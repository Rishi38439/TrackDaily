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
  createdAt?: number;
  expiresAt?: number;
  status?: 'active' | 'inactive' | 'expired';
  lastLoginAt?: number | null;
  logCode?: string; // MongoDB log code
  mobileNo?: string;
  mobileNumber?: string;
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

export interface UserInfo {
  _id?: string;
  id?: string;
  log_code: string; // 5-digit unique code
  session_id: string;
  session_code: string; // 5-character alphanumeric code
  createdAt?: Date;
  expiresAt?: Date;
  status?: 'active' | 'inactive' | 'expired';
  lastLoginAt?: Date | null;
  createdAT?: Date;
  UpdatedAt?: Date;
  mobileNo?: string;
  mobileNumber?: string;
  sessionCode?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  sessionCode: string;
  mobileNumber: string;
  verificationToken?: string;
}

export interface RegisterData {
  sessionId: string;
  sessionCode: string;
  logCode?: string;
}
