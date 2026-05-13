import { NextRequest, NextResponse } from 'next/server';
import { logActivity } from '@/lib/activityLogger';

export async function POST(request: NextRequest) {
  try {
    const { activityName, log_code, activity_time } = await request.json();
    if (!activityName || !log_code || typeof activity_time !== 'number') {
      console.error('[activity-log] Missing required fields', { activityName, log_code, activity_time });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const result = await logActivity({ activityName, log_code, activity_time });
    console.log(`[activity-log] Collection: ${activityName}, log_code: ${log_code}, result:`, result);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('[activity-log] ERROR:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
