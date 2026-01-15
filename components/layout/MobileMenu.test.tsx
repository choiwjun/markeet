import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MobileMenu } from './MobileMenu';

// Next.js 모킹
vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}));

describe('MobileMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // body overflow 스타일 초기화
    document.body.style.overflow = '';
  });

  describe('렌더링', () => {
    it('isOpen이 true일 때 사이드바가 렌더링되어야 함', () => {
      const onClose = vi.fn();
      render(<MobileMenu isOpen={true} onClose={onClose} />);

      expect(screen.getByText('MARKEET')).toBeInTheDocument();
    });

    it('isOpen이 false일 때 렌더링되지 않아야 함', () => {
      const onClose = vi.fn();
      render(<MobileMenu isOpen={false} onClose={onClose} />);

      expect(screen.queryByText('MARKEET')).not.toBeInTheDocument();
    });

    it('dialog role이 설정되어야 함', () => {
      const onClose = vi.fn();
      render(<MobileMenu isOpen={true} onClose={onClose} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('aria-modal이 true로 설정되어야 함', () => {
      const onClose = vi.fn();
      render(<MobileMenu isOpen={true} onClose={onClose} />);

      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    });
  });

  describe('닫기 동작', () => {
    it('오버레이 클릭 시 onClose가 호출되어야 함', () => {
      const onClose = vi.fn();
      render(<MobileMenu isOpen={true} onClose={onClose} />);

      // 오버레이 찾기 (aria-hidden 요소)
      const overlay = document.querySelector('[aria-hidden="true"]');
      expect(overlay).not.toBeNull();

      if (overlay) {
        fireEvent.click(overlay);
        expect(onClose).toHaveBeenCalledTimes(1);
      }
    });

    it('ESC 키 입력 시 onClose가 호출되어야 함', () => {
      const onClose = vi.fn();
      render(<MobileMenu isOpen={true} onClose={onClose} />);

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('닫힌 상태에서 ESC 키 입력 시 onClose가 호출되지 않아야 함', () => {
      const onClose = vi.fn();
      render(<MobileMenu isOpen={false} onClose={onClose} />);

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('body 스크롤 제어', () => {
    it('메뉴가 열리면 body 스크롤이 비활성화되어야 함', () => {
      const onClose = vi.fn();
      render(<MobileMenu isOpen={true} onClose={onClose} />);

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('메뉴가 닫히면 body 스크롤이 복원되어야 함', () => {
      const onClose = vi.fn();
      const { rerender } = render(<MobileMenu isOpen={true} onClose={onClose} />);

      expect(document.body.style.overflow).toBe('hidden');

      rerender(<MobileMenu isOpen={false} onClose={onClose} />);

      expect(document.body.style.overflow).toBe('');
    });

    it('언마운트 시 body 스크롤이 복원되어야 함', () => {
      const onClose = vi.fn();
      const { unmount } = render(<MobileMenu isOpen={true} onClose={onClose} />);

      expect(document.body.style.overflow).toBe('hidden');

      unmount();

      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('사이드바 통합', () => {
    it('네비게이션 메뉴가 표시되어야 함', () => {
      const onClose = vi.fn();
      render(<MobileMenu isOpen={true} onClose={onClose} />);

      expect(screen.getByText('대시보드')).toBeInTheDocument();
      expect(screen.getByText('리포트')).toBeInTheDocument();
      expect(screen.getByText('설정')).toBeInTheDocument();
    });

    it('네비게이션 링크 클릭 시 onClose가 호출되어야 함', async () => {
      const onClose = vi.fn();
      render(<MobileMenu isOpen={true} onClose={onClose} />);

      const dashboardLink = screen.getByText('대시보드');
      fireEvent.click(dashboardLink);

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      });
    });
  });
});
