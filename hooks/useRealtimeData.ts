/**
 * 실시간 데이터 업데이트 훅
 * TASK-1208: Supabase Realtime으로 데이터 변경 시 자동 갱신
 */

import { useEffect, useCallback, useRef } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

type TableName = 'ad_performance' | 'platform_connections' | 'reports' | 'notifications';

interface UseRealtimeDataOptions {
  /** 구독할 테이블 이름 */
  table: TableName;
  /** 필터링할 사용자 ID */
  userId?: string;
  /** INSERT 이벤트 콜백 */
  onInsert?: (payload: Record<string, unknown>) => void;
  /** UPDATE 이벤트 콜백 */
  onUpdate?: (payload: Record<string, unknown>) => void;
  /** DELETE 이벤트 콜백 */
  onDelete?: (payload: Record<string, unknown>) => void;
  /** 모든 변경사항에 대한 콜백 */
  onChange?: () => void;
  /** 활성화 여부 */
  enabled?: boolean;
}

/**
 * Supabase Realtime 구독 훅
 * 테이블의 실시간 변경사항을 구독하고 콜백을 호출합니다.
 */
export function useRealtimeData({
  table,
  userId,
  onInsert,
  onUpdate,
  onDelete,
  onChange,
  enabled = true,
}: UseRealtimeDataOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  // 구독 설정
  const subscribe = useCallback(async () => {
    if (!enabled) return;

    const supabase = getSupabaseClient();

    // 채널 이름
    const channelName = userId ? `${table}_${userId}` : `${table}_all`;

    // 필터 조건
    const filter = userId ? `user_id=eq.${userId}` : undefined;

    // 채널 생성
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: table,
          filter: filter,
        },
        (payload) => {
          console.log(`[Realtime] ${table} INSERT:`, payload);
          onInsert?.(payload.new as Record<string, unknown>);
          onChange?.();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: table,
          filter: filter,
        },
        (payload) => {
          console.log(`[Realtime] ${table} UPDATE:`, payload);
          onUpdate?.(payload.new as Record<string, unknown>);
          onChange?.();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: table,
          filter: filter,
        },
        (payload) => {
          console.log(`[Realtime] ${table} DELETE:`, payload);
          onDelete?.(payload.old as Record<string, unknown>);
          onChange?.();
        }
      )
      .subscribe((status) => {
        console.log(`[Realtime] ${table} subscription status:`, status);
      });

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [enabled, table, userId, onInsert, onUpdate, onDelete, onChange]);

  // 구독 해제
  const unsubscribe = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }
  }, []);

  // 마운트/언마운트 시 구독 관리
  useEffect(() => {
    subscribe();
    return () => unsubscribe();
  }, [subscribe, unsubscribe]);

  return {
    unsubscribe,
    resubscribe: subscribe,
  };
}

/**
 * 대시보드 데이터 실시간 업데이트 훅
 * ad_performance 테이블 변경 시 대시보드 데이터 새로고침
 */
export function useDashboardRealtime(
  userId: string | undefined,
  onRefresh: () => void
) {
  return useRealtimeData({
    table: 'ad_performance',
    userId,
    onChange: onRefresh,
    enabled: !!userId,
  });
}

/**
 * 알림 실시간 업데이트 훅
 * notifications 테이블 변경 시 알림 목록 새로고침
 */
export function useNotificationsRealtime(
  userId: string | undefined,
  onNewNotification?: (notification: Record<string, unknown>) => void,
  onRefresh?: () => void
) {
  return useRealtimeData({
    table: 'notifications',
    userId,
    onInsert: onNewNotification,
    onChange: onRefresh,
    enabled: !!userId,
  });
}

export default useRealtimeData;
