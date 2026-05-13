import { NextRequest, NextResponse } from 'next/server';
import { storeUserInfo, getUserInfoByLogCode, getUserInfoBySessionId, updateUserSession, deleteUserInfo, getAllUsers, verifySession, getUserInfoBySessionCode } from '@/lib/userService';
import { withRouteTiming } from '@/lib/routeTiming';

export async function POST(request: NextRequest) {
  const { action, log_code, session_id, session_code } = await request.json();

  return withRouteTiming(
    'api/user-info:POST',
    async () => {
      try {
        switch (action) {
          case 'store': {
            if (!log_code || !session_id || !session_code) {
              return NextResponse.json({ error: 'log_code, session_id, and session_code are required' }, { status: 400 });
            }
            const storeResult = await storeUserInfo(log_code, session_id, session_code);
            return NextResponse.json({ success: true, data: storeResult });
          }

          case 'verify': {
            if (!session_code || !log_code) {
              return NextResponse.json({ error: 'session_code and log_code are required' }, { status: 400 });
            }
            const verifyResult = await verifySession(session_code, log_code);
            return NextResponse.json({ success: true, data: verifyResult });
          }

          case 'update': {
            if (!log_code || !session_id) {
              return NextResponse.json({ error: 'log_code and session_id are required' }, { status: 400 });
            }
            const updateResult = await updateUserSession(log_code, session_id);
            return NextResponse.json({ success: true, updated: updateResult });
          }

          case 'delete': {
            if (!log_code) {
              return NextResponse.json({ error: 'log_code is required' }, { status: 400 });
            }
            const deleteResult = await deleteUserInfo(log_code);
            return NextResponse.json({ success: true, deleted: deleteResult });
          }

          default:
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }
      } catch (error) {
        console.error('User info API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
      }
    },
    { action },
  );
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const log_code = searchParams.get('log_code');
  const session_id = searchParams.get('session_id');
  const session_code = searchParams.get('session_code');
  const action = searchParams.get('action');

  return withRouteTiming(
    'api/user-info:GET',
    async () => {
      try {
        switch (action) {
          case 'all': {
            const allUsers = await getAllUsers();
            return NextResponse.json({ success: true, data: allUsers });
          }

          case 'by-log-code': {
            if (!log_code) {
              return NextResponse.json({ error: 'log_code is required' }, { status: 400 });
            }
            const userByCode = await getUserInfoByLogCode(log_code);
            return NextResponse.json({ success: true, data: userByCode });
          }

          case 'by-session-id': {
            if (!session_id) {
              return NextResponse.json({ error: 'session_id is required' }, { status: 400 });
            }
            const userBySession = await getUserInfoBySessionId(session_id);
            return NextResponse.json({ success: true, data: userBySession });
          }

          case 'by-session-code': {
            if (!session_code) {
              return NextResponse.json({ error: 'session_code is required' }, { status: 400 });
            }
            const userBySessionCode = await getUserInfoBySessionCode(session_code);
            return NextResponse.json({ success: true, data: userBySessionCode });
          }

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
    },
    { action: action ?? 'default' },
  );
}
