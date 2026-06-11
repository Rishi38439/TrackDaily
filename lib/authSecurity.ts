import crypto from 'crypto';
import { isValidMobileNumber, normalizeMobileNumber } from './phone';

export const OTP_TTL_MS = 5 * 60 * 1000;
export const OTP_RESEND_INTERVAL_MS = 60 * 1000;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_SEND_MAX_ATTEMPTS = 5;
export const OTP_SEND_WINDOW_MS = 10 * 60 * 1000;
export const LOGIN_ATTEMPT_MAX = 8;
export const LOGIN_ATTEMPT_WINDOW_MS = 10 * 60 * 1000;
export const VERIFICATION_TOKEN_TTL_MS = 10 * 60 * 1000;

interface OtpChallenge {
  otpHash: string;
  salt: string;
  expiresAt: number;
  attempts: number;
  resendAvailableAt: number;
}

interface VerificationTokenEntry {
  mobileNumber: string;
  expiresAt: number;
}

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const globalForAuth = globalThis as unknown as {
  __trackDailyOtpChallenges?: Map<string, OtpChallenge>;
  __trackDailyVerificationTokens?: Map<string, VerificationTokenEntry>;
  __trackDailyRateLimits?: Map<string, RateLimitEntry>;
};

const otpChallenges = globalForAuth.__trackDailyOtpChallenges ?? new Map<string, OtpChallenge>();
const verificationTokens = globalForAuth.__trackDailyVerificationTokens ?? new Map<string, VerificationTokenEntry>();
const rateLimits = globalForAuth.__trackDailyRateLimits ?? new Map<string, RateLimitEntry>();

if (!globalForAuth.__trackDailyOtpChallenges) {
  globalForAuth.__trackDailyOtpChallenges = otpChallenges;
}

if (!globalForAuth.__trackDailyVerificationTokens) {
  globalForAuth.__trackDailyVerificationTokens = verificationTokens;
}

if (!globalForAuth.__trackDailyRateLimits) {
  globalForAuth.__trackDailyRateLimits = rateLimits;
}

export function normalizeLoginMobileNumber(value: string): string {
  return normalizeMobileNumber(value);
}

export function validateMobileNumber(value: string): boolean {
  return isValidMobileNumber(value);
}

export function createOtpRateKey(mobileNumber: string): string {
  return `otp:${normalizeMobileNumber(mobileNumber)}`;
}

export function createLoginRateKey(mobileNumber: string, ipAddress: string): string {
  return `login:${normalizeMobileNumber(mobileNumber)}:${ipAddress || 'unknown'}`;
}

function touchRateLimit(key: string, maxAttempts: number, windowMs: number): { allowed: boolean; retryAfterMs?: number } {
  const now = Date.now();
  const entry = rateLimits.get(key);

  if (!entry || now - entry.windowStart >= windowMs) {
    rateLimits.set(key, { count: 1, windowStart: now });
    return { allowed: true };
  }

  if (entry.count >= maxAttempts) {
    return {
      allowed: false,
      retryAfterMs: windowMs - (now - entry.windowStart),
    };
  }

  rateLimits.set(key, { count: entry.count + 1, windowStart: entry.windowStart });
  return { allowed: true };
}

function hashOtp(otp: string, salt: string): string {
  return crypto.createHash('sha256').update(`${salt}:${otp}`).digest('hex');
}

function createVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function createOtpChallenge(mobileNumber: string):
  | { success: true; otp: string }
  | { success: false; error: string; retryAfterMs?: number } {
  const normalizedMobileNumber = normalizeMobileNumber(mobileNumber);

  if (!validateMobileNumber(normalizedMobileNumber)) {
    return { success: false, error: 'A valid mobile number is required' };
  }

  const sendRate = touchRateLimit(createOtpRateKey(normalizedMobileNumber), OTP_SEND_MAX_ATTEMPTS, OTP_SEND_WINDOW_MS);
  if (!sendRate.allowed) {
    return { success: false, error: 'Too many OTP requests. Please try again later.', retryAfterMs: sendRate.retryAfterMs };
  }

  const now = Date.now();
  const existingChallenge = otpChallenges.get(normalizedMobileNumber);
  if (existingChallenge && now < existingChallenge.resendAvailableAt && now < existingChallenge.expiresAt) {
    return {
      success: false,
      error: 'Please wait before requesting another OTP.',
      retryAfterMs: existingChallenge.resendAvailableAt - now,
    };
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const otp = crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');

  otpChallenges.set(normalizedMobileNumber, {
    otpHash: hashOtp(otp, salt),
    salt,
    expiresAt: now + OTP_TTL_MS,
    attempts: 0,
    resendAvailableAt: now + OTP_RESEND_INTERVAL_MS,
  });

  return { success: true, otp };
}

export function verifyOtpChallenge(mobileNumber: string, otp: string):
  | { success: true; verificationToken: string }
  | { success: false; error: string } {
  const normalizedMobileNumber = normalizeMobileNumber(mobileNumber);
  const challenge = otpChallenges.get(normalizedMobileNumber);

  if (!challenge) {
    return { success: false, error: 'No OTP found. Please request a new one.' };
  }

  const now = Date.now();
  if (now > challenge.expiresAt) {
    otpChallenges.delete(normalizedMobileNumber);
    return { success: false, error: 'OTP has expired. Please request a new one.' };
  }

  if (challenge.attempts >= OTP_MAX_ATTEMPTS) {
    otpChallenges.delete(normalizedMobileNumber);
    return { success: false, error: 'Too many attempts. Please request a new OTP.' };
  }

  const enteredOtp = String(otp ?? '').trim();
  const enteredHash = hashOtp(enteredOtp, challenge.salt);
  const expectedHash = challenge.otpHash;

  const hashesMatch =
    enteredHash.length === expectedHash.length &&
    crypto.timingSafeEqual(Buffer.from(enteredHash), Buffer.from(expectedHash));

  if (!hashesMatch) {
    challenge.attempts += 1;
    otpChallenges.set(normalizedMobileNumber, challenge);

    if (challenge.attempts >= OTP_MAX_ATTEMPTS) {
      otpChallenges.delete(normalizedMobileNumber);
      return { success: false, error: 'Too many attempts. Please request a new OTP.' };
    }

    return { success: false, error: 'Invalid OTP. Please try again.' };
  }

  otpChallenges.delete(normalizedMobileNumber);
  const verificationToken = createVerificationToken();
  verificationTokens.set(verificationToken, {
    mobileNumber: normalizedMobileNumber,
    expiresAt: now + VERIFICATION_TOKEN_TTL_MS,
  });

  return { success: true, verificationToken };
}

export function consumeVerificationToken(token: string, mobileNumber: string): boolean {
  const entry = verificationTokens.get(token);

  if (!entry) {
    return false;
  }

  if (Date.now() > entry.expiresAt || entry.mobileNumber !== normalizeMobileNumber(mobileNumber)) {
    verificationTokens.delete(token);
    return false;
  }

  verificationTokens.delete(token);
  return true;
}

export function peekVerificationToken(token: string): VerificationTokenEntry | null {
  const entry = verificationTokens.get(token);

  if (!entry) {
    return null;
  }

  if (Date.now() > entry.expiresAt) {
    verificationTokens.delete(token);
    return null;
  }

  return entry;
}

export function verifyLoginRateLimit(mobileNumber: string, ipAddress: string): { allowed: boolean; retryAfterMs?: number } {
  return touchRateLimit(createLoginRateKey(mobileNumber, ipAddress), LOGIN_ATTEMPT_MAX, LOGIN_ATTEMPT_WINDOW_MS);
}
