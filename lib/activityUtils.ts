import { Activity, ActivityStats, ChartData, Session } from '@/types/activity';
import { v4 as uuidv4 } from 'uuid';

export const generateSessionId = (): string => uuidv4();

export const generateActivityId = (): string => uuidv4();

export const calculateStats = (activities: Activity[]): ActivityStats => {
  if (activities.length === 0) {
    return {
      totalActivities: 0,
      totalDuration: 0,
      averageDuration: 0,
      mostCommonCategory: 'N/A',
    };
  }

  const totalDuration = activities.reduce((sum, a) => sum + a.duration, 0);
  
  const categoryCounts = activities.reduce((acc, a) => {
    acc[a.category] = (acc[a.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostCommonCategory = Object.entries(categoryCounts).sort(
    ([, a], [, b]) => b - a
  )[0]?.[0] || 'N/A';

  return {
    totalActivities: activities.length,
    totalDuration,
    averageDuration: Math.round(totalDuration / activities.length),
    mostCommonCategory,
  };
};

export const getChartData = (activities: Activity[], days: number = 7): ChartData[] => {
  const now = new Date();
  const dates: Record<string, ChartData> = {};

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    dates[dateStr] = { date: dateStr, duration: 0, count: 0 };
  }

  activities.forEach((activity) => {
    const date = new Date(activity.timestamp);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (dates[dateStr]) {
      dates[dateStr].duration += activity.duration;
      dates[dateStr].count += 1;
    }
  });

  return Object.values(dates);
};

export const exportActivitiesToJson = (activities: Activity[]): string => {
  return JSON.stringify(activities, null, 2);
};

export const importActivitiesFromJson = (json: string): Activity[] => {
  try {
    const parsed = JSON.parse(json);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    throw new Error('Invalid format');
  } catch {
    throw new Error('Failed to parse JSON');
  }
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins > 0 ? mins + 'm' : ''}`.trim();
};

export const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    cardio: '#ef4444',
    strength: '#3b82f6',
    flexibility: '#ec4899',
    sports: '#f59e0b',
    outdoor: '#10b981',
    mind: '#8b5cf6',
    other: '#06b6d4',
  };
  return colors[category] || '#06b6d4';
};

export const getCategoryIcon = (category: string): string => {
  const icons: Record<string, string> = {
    cardio: '❤️',
    strength: '💪',
    flexibility: '🧘',
    sports: '⚽',
    outdoor: '🌲',
    mind: '🧠',
    other: '📌',
  };
  return icons[category] || '📌';
};
