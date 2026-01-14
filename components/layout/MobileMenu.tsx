'use client';

import { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Sidebar } from './Sidebar';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
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
  'transform transition-transform duration-300 ease-out',
].join(' ');

/**
 * 모바일 사이드바 메뉴 컴포넌트
 * TASK-503: 모바일에서 햄버거 버튼 클릭 시 사이드바 슬라이드
 */
export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  // ESC 키로 닫기
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    },
    [isOpen, onClose]
  );

  // 키보드 이벤트 리스너 등록
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

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

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label="네비게이션 메뉴">
      {/* 오버레이 */}
      <div
        className={`${OVERLAY_STYLES} ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 사이드바 드로어 */}
      <div
        className={`${DRAWER_STYLES} ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar isOpen={true} onClose={onClose} isMobile={true} />
      </div>
    </div>,
    document.body
  );
}

export default MobileMenu;
