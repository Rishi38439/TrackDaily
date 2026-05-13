'use client';

import { useState } from 'react';
import { Activity } from '@/types/activity';
import { ActivityItem } from './ActivityItem';
import { ActivityLineGraph } from './ActivityLineGraph';

interface ActivitySectorViewProps {
  activities: Activity[];
  onDeleteActivity: (id: string) => void;
}

export function ActivitySectorView({ activities, onDeleteActivity }: ActivitySectorViewProps) {
  const [hoveredActivityName, setHoveredActivityName] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Activities List */}
      <div className="lg:col-span-3">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-white mb-4">Your Activities</h2>
          {activities.length === 0 ? (
            <p className="text-white/50 text-center py-8">No activities yet. Create your first activity!</p>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                onMouseEnter={() => setHoveredActivityName(activity.name)}
                onMouseLeave={() => setHoveredActivityName(null)}
                className="cursor-pointer transition-all"
              >
                <ActivityItem
                  id={activity.id}
                  name={activity.name}
                  initialDuration={activity.duration}
                  onDelete={onDeleteActivity}
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Hover Preview */}
      <div className="lg:col-span-2">
        {hoveredActivityName ? (
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">{hoveredActivityName}</h3>
            <ActivityLineGraph
              activityName={hoveredActivityName}
              activities={activities}
              compact={true}
            />
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-lg p-6 h-full flex items-center justify-center">
            <p className="text-white/50 text-center">
              Hover over an activity to see its line graph
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
