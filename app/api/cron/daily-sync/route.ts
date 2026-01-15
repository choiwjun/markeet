/**
 * 일일 데이터 동기화 Cron API
 *
 * Vercel Cron 또는 외부 스케줄러에서 호출됩니다.
 * 매일 새벽 3시(KST)에 모든 사용자의 플랫폼 데이터를 동기화합니다.
 *
 * 설정 방법 (vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/daily-sync",
 *     "schedule": "0 18 * * *"
 *   }]
 * }
 */

import { NextRequest, NextResponse } from 'next/server';

// Cron 인증 토큰 검증
function verifyCronAuth(request: NextRequest): boolean {
  // Vercel Cron은 자동으로 CRON_SECRET 헤더를 포함
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    // CRON_SECRET이 설정되지 않은 경우, 개발 환경에서만 허용
    return process.env.NODE_ENV === 'development';
  }

  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${cronSecret}`;
}

/**
 * GET /api/cron/daily-sync
 * 일일 동기화 실행 (Vercel Cron에서 호출)
 */
export async function GET(request: NextRequest) {
  // 인증 검증
  if (!verifyCronAuth(request)) {
    return NextResponse.json(
      { error: '인증이 필요합니다.' },
      { status: 401 }
    );
  }

  console.log('[Daily Sync Cron] Starting daily sync...');

  try {
    // Supabase Admin 클라이언트 사용
    const { createServerClient } = await import('@supabase/ssr');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('[Daily Sync Cron] Missing Supabase credentials');
      return NextResponse.json(
        { error: 'Supabase 설정이 필요합니다.' },
        { status: 500 }
      );
    }

    const supabase = createServerClient(supabaseUrl, serviceRoleKey, {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    });

    // 모든 활성 플랫폼 연결 조회
    const { data: connections, error: fetchError } = await supabase
      .from('platform_connections')
      .select('id, user_id, platform')
      .eq('status', 'active');

    if (fetchError) {
      console.error('[Daily Sync Cron] Failed to fetch connections:', fetchError);
      return NextResponse.json(
        { error: '연결 목록 조회 실패' },
        { status: 500 }
      );
    }

    if (!connections || connections.length === 0) {
      console.log('[Daily Sync Cron] No active connections found');
      return NextResponse.json({
        success: true,
        message: '동기화할 연결이 없습니다.',
        syncedCount: 0,
      });
    }

    // 동기화 모듈 동적 import
    const { triggerDataSync } = await import('@/lib/platforms/syncData');

    // 각 연결에 대해 동기화 실행
    const results = [];
    let successCount = 0;
    let failCount = 0;

    for (const connection of connections) {
      try {
        console.log(`[Daily Sync Cron] Syncing ${connection.platform} for user ${connection.user_id}`);

        const jobId = await triggerDataSync(connection.user_id, connection.platform);

        results.push({
          connectionId: connection.id,
          platform: connection.platform,
          jobId,
          success: true,
        });

        successCount++;

        // Rate limiting: 각 동기화 간 1초 대기
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
        console.error(`[Daily Sync Cron] Failed to sync ${connection.platform}:`, errorMessage);

        results.push({
          connectionId: connection.id,
          platform: connection.platform,
          success: false,
          error: errorMessage,
        });

        failCount++;
      }
    }

    console.log(`[Daily Sync Cron] Completed: ${successCount} success, ${failCount} failed`);

    return NextResponse.json({
      success: true,
      message: `일일 동기화 완료: ${successCount}개 성공, ${failCount}개 실패`,
      syncedCount: successCount,
      failedCount: failCount,
      results,
    });
  } catch (error) {
    console.error('[Daily Sync Cron] Error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// POST도 지원 (수동 트리거용)
export async function POST(request: NextRequest) {
  return GET(request);
}
