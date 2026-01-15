/**
 * 데이터 동기화 API 라우트
 *
 * 수동으로 플랫폼 데이터 동기화를 트리거합니다.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { executeSyncAndWait, getUserSyncJobs } from '@/lib/platforms/syncData';
import type { PlatformCode } from '@/types/database';

// Vercel 서버리스 함수 타임아웃 설정 (최대 60초)
export const maxDuration = 60;

// 유효한 플랫폼 코드 목록
const VALID_PLATFORMS: PlatformCode[] = [
  'naver',
  'google',
  'meta',
  'kakao',
  'coupang',
  'gmarket',
  'eleventh',
  'naver_store',
  'ga4',
  'naver_analytics',
];

/**
 * POST /api/sync
 * 데이터 동기화 트리거
 *
 * Body:
 * - platform?: PlatformCode - 특정 플랫폼만 동기화 (없으면 전체)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 현재 사용자 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 요청 본문 파싱
    let body: { platform?: PlatformCode } = {};
    try {
      body = await request.json();
    } catch {
      // 본문이 없어도 OK (전체 동기화)
    }

    const { platform } = body;

    // 플랫폼 코드 검증
    if (platform && !VALID_PLATFORMS.includes(platform)) {
      return NextResponse.json(
        { error: '지원하지 않는 플랫폼입니다.' },
        { status: 400 }
      );
    }

    // 연동된 플랫폼 목록 조회
    const { data: connections } = await supabase
      .from('platform_connections')
      .select('platform')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .returns<Array<{ platform: string }>>();

    if (!connections || connections.length === 0) {
      return NextResponse.json(
        { error: '연동된 플랫폼이 없습니다.' },
        { status: 400 }
      );
    }

    const connectedPlatforms = connections.map(c => c.platform as PlatformCode);

    // 특정 플랫폼 동기화
    if (platform) {
      if (!connectedPlatforms.includes(platform)) {
        return NextResponse.json(
          { error: '해당 플랫폼이 연동되어 있지 않습니다.' },
          { status: 400 }
        );
      }

      // 동기적으로 실행하고 결과 대기 (Vercel 서버리스 환경 대응)
      const { jobId, result } = await executeSyncAndWait(user.id, platform);

      return NextResponse.json({
        success: result.success,
        message: result.message,
        jobId,
        recordCount: result.recordCount,
        error: result.error,
      });
    }

    // 전체 플랫폼 동기화 (순차 실행)
    const results: Array<{ platform: PlatformCode; jobId: string; success: boolean; message: string }> = [];

    for (const p of connectedPlatforms) {
      const { jobId, result } = await executeSyncAndWait(user.id, p);
      results.push({
        platform: p,
        jobId,
        success: result.success,
        message: result.message,
      });
    }

    const successCount = results.filter(r => r.success).length;

    return NextResponse.json({
      success: successCount > 0,
      message: `${successCount}/${connectedPlatforms.length}개 플랫폼 동기화 완료`,
      results,
      platforms: connectedPlatforms,
    });
  } catch (error) {
    console.error('[Sync API] POST error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/sync
 * 동기화 작업 목록 조회
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // 현재 사용자 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 최근 동기화 작업 조회
    const jobs = await getUserSyncJobs(user.id, 20);

    return NextResponse.json({
      success: true,
      jobs,
    });
  } catch (error) {
    console.error('[Sync API] GET error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
