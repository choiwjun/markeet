/**
 * 주간 자동 리포트 Cron API
 * TASK-1009: 매주 월요일 자동 리포트 생성 및 이메일 발송
 *
 * Vercel Cron 설정 예시:
 * { "crons": [{ "path": "/api/cron/weekly-report", "schedule": "0 9 * * 1" }] }
 * (매주 월요일 오전 9시 실행)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { sendReportEmail } from '@/lib/email';

// Cron 시크릿 검증
function validateCronRequest(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return false;
  }

  return true;
}

// 타입 정의
interface NotificationSettingRow {
  user_id: string;
}

interface UserProfile {
  id: string;
  email: string | null;
}

interface AdPerformanceRow {
  platform: string;
  spend: number | null;
  revenue: number | null;
  impressions: number | null;
  clicks: number | null;
  conversions: number | null;
}

/**
 * GET /api/cron/weekly-report
 * 주간 리포트 자동 생성 및 발송
 */
export async function GET(request: NextRequest) {
  if (!validateCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = await createServiceClient();

    // 지난 주 날짜 계산
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 1); // 어제
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 6); // 7일 전

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // 주간 리포트 이메일을 활성화한 사용자 조회
    const { data: settings, error: settingsError } = await supabase
      .from('notification_settings')
      .select('user_id')
      .eq('email_weekly_report', true);

    if (settingsError) {
      console.error('[Cron/WeeklyReport] Settings fetch error:', settingsError);
      return NextResponse.json(
        { error: 'Failed to fetch notification settings' },
        { status: 500 }
      );
    }

    const settingsData = settings as NotificationSettingRow[] | null;

    if (!settingsData || settingsData.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No users with weekly report enabled',
        generated: 0,
      });
    }

    const userIds = settingsData.map((s) => s.user_id);

    // 사용자 이메일 조회
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, email')
      .in('id', userIds);

    if (usersError) {
      console.error('[Cron/WeeklyReport] Users fetch error:', usersError);
      return NextResponse.json(
        { error: 'Failed to fetch user profiles' },
        { status: 500 }
      );
    }

    const usersData = users as UserProfile[] | null;

    let generatedCount = 0;
    let errorCount = 0;

    // 각 사용자에게 리포트 생성 및 발송
    for (const user of usersData || []) {
      try {
        // 사용자의 지난 주 광고 데이터 조회
        const { data: adData, error: adError } = await supabase
          .from('ad_performance')
          .select('platform, spend, revenue, impressions, clicks, conversions')
          .eq('user_id', user.id)
          .gte('date', startDateStr)
          .lte('date', endDateStr);

        if (adError) {
          console.error(`[Cron/WeeklyReport] Ad data fetch error for user ${user.id}:`, adError);
          errorCount++;
          continue;
        }

        const adDataTyped = adData as AdPerformanceRow[] | null;

        // 데이터가 없으면 스킵
        if (!adDataTyped || adDataTyped.length === 0) {
          continue;
        }

        // 데이터 집계
        let totalSpend = 0;
        let totalRevenue = 0;
        let totalImpressions = 0;
        let totalClicks = 0;
        let totalConversions = 0;

        const platformMap = new Map<string, { spend: number; revenue: number }>();

        for (const d of adDataTyped) {
          totalSpend += d.spend || 0;
          totalRevenue += d.revenue || 0;
          totalImpressions += d.impressions || 0;
          totalClicks += d.clicks || 0;
          totalConversions += d.conversions || 0;

          const existing = platformMap.get(d.platform) || { spend: 0, revenue: 0 };
          platformMap.set(d.platform, {
            spend: existing.spend + (d.spend || 0),
            revenue: existing.revenue + (d.revenue || 0),
          });
        }

        const avgRoas = totalSpend > 0 ? totalRevenue / totalSpend : 0;
        const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
        const avgCvr = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

        const platformBreakdown = Array.from(platformMap.entries()).map(([platform, data]) => ({
          platform,
          spend: data.spend,
          revenue: data.revenue,
          roas: data.spend > 0 ? data.revenue / data.spend : 0,
        }));

        // AI 인사이트 생성
        const aiInsights = generateWeeklyInsights({
          totalSpend,
          totalRevenue,
          avgRoas,
          platformBreakdown,
        });

        const dataSummary = {
          totalSpend,
          totalRevenue,
          totalImpressions,
          totalClicks,
          totalConversions,
          avgRoas,
          avgCtr,
          avgCvr,
          platformBreakdown,
        };

        // 리포트 저장
        const reportTitle = `${startDateStr} ~ ${endDateStr} 주간 리포트`;
        const { data: reportData, error: insertError } = await supabase
          .from('reports')
          .insert({
            user_id: user.id,
            title: reportTitle,
            type: 'weekly',
            template: 'standard',
            platforms: Array.from(platformMap.keys()),
            period_start: startDateStr,
            period_end: endDateStr,
            status: 'completed',
            data_summary: dataSummary,
            ai_insights: aiInsights,
          } as never)
          .select()
          .single();

        if (insertError) {
          console.error(`[Cron/WeeklyReport] Insert error for user ${user.id}:`, insertError);
          errorCount++;
          continue;
        }

        const report = reportData as { id: string } | null;

        // 이메일 발송
        if (user.email && report) {
          const emailResult = await sendReportEmail(user.email, {
            id: report.id,
            title: reportTitle,
            type: 'weekly',
            period_start: startDateStr,
            period_end: endDateStr,
            data_summary: dataSummary,
            ai_insights: aiInsights,
          });

          if (emailResult) {
            // 발송 시간 기록
            await supabase
              .from('reports')
              .update({ email_sent_at: new Date().toISOString() } as never)
              .eq('id', report.id);
          }
        }

        generatedCount++;
      } catch (err) {
        console.error(`[Cron/WeeklyReport] Error processing user ${user.id}:`, err);
        errorCount++;
      }
    }

    return NextResponse.json({
      success: true,
      period: { start: startDateStr, end: endDateStr },
      totalUsers: usersData?.length || 0,
      generated: generatedCount,
      errors: errorCount,
    });
  } catch (error) {
    console.error('[Cron/WeeklyReport] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 주간 인사이트 생성
function generateWeeklyInsights(data: {
  totalSpend: number;
  totalRevenue: number;
  avgRoas: number;
  platformBreakdown: Array<{ platform: string; spend: number; revenue: number; roas: number }>;
}): string {
  const insights: string[] = [];
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }).format(value);

  // 총 성과 요약
  insights.push(
    `이번 주 총 ${formatCurrency(data.totalSpend)}의 광고비를 사용하여 ${formatCurrency(data.totalRevenue)}의 매출을 달성했습니다.`
  );

  // ROAS 분석
  if (data.avgRoas >= 3) {
    insights.push(`ROAS ${data.avgRoas.toFixed(1)}배로 매우 우수한 광고 효율을 보이고 있습니다. 현재 전략을 유지하세요.`);
  } else if (data.avgRoas >= 2) {
    insights.push(`ROAS ${data.avgRoas.toFixed(1)}배로 양호한 성과입니다. 소재 최적화로 추가 개선의 여지가 있습니다.`);
  } else if (data.avgRoas >= 1) {
    insights.push(`ROAS ${data.avgRoas.toFixed(1)}배로 손익분기점 근처입니다. 저효율 캠페인 점검을 권장합니다.`);
  } else if (data.avgRoas > 0) {
    insights.push(`ROAS ${data.avgRoas.toFixed(1)}배로 광고 효율이 낮습니다. 타겟팅과 소재 전면 재검토가 필요합니다.`);
  }

  // 플랫폼별 분석
  if (data.platformBreakdown.length > 1) {
    const sortedPlatforms = [...data.platformBreakdown].sort((a, b) => b.roas - a.roas);
    const bestPlatform = sortedPlatforms[0];
    const worstPlatform = sortedPlatforms[sortedPlatforms.length - 1];

    if (bestPlatform.roas > 0 && worstPlatform.roas > 0) {
      insights.push(
        `${bestPlatform.platform}이 ROAS ${bestPlatform.roas.toFixed(1)}배로 가장 효율적이며, ` +
        `${worstPlatform.platform}(${worstPlatform.roas.toFixed(1)}배)은 개선이 필요합니다.`
      );
    }
  }

  return insights.join('\n\n');
}
