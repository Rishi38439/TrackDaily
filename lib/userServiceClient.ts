import { UserInfo } from '@/types/activity';

// Client-side user service using API calls
export async function storeUserInfo(log_code: string, session_id: string, session_code: string): Promise<UserInfo> {
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

export async function getUserInfoBySessionCode(session_code: string): Promise<UserInfo | null> {
  try {
    const response = await fetch(`/api/user-info?session_code=${session_code}&action=by-session-code`);
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

// Keep the original generateLogCode function
export function generateLogCode(): string {
  return Math.floor(10000 + Math.random() * 90000).toString();
}
