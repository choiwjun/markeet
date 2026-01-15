/**
 * 알림 생성 유틸리티 (서버사이드)
 * TASK-805: API 키 만료 알림 생성
 * TASK-806: 이상 징후 감지 알림
 */

import { createServiceClient } from '@/lib/supabase/server';
import type { NotificationType, PlatformCode, Json } from '@/types/database';
import { PLATFORMS } from '@/lib/constants/platforms';

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}

/**
 * 플랫폼 이름 조회 헬퍼
 */
function getPlatformName(platform: PlatformCode): string {
  const platformInfo = PLATFORMS[platform];
  return platformInfo?.name || platform;
}

/**
 * 알림 생성 (서버사이드 전용)
 */
export async function createNotification({
  userId,
  type,
  title,
  message,
  data,
}: CreateNotificationParams): Promise<{ id: string } | null> {
  try {
    const supabase = await createServiceClient();

    const { data: result, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message,
        data: (data || null) as Json,
      } as never)
      .select('id')
      .single();

    if (error) {
      console.error('[Notification] Create error:', error);
      return null;
    }

    return result as { id: string };
  } catch (err) {
    console.error('[Notification] Unexpected error:', err);
    return null;
  }
}

/**
 * API 키 만료 알림 생성
 */
export async function createApiKeyExpiredNotification(
  userId: string,
  platform: PlatformCode,
  errorMessage?: string
): Promise<void> {
  const platformName = getPlatformName(platform);

  await createNotification({
    userId,
    type: 'api_key_expired',
    title: `${platformName} API 키 만료`,
    message: errorMessage || `${platformName} 연동의 API 키가 만료되었습니다. 새 API 키를 입력해주세요.`,
    data: {
      platform,
      link: '/settings/connections',
    },
  });
}

/**
 * API 키 만료 임박 알림 생성
 */
export async function createApiKeyExpiringNotification(
  userId: string,
  platform: PlatformCode,
  daysLeft: number
): Promise<void> {
  const platformName = getPlatformName(platform);

  await createNotification({
    userId,
    type: 'api_key_expiring',
    title: `${platformName} API 키 만료 임박`,
    message: `${platformName} 연동의 API 키가 ${daysLeft}일 후 만료됩니다. 갱신을 권장합니다.`,
    data: {
      platform,
      daysLeft,
      link: '/settings/connections',
    },
  });
}

/**
 * 동기화 오류 알림 생성
 */
export async function createSyncErrorNotification(
  userId: string,
  platform: PlatformCode,
  errorMessage: string
): Promise<void> {
  const platformName = getPlatformName(platform);

  await createNotification({
    userId,
    type: 'sync_error',
    title: `${platformName} 데이터 동기화 실패`,
    message: `${platformName} 데이터 동기화 중 오류가 발생했습니다: ${errorMessage}`,
    data: {
      platform,
      error: errorMessage,
      link: '/settings/connections',
    },
  });
}

/**
 * 광고비 이상 감지 알림 생성
 */
export async function createAnomalySpendNotification(
  userId: string,
  platform: PlatformCode,
  changePercent: number,
  currentSpend: number,
  previousSpend: number
): Promise<void> {
  const platformName = getPlatformName(platform);
  const isIncrease = changePercent > 0;

  const formattedChange = Math.abs(changePercent).toFixed(1);
  const formattedCurrent = currentSpend.toLocaleString('ko-KR');
  const formattedPrevious = previousSpend.toLocaleString('ko-KR');

  await createNotification({
    userId,
    type: 'anomaly_spend',
    title: `${platformName} 광고비 ${isIncrease ? '급증' : '급감'} 감지`,
    message: `${platformName}의 광고비가 전일 대비 ${formattedChange}% ${isIncrease ? '증가' : '감소'}했습니다. (${formattedPrevious}원 → ${formattedCurrent}원)`,
    data: {
      platform,
      changePercent,
      currentSpend,
      previousSpend,
      link: '/dashboard',
    },
  });
}

/**
 * ROAS 이상 감지 알림 생성
 */
export async function createAnomalyRoasNotification(
  userId: string,
  platform: PlatformCode,
  changePercent: number,
  currentRoas: number,
  previousRoas: number
): Promise<void> {
  const platformName = getPlatformName(platform);
  const isIncrease = changePercent > 0;

  const formattedChange = Math.abs(changePercent).toFixed(1);
  const formattedCurrent = (currentRoas * 100).toFixed(0);
  const formattedPrevious = (previousRoas * 100).toFixed(0);

  await createNotification({
    userId,
    type: 'anomaly_roas',
    title: `${platformName} ROAS ${isIncrease ? '급등' : '급락'} 감지`,
    message: `${platformName}의 ROAS가 전일 대비 ${formattedChange}% ${isIncrease ? '증가' : '감소'}했습니다. (${formattedPrevious}% → ${formattedCurrent}%)`,
    data: {
      platform,
      changePercent,
      currentRoas,
      previousRoas,
      link: '/dashboard',
    },
  });
}

/**
 * 일일 요약 알림 생성
 */
export async function createDailySummaryNotification(
  userId: string,
  summary: {
    totalSpend: number;
    totalRevenue: number;
    roas: number;
    date: string;
  }
): Promise<void> {
  const formattedSpend = summary.totalSpend.toLocaleString('ko-KR');
  const formattedRevenue = summary.totalRevenue.toLocaleString('ko-KR');
  const formattedRoas = (summary.roas * 100).toFixed(0);

  await createNotification({
    userId,
    type: 'daily_summary',
    title: '어제의 광고 성과 요약',
    message: `광고비 ${formattedSpend}원, 매출 ${formattedRevenue}원, ROAS ${formattedRoas}%`,
    data: {
      ...summary,
      link: '/dashboard',
    },
  });
}

/**
 * 주간 리포트 알림 생성
 */
export async function createWeeklyReportNotification(
  userId: string,
  reportId: string,
  weekStart: string,
  weekEnd: string
): Promise<void> {
  await createNotification({
    userId,
    type: 'weekly_report',
    title: '주간 리포트가 생성되었습니다',
    message: `${weekStart} ~ ${weekEnd} 기간의 주간 광고 성과 리포트가 준비되었습니다.`,
    data: {
      reportId,
      weekStart,
      weekEnd,
      link: `/reports/${reportId}`,
    },
  });
}

/**
 * 시스템 공지 알림 생성
 */
export async function createSystemNotification(
  userId: string,
  title: string,
  message: string,
  link?: string
): Promise<void> {
  await createNotification({
    userId,
    type: 'system',
    title,
    message,
    data: link ? { link } : undefined,
  });
}
