import { getUserInfoCollection } from './mongodb';
import { UserInfo } from '@/types/activity';
import { normalizeMobileNumber } from './phone';

// Generate a unique 5-digit log code
export function generateLogCode(): string {
  return Math.floor(10000 + Math.random() * 90000).toString();
}

// Store user info in the database
export async function storeUserInfo(log_code: string, session_id: string, session_code: string, mobileNo: string): Promise<UserInfo> {
  try {
    const collection = await getUserInfoCollection();
    const now = new Date();
    const mobileNumber = normalizeMobileNumber(mobileNo);
    const userInfo: UserInfo = {
      id: session_id,
      log_code,
      session_id,
      session_code,
      sessionCode: session_code,
      createdAt: now,
      expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      status: 'active',
      lastLoginAt: null,
      createdAT: now,
      UpdatedAt: now,
      mobileNo: mobileNumber,
      mobileNumber,
    };
    // Use upsert to either insert new or update existing log code
    const result = await collection.replaceOne(
      { log_code },
      userInfo,
      { upsert: true }
    );
    if (result.upsertedId) {
      userInfo._id = result.upsertedId.toString();
    }
    return userInfo;
  } catch (error) {
    console.error('Error storing user info:', error);
    throw new Error('Failed to store user information');
  }
}

// Get user info by log code
export async function getUserInfoByLogCode(log_code: string): Promise<UserInfo | null> {
  try {
    const collection = await getUserInfoCollection();
    const userInfo = await collection.findOne({ log_code });
    return userInfo;
  } catch (error) {
    console.error('Error fetching user info:', error);
    throw new Error('Failed to fetch user information');
  }
}

// Get user info by session ID
export async function getUserInfoBySessionId(session_id: string): Promise<UserInfo | null> {
  try {
    const collection = await getUserInfoCollection();
    const userInfo = await collection.findOne({ session_id });
    return userInfo;
  } catch (error) {
    console.error('Error fetching user info by session ID:', error);
    throw new Error('Failed to fetch user information');
  }
}

// Update session ID for an existing user
export async function updateUserSession(log_code: string, newSession_id: string): Promise<boolean> {
  try {
    const collection = await getUserInfoCollection();
    const result = await collection.updateOne(
      { log_code },
      { 
        $set: { 
          session_id: newSession_id,
            id: newSession_id,
          UpdatedAt: new Date()
        }
      }
    );
    
    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Error updating user session:', error);
    throw new Error('Failed to update user session');
  }
}

// Delete user info by log code
export async function deleteUserInfo(log_code: string): Promise<boolean> {
  try {
    const collection = await getUserInfoCollection();
    const result = await collection.deleteOne({ log_code });
    return result.deletedCount > 0;
  } catch (error) {
    console.error('Error deleting user info:', error);
    throw new Error('Failed to delete user information');
  }
}

// Verify session using session_code and log_code
export async function verifySession(session_code: string, log_code: string): Promise<UserInfo | null> {
  try {
    const collection = await getUserInfoCollection();
    const userInfo = await collection.findOne({ session_code, log_code });
    return userInfo;
  } catch (error) {
    console.error('Error verifying session:', error);
    throw new Error('Failed to verify session');
  }
}

// Get user info by session code
export async function getUserInfoBySessionCode(session_code: string): Promise<UserInfo | null> {
  try {
    const collection = await getUserInfoCollection();
    const userInfo = await collection.findOne({ session_code });
    return userInfo;
  } catch (error) {
    console.error('Error fetching user info by session code:', error);
    throw new Error('Failed to fetch user information');
  }
}

// Get user info by session code and mobile number
export async function getUserInfoBySessionCodeAndMobile(session_code: string, mobileNo: string): Promise<UserInfo | null> {
  try {
    const collection = await getUserInfoCollection();
    const normalizedMobileNumber = normalizeMobileNumber(mobileNo);
    const userInfo = await collection.findOne({
      status: 'active',
      expiresAt: { $gt: new Date() },
      $or: [
        { session_code, mobileNo: normalizedMobileNumber },
        { sessionCode: session_code, mobileNumber: normalizedMobileNumber },
        { session_code, mobileNumber: normalizedMobileNumber },
      ],
    });
    return userInfo;
  } catch (error) {
    console.error('Error fetching user info by session code and mobile:', error);
    throw new Error('Failed to fetch user information');
  }
}

export async function getUserInfoByMobileNumber(mobileNo: string): Promise<UserInfo | null> {
  try {
    const collection = await getUserInfoCollection();
    const normalizedMobileNumber = normalizeMobileNumber(mobileNo);
    const userInfo = await collection.findOne({
      mobileNumber: normalizedMobileNumber,
    });

    if (userInfo) {
      return userInfo;
    }

    return await collection.findOne({ mobileNo: normalizedMobileNumber });
  } catch (error) {
    console.error('Error fetching user info by mobile number:', error);
    throw new Error('Failed to fetch user information');
  }
}

export async function getUserInfoBySessionCodeOnly(session_code: string): Promise<UserInfo | null> {
  try {
    const collection = await getUserInfoCollection();
    const userInfo = await collection.findOne({
      $or: [
        { session_code },
        { sessionCode: session_code },
      ],
    });
    return userInfo;
  } catch (error) {
    console.error('Error fetching user info by session code:', error);
    throw new Error('Failed to fetch user information');
  }
}

export async function updateSessionLastLogin(session_code: string, mobileNo: string): Promise<boolean> {
  try {
    const collection = await getUserInfoCollection();
    const normalizedMobileNumber = normalizeMobileNumber(mobileNo);
    const result = await collection.updateOne(
      {
        $or: [
          { session_code, mobileNo: normalizedMobileNumber },
          { sessionCode: session_code, mobileNumber: normalizedMobileNumber },
          { session_code, mobileNumber: normalizedMobileNumber },
        ],
      },
      {
        $set: {
          lastLoginAt: new Date(),
          UpdatedAt: new Date(),
          status: 'active',
        },
      },
    );

    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Error updating session last login:', error);
    throw new Error('Failed to update last login');
  }
}

// Get all users (for admin purposes)
export async function getAllUsers(): Promise<UserInfo[]> {
  try {
    const collection = await getUserInfoCollection();
    const users = await collection.find({}).sort({ createdAT: -1 }).toArray();
    return users;
  } catch (error) {
    console.error('Error fetching all users:', error);
    throw new Error('Failed to fetch users');
  }
}
