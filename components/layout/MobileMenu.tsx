'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Sidebar } from './Sidebar';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

// 터치 상태 타입
interface TouchState {
  startX: number;
  startY: number;
  currentX: number;
  isDragging: boolean;
}

// 스타일 상수
const OVERLAY_STYLES = [
  'fixed inset-0 z-40',
  'bg-black/50',
  'backdrop-blur-sm',
  'transition-opacity duration-300',
].join(' ');

const DRAWER_STYLES = [
  'fixed inset-y-0 left-0 z-50',
  'w-64 max-w-[80vw]',
].join(' ');

const DRAWER_BASE_TRANSFORM = 'transform transition-transform duration-300 ease-out';
const DRAWER_DRAGGING_TRANSFORM = 'transform duration-0';

// 스와이프 임계값
const SWIPE_THRESHOLD = 50;
const SWIPE_VELOCITY_THRESHOLD = 0.3;

/**
 * 모바일 사이드바 메뉴 컴포넌트
 * TASK-503: 모바일에서 햄버거 버튼 클릭 시 사이드바 슬라이드
 * TASK-1302: 터치 제스처로 메뉴 열기/닫기
 */
export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const touchStateRef = useRef<TouchState | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // ESC 키로 닫기
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    },
    [isOpen, onClose]
  );

  // 터치 시작
  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    touchStateRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      isDragging: false,
    };
  }, []);

  // 터치 이동
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!touchStateRef.current) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStateRef.current.startX;
    const deltaY = Math.abs(touch.clientY - touchStateRef.current.startY);

    // 수평 스와이프만 처리 (왼쪽으로 스와이프해서 닫기)
    if (Math.abs(deltaX) > 10 && deltaY < 50) {
      touchStateRef.current.isDragging = true;
      touchStateRef.current.currentX = touch.clientX;

      // 왼쪽으로만 드래그 허용
      if (deltaX < 0) {
        setIsDragging(true);
        setDragOffset(deltaX);
      }
    }
  }, []);

  // 터치 종료
  const handleTouchEnd = useCallback(() => {
    if (!touchStateRef.current) return;

    const { startX, currentX, isDragging: wasDragging } = touchStateRef.current;

    if (wasDragging) {
      const deltaX = currentX - startX;

      // 임계값 이상 왼쪽으로 스와이프하면 닫기
      if (deltaX < -SWIPE_THRESHOLD) {
        onClose();
      }
    }

    // 상태 초기화
    touchStateRef.current = null;
    setIsDragging(false);
    setDragOffset(0);
  }, [onClose]);

  // 키보드 이벤트 리스너 등록
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // 터치 이벤트 리스너 등록
  useEffect(() => {
    const drawer = drawerRef.current;
    if (!drawer || !isOpen) return;

    drawer.addEventListener('touchstart', handleTouchStart, { passive: true });
    drawer.addEventListener('touchmove', handleTouchMove, { passive: true });
    drawer.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      drawer.removeEventListener('touchstart', handleTouchStart);
      drawer.removeEventListener('touchmove', handleTouchMove);
      drawer.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isOpen, handleTouchStart, handleTouchMove, handleTouchEnd]);

  // 메뉴가 열려있을 때 body 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // 서버사이드 렌더링 방지
  if (typeof window === 'undefined') {
    return null;
  }

  // 닫힌 상태에서는 렌더링하지 않음
  if (!isOpen) {
    return null;
  }

  // 드래그 오프셋에 따른 트랜스폼 계산
  const getTransformStyle = () => {
    if (isDragging && dragOffset < 0) {
      return { transform: `translateX(${dragOffset}px)` };
    }
    return {};
  };

  // 오버레이 투명도 계산
  const getOverlayOpacity = () => {
    if (isDragging && dragOffset < 0) {
      const drawerWidth = 256; // w-64 = 16rem = 256px
      const progress = Math.max(0, 1 + dragOffset / drawerWidth);
      return progress;
    }
    return 1;
  };

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label="네비게이션 메뉴">
      {/* 오버레이 */}
      <div
        className={OVERLAY_STYLES}
        style={{ opacity: isOpen ? getOverlayOpacity() : 0 }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 사이드바 드로어 */}
      <div
        ref={drawerRef}
        className={`${DRAWER_STYLES} ${
          isDragging ? DRAWER_DRAGGING_TRANSFORM : DRAWER_BASE_TRANSFORM
        } ${isOpen && !isDragging ? 'translate-x-0' : ''}`}
        style={getTransformStyle()}
      >
        <Sidebar isOpen={true} onClose={onClose} isMobile={true} />
      </div>
    </div>,
    document.body
  );
}

export default MobileMenu;
