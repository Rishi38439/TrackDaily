import { MongoClient, Db, Collection, Document } from 'mongodb';
import { UserInfo } from '@/types/activity';

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
  
  return collection;
}
