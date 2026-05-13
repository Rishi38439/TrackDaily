"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Session, AuthState, LoginCredentials, RegisterData } from '@/types/activity';
import { createSession } from '@/lib/sessionUtils';
import { getUserInfoBySessionCode } from '@/lib/userServiceClient';

const SESSION_KEY = 'session';
const AUTH_KEY = 'auth_state';

type AuthContextValue = AuthState & {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: () => Promise<RegisterData | null>;
  logout: () => void;
  clearError: () => void;
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

  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const existingSession = await getUserInfoBySessionCode(credentials.sessionCode);

      if (existingSession) {
        const session: Session = {
          id: existingSession.session_id,
          code: existingSession.session_code,
          startDate: typeof existingSession.createdAT === 'string'
            ? new Date(existingSession.createdAT).getTime()
            : existingSession.createdAT.getTime(),
          logCode: existingSession.log_code,
        };

        localStorage.setItem(SESSION_KEY, JSON.stringify(session));

        setAuthState({
          isAuthenticated: true,
          session,
          isLoading: false,
          error: null,
        });

        // notify other hooks/components relying on localStorage if needed
        window.dispatchEvent(new Event('storage'));

        return true;
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false, error: 'Invalid session code. Please check and try again.' }));
        return false;
      }
    } catch (error) {
      console.error('Login failed:', error);
      setAuthState(prev => ({ ...prev, isLoading: false, error: 'Login failed. Please try again.' }));
      return false;
    }
  }, []);

  const register = useCallback(async (): Promise<RegisterData | null> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const newSession = await createSession();

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
