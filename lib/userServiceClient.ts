import { UserInfo } from '@/types/activity';

// Client-side user service using API calls
export async function storeUserInfo(log_code: string, session_id: string, session_code: string, mobileNo?: string): Promise<UserInfo> {
  try {
    const response = await fetch('/api/user-info', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'store',
        log_code,
        session_id,
        session_code,
        mobileNo,
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error || 'Failed to store user information');
    }
  } catch (error) {
    console.error('Error storing user info via API:', error);
    throw new Error('Failed to store user information');
  }
}

export async function getUserInfoByLogCode(log_code: string): Promise<UserInfo | null> {
  try {
    const response = await fetch(`/api/user-info?log_code=${log_code}&action=by-log-code`);
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error || 'Failed to fetch user information');
    }
  } catch (error) {
    console.error('Error fetching user info via API:', error);
    return null;
  }
}

export async function getUserInfoBySessionId(session_id: string): Promise<UserInfo | null> {
  try {
    const response = await fetch(`/api/user-info?session_id=${session_id}&action=by-session-id`);
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error || 'Failed to fetch user information');
    }
  } catch (error) {
    console.error('Error fetching user info via API:', error);
    return null;
  }
}

export async function getUserInfoBySessionCodeAndMobile(session_code: string, mobileNo: string): Promise<UserInfo | null> {
  try {
    const response = await fetch(`/api/user-info?session_code=${session_code}&mobileNo=${mobileNo}&action=by-session-code`);
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error || 'Failed to fetch user information');
    }
  } catch (error) {
    console.error('Error fetching user info via API:', error);
    return null;
  }
}

export async function updateUserSession(log_code: string, newSession_id: string): Promise<boolean> {
  try {
    const response = await fetch('/api/user-info', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'update',
        log_code,
        session_id: newSession_id,
      }),
    });

    const result = await response.json();
    return result.success ? result.updated : false;
  } catch (error) {
    console.error('Error updating user session via API:', error);
    return false;
  }
}

export async function deleteUserInfo(log_code: string): Promise<boolean> {
  try {
    const response = await fetch('/api/user-info', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'delete',
        log_code,
      }),
    });

    const result = await response.json();
    return result.success ? result.deleted : false;
  } catch (error) {
    console.error('Error deleting user info via API:', error);
    return false;
  }
}

export async function getAllUsers(): Promise<UserInfo[]> {
  try {
    const response = await fetch('/api/user-info?action=all');
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error || 'Failed to fetch users');
    }
  } catch (error) {
    console.error('Error fetching all users via API:', error);
    return [];
  }
}

// Verify session using session_code and log_code
export async function verifySession(session_code: string, log_code: string): Promise<UserInfo | null> {
  try {
    const response = await fetch('/api/user-info', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'verify',
        session_code,
        log_code,
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error || 'Failed to verify session');
    }
  } catch (error) {
    console.error('Error verifying session via API:', error);
    throw new Error('Failed to verify session');
  }
}

export interface LoginSessionResult {
  success: boolean;
  message?: string;
  error?: string;
  reason?: 'session_code_mismatch' | 'mobile_number_mismatch' | 'session_expired' | 'session_inactive' | 'otp_not_verified' | 'rate_limited';
  session?: {
    id: string;
    code: string;
    startDate: number;
    createdAt?: number;
    expiresAt?: number;
    status?: 'active' | 'inactive' | 'expired';
    lastLoginAt?: number | null;
    logCode?: string;
    mobileNo?: string;
    mobileNumber?: string;
  };
}

export async function loginWithSessionCode(mobileNumber: string, sessionCode: string, verificationToken: string): Promise<LoginSessionResult> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mobileNumber,
        sessionCode,
        verificationToken,
      }),
    });

    return (await response.json()) as LoginSessionResult;
  } catch (error) {
    console.error('Error logging in via API:', error);
    return { success: false, error: 'Failed to sign in. Please try again.' };
  }
}

// Keep the original generateLogCode function
export function generateLogCode(): string {
  return Math.floor(10000 + Math.random() * 90000).toString();
}
