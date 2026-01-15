/**
 * AI 질의 히스토리 API
 * TASK-908: 질문/답변 히스토리 저장 및 조회
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// 히스토리 타입 (임시 - DB 테이블 생성 전까지 메모리 저장)
interface QueryHistoryItem {
  id: string;
  user_id: string;
  question: string;
  response: string;
  sql?: string;
  chart_type?: string | null;
  created_at: string;
}

// 메모리 저장소 (임시)
const historyStore = new Map<string, QueryHistoryItem[]>();

/**
 * GET /api/ai/history
 * AI 질의 히스토리 조회
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

    // 쿼리 파라미터
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // 사용자 히스토리 조회
    const userHistory = historyStore.get(user.id) || [];

    // 최신순 정렬 및 페이징
    const sortedHistory = [...userHistory]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(offset, offset + limit);

    return NextResponse.json({
      history: sortedHistory,
      total: userHistory.length,
      has_more: offset + limit < userHistory.length,
    });
  } catch (error) {
    console.error('[AI History API] GET error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ai/history
 * AI 질의 히스토리 저장
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
    let body: {
      question: string;
      response: string;
      sql?: string;
      chart_type?: string | null;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: '요청 형식이 올바르지 않습니다.' },
        { status: 400 }
      );
    }

    const { question, response, sql, chart_type } = body;

    if (!question || !response) {
      return NextResponse.json(
        { error: '질문과 응답이 필요합니다.' },
        { status: 400 }
      );
    }

    // 히스토리 항목 생성
    const historyItem: QueryHistoryItem = {
      id: crypto.randomUUID(),
      user_id: user.id,
      question,
      response,
      sql,
      chart_type,
      created_at: new Date().toISOString(),
    };

    // 사용자 히스토리에 추가
    const userHistory = historyStore.get(user.id) || [];
    userHistory.push(historyItem);

    // 최대 100개 유지
    if (userHistory.length > 100) {
      userHistory.shift();
    }

    historyStore.set(user.id, userHistory);

    return NextResponse.json({
      success: true,
      id: historyItem.id,
    });
  } catch (error) {
    console.error('[AI History API] POST error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ai/history
 * AI 질의 히스토리 삭제
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
    let body: { id?: string; all?: boolean };
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const { id, all } = body;

    if (all) {
      // 전체 삭제
      historyStore.delete(user.id);
      return NextResponse.json({ success: true, deleted: 'all' });
    }

    if (id) {
      // 특정 항목 삭제
      const userHistory = historyStore.get(user.id) || [];
      const filteredHistory = userHistory.filter((item) => item.id !== id);
      historyStore.set(user.id, filteredHistory);
      return NextResponse.json({ success: true, deleted: id });
    }

    return NextResponse.json(
      { error: '삭제할 항목을 지정해주세요.' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[AI History API] DELETE error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
