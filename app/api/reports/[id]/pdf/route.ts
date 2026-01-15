/**
 * 리포트 PDF 생성 API
 * TASK-1006: 리포트를 PDF 파일로 변환
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generatePdfBuffer } from '@/lib/reports/pdfGenerator';
import type { Report } from '@/types/database';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/reports/[id]/pdf
 * PDF 다운로드
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

    if (fetchError || !report) {
      return NextResponse.json(
        { error: '리포트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // PDF 생성 (HTML 형식으로 반환)
    const pdfBuffer = await generatePdfBuffer(report as Report);

    // HTML 응답 반환 (Uint8Array로 변환)
    const uint8Array = new Uint8Array(pdfBuffer);
    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="report-${id}.html"`,
      },
    });
  } catch (error) {
    console.error('[Report PDF API] Error:', error);
    return NextResponse.json(
      { error: 'PDF 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}
