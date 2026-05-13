import { useState, useEffect, useCallback } from 'react';
import { Activity } from '@/types/activity';
import { generateActivityId } from '@/lib/activityUtils';
import { useGuestSession } from './useGuestSession';
import { useAuth } from '@/hooks/useAuth';

const STORAGE_KEY = 'activities';

export const useActivityTracker = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { guestSession, isLoading: sessionLoading } = useGuestSession();
  const { session, isAuthenticated } = useAuth ? useAuth() : { session: null, isAuthenticated: false };

  // Initialize activities and create guest session if needed
  useEffect(() => {
    const initializeActivities = () => {
      const storedActivities = localStorage.getItem(STORAGE_KEY);

      if (storedActivities) {
        try {
          setActivities(JSON.parse(storedActivities));
        } catch {
          console.error('Failed to parse activities from localStorage');
        }
      }

      setIsLoaded(true);
    };

    // Only initialize when guest session is ready
    if (!sessionLoading && guestSession) {
      initializeActivities();
    }
  }, [sessionLoading, guestSession]);

  // Save activities to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
    }
  }, [activities, isLoaded]);

  const addActivity = useCallback(
    async (
      name: string,
      duration: number,
      notes?: string,
      category?: string
    ) => {
      const userLogCode = isAuthenticated && session?.logCode ? session.logCode : guestSession?.id;
      if (!userLogCode) {
        console.log('No log code or guest session available');
        return;
      }

      // Validation: duration must be between 0 and 1440 minutes (24 hours)
      if (duration < 0 || duration > 1440) {
        console.error('Duration must be between 0 and 24 hours (1440 minutes)');
        return;
      }

      const newActivity: Activity = {
        id: generateActivityId(),
        sessionId: userLogCode,
        name,
        category: category || 'other',
        duration,
        timestamp: Date.now(),
        notes,
      };

      setActivities((prev) => [newActivity, ...prev]);
      console.log('Activity added:', name, 'Duration:', duration, 'minutes');

      // Call backend to log activity in MongoDB
      try {
        await fetch('/api/activity-log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            activityName: name,
            log_code: userLogCode,
            activity_time: duration,
          }),
        });
      } catch (err) {
        console.error('Failed to log activity in MongoDB:', err);
      }
    },
    [guestSession, session, isAuthenticated]
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
    sessionId: guestSession?.id || '',
    sessionCode: 'GUEST', // Always show GUEST as session code
    isLoaded,
    addActivity,
    deleteActivity,
    updateActivity,
    clearAllActivities,
    getActivities,
    getActivitiesByDateRange,
  };
};
