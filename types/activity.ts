export interface Activity {
  id: string;
  sessionId: string;
  name: string;
  category: string;
  duration: number; // in minutes
  calories: number;
  timestamp: number; // timestamp in ms
  notes?: string;
}

export type ActivityCategory = 
  | 'cardio'
  | 'strength'
  | 'flexibility'
  | 'sports'
  | 'outdoor'
  | 'mind'
  | 'other';

export interface Session {
  id: string;
  code: string; // 5-digit unique code
  startDate: number;
}

export type TimeRange = 'weekly' | 'monthly' | 'yearly';

export interface ActivityStats {
  totalActivities: number;
  totalDuration: number;
  totalCalories: number;
  averageDuration: number;
  mostCommonCategory: string;
}

export interface ChartData {
  date: string;
  duration: number;
  calories: number;
  count: number;
}
