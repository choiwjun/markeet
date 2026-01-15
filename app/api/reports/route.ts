/**
 * 리포트 API 라우트
 * TASK-1004: 리포트 목록 조회 및 생성
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ReportInsert } from '@/types/database';

/**
 * GET /api/reports
 * 리포트 목록 조회
 */
export async function GET() {
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

    // 리포트 목록 조회
    const { data: reports, error: fetchError } = await supabase
      .from('reports')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('[Reports API] Fetch error:', fetchError);
      return NextResponse.json(
        { error: '리포트 목록 조회에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ reports: reports || [] });
  } catch (error) {
    console.error('[Reports API] GET error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/reports
 * 새 리포트 생성
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
      title: string;
      type: 'weekly' | 'monthly' | 'custom';
      template: 'standard' | 'detailed' | 'summary';
      platforms: string[];
      period_start: string;
      period_end: string;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: '요청 형식이 올바르지 않습니다.' },
        { status: 400 }
      );
    }

    const { title, type, template, platforms, period_start, period_end } = body;

    // 유효성 검사
    if (!title || !type || !platforms || platforms.length === 0) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 광고 데이터 집계
    const { data: adData, error: adError } = await supabase
      .from('ad_performance')
      .select('platform, spend, revenue, impressions, clicks, conversions')
      .eq('user_id', user.id)
      .gte('date', period_start)
      .lte('date', period_end)
      .in('platform', platforms);

    if (adError) {
      console.error('[Reports API] Ad data fetch error:', adError);
    }

    // 데이터 집계
    const summary = aggregateData(adData || []);

    // AI 인사이트 생성 (간단한 버전)
    const aiInsights = generateSimpleInsights(summary);

    // 리포트 생성
    const reportData = {
      user_id: user.id,
      title,
      type,
      template,
      platforms,
      period_start,
      period_end,
      status: 'completed' as const,
      data_summary: summary,
      insights: null,
      ai_insights: aiInsights,
    };

    const { data: report, error: insertError } = await supabase
      .from('reports')
      .insert(reportData as never)
      .select()
      .single();

    if (insertError) {
      console.error('[Reports API] Insert error:', insertError);
      return NextResponse.json(
        { error: '리포트 생성에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    console.error('[Reports API] POST error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 데이터 집계 함수
interface AdRow {
  platform: string;
  spend: number | null;
  revenue: number | null;
  impressions: number | null;
  clicks: number | null;
  conversions: number | null;
}

interface DataSummary {
  totalSpend: number;
  totalRevenue: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  avgRoas: number;
  avgCtr: number;
  avgCvr: number;
  platformBreakdown: {
    platform: string;
    spend: number;
    revenue: number;
    roas: number;
  }[];
}

function aggregateData(data: AdRow[]): DataSummary {
  const platformMap = new Map<string, { spend: number; revenue: number; impressions: number; clicks: number; conversions: number }>();

  let totalSpend = 0;
  let totalRevenue = 0;
  let totalImpressions = 0;
  let totalClicks = 0;
  let totalConversions = 0;

  for (const row of data) {
    const spend = row.spend || 0;
    const revenue = row.revenue || 0;
    const impressions = row.impressions || 0;
    const clicks = row.clicks || 0;
    const conversions = row.conversions || 0;

    totalSpend += spend;
    totalRevenue += revenue;
    totalImpressions += impressions;
    totalClicks += clicks;
    totalConversions += conversions;

    const existing = platformMap.get(row.platform) || { spend: 0, revenue: 0, impressions: 0, clicks: 0, conversions: 0 };
    platformMap.set(row.platform, {
      spend: existing.spend + spend,
      revenue: existing.revenue + revenue,
      impressions: existing.impressions + impressions,
      clicks: existing.clicks + clicks,
      conversions: existing.conversions + conversions,
    });
  }

  const platformBreakdown = Array.from(platformMap.entries()).map(([platform, data]) => ({
    platform,
    spend: data.spend,
    revenue: data.revenue,
    roas: data.spend > 0 ? data.revenue / data.spend : 0,
  }));

  return {
    totalSpend,
    totalRevenue,
    totalImpressions,
    totalClicks,
    totalConversions,
    avgRoas: totalSpend > 0 ? totalRevenue / totalSpend : 0,
    avgCtr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
    avgCvr: totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0,
    platformBreakdown,
  };
}

// 간단한 인사이트 생성
function generateSimpleInsights(summary: DataSummary): string {
  const insights: string[] = [];

  // 총 성과 요약
  insights.push(`총 광고비 ${formatCurrency(summary.totalSpend)}를 사용하여 ${formatCurrency(summary.totalRevenue)}의 매출을 달성했습니다.`);

  // ROAS 분석
  if (summary.avgRoas >= 3) {
    insights.push(`ROAS ${summary.avgRoas.toFixed(1)}배로 우수한 광고 효율을 보이고 있습니다.`);
  } else if (summary.avgRoas >= 1) {
    insights.push(`ROAS ${summary.avgRoas.toFixed(1)}배로 광고비 대비 수익이 발생하고 있습니다.`);
  } else if (summary.avgRoas > 0) {
    insights.push(`ROAS ${summary.avgRoas.toFixed(1)}배로 광고 효율 개선이 필요합니다.`);
  }

  // 플랫폼별 분석
  if (summary.platformBreakdown.length > 1) {
    const bestPlatform = summary.platformBreakdown.reduce((best, current) =>
      current.roas > best.roas ? current : best
    );
    if (bestPlatform.roas > 0) {
      insights.push(`${bestPlatform.platform} 플랫폼이 ROAS ${bestPlatform.roas.toFixed(1)}배로 가장 좋은 성과를 보이고 있습니다.`);
    }
  }

  // CTR 분석
  if (summary.avgCtr >= 2) {
    insights.push(`클릭률 ${summary.avgCtr.toFixed(2)}%로 양호한 수준입니다.`);
  } else if (summary.avgCtr > 0) {
    insights.push(`클릭률 ${summary.avgCtr.toFixed(2)}%로 광고 크리에이티브 개선을 검토해보세요.`);
  }

  return insights.join('\n\n');
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(value);
}
