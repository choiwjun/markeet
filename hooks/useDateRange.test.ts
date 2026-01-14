import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDateRange } from './useDateRange';

describe('useDateRange', () => {
  beforeEach(() => {
    // 일정한 날짜로 테스트를 위해 Date mock
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-14T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('초기화', () => {
    it('기본값으로 7d가 선택되어야 함', () => {
      const { result } = renderHook(() => useDateRange());
      expect(result.current.selectedOption).toBe('7d');
    });

    it('initialOption으로 초기 옵션을 설정할 수 있어야 함', () => {
      const { result } = renderHook(() => useDateRange('30d'));
      expect(result.current.selectedOption).toBe('30d');
    });
  });

  describe('날짜 범위 계산', () => {
    it('7d 옵션에서 올바른 날짜 범위가 계산되어야 함', () => {
      const { result } = renderHook(() => useDateRange('7d'));

      const { dateRange } = result.current;
      const startDate = dateRange.startDate;
      const endDate = dateRange.endDate;

      // 종료일은 오늘 (2026-01-14)
      expect(endDate.getFullYear()).toBe(2026);
      expect(endDate.getMonth()).toBe(0); // 1월 (0-indexed)
      expect(endDate.getDate()).toBe(14);

      // 시작일은 7일 전 (6일을 빼면 2026-01-08)
      expect(startDate.getFullYear()).toBe(2026);
      expect(startDate.getMonth()).toBe(0);
      expect(startDate.getDate()).toBe(8);
    });

    it('30d 옵션에서 올바른 날짜 범위가 계산되어야 함', () => {
      const { result } = renderHook(() => useDateRange('30d'));

      const { dateRange } = result.current;

      // 시작일은 30일 전 (29일을 빼면 2025-12-16)
      expect(dateRange.startDate.getFullYear()).toBe(2025);
      expect(dateRange.startDate.getMonth()).toBe(11); // 12월 (0-indexed)
      expect(dateRange.startDate.getDate()).toBe(16);
    });

    it('90d 옵션에서 올바른 날짜 범위가 계산되어야 함', () => {
      const { result } = renderHook(() => useDateRange('90d'));

      const { dateRange } = result.current;

      // 시작일은 90일 전 (89일을 빼면 2025-10-17)
      expect(dateRange.startDate.getFullYear()).toBe(2025);
      expect(dateRange.startDate.getMonth()).toBe(9); // 10월 (0-indexed)
      expect(dateRange.startDate.getDate()).toBe(17);
    });
  });

  describe('옵션 변경', () => {
    it('setOption으로 기간을 변경할 수 있어야 함', () => {
      const { result } = renderHook(() => useDateRange('7d'));

      act(() => {
        result.current.setOption('30d');
      });

      expect(result.current.selectedOption).toBe('30d');
    });

    it('옵션 변경 시 dateRange가 업데이트되어야 함', () => {
      const { result } = renderHook(() => useDateRange('7d'));

      const initialStartDate = result.current.dateRange.startDate.getTime();

      act(() => {
        result.current.setOption('30d');
      });

      const newStartDate = result.current.dateRange.startDate.getTime();
      expect(newStartDate).not.toBe(initialStartDate);
    });
  });

  describe('커스텀 범위', () => {
    it('setCustomRange로 커스텀 범위를 설정할 수 있어야 함', () => {
      const { result } = renderHook(() => useDateRange('7d'));

      const customStart = new Date('2026-01-01');
      const customEnd = new Date('2026-01-10');

      act(() => {
        result.current.setCustomRange({
          startDate: customStart,
          endDate: customEnd,
        });
      });

      expect(result.current.selectedOption).toBe('custom');
      expect(result.current.dateRange.startDate.getTime()).toBe(customStart.getTime());
      expect(result.current.dateRange.endDate.getTime()).toBe(customEnd.getTime());
    });
  });

  describe('ISO 문자열 출력', () => {
    it('startDateISO가 올바른 형식이어야 함', () => {
      const { result } = renderHook(() => useDateRange('7d'));

      // YYYY-MM-DD 형식 확인
      expect(result.current.startDateISO).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(result.current.startDateISO).toBe('2026-01-08');
    });

    it('endDateISO가 올바른 형식이어야 함', () => {
      const { result } = renderHook(() => useDateRange('7d'));

      expect(result.current.endDateISO).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(result.current.endDateISO).toBe('2026-01-14');
    });
  });

  describe('쿼리 파라미터', () => {
    it('queryParams가 올바른 형식이어야 함', () => {
      const { result } = renderHook(() => useDateRange('7d'));

      expect(result.current.queryParams).toEqual({
        start_date: '2026-01-08',
        end_date: '2026-01-14',
      });
    });

    it('옵션 변경 시 queryParams가 업데이트되어야 함', () => {
      const { result } = renderHook(() => useDateRange('7d'));

      const initialParams = { ...result.current.queryParams };

      act(() => {
        result.current.setOption('30d');
      });

      expect(result.current.queryParams.start_date).not.toBe(initialParams.start_date);
    });
  });
});
