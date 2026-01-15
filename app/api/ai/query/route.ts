/**
 * AI 질의 API 엔드포인트
 * TASK-902: 사용자 질문 → OpenAI API → SQL 생성 → 결과 반환
 * TASK-910: Rate Limiting
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateSqlFromQuestion } from '@/lib/ai/sqlGenerator';
import { generateNaturalResponse } from '@/lib/ai/responseGenerator';
import { generateCacheKey, getFromCache, saveToCache } from '@/lib/ai/queryCache';

// Rate Limiting 설정
const DAILY_QUERY_LIMIT = 50; // 일일 질의 제한
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

/**
 * Rate Limiting 체크
 */
function checkRateLimit(userId: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const todayStart = new Date().setHours(0, 0, 0, 0);
  const todayEnd = new Date().setHours(23, 59, 59, 999);

  let userLimit = rateLimitStore.get(userId);

  // 날짜가 변경되었으면 리셋
  if (!userLimit || userLimit.resetAt < now) {
    userLimit = { count: 0, resetAt: todayEnd };
    rateLimitStore.set(userId, userLimit);
  }

  const remaining = DAILY_QUERY_LIMIT - userLimit.count;

  if (userLimit.count >= DAILY_QUERY_LIMIT) {
    return { allowed: false, remaining: 0, resetAt: userLimit.resetAt };
  }

  return { allowed: true, remaining, resetAt: userLimit.resetAt };
}

/**
 * Rate Limit 카운트 증가
 */
function incrementRateLimit(userId: string): void {
  const userLimit = rateLimitStore.get(userId);
  if (userLimit) {
    userLimit.count++;
  }
}

/**
 * POST /api/ai/query
 * AI 자연어 질의 처리
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
    let body: { question: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: '요청 형식이 올바르지 않습니다.' },
        { status: 400 }
      );
    }

    const { question } = body;

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return NextResponse.json(
        { error: '질문을 입력해주세요.' },
        { status: 400 }
      );
    }

    if (question.length > 500) {
      return NextResponse.json(
        { error: '질문은 500자 이내로 입력해주세요.' },
        { status: 400 }
      );
    }

    // Rate Limiting 체크
    const rateLimit = checkRateLimit(user.id);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: '일일 질의 한도를 초과했습니다. 내일 다시 시도해주세요.',
          limit: DAILY_QUERY_LIMIT,
          remaining: 0,
          resetAt: new Date(rateLimit.resetAt).toISOString(),
        },
        { status: 429 }
      );
    }

    // 캐시 확인
    const cacheKey = generateCacheKey(user.id, question);
    const cachedResult = getFromCache(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        success: true,
        response: cachedResult.response,
        sql: cachedResult.sql,
        chartType: cachedResult.chartType,
        chartData: cachedResult.chartData,
        cached: true,
        remaining: rateLimit.remaining,
      });
    }

    // Rate Limit 카운트 증가 (캐시 미스 시에만)
    incrementRateLimit(user.id);

    // SQL 생성
    const sqlResult = await generateSqlFromQuestion(question, user.id);

    if (!sqlResult.success || !sqlResult.sql) {
      return NextResponse.json({
        success: false,
        error: sqlResult.error || 'SQL 생성에 실패했습니다.',
        remaining: rateLimit.remaining - 1,
      });
    }

    // SQL 실행 (RPC 함수를 통해 안전하게 실행)
    type RpcFunction = (name: string, params: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>;
    const rpcFunction = supabase.rpc as unknown as RpcFunction;
    const { data: queryResult, error: queryError } = await rpcFunction('execute_safe_query', {
      query_text: sqlResult.sql,
    });

    // RPC가 없으면 직접 실행 (개발용)
    let result: Record<string, unknown>[] = [];

    if (queryError) {
      // RPC 함수가 없으면 ad_performance에서 직접 조회 시도
      console.warn('[AI Query] RPC not available, trying direct query');

      // 간단한 쿼리만 직접 실행 (보안 이유로 제한적)
      try {
        const { data: directResult, error: directError } = await supabase
          .from('ad_performance')
          .select('*')
          .eq('user_id', user.id)
          .limit(100);

        if (directError) {
          console.error('[AI Query] Direct query error:', directError);
          return NextResponse.json({
            success: false,
            error: '데이터 조회 중 오류가 발생했습니다.',
            remaining: rateLimit.remaining - 1,
          });
        }

        result = (directResult || []) as Record<string, unknown>[];
      } catch (err) {
        console.error('[AI Query] Query execution error:', err);
        return NextResponse.json({
          success: false,
          error: '쿼리 실행 중 오류가 발생했습니다.',
          remaining: rateLimit.remaining - 1,
        });
      }
    } else {
      result = (queryResult || []) as Record<string, unknown>[];
    }

    // 자연어 응답 생성
    const responseResult = await generateNaturalResponse(question, result, sqlResult.sql);

    if (!responseResult.success) {
      return NextResponse.json({
        success: false,
        error: responseResult.error || '응답 생성에 실패했습니다.',
        remaining: rateLimit.remaining - 1,
      });
    }

    // 캐시 저장
    saveToCache(cacheKey, {
      response: responseResult.response || '',
      sql: sqlResult.sql,
      chartType: responseResult.chartType || null,
      chartData: responseResult.chartData || null,
    });

    return NextResponse.json({
      success: true,
      response: responseResult.response,
      sql: sqlResult.sql,
      chartType: responseResult.chartType,
      chartData: responseResult.chartData,
      cached: false,
      remaining: rateLimit.remaining - 1,
    });
  } catch (error) {
    console.error('[AI Query API] Error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
