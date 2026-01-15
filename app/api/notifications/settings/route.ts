/**
 * 알림 설정 API 라우트
 * TASK-808: 알림 설정 관리
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { NotificationSettings, NotificationSettingsUpdate } from '@/types/database';

/**
 * GET /api/notifications/settings
 * 사용자의 알림 설정 조회
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

    // 알림 설정 조회
    const { data, error: fetchError } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (fetchError) {
      // 설정이 없으면 기본값 반환 (trigger가 자동 생성하지만 만약을 위해)
      if (fetchError.code === 'PGRST116') {
        const defaultSettings: Partial<NotificationSettings> = {
          user_id: user.id,
          email_enabled: true,
          email_daily_summary: true,
          email_weekly_report: true,
          push_enabled: true,
          anomaly_alerts: true,
          api_key_alerts: true,
        };
        return NextResponse.json(defaultSettings);
      }

      console.error('[NotificationSettings API] Fetch error:', fetchError);
      return NextResponse.json(
        { error: '알림 설정 조회에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json(data as NotificationSettings);
  } catch (error) {
    console.error('[NotificationSettings API] GET error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/notifications/settings
 * 알림 설정 업데이트
 */
export async function PATCH(request: NextRequest) {
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
    let body: NotificationSettingsUpdate;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: '요청 형식이 올바르지 않습니다.' },
        { status: 400 }
      );
    }

    // 허용된 필드만 추출
    const allowedFields: (keyof NotificationSettingsUpdate)[] = [
      'email_enabled',
      'email_daily_summary',
      'email_weekly_report',
      'push_enabled',
      'anomaly_alerts',
      'api_key_alerts',
    ];

    const updateData: NotificationSettingsUpdate = {};
    for (const field of allowedFields) {
      if (field in body) {
        (updateData as Record<string, unknown>)[field] = body[field];
      }
    }

    // upsert로 처리 (없으면 생성, 있으면 업데이트)
    const { data, error: updateError } = await supabase
      .from('notification_settings')
      .upsert(
        {
          user_id: user.id,
          ...updateData,
          updated_at: new Date().toISOString(),
        } as never,
        { onConflict: 'user_id' }
      )
      .select()
      .single();

    if (updateError) {
      console.error('[NotificationSettings API] Update error:', updateError);
      return NextResponse.json(
        { error: '알림 설정 업데이트에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json(data as NotificationSettings);
  } catch (error) {
    console.error('[NotificationSettings API] PATCH error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
