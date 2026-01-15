/**
 * 리포트 이메일 발송 API
 * TASK-1007: 리포트를 이메일로 발송
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendReportEmail } from '@/lib/email';
import type { Report } from '@/types/database';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/reports/[id]/send
 * 리포트 이메일 발송
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

    // 사용자 이메일 조회
    const { data: profileData } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', user.id)
      .single();

    // 이메일 주소 확인 (profiles 테이블 또는 auth.user)
    const profile = profileData as { email: string | null } | null;
    const email = profile?.email || user.email;

    if (!email) {
      return NextResponse.json(
        { error: '이메일 주소가 설정되지 않았습니다.' },
        { status: 400 }
      );
    }

    // 리포트 조회
    const { data: report, error: fetchError } = await supabase
      .from('reports')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !report) {
      return NextResponse.json(
        { error: '리포트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 이메일 발송
    const reportTyped = report as Report;
    const success = await sendReportEmail(email, {
      id: reportTyped.id,
      title: reportTyped.title,
      type: reportTyped.type,
      period_start: reportTyped.period_start,
      period_end: reportTyped.period_end,
      data_summary: reportTyped.data_summary as { totalSpend?: number; totalRevenue?: number; avgRoas?: number; totalConversions?: number } | null,
      ai_insights: reportTyped.ai_insights,
    });

    if (!success) {
      return NextResponse.json(
        { error: '이메일 발송에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 발송 시간 기록
    await supabase
      .from('reports')
      .update({ email_sent_at: new Date().toISOString() } as never)
      .eq('id', id)
      .eq('user_id', user.id);

    return NextResponse.json({
      success: true,
      sentTo: email,
    });
  } catch (error) {
    console.error('[Report Send API] Error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
