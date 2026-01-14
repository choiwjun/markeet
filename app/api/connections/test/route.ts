/**
 * 플랫폼 연결 테스트 API 라우트
 * TASK-409: 플랫폼 연결 테스트 기능
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { testPlatformConnection } from '@/lib/platforms/connectionTest';
import type { PlatformCode } from '@/types/database';

// 요청 본문 타입
interface TestRequestBody {
  platform: PlatformCode;
  credentials: Record<string, string>;
}

/**
 * POST /api/connections/test
 * 플랫폼 API 연결 테스트
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
    const body: TestRequestBody = await request.json();
    const { platform, credentials } = body;

    // 필수 필드 검증
    if (!platform) {
      return NextResponse.json(
        { error: '플랫폼 코드가 필요합니다.' },
        { status: 400 }
      );
    }

    if (!credentials || Object.keys(credentials).length === 0) {
      return NextResponse.json(
        { error: '자격 증명이 필요합니다.' },
        { status: 400 }
      );
    }

    // 연결 테스트 실행
    const result = await testPlatformConnection(platform, credentials);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      details: result.details,
    });
  } catch (error) {
    console.error('[Connection Test API] Error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
