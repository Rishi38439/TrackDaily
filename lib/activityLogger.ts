import { connectToDatabase } from './mongodb';

export interface ActivityLog {
  log_code: string;
  activity_time: number;
  date: string; // YYYY-MM-DD
  updated_time: Date;
  update_count: number;
}

export async function logActivity({ activityName, log_code, activity_time }: { activityName: string; log_code: string; activity_time: number; }) {
  const db = await connectToDatabase();
  // Use activityName + '_' + log_code as the collection name
  const collectionName = `${activityName}_${log_code}`;
  const collection = db.collection(collectionName);
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];

  // Try to find today's log for this user
  const existing = await collection.findOne({ log_code, date: dateStr });

  if (!existing) {
    // Insert new log
    await collection.insertOne({
      log_code,
      activity_time,
      date: dateStr,
      updated_time: today,
      update_count: 1,
    });
    return { created: true };
  } else {
    // Update logic
    const newCount = (existing.update_count || 1) + 1;
    if (newCount > 2) {
      await collection.updateOne(
        { _id: existing._id },
        { $set: { activity_time, updated_time: today, update_count: newCount } }
      );
      return { updated: true, update_count: newCount };
    } else {
      await collection.updateOne(
        { _id: existing._id },
        { $set: { updated_time: today }, $inc: { update_count: 1 } }
      );
      return { updated: false, update_count: newCount };
    }
  }
}
