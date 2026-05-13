'use client';

import { useState, useEffect } from 'react';
import { useGuestSession } from '@/hooks/useGuestSession';
import { Dashboard } from '@/components/Dashboard';
import LiveGridPulseNetwork from '@/components/LiveGridPulseNetwork';
import InfrastructureIntro from '@/components/InfrastructureIntro';
import { useActivityTracker } from '@/hooks/useActivityTracker';

export function AuthWrapper() {
  const [showIntro, setShowIntro] = useState(true); // Always start with intro on server-side

  useEffect(() => {
    // Check if intro has already been played in this browser session
    const hasSeenIntro = sessionStorage.getItem('trackdaily_intro_seen');
    if (hasSeenIntro) {
      setShowIntro(false);
    }
  }, []);

  const handleIntroComplete = () => {
    // Mark intro as seen for this browser session
    sessionStorage.setItem('trackdaily_intro_seen', 'true');
    // Delay hiding intro to allow smooth fade out
    setTimeout(() => setShowIntro(false), 1500);
  };
  useGuestSession();
  const {
    activities,
    sessionId,
    sessionCode,
    addActivity,
    deleteActivity,
    updateActivity,
  } = useActivityTracker();

  // Show intro animation first
  if (showIntro) {
    return (
      <div suppressHydrationWarning>
        <InfrastructureIntro onComplete={handleIntroComplete} />
      </div>
    );
  }

  // Show main app with guest session
  return (
    <div className="min-h-screen bg-black relative">
      {/* Live Grid Pulse Network */}
      <LiveGridPulseNetwork />
      
      {/* Dashboard Content */}
      <Dashboard
        activities={activities}
        sessionId={sessionId}
        sessionCode={sessionCode}
        onAddActivity={addActivity}
        onDeleteActivity={deleteActivity}
        onUpdateActivity={updateActivity}
      />
    </div>
  );
}
