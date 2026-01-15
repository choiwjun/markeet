'use client';

/**
 * 알림 관리 훅
 * TASK-802: 알림 목록 조회, 읽음 처리, 실시간 업데이트
 */

import { useState, useEffect, useCallback } from 'react';
import type { Notification } from '@/types/database';
import {
  getNotifications,
  markNotificationsAsRead,
  markNotificationAsRead,
  deleteNotification,
  type GetNotificationsOptions,
} from '@/lib/notifications';

interface UseNotificationsState {
  notifications: Notification[];
  unreadCount: number;
  total: number;
  hasMore: boolean;
  isLoading: boolean;
  error: string | null;
}

interface UseNotificationsReturn extends UseNotificationsState {
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  remove: (id: string) => Promise<void>;
}

const INITIAL_STATE: UseNotificationsState = {
  notifications: [],
  unreadCount: 0,
  total: 0,
  hasMore: false,
  isLoading: true,
  error: null,
};

/**
 * 알림 관리 훅
 */
export function useNotifications(options: GetNotificationsOptions = {}): UseNotificationsReturn {
  const [state, setState] = useState<UseNotificationsState>(INITIAL_STATE);
  const [offset, setOffset] = useState(0);

  const limit = options.limit || 20;

  // 알림 목록 조회
  const fetchNotifications = useCallback(async (reset = false) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const currentOffset = reset ? 0 : offset;
      const response = await getNotifications({
        ...options,
        limit,
        offset: currentOffset,
      });

      setState(prev => ({
        notifications: reset
          ? response.notifications
          : [...prev.notifications, ...response.notifications],
        unreadCount: response.unread_count,
        total: response.total,
        hasMore: response.has_more,
        isLoading: false,
        error: null,
      }));

      if (reset) {
        setOffset(limit);
      } else {
        setOffset(currentOffset + limit);
      }
    } catch (err) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : '알림 조회에 실패했습니다.',
      }));
    }
  }, [limit, offset, options]);

  // 새로고침
  const refresh = useCallback(async () => {
    setOffset(0);
    await fetchNotifications(true);
  }, [fetchNotifications]);

  // 더 불러오기
  const loadMore = useCallback(async () => {
    if (state.hasMore && !state.isLoading) {
      await fetchNotifications(false);
    }
  }, [fetchNotifications, state.hasMore, state.isLoading]);

  // 개별 알림 읽음 처리
  const markAsRead = useCallback(async (id: string) => {
    try {
      const updated = await markNotificationAsRead(id);
      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(n =>
          n.id === id ? updated : n
        ),
        unreadCount: Math.max(0, prev.unreadCount - 1),
      }));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }, []);

  // 모든 알림 읽음 처리
  const markAllAsRead = useCallback(async () => {
    try {
      await markNotificationsAsRead();
      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(n => ({
          ...n,
          is_read: true,
          read_at: new Date().toISOString(),
        })),
        unreadCount: 0,
      }));
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  }, []);

  // 알림 삭제
  const remove = useCallback(async (id: string) => {
    try {
      await deleteNotification(id);
      setState(prev => {
        const notification = prev.notifications.find(n => n.id === id);
        const wasUnread = notification && !notification.is_read;
        return {
          ...prev,
          notifications: prev.notifications.filter(n => n.id !== id),
          unreadCount: wasUnread ? Math.max(0, prev.unreadCount - 1) : prev.unreadCount,
          total: Math.max(0, prev.total - 1),
        };
      });
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  }, []);

  // 초기 로드
  useEffect(() => {
    fetchNotifications(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    ...state,
    refresh,
    loadMore,
    markAsRead,
    markAllAsRead,
    remove,
  };
}

/**
 * 읽지 않은 알림 수만 조회하는 훅
 */
export function useUnreadCount(): { count: number; isLoading: boolean; refresh: () => void } {
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCount = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getNotifications({ limit: 1 });
      setCount(response.unread_count);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCount();

    // 30초마다 갱신
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [fetchCount]);

  return { count, isLoading, refresh: fetchCount };
}
