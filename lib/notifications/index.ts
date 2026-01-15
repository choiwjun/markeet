/**
 * 알림 시스템 유틸리티
 * TASK-802: 알림 API 클라이언트
 */

import type { Notification, NotificationType } from '@/types/database';

// 알림 목록 응답 타입
export interface NotificationListResponse {
  notifications: Notification[];
  unread_count: number;
  total: number;
  has_more: boolean;
}

// 알림 조회 옵션
export interface GetNotificationsOptions {
  limit?: number;
  offset?: number;
  unreadOnly?: boolean;
}

/**
 * 알림 목록 조회
 */
export async function getNotifications(
  options: GetNotificationsOptions = {}
): Promise<NotificationListResponse> {
  const { limit = 20, offset = 0, unreadOnly = false } = options;

  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
    ...(unreadOnly && { unread_only: 'true' }),
  });

  const response = await fetch(`/api/notifications?${params}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '알림 목록 조회에 실패했습니다.');
  }

  return response.json();
}

/**
 * 알림 읽음 처리 (일괄)
 */
export async function markNotificationsAsRead(ids?: string[]): Promise<{ updated_count: number }> {
  const response = await fetch('/api/notifications', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: ids ? JSON.stringify({ ids }) : '{}',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '알림 읽음 처리에 실패했습니다.');
  }

  return response.json();
}

/**
 * 개별 알림 읽음 처리
 */
export async function markNotificationAsRead(id: string): Promise<Notification> {
  const response = await fetch(`/api/notifications/${id}`, {
    method: 'PATCH',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '알림 읽음 처리에 실패했습니다.');
  }

  return response.json();
}

/**
 * 알림 삭제 (일괄)
 */
export async function deleteNotifications(ids: string[]): Promise<{ deleted_count: number }> {
  const response = await fetch('/api/notifications', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '알림 삭제에 실패했습니다.');
  }

  return response.json();
}

/**
 * 개별 알림 삭제
 */
export async function deleteNotification(id: string): Promise<void> {
  const response = await fetch(`/api/notifications/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '알림 삭제에 실패했습니다.');
  }
}

// 알림 타입별 아이콘 매핑
export const NOTIFICATION_ICONS: Record<NotificationType, string> = {
  api_key_expired: '🔑',
  api_key_expiring: '⚠️',
  sync_error: '❌',
  anomaly_spend: '💸',
  anomaly_roas: '📉',
  daily_summary: '📊',
  weekly_report: '📈',
  system: '🔔',
};

// 알림 타입별 색상 매핑
export const NOTIFICATION_COLORS: Record<NotificationType, string> = {
  api_key_expired: 'text-danger-600',
  api_key_expiring: 'text-warning-600',
  sync_error: 'text-danger-600',
  anomaly_spend: 'text-warning-600',
  anomaly_roas: 'text-danger-600',
  daily_summary: 'text-primary-600',
  weekly_report: 'text-primary-600',
  system: 'text-slate-600',
};

// 알림 타입별 한글 라벨
export const NOTIFICATION_LABELS: Record<NotificationType, string> = {
  api_key_expired: 'API 키 만료',
  api_key_expiring: 'API 키 만료 임박',
  sync_error: '동기화 오류',
  anomaly_spend: '광고비 이상',
  anomaly_roas: 'ROAS 이상',
  daily_summary: '일일 요약',
  weekly_report: '주간 리포트',
  system: '시스템 공지',
};

/**
 * 알림 생성일 포맷 (상대 시간)
 */
export function formatNotificationTime(createdAt: string): string {
  const now = new Date();
  const created = new Date(createdAt);
  const diffMs = now.getTime() - created.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  if (diffDay < 7) return `${diffDay}일 전`;

  return created.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
  });
}
