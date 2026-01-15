/**
 * 플랫폼별 상세 데이터 API
 * TASK-1202: 플랫폼별 상세 페이지
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{ platform: string }>;
}

/**
 * GET /api/dashboard/platforms/[platform]
 * 특정 플랫폼의 캠페인별 상세 데이터 조회
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { platform } = await params;
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

    // 플랫폼 데이터 조회
    const { data: performanceData, error: dataError } = await supabase
      .from('ad_performance')
      .select('*')
      .eq('user_id', user.id)
      .eq('platform', platform)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (dataError) {
      console.error('[Platform API] Data error:', dataError);
      return NextResponse.json(
        { error: '데이터 조회에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 타입 정의
    interface PerformanceRow {
      date: string;
      platform: string;
      campaign_id: string | null;
      campaign_name: string | null;
      spend: number | null;
      revenue: number | null;
      impressions: number | null;
      clicks: number | null;
      conversions: number | null;
    }

    const typedData = (performanceData || []) as PerformanceRow[];

    // 캠페인별 집계
    const campaignMap = new Map<string, {
      campaign_id: string;
      campaign_name: string;
      spend: number;
      revenue: number;
      impressions: number;
      clicks: number;
      conversions: number;
    }>();

    for (const row of typedData) {
      const campaignId = row.campaign_id || 'unknown';
      const campaignName = row.campaign_name || '알 수 없는 캠페인';
      const key = campaignId;

      const existing = campaignMap.get(key) || {
        campaign_id: campaignId,
        campaign_name: campaignName,
        spend: 0,
        revenue: 0,
        impressions: 0,
        clicks: 0,
        conversions: 0,
      };

      campaignMap.set(key, {
        ...existing,
        spend: existing.spend + (row.spend || 0),
        revenue: existing.revenue + (row.revenue || 0),
        impressions: existing.impressions + (row.impressions || 0),
        clicks: existing.clicks + (row.clicks || 0),
        conversions: existing.conversions + (row.conversions || 0),
      });
    }

    // 캠페인 목록 (ROAS 기준 정렬)
    const campaigns = Array.from(campaignMap.values())
      .map((c) => ({
        ...c,
        roas: c.spend > 0 ? c.revenue / c.spend : 0,
        ctr: c.impressions > 0 ? (c.clicks / c.impressions) * 100 : 0,
        cvr: c.clicks > 0 ? (c.conversions / c.clicks) * 100 : 0,
      }))
      .sort((a, b) => b.spend - a.spend);

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

    const dailyTrend = Array.from(dailyMap.entries())
      .map(([date, data]) => ({
        date,
        ...data,
        roas: data.spend > 0 ? data.revenue / data.spend : 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // 전체 합계
    let totalSpend = 0;
    let totalRevenue = 0;
    let totalImpressions = 0;
    let totalClicks = 0;
    let totalConversions = 0;

    for (const c of campaigns) {
      totalSpend += c.spend;
      totalRevenue += c.revenue;
      totalImpressions += c.impressions;
      totalClicks += c.clicks;
      totalConversions += c.conversions;
    }

    return NextResponse.json({
      platform,
      period: { startDate, endDate },
      summary: {
        totalSpend,
        totalRevenue,
        totalImpressions,
        totalClicks,
        totalConversions,
        avgRoas: totalSpend > 0 ? totalRevenue / totalSpend : 0,
        avgCtr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
        avgCvr: totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0,
        campaignCount: campaigns.length,
      },
      campaigns,
      dailyTrend,
    });
  } catch (error) {
    console.error('[Platform API] Error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
