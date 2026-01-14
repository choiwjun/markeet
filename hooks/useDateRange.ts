'use client';

import { useState, useCallback, useMemo } from 'react';

// 기간 옵션 타입
export type DateRangeOption = '7d' | '30d' | '90d' | 'custom';

// 기간 범위 인터페이스
export interface DateRange {
  startDate: Date;
  endDate: Date;
}

// Hook 반환 타입
interface UseDateRangeReturn {
  /** 현재 선택된 기간 옵션 */
  selectedOption: DateRangeOption;
  /** 현재 날짜 범위 */
  dateRange: DateRange;
  /** 기간 옵션 변경 */
  setOption: (option: DateRangeOption) => void;
  /** 커스텀 기간 설정 */
  setCustomRange: (range: DateRange) => void;
  /** ISO 문자열 형식의 시작일 */
  startDateISO: string;
  /** ISO 문자열 형식의 종료일 */
  endDateISO: string;
  /** API 쿼리용 파라미터 */
  queryParams: {
    start_date: string;
    end_date: string;
  };
}

/**
 * 옵션에 따른 날짜 범위 계산
 */
function calculateDateRange(option: DateRangeOption): DateRange {
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);

  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);

  switch (option) {
    case '7d':
      startDate.setDate(startDate.getDate() - 6);
      break;
    case '30d':
      startDate.setDate(startDate.getDate() - 29);
      break;
    case '90d':
      startDate.setDate(startDate.getDate() - 89);
      break;
    case 'custom':
      // custom의 경우 기본값으로 7일 사용
      startDate.setDate(startDate.getDate() - 6);
      break;
  }

  return { startDate, endDate };
}

/**
 * Date를 YYYY-MM-DD 형식의 문자열로 변환 (로컬 시간 기준)
 */
function formatDateToISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 기간 선택 상태 관리 훅
 * TASK-509: 선택된 기간에 따라 데이터 다시 조회
 *
 * @example
 * ```tsx
 * const {
 *   selectedOption,
 *   dateRange,
 *   setOption,
 *   queryParams,
 * } = useDateRange();
 *
 * // 기간 변경
 * setOption('30d');
 *
 * // API 호출 시
 * fetch(`/api/dashboard?${new URLSearchParams(queryParams)}`);
 * ```
 */
export function useDateRange(initialOption: DateRangeOption = '7d'): UseDateRangeReturn {
  const [selectedOption, setSelectedOption] = useState<DateRangeOption>(initialOption);
  const [customRange, setCustomRangeState] = useState<DateRange | null>(null);

  // 현재 날짜 범위 계산
  const dateRange = useMemo<DateRange>(() => {
    if (selectedOption === 'custom' && customRange) {
      return customRange;
    }
    return calculateDateRange(selectedOption);
  }, [selectedOption, customRange]);

  // ISO 문자열 형식의 날짜
  const startDateISO = useMemo(() => formatDateToISO(dateRange.startDate), [dateRange.startDate]);
  const endDateISO = useMemo(() => formatDateToISO(dateRange.endDate), [dateRange.endDate]);

  // API 쿼리 파라미터
  const queryParams = useMemo(
    () => ({
      start_date: startDateISO,
      end_date: endDateISO,
    }),
    [startDateISO, endDateISO]
  );

  // 옵션 변경 핸들러
  const setOption = useCallback((option: DateRangeOption) => {
    setSelectedOption(option);
    // custom이 아닌 옵션으로 변경 시 customRange 초기화
    if (option !== 'custom') {
      setCustomRangeState(null);
    }
  }, []);

  // 커스텀 범위 설정 핸들러
  const setCustomRange = useCallback((range: DateRange) => {
    setSelectedOption('custom');
    setCustomRangeState(range);
  }, []);

  return {
    selectedOption,
    dateRange,
    setOption,
    setCustomRange,
    startDateISO,
    endDateISO,
    queryParams,
  };
}

export default useDateRange;
