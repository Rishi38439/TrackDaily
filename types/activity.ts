export interface Activity {
  id: string;
  sessionId: string;
  name: string;
  duration: number; // in minutes
  timestamp: number; // timestamp in ms
  notes?: string;
}

export interface Session {
  id: string;
  code: string; // 5-digit unique code
  startDate: number;
}

export type TimeRange = 'weekly' | 'monthly' | 'yearly';

export interface ActivityStats {
  totalActivities: number;
  totalDuration: number;
  averageDuration: number;
}

export interface ChartData {
  date: string;
  duration: number;
  count: number;
}
