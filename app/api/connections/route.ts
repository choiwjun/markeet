/**
 * 플랫폼 연동 API 라우트
 * TASK-407: 플랫폼 연동 저장 API 라우트 생성
 * TASK-410: 연동된 플랫폼 목록 조회 API 생성
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { encryptCredentials } from '@/lib/supabase/vault';
import { triggerDataSync } from '@/lib/platforms/syncData';
import type { PlatformCode, PlatformStatus, PlatformConnectionInsert, PlatformConnectionUpdate } from '@/types/database';

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

// 자격 증명 최대 크기 (10KB)
const MAX_CREDENTIALS_SIZE = 10 * 1024;

// 요청 본문 타입
interface ConnectionRequestBody {
  platform: PlatformCode;
  credentials: Record<string, string>;
}

/**
 * 플랫폼 코드 유효성 검사
 */
function isValidPlatform(platform: unknown): platform is PlatformCode {
  return typeof platform === 'string' && VALID_PLATFORMS.includes(platform as PlatformCode);
}

/**
 * 자격 증명 유효성 검사
 */
function validateCredentials(credentials: unknown): { valid: boolean; error?: string } {
  if (!credentials || typeof credentials !== 'object') {
    return { valid: false, error: '자격 증명이 필요합니다.' };
  }

  const creds = credentials as Record<string, unknown>;

  if (Object.keys(creds).length === 0) {
    return { valid: false, error: '자격 증명이 비어있습니다.' };
  }

  // 크기 제한 검사
  const credentialsJson = JSON.stringify(creds);
  if (credentialsJson.length > MAX_CREDENTIALS_SIZE) {
    return { valid: false, error: '자격 증명이 너무 큽니다.' };
  }

  // 모든 값이 문자열인지 검사
  for (const [key, value] of Object.entries(creds)) {
    if (typeof value !== 'string') {
      return { valid: false, error: `자격 증명 필드 '${key}'는 문자열이어야 합니다.` };
    }
  }

  return { valid: true };
}

// 응답 타입
interface ConnectionResponse {
  id: string;
  platform: PlatformCode;
  status: PlatformStatus;
  created_at: string;
  last_sync_at: string | null;
}

// DB 조회 결과 타입
interface ConnectionRow {
  id: string;
  platform: PlatformCode;
  status: PlatformStatus;
  created_at: string;
  last_sync_at: string | null;
}

/**
 * GET /api/connections
 * 사용자의 연동된 플랫폼 목록 조회 (TASK-410)
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

    // 연동 목록 조회
    const { data, error: fetchError } = await supabase
      .from('platform_connections')
      .select('id, platform, status, created_at, last_sync_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('[Connections API] Fetch error:', fetchError);
      return NextResponse.json(
        { error: '연동 목록 조회에 실패했습니다.' },
        { status: 500 }
      );
    }

    const connections = (data || []) as ConnectionRow[];
    return NextResponse.json({ connections });
  } catch (error) {
    console.error('[Connections API] GET error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/connections
 * 새 플랫폼 연동 저장 (TASK-407)
 */
export async function POST(request: NextRequest) {
  let userId: string | undefined;
  let platform: string | undefined;

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

    userId = user.id;

    // 요청 본문 파싱
    let body: ConnectionRequestBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: '요청 형식이 올바르지 않습니다.' },
        { status: 400 }
      );
    }

    platform = body.platform;
    const { credentials } = body;

    // 플랫폼 코드 검증
    if (!isValidPlatform(platform)) {
      return NextResponse.json(
        { error: '지원하지 않는 플랫폼입니다.' },
        { status: 400 }
      );
    }

    // 자격 증명 검증
    const credentialsValidation = validateCredentials(credentials);
    if (!credentialsValidation.valid) {
      return NextResponse.json(
        { error: credentialsValidation.error },
        { status: 400 }
      );
    }

    // 기존 연동 확인
    const { data: existingConnection } = await supabase
      .from('platform_connections')
      .select('id')
      .eq('user_id', user.id)
      .eq('platform', platform)
      .single();

    if (existingConnection) {
      return NextResponse.json(
        { error: '이미 연동된 플랫폼입니다. PUT 메서드를 사용하여 갱신하세요.' },
        { status: 409 }
      );
    }

    // 자격 증명 암호화 (TASK-408)
    let encryptedCredentials: string;
    try {
      encryptedCredentials = await encryptCredentials(credentials as Record<string, string>);
    } catch (encryptError) {
      console.error('[Connections API] Encryption error:', {
        userId: user.id,
        platform,
        error: encryptError instanceof Error ? encryptError.message : 'Unknown',
      });
      return NextResponse.json(
        { error: 'API 키 처리 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    // 연동 정보 저장
    const insertData = {
      user_id: user.id,
      platform,
      api_key_encrypted: encryptedCredentials,
      api_config: null,
      status: 'active' as const,
      last_sync_at: null,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error: insertError } = await (supabase
      .from('platform_connections') as any)
      .insert(insertData)
      .select('id, platform, status, created_at, last_sync_at')
      .single();

    if (insertError || !data) {
      console.error('[Connections API] Insert error:', {
        userId: user.id,
        platform,
        error: insertError,
      });
      return NextResponse.json(
        { error: '연동 정보 저장에 실패했습니다.' },
        { status: 500 }
      );
    }

    const newConnection = data as ConnectionRow;

    // 데이터 동기화 트리거 (TASK-416)
    triggerDataSync(user.id, platform).catch(error => {
      console.error('[Connections API] Sync trigger error:', {
        userId: user.id,
        platform,
        error: error instanceof Error ? error.message : 'Unknown',
      });
    });

    const response: ConnectionResponse = {
      id: newConnection.id,
      platform: newConnection.platform,
      status: newConnection.status,
      created_at: newConnection.created_at,
      last_sync_at: newConnection.last_sync_at,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('[Connections API] POST error:', {
      userId,
      platform,
      error: error instanceof Error ? error.message : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/connections
 * 플랫폼 연동 API 키 갱신 (TASK-414)
 */
export async function PUT(request: NextRequest) {
  let userId: string | undefined;
  let platform: string | undefined;

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

    userId = user.id;

    // 요청 본문 파싱
    let body: ConnectionRequestBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: '요청 형식이 올바르지 않습니다.' },
        { status: 400 }
      );
    }

    platform = body.platform;
    const { credentials } = body;

    // 플랫폼 코드 검증
    if (!isValidPlatform(platform)) {
      return NextResponse.json(
        { error: '지원하지 않는 플랫폼입니다.' },
        { status: 400 }
      );
    }

    // 자격 증명 검증
    const credentialsValidation = validateCredentials(credentials);
    if (!credentialsValidation.valid) {
      return NextResponse.json(
        { error: credentialsValidation.error },
        { status: 400 }
      );
    }

    // 기존 연동 확인
    const { data: existing, error: findError } = await supabase
      .from('platform_connections')
      .select('id')
      .eq('user_id', user.id)
      .eq('platform', platform)
      .single();

    if (findError || !existing) {
      return NextResponse.json(
        { error: '연동된 플랫폼을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const existingConnection = existing as { id: string };

    // 자격 증명 암호화
    let encryptedCredentials: string;
    try {
      encryptedCredentials = await encryptCredentials(credentials as Record<string, string>);
    } catch (encryptError) {
      console.error('[Connections API] Encryption error:', {
        userId: user.id,
        platform,
        error: encryptError instanceof Error ? encryptError.message : 'Unknown',
      });
      return NextResponse.json(
        { error: 'API 키 처리 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    // 연동 정보 갱신
    const updateData = {
      api_key_encrypted: encryptedCredentials,
      status: 'active' as const,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error: updateError } = await (supabase
      .from('platform_connections') as any)
      .update(updateData)
      .eq('id', existingConnection.id)
      .select('id, platform, status, created_at, last_sync_at')
      .single();

    if (updateError || !data) {
      console.error('[Connections API] Update error:', {
        userId: user.id,
        platform,
        error: updateError,
      });
      return NextResponse.json(
        { error: '연동 정보 갱신에 실패했습니다.' },
        { status: 500 }
      );
    }

    const updatedConnection = data as ConnectionRow;

    // 데이터 동기화 트리거
    triggerDataSync(user.id, platform).catch(error => {
      console.error('[Connections API] Sync trigger error:', {
        userId: user.id,
        platform,
        error: error instanceof Error ? error.message : 'Unknown',
      });
    });

    const response: ConnectionResponse = {
      id: updatedConnection.id,
      platform: updatedConnection.platform,
      status: updatedConnection.status,
      created_at: updatedConnection.created_at,
      last_sync_at: updatedConnection.last_sync_at,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Connections API] PUT error:', {
      userId,
      platform,
      error: error instanceof Error ? error.message : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
