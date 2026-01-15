/**
 * 계정 삭제 API
 * TASK-1104: 계정 삭제 기능
 * TRD - 익명화 & 삭제 경로 (Hard Delete)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

/**
 * DELETE /api/user/delete
 * 계정 및 모든 데이터 삭제
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

    // 요청 데이터 파싱
    const body = await request.json();
    const { confirmation } = body;

    // 확인 문자열 검증
    if (confirmation !== 'DELETE MY ACCOUNT') {
      return NextResponse.json(
        { error: '확인 문자열이 올바르지 않습니다.' },
        { status: 400 }
      );
    }

    const userId = user.id;

    // 서비스 클라이언트로 데이터 삭제 (RLS 우회)
    const serviceClient = await createServiceClient();

    // 1. 알림 설정 삭제
    await serviceClient
      .from('notification_settings')
      .delete()
      .eq('user_id', userId);

    // 2. 알림 삭제
    await serviceClient
      .from('notifications')
      .delete()
      .eq('user_id', userId);

    // 3. 채팅 히스토리 삭제
    await serviceClient
      .from('chat_history')
      .delete()
      .eq('user_id', userId);

    // 4. 리포트 삭제
    await serviceClient
      .from('reports')
      .delete()
      .eq('user_id', userId);

    // 5. 동기화 작업 삭제
    await serviceClient
      .from('sync_jobs')
      .delete()
      .eq('user_id', userId);

    // 6. 광고 데이터 삭제
    await serviceClient
      .from('ad_data')
      .delete()
      .eq('user_id', userId);

    // 7. 광고 성과 데이터 삭제 (있는 경우)
    await serviceClient
      .from('ad_performance')
      .delete()
      .eq('user_id', userId);

    // 8. 플랫폼 연결 삭제
    await serviceClient
      .from('platform_connections')
      .delete()
      .eq('user_id', userId);

    // 9. 프로필 삭제
    await serviceClient
      .from('profiles')
      .delete()
      .eq('id', userId);

    // 10. Auth 사용자 삭제
    const { error: deleteError } = await serviceClient.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error('[Delete Account API] Auth delete error:', deleteError);
      return NextResponse.json(
        { error: '계정 삭제에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '계정이 성공적으로 삭제되었습니다.',
    });
  } catch (error) {
    console.error('[Delete Account API] Error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
