export interface Activity {
  id: string;
  sessionId: string;
  name: string;
  category: string;
  duration: number; // in minutes
  timestamp: number; // timestamp in ms
  notes?: string;
}

export interface Session {
  id: string;
  code: string; // 5-digit unique code
  startDate: number;
  logCode?: string; // MongoDB log code
}

export type TimeRange = 'weekly' | 'monthly' | 'yearly';

export interface ActivityStats {
  totalActivities: number;
  totalDuration: number;
  averageDuration: number;
  mostCommonCategory: string;
}

export interface ChartData {
  date: string;
  duration: number;
  count: number;
}

export interface UserInfo {
  _id?: string;
  log_code: string; // 5-digit unique code
  session_id: string;
  createdAT: Date;
  UpdatedAt: Date;
}

export interface AuthState {
  isAuthenticated: boolean;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  sessionCode: string;
}

export interface RegisterData {
  sessionId: string;
  sessionCode: string;
  logCode?: string;
}
