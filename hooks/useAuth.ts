import { useState, useEffect, useCallback } from 'react';
import { Session, AuthState, LoginCredentials, RegisterData } from '@/types/activity';
import { createSession, validateSessionCode } from '@/lib/sessionUtils';
import { getUserInfoBySessionCode, verifySession } from '@/lib/userServiceClient';

const SESSION_KEY = 'session';
const AUTH_KEY = 'auth_state';

export const useAuth = () => {
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

        if (storedSession && storedAuthState) {
          const session = JSON.parse(storedSession);
          const authState = JSON.parse(storedAuthState);
          
          setAuthState({
            ...authState,
            session,
            isLoading: false,
          });
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
      // First, try to find an existing session by session code
      const existingSession = await getUserInfoBySessionCode(credentials.sessionCode);
      
      if (existingSession) {
        // Session exists, create a session object from the stored data
        const session: Session = {
          id: existingSession.session_id,
          code: existingSession.session_code,
          startDate: typeof existingSession.createdAT === 'string' 
            ? new Date(existingSession.createdAT).getTime() 
            : existingSession.createdAT.getTime(),
          logCode: existingSession.log_code,
        };
        
        // Store session
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        
        setAuthState({
          isAuthenticated: true,
          session,
          isLoading: false,
          error: null,
        });
        
        console.log('✅ Login successful - existing session found:', {
          sessionCode: session.code,
          logCode: session.logCode,
          sessionId: session.id
        });
        
        return true;
      } else {
        // No existing session found
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Invalid session code. Please check and try again.',
        }));
        return false;
      }
    } catch (error) {
      console.error('Login failed:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Login failed. Please try again.',
      }));
      return false;
    }
  }, []);

  const register = useCallback(async (): Promise<RegisterData | null> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const newSession = await createSession();
      
      // Store session
      localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
      
      setAuthState({
        isAuthenticated: true,
        session: newSession,
        isLoading: false,
        error: null,
      });

      return {
        sessionId: newSession.id,
        sessionCode: newSession.code,
        logCode: (newSession as any).logCode,
      };
    } catch (error) {
      console.error('Registration failed:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Registration failed. Please try again.',
      }));
      return null;
    }
  }, []);

  const logout = useCallback(() => {
    // Clear stored data
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem('activities'); // Also clear activities on logout
    
    setAuthState({
      isAuthenticated: false,
      session: null,
      isLoading: false,
      error: null,
    });
  }, []);

  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...authState,
    login,
    register,
    logout,
    clearError,
  };
};
