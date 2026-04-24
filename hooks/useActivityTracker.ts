import { useState, useEffect, useCallback } from 'react';
import { Activity, Session } from '@/types/activity';
import { generateSessionId, generateActivityId } from '@/lib/activityUtils';
import { createSession } from '@/lib/sessionUtils';

const STORAGE_KEY = 'activities';
const SESSION_KEY = 'session';

export const useActivityTracker = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize session and load activities
  useEffect(() => {
    const storedActivities = localStorage.getItem(STORAGE_KEY);
    const storedSession = localStorage.getItem(SESSION_KEY);

    if (storedActivities) {
      try {
        setActivities(JSON.parse(storedActivities));
      } catch {
        console.error('Failed to parse activities from localStorage');
      }
    }

    if (storedSession) {
      try {
        setSession(JSON.parse(storedSession));
      } catch {
        console.error('Failed to parse session from localStorage');
        const newSession = createSession();
        setSession(newSession);
        localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
      }
    } else {
      const newSession = createSession();
      setSession(newSession);
      localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
      console.log('New session created:', newSession.code);
    }

    setIsLoaded(true);
  }, []);

  // Save activities to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
    }
  }, [activities, isLoaded]);

  const addActivity = useCallback(
    (
      name: string,
      duration: number,
      notes?: string
    ) => {
      if (!session) {
        console.log('Session not initialized');
        return;
      }

      const newActivity: Activity = {
        id: generateActivityId(),
        sessionId: session.id,
        name,
        duration,
        timestamp: Date.now(),
        notes,
      };

      setActivities((prev) => [newActivity, ...prev]);
      console.log('Activity added:', name, 'Duration:', duration, 'minutes');
    },
    [session]
  );

  const deleteActivity = useCallback((id: string) => {
    setActivities((prev) => prev.filter((activity) => activity.id !== id));
  }, []);

  const updateActivity = useCallback(
    (id: string, updates: Partial<Activity>) => {
      setActivities((prev) =>
        prev.map((activity) =>
          activity.id === id ? { ...activity, ...updates } : activity
        )
      );
    },
    []
  );

  const clearAllActivities = useCallback(() => {
    setActivities([]);
  }, []);

  const getActivities = useCallback(() => {
    return activities;
  }, [activities]);

  const getActivitiesByDateRange = useCallback(
    (startDate: number, endDate: number) => {
      return activities.filter(
        (activity) => activity.timestamp >= startDate && activity.timestamp <= endDate
      );
    },
    [activities]
  );

  return {
    activities,
    session,
    sessionId: session?.id || '',
    sessionCode: session?.code || '',
    isLoaded,
    addActivity,
    deleteActivity,
    updateActivity,
    clearAllActivities,
    getActivities,
    getActivitiesByDateRange,
  };
};
