import crypto from 'crypto';
import { isValidMobileNumber, normalizeMobileNumber } from './phone';
import { getOtpCollection, getVerificationTokenCollection, getRateLimitCollection } from './mongodb';

export const OTP_TTL_MS = 5 * 60 * 1000;
export const OTP_RESEND_INTERVAL_MS = 60 * 1000;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_SEND_MAX_ATTEMPTS = 5;
export const OTP_SEND_WINDOW_MS = 10 * 60 * 1000;
export const LOGIN_ATTEMPT_MAX = 8;
export const LOGIN_ATTEMPT_WINDOW_MS = 10 * 60 * 1000;
export const VERIFICATION_TOKEN_TTL_MS = 10 * 60 * 1000;

export interface OtpChallenge {
  mobileNumber: string;
  otpHash: string;
  salt: string;
  expiresAt: Date;
  attempts: number;
  resendAvailableAt: Date;
}

export interface VerificationTokenEntry {
  token: string;
  mobileNumber: string;
  expiresAt: Date;
}

export interface RateLimitEntry {
  key: string;
  count: number;
  windowStart: Date;
}

export function normalizeLoginMobileNumber(value: string): string {
  return normalizeMobileNumber(value);
}

export function validateMobileNumber(value: string): boolean {
  return isValidMobileNumber(value);
}

export function createOtpRateKey(mobileNumber: string, ipAddress: string): string {
  return `otp:${normalizeMobileNumber(mobileNumber)}:${ipAddress || 'unknown'}`;
}

export function createLoginRateKey(mobileNumber: string, ipAddress: string): string {
  return `login:${normalizeMobileNumber(mobileNumber)}:${ipAddress || 'unknown'}`;
}

async function touchRateLimit(key: string, maxAttempts: number, windowMs: number): Promise<{ allowed: boolean; retryAfterMs?: number }> {
  const collection = await getRateLimitCollection();
  const now = new Date();
  const entry = await collection.findOne({ key });

  if (!entry || now.getTime() - entry.windowStart.getTime() >= windowMs) {
    await collection.updateOne(
      { key },
      { $set: { count: 1, windowStart: now } },
      { upsert: true }
    );
    return { allowed: true };
  }

  if (entry.count >= maxAttempts) {
    return {
      allowed: false,
      retryAfterMs: windowMs - (now.getTime() - entry.windowStart.getTime()),
    };
  }

  await collection.updateOne(
    { key },
    { $inc: { count: 1 } }
  );
  return { allowed: true };
}

function hashOtp(otp: string, salt: string): string {
  return crypto.createHash('sha256').update(`${salt}:${otp}`).digest('hex');
}

function createVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function createOtpChallenge(mobileNumber: string, ipAddress: string): Promise<
  | { success: true; otp: string }
  | { success: false; error: string; retryAfterMs?: number }
> {
  const normalizedMobileNumber = normalizeMobileNumber(mobileNumber);

  if (!validateMobileNumber(normalizedMobileNumber)) {
    return { success: false, error: 'A valid mobile number is required' };
  }

  const sendRate = await touchRateLimit(createOtpRateKey(normalizedMobileNumber, ipAddress), OTP_SEND_MAX_ATTEMPTS, OTP_SEND_WINDOW_MS);
  if (!sendRate.allowed) {
    return { success: false, error: 'Too many OTP requests. Please try again later.', retryAfterMs: sendRate.retryAfterMs };
  }

  const collection = await getOtpCollection();
  const now = new Date();
  const existingChallenge = await collection.findOne({ mobileNumber: normalizedMobileNumber });
  
  if (existingChallenge && now < existingChallenge.resendAvailableAt && now < existingChallenge.expiresAt) {
    return {
      success: false,
      error: 'Please wait before requesting another OTP.',
      retryAfterMs: existingChallenge.resendAvailableAt.getTime() - now.getTime(),
    };
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const otp = crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');

  await collection.updateOne(
    { mobileNumber: normalizedMobileNumber },
    {
      $set: {
        otpHash: hashOtp(otp, salt),
        salt,
        expiresAt: new Date(now.getTime() + OTP_TTL_MS),
        attempts: 0,
        resendAvailableAt: new Date(now.getTime() + OTP_RESEND_INTERVAL_MS),
      }
    },
    { upsert: true }
  );

  return { success: true, otp };
}

export async function verifyOtpChallenge(mobileNumber: string, otp: string): Promise<
  | { success: true; verificationToken: string }
  | { success: false; error: string }
> {
  const normalizedMobileNumber = normalizeMobileNumber(mobileNumber);
  const collection = await getOtpCollection();
  const challenge = await collection.findOne({ mobileNumber: normalizedMobileNumber });

  if (!challenge) {
    return { success: false, error: 'No OTP found. Please request a new one.' };
  }

  const now = new Date();
  if (now > challenge.expiresAt) {
    await collection.deleteOne({ mobileNumber: normalizedMobileNumber });
    return { success: false, error: 'OTP has expired. Please request a new one.' };
  }

  if (challenge.attempts >= OTP_MAX_ATTEMPTS) {
    await collection.deleteOne({ mobileNumber: normalizedMobileNumber });
    return { success: false, error: 'Too many attempts. Please request a new OTP.' };
  }

  const enteredOtp = String(otp ?? '').trim();
  const enteredHash = hashOtp(enteredOtp, challenge.salt);
  const expectedHash = challenge.otpHash;

  const hashesMatch =
    enteredHash.length === expectedHash.length &&
    crypto.timingSafeEqual(Buffer.from(enteredHash), Buffer.from(expectedHash));

  if (!hashesMatch) {
    await collection.updateOne(
      { mobileNumber: normalizedMobileNumber },
      { $inc: { attempts: 1 } }
    );
    
    if (challenge.attempts + 1 >= OTP_MAX_ATTEMPTS) {
      await collection.deleteOne({ mobileNumber: normalizedMobileNumber });
      return { success: false, error: 'Too many attempts. Please request a new OTP.' };
    }

    return { success: false, error: 'Invalid OTP. Please try again.' };
  }

  await collection.deleteOne({ mobileNumber: normalizedMobileNumber });
  
  const verificationToken = createVerificationToken();
  const tokenCollection = await getVerificationTokenCollection();
  
  await tokenCollection.insertOne({
    token: verificationToken,
    mobileNumber: normalizedMobileNumber,
    expiresAt: new Date(now.getTime() + VERIFICATION_TOKEN_TTL_MS),
  });

  return { success: true, verificationToken };
}

export async function consumeVerificationToken(token: string, mobileNumber: string): Promise<boolean> {
  const collection = await getVerificationTokenCollection();
  const entry = await collection.findOne({ token });

  if (!entry) {
    return false;
  }

  if (new Date() > entry.expiresAt || entry.mobileNumber !== normalizeMobileNumber(mobileNumber)) {
    await collection.deleteOne({ token });
    return false;
  }

  await collection.deleteOne({ token });
  return true;
}

export async function peekVerificationToken(token: string): Promise<VerificationTokenEntry | null> {
  const collection = await getVerificationTokenCollection();
  const entry = await collection.findOne({ token });

  if (!entry) {
    return null;
  }

  if (new Date() > entry.expiresAt) {
    await collection.deleteOne({ token });
    return null;
  }

  return entry;
}

export async function verifyLoginRateLimit(mobileNumber: string, ipAddress: string): Promise<{ allowed: boolean; retryAfterMs?: number }> {
  return touchRateLimit(createLoginRateKey(mobileNumber, ipAddress), LOGIN_ATTEMPT_MAX, LOGIN_ATTEMPT_WINDOW_MS);
}

