import { v4 as uuidv4 } from 'uuid';
import { storeUserInfo, generateLogCode } from './userServiceClient';

/**
 * Generate a random 5-digit code
 * Format: XXXXX (uppercase letters and numbers)
 */
export function generateSessionCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  console.log('[v0] Generated session code:', code);
  return code;
}

/**
 * Create a new session object with unique code and store in MongoDB
 */
export async function createSession() {
  const session = {
    id: uuidv4(),
    code: generateSessionCode(),
    startDate: Date.now(),
  };
  console.log('[v0] Created new session:', session);
  
  // Store user info in MongoDB
  try {
    const logCode = generateLogCode();
    await storeUserInfo(logCode, session.id, session.code);
    console.log('[v0] ✅ Successfully stored user info in MongoDB:');
    console.log('   - Log Code:', logCode);
    console.log('   - Session Code:', session.code);
    console.log('   - Session ID:', session.id);
    console.log('   - Check MongoDB Compass for new document in user_info collection');
    return { ...session, logCode };
  } catch (error) {
    console.error('[v0] Failed to store user info in MongoDB:', error);
    // Still return session even if MongoDB storage fails
    return session;
  }
}

/**
 * Validate if a session code matches the stored code
 */
export function validateSessionCode(storedCode: string, enteredCode: string): boolean {
  const isValid = storedCode === enteredCode.toUpperCase();
  console.log('[v0] Session code validation:', { isValid });
  return isValid;
}
