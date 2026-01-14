/**
 * 개별 플랫폼 연동 API 라우트
 * TASK-413: 플랫폼 연동 삭제 기능 구현
 * TASK-414: API 키 갱신 기능 구현
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { encryptCredentials } from '@/lib/supabase/vault';
import { triggerDataSync } from '@/lib/platforms/syncData';
import type { PlatformCode, PlatformStatus, PlatformConnectionUpdate } from '@/types/database';

// 요청 본문 타입
interface UpdateRequestBody {
  credentials: Record<string, string>;
}

// DB 조회 결과 타입
interface ConnectionRow {
  id: string;
  platform: PlatformCode;
  status: PlatformStatus;
  created_at: string;
  last_sync_at: string | null;
}

interface ExistingConnectionRow {
  id: string;
  platform: PlatformCode;
}

/**
 * GET /api/connections/:id
 * 특정 연동 정보 조회
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // 연동 정보 조회
    const { data, error: fetchError } = await supabase
      .from('platform_connections')
      .select('id, platform, status, created_at, last_sync_at')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !data) {
      return NextResponse.json(
        { error: '연동 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const connection = data as ConnectionRow;
    return NextResponse.json({ connection });
  } catch (error) {
    console.error('[Connection API] GET error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/connections/:id
 * API 키 갱신 (TASK-414)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // 기존 연동 확인
    const { data: existing, error: findError } = await supabase
      .from('platform_connections')
      .select('id, platform')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (findError || !existing) {
      return NextResponse.json(
        { error: '연동 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const existingConnection = existing as ExistingConnectionRow;

    // 요청 본문 파싱
    const body: UpdateRequestBody = await request.json();
    const { credentials } = body;

    if (!credentials || Object.keys(credentials).length === 0) {
      return NextResponse.json(
        { error: '자격 증명이 필요합니다.' },
        { status: 400 }
      );
    }

    // 자격 증명 암호화
    const encryptedCredentials = await encryptCredentials(credentials);

    // 연동 정보 갱신
    const updateData = {
      api_key_encrypted: encryptedCredentials,
      status: 'active' as const,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error: updateError } = await (supabase
      .from('platform_connections') as any)
      .update(updateData)
      .eq('id', id)
      .select('id, platform, status, created_at, last_sync_at')
      .single();

    if (updateError || !data) {
      console.error('[Connection API] Update error:', updateError);
      return NextResponse.json(
        { error: '연동 정보 갱신에 실패했습니다.' },
        { status: 500 }
      );
    }

    const updatedConnection = data as ConnectionRow;

    // 데이터 동기화 트리거
    triggerDataSync(user.id, existingConnection.platform).catch(error => {
      console.error('[Connection API] Sync trigger error:', error);
    });

    return NextResponse.json({
      connection: {
        id: updatedConnection.id,
        platform: updatedConnection.platform,
        status: updatedConnection.status,
        created_at: updatedConnection.created_at,
        last_sync_at: updatedConnection.last_sync_at,
      },
    });
  } catch (error) {
    console.error('[Connection API] PATCH error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/connections/:id
 * 플랫폼 연동 삭제 (TASK-413)
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // 기존 연동 확인
    const { data: existingConnection, error: findError } = await supabase
      .from('platform_connections')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (findError || !existingConnection) {
      return NextResponse.json(
        { error: '연동 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 연동 삭제
    const { error: deleteError } = await supabase
      .from('platform_connections')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('[Connection API] Delete error:', deleteError);
      return NextResponse.json(
        { error: '연동 삭제에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: '연동이 삭제되었습니다.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Connection API] DELETE error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
