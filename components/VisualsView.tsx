'use client';

import { Activity } from '@/types/activity';
import { ActivityLineGraph } from './ActivityLineGraph';

interface VisualsViewProps {
  activities: Activity[];
}

export function VisualsView({ activities }: VisualsViewProps) {
  // Get unique activity names
  const uniqueActivities = Array.from(new Set(activities.map(a => a.name))).sort();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">All Activity Analytics</h2>
        <p className="text-white/60">View line graphs for all your activities</p>
      </div>

      {activities.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-lg p-12 flex items-center justify-center">
          <p className="text-white/50 text-center">No activities yet. Create your first activity to see analytics!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {uniqueActivities.map((activityName) => (
            <div
              key={activityName}
              className="bg-white/5 border border-white/10 rounded-lg p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">{activityName}</h3>
              <ActivityLineGraph
                activityName={activityName}
                activities={activities}
                compact={true}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
