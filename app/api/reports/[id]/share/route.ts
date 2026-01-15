/**
 * 리포트 공유 링크 생성 API
 * TASK-1008: 외부 공유 가능한 링크 생성
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/reports/[id]/share
 * 공유 링크 생성
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
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

    // 리포트 소유권 확인
    const { data: report, error: fetchError } = await supabase
      .from('reports')
      .select('id, share_token')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !report) {
      return NextResponse.json(
        { error: '리포트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const reportTyped = report as { id: string; share_token: string | null };

    // 이미 공유 토큰이 있으면 반환
    if (reportTyped.share_token) {
      const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/share/report/${reportTyped.share_token}`;
      return NextResponse.json({ shareUrl, shareToken: reportTyped.share_token });
    }

    // 새 공유 토큰 생성 (UUID v4)
    const shareToken = crypto.randomUUID();

    // 7일 후 만료
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // 리포트 업데이트
    const { error: updateError } = await supabase
      .from('reports')
      .update({
        share_token: shareToken,
        share_expires_at: expiresAt.toISOString(),
        is_public: true,
      } as never)
      .eq('id', id)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('[Report Share API] Update error:', updateError);
      return NextResponse.json(
        { error: '공유 링크 생성에 실패했습니다.' },
        { status: 500 }
      );
    }

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/share/report/${shareToken}`;

    return NextResponse.json({
      shareUrl,
      shareToken,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('[Report Share API] Error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/reports/[id]/share
 * 공유 링크 취소
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    // 공유 취소
    const { error: updateError } = await supabase
      .from('reports')
      .update({
        share_token: null,
        share_expires_at: null,
        is_public: false,
      } as never)
      .eq('id', id)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('[Report Share API] Update error:', updateError);
      return NextResponse.json(
        { error: '공유 취소에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Report Share API] DELETE error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
