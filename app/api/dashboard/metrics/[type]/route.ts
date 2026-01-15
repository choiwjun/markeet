/**
 * 지표 상세 데이터 API
 * TASK-1201: 지표 카드 드릴다운 페이지
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{ type: string }>;
}

// 지표 타입별 쿼리 필드 매핑
const METRIC_FIELDS: Record<string, string[]> = {
  spend: ['spend'],
  revenue: ['revenue'],
  roas: ['spend', 'revenue'],
  conversions: ['conversions'],
  clicks: ['clicks'],
  impressions: ['impressions'],
  ctr: ['clicks', 'impressions'],
  cvr: ['conversions', 'clicks'],
};

/**
 * GET /api/dashboard/metrics/[type]
 * 특정 지표의 상세 데이터 조회
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { type } = await params;
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
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: '기간을 지정해주세요.' },
        { status: 400 }
      );
    }

    // 유효한 지표 타입 확인
    if (!METRIC_FIELDS[type]) {
      return NextResponse.json(
        { error: '유효하지 않은 지표 타입입니다.' },
        { status: 400 }
      );
    }

    // 일별 데이터 조회
    const { data: dailyData, error: dailyError } = await supabase
      .from('ad_performance')
      .select('date, platform, spend, revenue, impressions, clicks, conversions')
      .eq('user_id', user.id)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (dailyError) {
      console.error('[Metrics API] Daily data error:', dailyError);
      return NextResponse.json(
        { error: '데이터 조회에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 타입 정의
    interface PerformanceRow {
      date: string;
      platform: string;
      spend: number | null;
      revenue: number | null;
      impressions: number | null;
      clicks: number | null;
      conversions: number | null;
    }

    const typedData = (dailyData || []) as PerformanceRow[];

    // 일별 집계
    const dailyMap = new Map<string, {
      spend: number;
      revenue: number;
      impressions: number;
      clicks: number;
      conversions: number;
    }>();

    for (const row of typedData) {
      const existing = dailyMap.get(row.date) || {
        spend: 0,
        revenue: 0,
        impressions: 0,
        clicks: 0,
        conversions: 0,
      };

      dailyMap.set(row.date, {
        spend: existing.spend + (row.spend || 0),
        revenue: existing.revenue + (row.revenue || 0),
        impressions: existing.impressions + (row.impressions || 0),
        clicks: existing.clicks + (row.clicks || 0),
        conversions: existing.conversions + (row.conversions || 0),
      });
    }

    // 일별 데이터 배열로 변환
    const dailyTrend = Array.from(dailyMap.entries()).map(([date, data]) => {
      let value = 0;

      switch (type) {
        case 'spend':
          value = data.spend;
          break;
        case 'revenue':
          value = data.revenue;
          break;
        case 'roas':
          value = data.spend > 0 ? data.revenue / data.spend : 0;
          break;
        case 'conversions':
          value = data.conversions;
          break;
        case 'clicks':
          value = data.clicks;
          break;
        case 'impressions':
          value = data.impressions;
          break;
        case 'ctr':
          value = data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0;
          break;
        case 'cvr':
          value = data.clicks > 0 ? (data.conversions / data.clicks) * 100 : 0;
          break;
      }

      return { date, value, ...data };
    });

    // 플랫폼별 집계
    const platformMap = new Map<string, {
      spend: number;
      revenue: number;
      impressions: number;
      clicks: number;
      conversions: number;
    }>();

    for (const row of typedData) {
      const existing = platformMap.get(row.platform) || {
        spend: 0,
        revenue: 0,
        impressions: 0,
        clicks: 0,
        conversions: 0,
      };

      platformMap.set(row.platform, {
        spend: existing.spend + (row.spend || 0),
        revenue: existing.revenue + (row.revenue || 0),
        impressions: existing.impressions + (row.impressions || 0),
        clicks: existing.clicks + (row.clicks || 0),
        conversions: existing.conversions + (row.conversions || 0),
      });
    }

    // 플랫폼별 데이터 배열로 변환
    const platformBreakdown = Array.from(platformMap.entries()).map(([platform, data]) => {
      let value = 0;

      switch (type) {
        case 'spend':
          value = data.spend;
          break;
        case 'revenue':
          value = data.revenue;
          break;
        case 'roas':
          value = data.spend > 0 ? data.revenue / data.spend : 0;
          break;
        case 'conversions':
          value = data.conversions;
          break;
        case 'clicks':
          value = data.clicks;
          break;
        case 'impressions':
          value = data.impressions;
          break;
        case 'ctr':
          value = data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0;
          break;
        case 'cvr':
          value = data.clicks > 0 ? (data.conversions / data.clicks) * 100 : 0;
          break;
      }

      return { platform, value, ...data };
    }).sort((a, b) => b.value - a.value);

    // 전체 합계
    let totalValue = 0;
    let totalSpend = 0;
    let totalRevenue = 0;
    let totalImpressions = 0;
    let totalClicks = 0;
    let totalConversions = 0;

    for (const data of Array.from(platformMap.values())) {
      totalSpend += data.spend;
      totalRevenue += data.revenue;
      totalImpressions += data.impressions;
      totalClicks += data.clicks;
      totalConversions += data.conversions;
    }

    switch (type) {
      case 'spend':
        totalValue = totalSpend;
        break;
      case 'revenue':
        totalValue = totalRevenue;
        break;
      case 'roas':
        totalValue = totalSpend > 0 ? totalRevenue / totalSpend : 0;
        break;
      case 'conversions':
        totalValue = totalConversions;
        break;
      case 'clicks':
        totalValue = totalClicks;
        break;
      case 'impressions':
        totalValue = totalImpressions;
        break;
      case 'ctr':
        totalValue = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
        break;
      case 'cvr':
        totalValue = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
        break;
    }

    return NextResponse.json({
      type,
      period: { startDate, endDate },
      totalValue,
      dailyTrend,
      platformBreakdown,
      summary: {
        totalSpend,
        totalRevenue,
        totalImpressions,
        totalClicks,
        totalConversions,
        avgRoas: totalSpend > 0 ? totalRevenue / totalSpend : 0,
        avgCtr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
        avgCvr: totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0,
      },
    });
  } catch (error) {
    console.error('[Metrics API] Error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
