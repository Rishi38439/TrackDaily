import { NextRequest, NextResponse } from 'next/server';
import { storeUserInfo, getUserInfoByLogCode, getUserInfoBySessionId, updateUserSession, deleteUserInfo, getAllUsers } from '@/lib/userService';

export async function POST(request: NextRequest) {
  try {
    const { action, log_code, session_id } = await request.json();

    switch (action) {
      case 'store':
        if (!log_code || !session_id) {
          return NextResponse.json({ error: 'log_code and session_id are required' }, { status: 400 });
        }
        const storeResult = await storeUserInfo(log_code, session_id);
        return NextResponse.json({ success: true, data: storeResult });

      case 'update':
        if (!log_code || !session_id) {
          return NextResponse.json({ error: 'log_code and session_id are required' }, { status: 400 });
        }
        const updateResult = await updateUserSession(log_code, session_id);
        return NextResponse.json({ success: true, updated: updateResult });

      case 'delete':
        if (!log_code) {
          return NextResponse.json({ error: 'log_code is required' }, { status: 400 });
        }
        const deleteResult = await deleteUserInfo(log_code);
        return NextResponse.json({ success: true, deleted: deleteResult });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('User info API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const log_code = searchParams.get('log_code');
    const session_id = searchParams.get('session_id');
    const action = searchParams.get('action');

    switch (action) {
      case 'all':
        const allUsers = await getAllUsers();
        return NextResponse.json({ success: true, data: allUsers });

      case 'by-log-code':
        if (!log_code) {
          return NextResponse.json({ error: 'log_code is required' }, { status: 400 });
        }
        const userByCode = await getUserInfoByLogCode(log_code);
        return NextResponse.json({ success: true, data: userByCode });

      case 'by-session-id':
        if (!session_id) {
          return NextResponse.json({ error: 'session_id is required' }, { status: 400 });
        }
        const userBySession = await getUserInfoBySessionId(session_id);
        return NextResponse.json({ success: true, data: userBySession });

      default:
        if (log_code) {
          const defaultUser = await getUserInfoByLogCode(log_code);
          return NextResponse.json({ success: true, data: defaultUser });
        }
        return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }
  } catch (error) {
    console.error('User info API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
