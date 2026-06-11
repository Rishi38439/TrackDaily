import { MongoClient, Db, Collection, Document } from 'mongodb';
import { UserInfo } from '@/types/activity';
import type { OtpChallenge, VerificationTokenEntry, RateLimitEntry } from './authSecurity';

// MongoDB connection configuration
const MONGODB_URI = 'mongodb://localhost:27017/';
const MONGODB_DB = 'TrackDaily';

let client: MongoClient | null = null;
let db: Db | null = null;

// Connection state management
let isConnecting = false;
let connectionPromise: Promise<void> | null = null;

export async function connectToDatabase(): Promise<Db> {
  if (db && client) {
    return db;
  }

  if (isConnecting && connectionPromise) {
    await connectionPromise;
    return db!;
  }

  isConnecting = true;
  connectionPromise = (async () => {
    try {
      client = new MongoClient(MONGODB_URI);
      await client.connect();
      db = client.db(MONGODB_DB);
      console.log('Connected to MongoDB successfully');
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      throw error;
    } finally {
      isConnecting = false;
    }
  })();

  await connectionPromise;
  return db!;
}

export async function disconnectFromDatabase(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('Disconnected from MongoDB');
  }
}

export function getCollection<T extends Document>(collectionName: string): Collection<T> {
  if (!db) {
    throw new Error('Database not connected. Call connectToDatabase() first.');
  }
  return db.collection<T>(collectionName);
}

// User info specific functions
export async function getUserInfoCollection(): Promise<Collection<UserInfo>> {
  const database = await connectToDatabase();
  const collection = database.collection<UserInfo>('user_info');
  
  // Create indexes for better performance
  await collection.createIndex({ log_code: 1 }, { unique: true });
  await collection.createIndex({ session_id: 1 });
  await collection.createIndex({ session_code: 1 });
  await collection.createIndex({ mobileNo: 1 });
  await collection.createIndex({ mobileNumber: 1 });
  await collection.createIndex({ session_code: 1, mobileNo: 1 });
  await collection.createIndex({ sessionCode: 1, mobileNumber: 1 });
  await collection.createIndex({ mobileNumber: 1, sessionCode: 1 });
  
  return collection;
}

export async function getOtpCollection(): Promise<Collection<OtpChallenge>> {
  const database = await connectToDatabase();
  const collection = database.collection<OtpChallenge>('otp_challenges');
  // TTL index to automatically delete expired OTPs
  await collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  await collection.createIndex({ mobileNumber: 1 }, { unique: true });
  return collection;
}

export async function getVerificationTokenCollection(): Promise<Collection<VerificationTokenEntry>> {
  const database = await connectToDatabase();
  const collection = database.collection<VerificationTokenEntry>('verification_tokens');
  await collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  await collection.createIndex({ token: 1 }, { unique: true });
  return collection;
}

export async function getRateLimitCollection(): Promise<Collection<RateLimitEntry>> {
  const database = await connectToDatabase();
  const collection = database.collection<RateLimitEntry>('rate_limits');
  await collection.createIndex({ windowStart: 1 }, { expireAfterSeconds: 86400 });
  await collection.createIndex({ key: 1 }, { unique: true });
  return collection;
}
