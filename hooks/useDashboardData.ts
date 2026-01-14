'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';

// 집계 데이터 타입
export interface DashboardMetrics {
  totalSpend: number;
  totalRevenue: number;
  avgRoas: number;
  totalClicks: number;
  totalConversions: number;
  totalImpressions: number;
}

// 변화량 타입
export interface MetricsChange {
  spendChange: number;
  revenueChange: number;
  roasChange: number;
  clicksChange: number;
  conversionsChange: number;
}

// API 응답 타입
export interface DashboardResponse {
  metrics: DashboardMetrics;
  changes: MetricsChange;
  period: {
    startDate: string;
    endDate: string;
  };
}

// Hook 파라미터 타입
interface UseDashboardDataParams {
  startDate: string;
  endDate: string;
  enabled?: boolean;
}

// Hook 반환 타입
interface UseDashboardDataReturn {
  data: DashboardResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * 대시보드 데이터 페칭 함수
 */
async function fetchDashboardData(
  startDate: string,
  endDate: string
): Promise<DashboardResponse> {
  const params = new URLSearchParams({
    start_date: startDate,
    end_date: endDate,
  });

  const response = await fetch(`/api/dashboard?${params.toString()}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || '대시보드 데이터 조회에 실패했습니다.');
  }

  return response.json();
}

/**
 * 대시보드 데이터 조회 훅
 * TASK-511: React Query를 사용한 대시보드 데이터 페칭 (5분 캐싱)
 *
 * @example
 * ```tsx
 * const { data, isLoading, isError, refetch } = useDashboardData({
 *   startDate: '2026-01-08',
 *   endDate: '2026-01-14',
 * });
 *
 * if (isLoading) return <Loading />;
 * if (isError) return <Error />;
 *
 * return <Dashboard metrics={data.metrics} />;
 * ```
 */
export function useDashboardData({
  startDate,
  endDate,
  enabled = true,
}: UseDashboardDataParams): UseDashboardDataReturn {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useQuery<
    DashboardResponse,
    Error
  >({
    queryKey: ['dashboard', startDate, endDate],
    queryFn: () => fetchDashboardData(startDate, endDate),
    enabled: enabled && !!startDate && !!endDate,
    staleTime: 5 * 60 * 1000, // 5분 동안 fresh 상태 유지
    gcTime: 10 * 60 * 1000, // 10분 후 가비지 컬렉션
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    data,
    isLoading,
    isError,
    error: error || null,
    refetch: () => {
      refetch();
    },
  };
}

/**
 * 대시보드 데이터 프리페치 함수
 * 페이지 진입 전에 데이터를 미리 로드할 때 사용
 */
export function usePrefetchDashboardData() {
  const queryClient = useQueryClient();

  return (startDate: string, endDate: string) => {
    return queryClient.prefetchQuery({
      queryKey: ['dashboard', startDate, endDate],
      queryFn: () => fetchDashboardData(startDate, endDate),
      staleTime: 5 * 60 * 1000,
    });
  };
}

export default useDashboardData;
