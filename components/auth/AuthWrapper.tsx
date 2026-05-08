'use client';

import { useState } from 'react';
import { useGuestSession } from '@/hooks/useGuestSession';
import { Dashboard } from '@/components/Dashboard';
import LiveGridPulseNetwork from '@/components/LiveGridPulseNetwork';
import InfrastructureIntro from '@/components/InfrastructureIntro';
import { useActivityTracker } from '@/hooks/useActivityTracker';

export function AuthWrapper() {
  const [showIntro, setShowIntro] = useState(true);
  const { guestSession, isLoading: sessionLoading } = useGuestSession();
  const {
    activities,
    sessionId,
    sessionCode,
    addActivity,
    deleteActivity,
    updateActivity,
  } = useActivityTracker();

  // Show loading state first (but only if intro is not showing)
  if (sessionLoading && !showIntro) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show intro animation first
  if (showIntro) {
    return <InfrastructureIntro onComplete={() => setShowIntro(false)} />;
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
