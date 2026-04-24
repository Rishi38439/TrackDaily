'use client';

import { useActivityTracker } from '@/hooks/useActivityTracker';
import { Dashboard } from '@/components/Dashboard';

export default function Home() {
  const {
    activities,
    sessionId,
    sessionCode,
    isLoaded,
    addActivity,
    deleteActivity,
  } = useActivityTracker();

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500/20 border-t-blue-500 mx-auto"></div>
          <p className="text-white/60">Loading your activity tracker...</p>
        </div>
      </div>
    );
  }

  return (
    <Dashboard
      activities={activities}
      sessionId={sessionId}
      sessionCode={sessionCode}
      onAddActivity={addActivity}
      onDeleteActivity={deleteActivity}
    />
  );
}
