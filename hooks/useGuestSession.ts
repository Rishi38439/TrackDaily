import { useState, useEffect } from 'react';

interface GuestSession {
  id: string;
  isGuest: boolean;
  startDate: number;
}

const GUEST_SESSION_KEY = 'guest_session';

export const useGuestSession = () => {
  const [guestSession, setGuestSession] = useState<GuestSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize guest session
  useEffect(() => {
    const initializeGuestSession = () => {
      try {
        const storedSession = localStorage.getItem(GUEST_SESSION_KEY);
        
        if (storedSession) {
          const session = JSON.parse(storedSession);
          setGuestSession(session);
        } else {
          // Create new guest session
          const newSession: GuestSession = {
            id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            isGuest: true,
            startDate: Date.now(),
          };
          
          localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(newSession));
          setGuestSession(newSession);
        }
      } catch (error) {
        console.error('Failed to initialize guest session:', error);
        // Create fallback session
        const fallbackSession: GuestSession = {
          id: `guest_fallback_${Date.now()}`,
          isGuest: true,
          startDate: Date.now(),
        };
        setGuestSession(fallbackSession);
      } finally {
        setIsLoading(false);
      }
    };

    initializeGuestSession();
  }, []);

  const clearGuestSession = () => {
    localStorage.removeItem(GUEST_SESSION_KEY);
    setGuestSession(null);
  };

  return {
    guestSession,
    isLoading,
    clearGuestSession,
  };
};
