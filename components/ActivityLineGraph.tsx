'use client';

import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { TimeRange } from '@/types/activity';
import { Activity } from '@/types/activity';

interface ActivityLineGraphProps {
  activityName: string;
  activities: Activity[];
  compact?: boolean;
}

export function ActivityLineGraph({ activityName, activities, compact = false }: ActivityLineGraphProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('weekly');

  const chartData = useMemo(() => {
    const now = Date.now();
    const filtered = activities.filter(a => a.name === activityName);
    
    let daysBack = 7; // weekly
    if (timeRange === 'monthly') daysBack = 30;
    if (timeRange === 'yearly') daysBack = 365;

    const cutoffDate = now - daysBack * 24 * 60 * 60 * 1000;
    
    const grouped: Record<string, { duration: number; count: number; date: string }> = {};

    filtered.forEach(activity => {
      if (activity.timestamp >= cutoffDate) {
        const date = new Date(activity.timestamp).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
        
        if (!grouped[date]) {
          grouped[date] = { duration: 0, count: 0, date };
        }
        grouped[date].duration += activity.duration;
        grouped[date].count += 1;
      }
    });

    return Object.values(grouped).sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  }, [activityName, activities, timeRange]);

  return (
    <div className="space-y-4">
      {/* Time Range Selector */}
      <div className="flex gap-2">
        <Button
          onClick={() => setTimeRange('weekly')}
          variant={timeRange === 'weekly' ? 'default' : 'outline'}
          className={`text-xs h-8 rounded-[8px] ${
            timeRange === 'weekly'
              ? 'bg-blue-500/80 text-white border-blue-500'
              : 'border-white/10 bg-white/5 text-white hover:bg-white/10'
          }`}
        >
          Weekly
        </Button>
        <Button
          onClick={() => setTimeRange('monthly')}
          variant={timeRange === 'monthly' ? 'default' : 'outline'}
          className={`text-xs h-8 rounded-[8px] ${
            timeRange === 'monthly'
              ? 'bg-blue-500/80 text-white border-blue-500'
              : 'border-white/10 bg-white/5 text-white hover:bg-white/10'
          }`}
        >
          Monthly
        </Button>
        <Button
          onClick={() => setTimeRange('yearly')}
          variant={timeRange === 'yearly' ? 'default' : 'outline'}
          className={`text-xs h-8 rounded-[8px] ${
            timeRange === 'yearly'
              ? 'bg-blue-500/80 text-white border-blue-500'
              : 'border-white/10 bg-white/5 text-white hover:bg-white/10'
          }`}
        >
          Yearly
        </Button>
      </div>

      {/* Chart */}
      {chartData.length === 0 ? (
        <div className="h-40 flex items-center justify-center text-white/50">
          <p>No data available for {activityName} in this period</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={compact ? 180 : 300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="date" 
              stroke="rgba(255,255,255,0.5)"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.5)"
              style={{ fontSize: '12px' }}
              label={{ value: 'Duration (min)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15,23,42,0.9)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
              }}
              labelStyle={{ color: 'rgba(255,255,255,0.8)' }}
              formatter={(value) => [`${value} min`, 'Duration']}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '16px' }}
              formatter={() => `${activityName} Duration`}
            />
            <Line
              type="monotone"
              dataKey="duration"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 4 }}
              activeDot={{ r: 6 }}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
