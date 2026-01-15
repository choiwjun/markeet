/**
 * 스와이프 제스처 훅
 * TASK-1302: 터치 제스처 지원
 */

import { useRef, useEffect, useCallback } from 'react';

interface SwipeOptions {
  /** 스와이프로 인식할 최소 거리 (px) */
  threshold?: number;
  /** 스와이프 인식할 최대 수직 편차 (px) */
  maxVerticalOffset?: number;
  /** 왼쪽으로 스와이프 시 콜백 */
  onSwipeLeft?: () => void;
  /** 오른쪽으로 스와이프 시 콜백 */
  onSwipeRight?: () => void;
  /** 위로 스와이프 시 콜백 */
  onSwipeUp?: () => void;
  /** 아래로 스와이프 시 콜백 */
  onSwipeDown?: () => void;
  /** 활성화 여부 */
  enabled?: boolean;
}

interface TouchState {
  startX: number;
  startY: number;
  startTime: number;
}

/**
 * 터치 스와이프 제스처를 감지하는 훅
 */
export function useSwipeGesture<T extends HTMLElement = HTMLElement>({
  threshold = 50,
  maxVerticalOffset = 100,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  enabled = true,
}: SwipeOptions = {}) {
  const elementRef = useRef<T>(null);
  const touchStateRef = useRef<TouchState | null>(null);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!enabled) return;

      const touch = e.touches[0];
      touchStateRef.current = {
        startX: touch.clientX,
        startY: touch.clientY,
        startTime: Date.now(),
      };
    },
    [enabled]
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (!enabled || !touchStateRef.current) return;

      const touch = e.changedTouches[0];
      const { startX, startY, startTime } = touchStateRef.current;

      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;
      const deltaTime = Date.now() - startTime;

      // 너무 오래 걸린 스와이프는 무시 (500ms 이상)
      if (deltaTime > 500) {
        touchStateRef.current = null;
        return;
      }

      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      // 수평 스와이프
      if (absDeltaX > threshold && absDeltaY < maxVerticalOffset) {
        if (deltaX > 0) {
          onSwipeRight?.();
        } else {
          onSwipeLeft?.();
        }
      }

      // 수직 스와이프
      if (absDeltaY > threshold && absDeltaX < maxVerticalOffset) {
        if (deltaY > 0) {
          onSwipeDown?.();
        } else {
          onSwipeUp?.();
        }
      }

      touchStateRef.current = null;
    },
    [enabled, threshold, maxVerticalOffset, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]
  );

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !enabled) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, handleTouchStart, handleTouchEnd]);

  return elementRef;
}

/**
 * 전역 스와이프 제스처 (document body에 적용)
 */
export function useGlobalSwipeGesture({
  threshold = 50,
  maxVerticalOffset = 100,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  enabled = true,
  /** 스와이프 시작 가능 영역 (화면 왼쪽에서 시작) */
  edgeWidth = 30,
}: SwipeOptions & { edgeWidth?: number } = {}) {
  const touchStateRef = useRef<TouchState | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];

      // 화면 왼쪽 가장자리에서 시작한 경우만 처리
      if (touch.clientX <= edgeWidth) {
        touchStateRef.current = {
          startX: touch.clientX,
          startY: touch.clientY,
          startTime: Date.now(),
        };
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStateRef.current) return;

      const touch = e.changedTouches[0];
      const { startX, startY, startTime } = touchStateRef.current;

      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;
      const deltaTime = Date.now() - startTime;

      // 너무 오래 걸린 스와이프는 무시
      if (deltaTime > 500) {
        touchStateRef.current = null;
        return;
      }

      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      // 수평 스와이프
      if (absDeltaX > threshold && absDeltaY < maxVerticalOffset) {
        if (deltaX > 0) {
          onSwipeRight?.();
        } else {
          onSwipeLeft?.();
        }
      }

      // 수직 스와이프
      if (absDeltaY > threshold && absDeltaX < maxVerticalOffset) {
        if (deltaY > 0) {
          onSwipeDown?.();
        } else {
          onSwipeUp?.();
        }
      }

      touchStateRef.current = null;
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, threshold, maxVerticalOffset, edgeWidth, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);
}

export default useSwipeGesture;
