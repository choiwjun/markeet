/**
 * 동기화 작업 상세 조회 API 라우트
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSyncJobStatus } from '@/lib/platforms/syncData';

/**
 * GET /api/sync/[jobId]
 * 특정 동기화 작업 상태 조회
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const supabase = await createClient();
    const { jobId } = await params;

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

    // 작업 상태 조회
    const jobStatus = await getSyncJobStatus(jobId);

    if (!jobStatus) {
      return NextResponse.json(
        { error: '동기화 작업을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      jobId,
      status: jobStatus.status,
      result: jobStatus.result,
    });
  } catch (error) {
    console.error('[Sync Job API] GET error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
