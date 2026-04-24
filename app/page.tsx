'use client';

import { useActivityTracker } from '@/hooks/useActivityTracker';
import { Dashboard } from '@/components/Dashboard';
import { Loading } from '@/components/Loading';

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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center space-y-8">
          <div className="relative">
            {/* Ambient animated background */}
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
            <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-2000" />
          </div>
          
          <div className="relative z-10">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <Loading 
              message="Initializing your FocusLoop experience..." 
              size="lg"
              className="relative z-10"
            />
          </div>
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
