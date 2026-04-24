'use client';

import { Activity } from '@/types/activity';
import { formatDuration, getCategoryIcon } from '@/lib/activityUtils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { Empty } from '@/components/ui/empty';

interface ActivityTableProps {
  activities: Activity[];
  onDelete: (id: string) => void;
}

export function ActivityTable({ activities, onDelete }: ActivityTableProps) {
  if (activities.length === 0) {
    return (
      <Card className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-md">
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>Your logged activities will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <Empty
            icon="📭"
            title="No activities logged yet"
            description="Start tracking your activities by filling out the form above"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-md">
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
        <CardDescription>{activities.length} activities logged</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-4 py-3 text-left text-sm font-medium text-white/60">Activity</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-white/60">Category</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-white/60">Duration</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-white/60">Calories</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-white/60">Date</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-white/60">Action</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity) => (
                <tr key={activity.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3">
                    <p className="font-medium">{activity.name}</p>
                    {activity.notes && <p className="text-sm text-white/50">{activity.notes}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className="mr-2">{getCategoryIcon(activity.category)}</span>
                    <span className="capitalize">{activity.category}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="inline-block rounded-full bg-blue-500/20 px-3 py-1 text-sm font-medium text-blue-300">
                      {formatDuration(activity.duration)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="inline-block rounded-full bg-orange-500/20 px-3 py-1 text-sm font-medium text-orange-300">
                      {activity.calories} kcal
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-white/60">
                    {new Date(activity.timestamp).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(activity.id)}
                      className="h-8 w-8 p-0 text-red-400 hover:bg-red-500/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
