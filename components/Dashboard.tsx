'use client';

import { useState } from 'react';
import { Activity } from '@/types/activity';
import { ActivityForm } from './ActivityForm';
import { ActivityItem } from './ActivityItem';
import { ActivitySectorView } from './ActivitySectorView';
import { VisualsView } from './VisualsView';
import { SessionManager } from './SessionManager';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

type ViewType = 'activity-sector' | 'visuals';

interface DashboardProps {
  activities: Activity[];
  sessionId: string;
  sessionCode: string;
  onAddActivity: (
    name: string,
    category: string,
    duration: number,
    calories: number,
    notes?: string
  ) => void;
  onDeleteActivity: (id: string) => void;
}

export function Dashboard({
  activities,
  sessionId,
  sessionCode,
  onAddActivity,
  onDeleteActivity,
}: DashboardProps) {
  const [currentView, setCurrentView] = useState<ViewType>('activity-sector');
  const [showSessionManager, setShowSessionManager] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header with Top Navigation */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Activity Tracker</h1>
          
          {/* Center Navigation Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={() => setCurrentView('activity-sector')}
              className={`rounded-[10px] px-6 py-2 h-10 ${
                currentView === 'activity-sector'
                  ? 'bg-blue-500/80 text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Activity Sector
            </Button>
            <Button
              onClick={() => setCurrentView('visuals')}
              className={`rounded-[10px] px-6 py-2 h-10 ${
                currentView === 'visuals'
                  ? 'bg-blue-500/80 text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Visuals
            </Button>
          </div>

          {/* Session Manager Button */}
          <Button
            onClick={() => setShowSessionManager(true)}
            className="rounded-[10px] h-10 w-10 p-0 bg-white/10 hover:bg-white/20 text-white"
            title="Session Information"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>

        {/* Activity Form - Always Visible */}
        <ActivityForm onSubmit={onAddActivity} />

        {/* View Content */}
        {currentView === 'activity-sector' ? (
          <ActivitySectorView activities={activities} onDeleteActivity={onDeleteActivity} />
        ) : (
          <VisualsView activities={activities} />
        )}

        {/* Session Manager Dialog */}
        <SessionManager
          sessionCode={sessionCode}
          isOpen={showSessionManager}
          onOpenChange={setShowSessionManager}
        />
      </div>
    </div>
  );
}
