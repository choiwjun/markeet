/**
 * 알림 API 라우트
 * TASK-802: 알림 목록 조회, 읽음 처리 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Notification, NotificationUpdate } from '@/types/database';

// 페이지네이션 기본값
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

// 응답 타입
interface NotificationListResponse {
  notifications: Notification[];
  unread_count: number;
  total: number;
  has_more: boolean;
}

/**
 * GET /api/notifications
 * 사용자의 알림 목록 조회
 *
 * Query params:
 * - limit: 조회할 알림 수 (기본 20, 최대 50)
 * - offset: 건너뛸 알림 수 (기본 0)
 * - unread_only: true이면 읽지 않은 알림만 조회
 */
export async function GET(request: NextRequest) {
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

    // 쿼리 파라미터 파싱
    const { searchParams } = new URL(request.url);
    const limit = Math.min(
      parseInt(searchParams.get('limit') || String(DEFAULT_LIMIT), 10),
      MAX_LIMIT
    );
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const unreadOnly = searchParams.get('unread_only') === 'true';

    // 알림 목록 조회
    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const { data, error: fetchError, count } = await query;

    if (fetchError) {
      console.error('[Notifications API] Fetch error:', fetchError);
      return NextResponse.json(
        { error: '알림 목록 조회에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 읽지 않은 알림 수 조회
    const { count: unreadCount, error: countError } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (countError) {
      console.error('[Notifications API] Unread count error:', countError);
    }

    const notifications = (data || []) as Notification[];
    const total = count || 0;

    const response: NotificationListResponse = {
      notifications,
      unread_count: unreadCount || 0,
      total,
      has_more: offset + notifications.length < total,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Notifications API] GET error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/notifications
 * 알림 읽음 처리 (일괄)
 *
 * Body:
 * - ids: 읽음 처리할 알림 ID 배열 (선택, 없으면 모두 읽음 처리)
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
    let body: { ids?: string[] } = {};
    try {
      body = await request.json();
    } catch {
      // 빈 본문이면 모든 알림 읽음 처리
    }

    const { ids } = body;
    const updateData: NotificationUpdate = {
      is_read: true,
      read_at: new Date().toISOString(),
    };

    let query = supabase
      .from('notifications')
      .update(updateData as never)
      .eq('user_id', user.id)
      .eq('is_read', false);

    // 특정 알림만 읽음 처리
    if (ids && Array.isArray(ids) && ids.length > 0) {
      query = query.in('id', ids);
    }

    const { error: updateError, count } = await query;

    if (updateError) {
      console.error('[Notifications API] Update error:', updateError);
      return NextResponse.json(
        { error: '알림 읽음 처리에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      updated_count: count || 0,
    });
  } catch (error) {
    console.error('[Notifications API] PATCH error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notifications
 * 알림 삭제 (일괄)
 *
 * Body:
 * - ids: 삭제할 알림 ID 배열 (필수)
 */
export async function DELETE(request: NextRequest) {
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
    let body: { ids?: string[] };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: '요청 형식이 올바르지 않습니다.' },
        { status: 400 }
      );
    }

    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: '삭제할 알림 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const { error: deleteError, count } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', user.id)
      .in('id', ids);

    if (deleteError) {
      console.error('[Notifications API] Delete error:', deleteError);
      return NextResponse.json(
        { error: '알림 삭제에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      deleted_count: count || 0,
    });
  } catch (error) {
    console.error('[Notifications API] DELETE error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
