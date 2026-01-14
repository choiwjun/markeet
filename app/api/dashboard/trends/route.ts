/**
 * 일자별 추이 데이터 조회 API
 * TASK-518: 일자별 집계 데이터 반환
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// 일자별 데이터 타입
interface DailyMetrics {
  date: string;
  spend: number;
  revenue: number;
  roas: number;
  clicks: number;
  conversions: number;
}

// 응답 타입
interface TrendsResponse {
  data: DailyMetrics[];
  period: {
    startDate: string;
    endDate: string;
  };
}

/**
 * 날짜 문자열 유효성 검사
 */
function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * GET /api/dashboard/trends
 * 일자별 집계 데이터 조회
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
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    // 날짜 파라미터 검증
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'start_date와 end_date 파라미터가 필요합니다.' },
        { status: 400 }
      );
    }

    if (!isValidDate(startDate) || !isValidDate(endDate)) {
      return NextResponse.json(
        { error: '날짜 형식이 올바르지 않습니다. (YYYY-MM-DD)' },
        { status: 400 }
      );
    }

    // 일자별 광고 데이터 조회
    const { data: adData, error: adDataError } = await supabase
      .from('ad_data')
      .select('date, spend, revenue, roas, clicks, conversions')
      .eq('user_id', user.id)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (adDataError) {
      console.error('[Trends API] Ad data query error:', adDataError);
      return NextResponse.json(
        { error: '광고 데이터 조회에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 일자별 집계
    const dailyMap = new Map<string, {
      spend: number;
      revenue: number;
      roasSum: number;
      roasCount: number;
      clicks: number;
      conversions: number;
    }>();

    if (adData) {
      for (const row of adData) {
        const date = row.date;

        if (!dailyMap.has(date)) {
          dailyMap.set(date, {
            spend: 0,
            revenue: 0,
            roasSum: 0,
            roasCount: 0,
            clicks: 0,
            conversions: 0,
          });
        }

        const agg = dailyMap.get(date)!;
        agg.spend += Number(row.spend) || 0;
        agg.revenue += Number(row.revenue) || 0;
        agg.clicks += Number(row.clicks) || 0;
        agg.conversions += Number(row.conversions) || 0;

        if (row.roas !== null) {
          agg.roasSum += Number(row.roas);
          agg.roasCount++;
        }
      }
    }

    // 응답 데이터 구성
    const dailyMetrics: DailyMetrics[] = [];

    // 날짜순 정렬
    const sortedDates = Array.from(dailyMap.keys()).sort();

    for (const date of sortedDates) {
      const agg = dailyMap.get(date)!;

      let avgRoas = 0;
      if (agg.roasCount > 0) {
        avgRoas = agg.roasSum / agg.roasCount;
      } else if (agg.spend > 0) {
        avgRoas = agg.revenue / agg.spend;
      }

      dailyMetrics.push({
        date,
        spend: agg.spend,
        revenue: agg.revenue,
        roas: avgRoas,
        clicks: agg.clicks,
        conversions: agg.conversions,
      });
    }

    const response: TrendsResponse = {
      data: dailyMetrics,
      period: { startDate, endDate },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Trends API] Error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
