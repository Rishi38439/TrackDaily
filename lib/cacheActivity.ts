import { connectToDatabase } from './mongodb';

export interface CachedActivity {
  log_code: string;
  activity_name: string;
  activity_data: any;
  deletedAt: Date;
}

export async function cacheDeletedActivity({ log_code, activity_name, activity_data }: { log_code: string; activity_name: string; activity_data: any }) {
  const db = await connectToDatabase();
  const collection = db.collection('cache_activity');
  await collection.insertOne({
    log_code,
    activity_name,
    activity_data,
    deletedAt: new Date(),
  });
}

export async function purgeOldCachedActivities() {
  const db = await connectToDatabase();
  const collection = db.collection('cache_activity');
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  await collection.deleteMany({ deletedAt: { $lt: cutoff } });
}
