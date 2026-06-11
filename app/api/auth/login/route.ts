import { NextRequest, NextResponse } from 'next/server';
import {
  normalizeLoginMobileNumber,
  peekVerificationToken,
  verifyLoginRateLimit,
} from '@/lib/authSecurity';
import {
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

      const loginLimit = await verifyLoginRateLimit(mobileNumber, ipAddress);
      if (!loginLimit.allowed) {
        return NextResponse.json(
          { success: false, error: 'Too many login attempts. Please try again later.', reason: 'rate_limited' },
          { status: 429 },
        );
      }

      const verificationEntry = await peekVerificationToken(verificationToken);
      if (!verificationEntry || verificationEntry.mobileNumber !== mobileNumber) {
        return NextResponse.json(
          { success: false, error: 'OTP not verified. Please verify OTP first.', reason: 'otp_not_verified' },
          { status: 401 },
        );
      }

      const sessionRecord = await getUserInfoBySessionCodeOnly(sessionCode);

      if (!sessionRecord) {
        return NextResponse.json(
          { success: false, error: 'Invalid session code.', reason: 'session_code_mismatch' },
          { status: 404 },
        );
      }

      const sessionMobileNumber = sessionRecord.mobileNumber ?? sessionRecord.mobileNo ?? '';
      if (sessionMobileNumber !== mobileNumber) {
        return NextResponse.json(
          { success: false, error: 'Mobile number mismatch. No active session found for this number or code.', reason: 'mobile_number_mismatch' },
          { status: 403 },
        );
      }

      const status = sessionRecord.status ?? 'inactive';
      const expiresAt = sessionRecord.expiresAt;
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
      await consumeVerificationToken(verificationToken, mobileNumber);

      const session = {
        id: sessionRecord.session_id,
        code: sessionCode,
        startDate: sessionRecord.createdAt instanceof Date ? sessionRecord.createdAt.getTime() : sessionRecord.createdAT instanceof Date ? sessionRecord.createdAT.getTime() : Date.now(),
        createdAt: sessionRecord.createdAt instanceof Date ? sessionRecord.createdAt.getTime() : undefined,
        expiresAt: expiresAt instanceof Date ? expiresAt.getTime() : undefined,
        status: 'active' as const,
        lastLoginAt: Date.now(),
        logCode: sessionRecord.log_code,
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
