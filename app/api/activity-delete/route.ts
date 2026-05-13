import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { cacheDeletedActivity } from '@/lib/cacheActivity';

export async function POST(request: NextRequest) {
  try {
    const { activityName, log_code, activityId } = await request.json();
    if (!activityName || !log_code || !activityId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const db = await connectToDatabase();
    const collectionName = `${activityName}_${log_code}`;
    const collection = db.collection(collectionName);
    const activity = await collection.findOne({ id: activityId });
    if (!activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }
    // Cache the deleted activity
    await cacheDeletedActivity({ log_code, activity_name: activityName, activity_data: activity });
    // Delete from original collection
    await collection.deleteOne({ id: activityId });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[activity-delete] ERROR:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
