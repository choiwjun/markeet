'use client';

import { useQuery } from '@tanstack/react-query';

// 일자별 데이터 타입
export interface DailyMetrics {
  date: string;
  spend: number;
  revenue: number;
  roas: number;
  clicks: number;
  conversions: number;
}

// API 응답 타입
export interface TrendResponse {
  data: DailyMetrics[];
  period: {
    startDate: string;
    endDate: string;
  };
}

// Hook 파라미터 타입
interface UseTrendDataParams {
  startDate: string;
  endDate: string;
  enabled?: boolean;
}

// Hook 반환 타입
interface UseTrendDataReturn {
  data: TrendResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * 일자별 추이 데이터 페칭 함수
 */
async function fetchTrendData(
  startDate: string,
  endDate: string
): Promise<TrendResponse> {
  const params = new URLSearchParams({
    start_date: startDate,
    end_date: endDate,
  });

  const response = await fetch(`/api/dashboard/trends?${params.toString()}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || '일자별 데이터 조회에 실패했습니다.');
  }

  return response.json();
}

/**
 * 일자별 추이 데이터 조회 훅
 */
export function useTrendData({
  startDate,
  endDate,
  enabled = true,
}: UseTrendDataParams): UseTrendDataReturn {
  const { data, isLoading, isError, error, refetch } = useQuery<
    TrendResponse,
    Error
  >({
    queryKey: ['dashboard', 'trends', startDate, endDate],
    queryFn: () => fetchTrendData(startDate, endDate),
    enabled: enabled && !!startDate && !!endDate,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
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

export default useTrendData;
