'use client';

import { useQuery } from '@tanstack/react-query';
import type { PlatformCode } from '@/types/database';

// 플랫폼별 데이터 타입
export interface PlatformMetrics {
  platform: PlatformCode;
  spend: number;
  revenue: number;
  roas: number;
  clicks: number;
  conversions: number;
}

// API 응답 타입
export interface PlatformResponse {
  data: PlatformMetrics[];
  period: {
    startDate: string;
    endDate: string;
  };
}

// Hook 파라미터 타입
interface UsePlatformDataParams {
  startDate: string;
  endDate: string;
  enabled?: boolean;
}

// Hook 반환 타입
interface UsePlatformDataReturn {
  data: PlatformResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * 플랫폼별 데이터 페칭 함수
 */
async function fetchPlatformData(
  startDate: string,
  endDate: string
): Promise<PlatformResponse> {
  const params = new URLSearchParams({
    start_date: startDate,
    end_date: endDate,
  });

  const response = await fetch(`/api/dashboard/platforms?${params.toString()}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || '플랫폼별 데이터 조회에 실패했습니다.');
  }

  return response.json();
}

/**
 * 플랫폼별 데이터 조회 훅
 */
export function usePlatformData({
  startDate,
  endDate,
  enabled = true,
}: UsePlatformDataParams): UsePlatformDataReturn {
  const { data, isLoading, isError, error, refetch } = useQuery<
    PlatformResponse,
    Error
  >({
    queryKey: ['dashboard', 'platforms', startDate, endDate],
    queryFn: () => fetchPlatformData(startDate, endDate),
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

export default usePlatformData;
