/**
 * 일일 요약 이메일 발송 Cron API
 * TASK-807: 일일 이메일 알림 발송
 *
 * Vercel Cron 또는 외부 스케줄러에서 매일 아침 호출
 * vercel.json에서 cron 설정 필요:
 * { "crons": [{ "path": "/api/cron/daily-summary", "schedule": "0 9 * * *" }] }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { sendDailySummaryEmail } from '@/lib/email';
import { createDailySummaryNotification } from '@/lib/notifications/createNotification';

// Cron 시크릿 검증 (Vercel Cron은 자동으로 Authorization 헤더 추가)
function validateCronRequest(request: NextRequest): boolean {
  // Vercel 환경에서는 CRON_SECRET으로 검증
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
}

/**
 * GET /api/cron/daily-summary
 * 일일 요약 이메일 발송 (Cron에서 호출)
 */
export async function GET(request: NextRequest) {
  // 검증
  if (!validateCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = await createServiceClient();

    // 어제 날짜 계산
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];

    // 일일 이메일 알림을 활성화한 사용자 조회
    const { data: settings, error: settingsError } = await supabase
      .from('notification_settings')
      .select('user_id')
      .eq('email_daily_summary', true);

    if (settingsError) {
      console.error('[Cron/DailySummary] Settings fetch error:', settingsError);
      return NextResponse.json(
        { error: 'Failed to fetch notification settings' },
        { status: 500 }
      );
    }

    const settingsData = settings as NotificationSettingRow[] | null;

    if (!settingsData || settingsData.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No users with daily summary enabled',
        sent: 0,
      });
    }

    const userIds = settingsData.map((s) => s.user_id);

    // 사용자 이메일 조회
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, email')
      .in('id', userIds);

    if (usersError) {
      console.error('[Cron/DailySummary] Users fetch error:', usersError);
      return NextResponse.json(
        { error: 'Failed to fetch user profiles' },
        { status: 500 }
      );
    }

    const usersData = users as UserProfile[] | null;

    let sentCount = 0;
    let errorCount = 0;

    // 각 사용자에게 이메일 발송
    for (const user of usersData || []) {
      try {
        // 사용자의 어제 광고 데이터 조회
        const { data: adData, error: adError } = await supabase
          .from('ad_performance')
          .select('platform, spend, revenue')
          .eq('user_id', user.id)
          .eq('date', dateStr);

        if (adError) {
          console.error(`[Cron/DailySummary] Ad data fetch error for user ${user.id}:`, adError);
          errorCount++;
          continue;
        }

        const adDataTyped = adData as AdPerformanceRow[] | null;

        // 데이터가 없으면 스킵
        if (!adDataTyped || adDataTyped.length === 0) {
          continue;
        }

        // 총계 계산
        const totalSpend = adDataTyped.reduce((sum, d) => sum + (d.spend || 0), 0);
        const totalRevenue = adDataTyped.reduce((sum, d) => sum + (d.revenue || 0), 0);
        const roas = totalSpend > 0 ? totalRevenue / totalSpend : 0;

        // 플랫폼별 데이터 집계
        const platformMap = new Map<string, { spend: number; revenue: number }>();
        for (const d of adDataTyped) {
          const key = d.platform;
          const existing = platformMap.get(key) || { spend: 0, revenue: 0 };
          platformMap.set(key, {
            spend: existing.spend + (d.spend || 0),
            revenue: existing.revenue + (d.revenue || 0),
          });
        }

        const platformBreakdown = Array.from(platformMap.entries()).map(([platform, data]) => ({
          platform,
          spend: data.spend,
          revenue: data.revenue,
        }));

        const summary = {
          date: dateStr,
          totalSpend,
          totalRevenue,
          roas,
          platformBreakdown,
        };

        // 이메일 발송
        if (user.email) {
          const emailResult = await sendDailySummaryEmail(user.email, summary);
          if (emailResult) {
            sentCount++;
          } else {
            errorCount++;
          }
        }

        // 인앱 알림도 생성
        await createDailySummaryNotification(user.id, {
          totalSpend,
          totalRevenue,
          roas,
          date: dateStr,
        });
      } catch (err) {
        console.error(`[Cron/DailySummary] Error processing user ${user.id}:`, err);
        errorCount++;
      }
    }

    return NextResponse.json({
      success: true,
      date: dateStr,
      totalUsers: usersData?.length || 0,
      sent: sentCount,
      errors: errorCount,
    });
  } catch (error) {
    console.error('[Cron/DailySummary] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
