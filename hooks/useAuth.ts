"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Session, AuthState, LoginCredentials, RegisterData } from '@/types/activity';
import { createSession } from '@/lib/sessionUtils';
import { loginWithSessionCode } from '@/lib/userServiceClient';
import { sendOtp, verifyOtp, SendOtpResult, VerifyOtpResult } from '@/lib/otpService';
import { normalizeMobileNumber } from '@/lib/phone';

const SESSION_KEY = 'session';
const AUTH_KEY = 'auth_state';
const OTP_VERIFIED_MOBILE_KEY = 'otp_verified_mobile';
const OTP_VERIFICATION_TOKEN_KEY = 'otp_verification_token';

type AuthContextValue = AuthState & {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (mobileNo?: string) => Promise<RegisterData | null>;
  logout: () => void;
  clearError: () => void;
  sendLoginOtp: (mobileNo: string) => Promise<SendOtpResult>;
  verifyLoginOtp: (mobileNo: string, otp: string) => Promise<VerifyOtpResult>;
  isOtpVerified: () => string | null;
  clearOtpVerification: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    session: null,
    isLoading: true,
    error: null,
  });

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedSession = localStorage.getItem(SESSION_KEY);
        const storedAuthState = localStorage.getItem(AUTH_KEY);

        // If a session object exists in localStorage treat the user as authenticated
        if (storedSession) {
          const session = JSON.parse(storedSession);
          let authStatePartial: any = { isAuthenticated: true, error: null };

          if (storedAuthState) {
            try {
              const parsed = JSON.parse(storedAuthState);
              authStatePartial = { ...authStatePartial, ...parsed };
            } catch (e) {
              // ignore
            }
          }

          setAuthState({
            isAuthenticated: Boolean(authStatePartial.isAuthenticated),
            session,
            isLoading: false,
            error: authStatePartial.error ?? null,
          });
        } else if (storedAuthState) {
          try {
            const parsed = JSON.parse(storedAuthState);
            setAuthState({
              isAuthenticated: Boolean(parsed.isAuthenticated),
              session: null,
              isLoading: false,
              error: parsed.error ?? null,
            });
          } catch (e) {
            setAuthState(prev => ({ ...prev, isLoading: false }));
          }
        } else {
          setAuthState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Failed to initialize auth state:', error);
        setAuthState(prev => ({ ...prev, isLoading: false, error: 'Failed to load authentication state' }));
      }
    };

    initializeAuth();
  }, []);

  // Save auth state to localStorage whenever it changes
  useEffect(() => {
    if (!authState.isLoading) {
      localStorage.setItem(AUTH_KEY, JSON.stringify({
        isAuthenticated: authState.isAuthenticated,
        error: authState.error,
      }));
    }
  }, [authState, authState.isLoading]);

  const sendLoginOtp = useCallback(async (mobileNo: string): Promise<SendOtpResult> => {
    return await sendOtp(normalizeMobileNumber(mobileNo));
  }, []);

  const verifyLoginOtp = useCallback(async (mobileNo: string, otp: string): Promise<VerifyOtpResult> => {
    const normalizedMobileNo = normalizeMobileNumber(mobileNo);
    const result = await verifyOtp(normalizedMobileNo, otp);
    if (result.success && result.verified) {
      // Store verified mobile and verification token in session storage for this browser session
      sessionStorage.setItem(OTP_VERIFIED_MOBILE_KEY, normalizedMobileNo);
      if (result.verificationToken) {
        sessionStorage.setItem(OTP_VERIFICATION_TOKEN_KEY, result.verificationToken);
      }
    }
    return result;
  }, []);

  const isOtpVerified = useCallback((): string | null => {
    return sessionStorage.getItem(OTP_VERIFIED_MOBILE_KEY);
  }, []);

  const clearOtpVerification = useCallback(() => {
    sessionStorage.removeItem(OTP_VERIFIED_MOBILE_KEY);
    sessionStorage.removeItem(OTP_VERIFICATION_TOKEN_KEY);
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const mobileNumber = normalizeMobileNumber(credentials.mobileNumber);
      const verifiedMobile = sessionStorage.getItem(OTP_VERIFIED_MOBILE_KEY);
      const verificationToken = credentials.verificationToken || sessionStorage.getItem(OTP_VERIFICATION_TOKEN_KEY) || '';

      if (verifiedMobile !== mobileNumber || !verificationToken) {
        setAuthState(prev => ({ ...prev, isLoading: false, error: 'Mobile number not verified. Please verify with OTP first.' }));
        return false;
      }

      const result = await loginWithSessionCode(mobileNumber, credentials.sessionCode, verificationToken);

      if (result.success && result.session) {
        const session: Session = {
          id: result.session.id,
          code: result.session.code,
          startDate: result.session.startDate,
          createdAt: result.session.createdAt,
          expiresAt: result.session.expiresAt,
          status: result.session.status,
          lastLoginAt: result.session.lastLoginAt ?? null,
          logCode: result.session.logCode,
          mobileNo: result.session.mobileNo ?? result.session.mobileNumber,
          mobileNumber: result.session.mobileNumber ?? result.session.mobileNo,
        };

        localStorage.setItem(SESSION_KEY, JSON.stringify(session));

        setAuthState({
          isAuthenticated: true,
          session,
          isLoading: false,
          error: null,
        });

        window.dispatchEvent(new Event('storage'));
        sessionStorage.removeItem(OTP_VERIFIED_MOBILE_KEY);
        sessionStorage.removeItem(OTP_VERIFICATION_TOKEN_KEY);
        return true;
      }

      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: result.error || 'Invalid session code or mobile number. Please check and try again.',
      }));
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      setAuthState(prev => ({ ...prev, isLoading: false, error: 'Login failed. Please try again.' }));
        return false;
    }
  }, []);

  const register = useCallback(async (mobileNo?: string): Promise<RegisterData | null> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Check if mobile is OTP verified when a mobile number is provided
      if (mobileNo) {
        const verifiedMobile = sessionStorage.getItem(OTP_VERIFIED_MOBILE_KEY);
        const normalizedMobileNo = normalizeMobileNumber(mobileNo);
        if (verifiedMobile !== normalizedMobileNo) {
          setAuthState(prev => ({ ...prev, isLoading: false, error: 'Mobile number not verified. Please verify with OTP first.' }));
          return null;
        }
      }

      const newSession = await createSession(mobileNo);

      localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));

      setAuthState({
        isAuthenticated: true,
        session: newSession,
        isLoading: false,
        error: null,
      });

      window.dispatchEvent(new Event('storage'));

      return {
        sessionId: newSession.id,
        sessionCode: newSession.code,
        logCode: (newSession as any).logCode,
      };
    } catch (error) {
      console.error('Registration failed:', error);
      setAuthState(prev => ({ ...prev, isLoading: false, error: 'Registration failed. Please try again.' }));
      return null;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem('activities');

    setAuthState({
      isAuthenticated: false,
      session: null,
      isLoading: false,
      error: null,
    });

    window.dispatchEvent(new Event('storage'));
  }, []);

  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }));
  }, []);

  const value: AuthContextValue = {
    ...authState,
    login,
    register,
    logout,
    clearError,
    sendLoginOtp,
    verifyLoginOtp,
    isOtpVerified,
    clearOtpVerification,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};

export default useAuth;