/**
 * 리포트 개별 API 라우트
 * TASK-1005: 리포트 상세 조회
 * TASK-1010: 리포트 삭제
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/reports/[id]
 * 리포트 상세 조회
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
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

    // 리포트 조회
    const { data: report, error: fetchError } = await supabase
      .from('reports')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: '리포트를 찾을 수 없습니다.' },
          { status: 404 }
        );
      }
      console.error('[Report API] Fetch error:', fetchError);
      return NextResponse.json(
        { error: '리포트 조회에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ report });
  } catch (error) {
    console.error('[Report API] GET error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/reports/[id]
 * 리포트 삭제
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

    // 리포트 소유권 확인 후 삭제
    const { error: deleteError } = await supabase
      .from('reports')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('[Report API] Delete error:', deleteError);
      return NextResponse.json(
        { error: '리포트 삭제에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Report API] DELETE error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/reports/[id]
 * 리포트 업데이트
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
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

    // 요청 본문 파싱
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: '요청 형식이 올바르지 않습니다.' },
        { status: 400 }
      );
    }

    // 허용된 필드만 추출
    const allowedFields = ['title', 'status', 'is_public'];
    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field];
      }
    }

    // 리포트 업데이트
    const { data: report, error: updateError } = await supabase
      .from('reports')
      .update(updateData as never)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('[Report API] Update error:', updateError);
      return NextResponse.json(
        { error: '리포트 업데이트에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ report });
  } catch (error) {
    console.error('[Report API] PATCH error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
