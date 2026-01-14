/**
 * 대시보드 데이터 조회 API
 * TASK-510: 선택된 기간의 집계 데이터 반환 (총 광고비, 매출, ROAS)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ad_data 쿼리 결과 타입
interface AdDataRow {
  spend: number | null;
  revenue: number | null;
  roas: number | null;
  clicks: number | null;
  conversions: number | null;
  impressions?: number | null;
}

// 집계 데이터 타입
interface DashboardMetrics {
  totalSpend: number;
  totalRevenue: number;
  avgRoas: number;
  totalClicks: number;
  totalConversions: number;
  totalImpressions: number;
}

// 변화량 타입
interface MetricsChange {
  spendChange: number;
  revenueChange: number;
  roasChange: number;
  clicksChange: number;
  conversionsChange: number;
}

// 응답 타입
interface DashboardResponse {
  metrics: DashboardMetrics;
  changes: MetricsChange;
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
 * 이전 기간 계산
 */
function getPreviousPeriod(startDate: string, endDate: string): { prevStart: string; prevEnd: string } {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const periodDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  const prevEnd = new Date(start);
  prevEnd.setDate(prevEnd.getDate() - 1);

  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevStart.getDate() - periodDays);

  return {
    prevStart: prevStart.toISOString().split('T')[0],
    prevEnd: prevEnd.toISOString().split('T')[0],
  };
}

/**
 * 변화율 계산
 */
function calculateChange(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return ((current - previous) / previous) * 100;
}

/**
 * GET /api/dashboard
 * 대시보드 집계 데이터 조회
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

    // 현재 기간 데이터 조회
    const { data: currentData, error: currentError } = await supabase
      .from('ad_data')
      .select('spend, revenue, roas, clicks, conversions, impressions')
      .eq('user_id', user.id)
      .gte('date', startDate)
      .lte('date', endDate);

    if (currentError) {
      console.error('[Dashboard API] Current period query error:', currentError);
      return NextResponse.json(
        { error: '데이터 조회에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 현재 기간 집계
    const currentMetrics: DashboardMetrics = {
      totalSpend: 0,
      totalRevenue: 0,
      avgRoas: 0,
      totalClicks: 0,
      totalConversions: 0,
      totalImpressions: 0,
    };

    if (currentData && currentData.length > 0) {
      let roasSum = 0;
      let roasCount = 0;

      for (const row of currentData as AdDataRow[]) {
        currentMetrics.totalSpend += Number(row.spend) || 0;
        currentMetrics.totalRevenue += Number(row.revenue) || 0;
        currentMetrics.totalClicks += Number(row.clicks) || 0;
        currentMetrics.totalConversions += Number(row.conversions) || 0;
        currentMetrics.totalImpressions += Number(row.impressions) || 0;

        if (row.roas !== null) {
          roasSum += Number(row.roas);
          roasCount++;
        }
      }

      // 평균 ROAS 계산 (데이터가 있는 경우)
      if (roasCount > 0) {
        currentMetrics.avgRoas = roasSum / roasCount;
      } else if (currentMetrics.totalSpend > 0) {
        // ROAS 데이터가 없으면 직접 계산
        currentMetrics.avgRoas = currentMetrics.totalRevenue / currentMetrics.totalSpend;
      }
    }

    // 이전 기간 데이터 조회 (변화량 계산용)
    const { prevStart, prevEnd } = getPreviousPeriod(startDate, endDate);

    const { data: previousData, error: previousError } = await supabase
      .from('ad_data')
      .select('spend, revenue, roas, clicks, conversions')
      .eq('user_id', user.id)
      .gte('date', prevStart)
      .lte('date', prevEnd);

    // 이전 기간 집계
    const previousMetrics = {
      totalSpend: 0,
      totalRevenue: 0,
      avgRoas: 0,
      totalClicks: 0,
      totalConversions: 0,
    };

    if (previousData && previousData.length > 0 && !previousError) {
      let roasSum = 0;
      let roasCount = 0;

      for (const row of previousData as AdDataRow[]) {
        previousMetrics.totalSpend += Number(row.spend) || 0;
        previousMetrics.totalRevenue += Number(row.revenue) || 0;
        previousMetrics.totalClicks += Number(row.clicks) || 0;
        previousMetrics.totalConversions += Number(row.conversions) || 0;

        if (row.roas !== null) {
          roasSum += Number(row.roas);
          roasCount++;
        }
      }

      if (roasCount > 0) {
        previousMetrics.avgRoas = roasSum / roasCount;
      } else if (previousMetrics.totalSpend > 0) {
        previousMetrics.avgRoas = previousMetrics.totalRevenue / previousMetrics.totalSpend;
      }
    }

    // 변화량 계산
    const changes: MetricsChange = {
      spendChange: calculateChange(currentMetrics.totalSpend, previousMetrics.totalSpend),
      revenueChange: calculateChange(currentMetrics.totalRevenue, previousMetrics.totalRevenue),
      roasChange: calculateChange(currentMetrics.avgRoas, previousMetrics.avgRoas),
      clicksChange: calculateChange(currentMetrics.totalClicks, previousMetrics.totalClicks),
      conversionsChange: calculateChange(currentMetrics.totalConversions, previousMetrics.totalConversions),
    };

    const response: DashboardResponse = {
      metrics: currentMetrics,
      changes,
      period: {
        startDate,
        endDate,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Dashboard API] Error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
