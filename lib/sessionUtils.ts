import { v4 as uuidv4 } from 'uuid';

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
 * Create a new session object with unique code
 */
export function createSession() {
  const session = {
    id: uuidv4(),
    code: generateSessionCode(),
    startDate: Date.now(),
  };
  console.log('[v0] Created new session:', session);
  return session;
}

/**
 * Validate if a session code matches the stored code
 */
export function validateSessionCode(storedCode: string, enteredCode: string): boolean {
  const isValid = storedCode === enteredCode.toUpperCase();
  console.log('[v0] Session code validation:', { isValid });
  return isValid;
}
