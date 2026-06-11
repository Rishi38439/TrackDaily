import { NextRequest, NextResponse } from 'next/server';
import {
  normalizeLoginMobileNumber,
  peekVerificationToken,
  verifyLoginRateLimit,
} from '@/lib/authSecurity';
import {
  getUserInfoByMobileNumber,
  getUserInfoBySessionCodeOnly,
  updateSessionLastLogin,
} from '@/lib/userService';
import { withRouteTiming } from '@/lib/routeTiming';

export async function POST(request: NextRequest) {
  return withRouteTiming('api/auth/login:POST', async () => {
    try {
      const body = await request.json();
      const mobileNumber = normalizeLoginMobileNumber(body.mobileNumber ?? body.mobileNo ?? '');
      const sessionCode = String(body.sessionCode ?? body.session_code ?? '').trim().toUpperCase();
      const verificationToken = String(body.verificationToken ?? '').trim();
      const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? request.headers.get('x-real-ip') ?? 'unknown';

      if (!mobileNumber || !sessionCode || !verificationToken) {
        return NextResponse.json(
          { success: false, error: 'Mobile number, OTP verification, and session code are required' },
          { status: 400 },
        );
      }

      const loginLimit = verifyLoginRateLimit(mobileNumber, ipAddress);
      if (!loginLimit.allowed) {
        return NextResponse.json(
          { success: false, error: 'Too many login attempts. Please try again later.', reason: 'rate_limited' },
          { status: 429 },
        );
      }

      const verificationEntry = peekVerificationToken(verificationToken);
      if (!verificationEntry || verificationEntry.mobileNumber !== mobileNumber) {
        return NextResponse.json(
          { success: false, error: 'OTP not verified. Please verify OTP first.', reason: 'otp_not_verified' },
          { status: 401 },
        );
      }

      const mobileRecord = await getUserInfoByMobileNumber(mobileNumber);
      const sessionRecord = await getUserInfoBySessionCodeOnly(sessionCode);

      if (!mobileRecord && !sessionRecord) {
        return NextResponse.json(
          { success: false, error: 'Invalid session code or mobile number.', reason: 'session_code_mismatch' },
          { status: 404 },
        );
      }

      if (!mobileRecord) {
        return NextResponse.json(
          { success: false, error: 'Mobile number mismatch. No active session found for this number.', reason: 'mobile_number_mismatch' },
          { status: 403 },
        );
      }

      if (!sessionRecord) {
        return NextResponse.json(
          { success: false, error: 'Session code mismatch. Please check and try again.', reason: 'session_code_mismatch' },
          { status: 403 },
        );
      }

      const mobileMatches = (mobileRecord.mobileNumber ?? mobileRecord.mobileNo ?? '') === mobileNumber;
      const sessionMatches = (sessionRecord.session_code ?? sessionRecord.sessionCode ?? '') === sessionCode;
      const recordsMatch = mobileRecord.session_id === sessionRecord.session_id;

      if (!mobileMatches) {
        return NextResponse.json(
          { success: false, error: 'Mobile number mismatch. Please check the number tied to this session.', reason: 'mobile_number_mismatch' },
          { status: 403 },
        );
      }

      if (!sessionMatches || !recordsMatch) {
        return NextResponse.json(
          { success: false, error: 'Session code mismatch. Please check and try again.', reason: 'session_code_mismatch' },
          { status: 403 },
        );
      }

      const status = mobileRecord.status ?? sessionRecord.status ?? 'inactive';
      const expiresAt = mobileRecord.expiresAt ?? sessionRecord.expiresAt;
      if (status !== 'active') {
        return NextResponse.json(
          { success: false, error: 'Session is inactive.', reason: 'session_inactive' },
          { status: 403 },
        );
      }

      if (expiresAt && expiresAt.getTime && expiresAt.getTime() <= Date.now()) {
        return NextResponse.json(
          { success: false, error: 'Session has expired.', reason: 'session_expired' },
          { status: 403 },
        );
      }

      await updateSessionLastLogin(sessionCode, mobileNumber);
      // Invalidate the OTP verification token after a successful login.
      const { consumeVerificationToken } = await import('@/lib/authSecurity');
      consumeVerificationToken(verificationToken, mobileNumber);

      const session = {
        id: mobileRecord.session_id,
        code: sessionCode,
        startDate: mobileRecord.createdAt instanceof Date ? mobileRecord.createdAt.getTime() : mobileRecord.createdAT instanceof Date ? mobileRecord.createdAT.getTime() : Date.now(),
        createdAt: mobileRecord.createdAt instanceof Date ? mobileRecord.createdAt.getTime() : undefined,
        expiresAt: expiresAt instanceof Date ? expiresAt.getTime() : undefined,
        status: 'active' as const,
        lastLoginAt: Date.now(),
        logCode: mobileRecord.log_code,
        mobileNo: mobileNumber,
        mobileNumber,
      };

      return NextResponse.json({
        success: true,
        message: 'Access granted',
        session,
      });
    } catch (error) {
      console.error('Auth login error:', error);
      return NextResponse.json(
        { success: false, error: 'Internal server error' },
        { status: 500 },
      );
    }
  });
}
