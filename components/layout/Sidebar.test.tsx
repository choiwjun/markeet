import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from './Sidebar';

// Next.js 모킹
const mockPathname = vi.fn(() => '/dashboard');
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}));

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname.mockReturnValue('/dashboard');
  });

  describe('렌더링', () => {
    it('로고가 렌더링되어야 함', () => {
      render(<Sidebar />);
      expect(screen.getByText('MARKEET')).toBeInTheDocument();
    });

    it('서브타이틀이 렌더링되어야 함', () => {
      render(<Sidebar />);
      expect(screen.getByText('AI Marketing Console')).toBeInTheDocument();
    });

    it('네비게이션 메뉴가 렌더링되어야 함', () => {
      render(<Sidebar />);
      expect(screen.getByText('대시보드')).toBeInTheDocument();
      expect(screen.getByText('리포트')).toBeInTheDocument();
      expect(screen.getByText('플랫폼 연동')).toBeInTheDocument();
      expect(screen.getByText('설정')).toBeInTheDocument();
    });

    it('사용자 프로필 영역이 렌더링되어야 함', () => {
      render(<Sidebar />);
      expect(screen.getByText('사용자')).toBeInTheDocument();
    });

    it('isOpen이 false일 때 렌더링되지 않아야 함', () => {
      const { container } = render(<Sidebar isOpen={false} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('네비게이션', () => {
    it('현재 경로에 해당하는 메뉴가 활성화되어야 함', () => {
      mockPathname.mockReturnValue('/dashboard');
      render(<Sidebar />);

      const dashboardLink = screen.getByText('대시보드').closest('a');
      expect(dashboardLink).toHaveAttribute('aria-current', 'page');
    });

    it('/reports 경로에서 리포트 메뉴가 활성화되어야 함', () => {
      mockPathname.mockReturnValue('/reports');
      render(<Sidebar />);

      const reportsLink = screen.getByText('리포트').closest('a');
      expect(reportsLink).toHaveAttribute('aria-current', 'page');
    });

    it('/settings/connections 경로에서 플랫폼 연동 메뉴가 활성화되어야 함', () => {
      mockPathname.mockReturnValue('/settings/connections');
      render(<Sidebar />);

      const connectionsLink = screen.getByText('플랫폼 연동').closest('a');
      expect(connectionsLink).toHaveAttribute('aria-current', 'page');
    });

    it('각 네비게이션 링크가 올바른 href를 가져야 함', () => {
      render(<Sidebar />);

      expect(screen.getByText('대시보드').closest('a')).toHaveAttribute('href', '/dashboard');
      expect(screen.getByText('리포트').closest('a')).toHaveAttribute('href', '/reports');
      expect(screen.getByText('플랫폼 연동').closest('a')).toHaveAttribute('href', '/settings/connections');
      expect(screen.getByText('설정').closest('a')).toHaveAttribute('href', '/settings');
    });
  });

  describe('모바일 모드', () => {
    it('모바일 모드에서 닫기 버튼이 표시되어야 함', () => {
      const onClose = vi.fn();
      render(<Sidebar isMobile={true} onClose={onClose} />);

      const closeButton = screen.getByLabelText('사이드바 닫기');
      expect(closeButton).toBeInTheDocument();
    });

    it('닫기 버튼 클릭 시 onClose가 호출되어야 함', () => {
      const onClose = vi.fn();
      render(<Sidebar isMobile={true} onClose={onClose} />);

      const closeButton = screen.getByLabelText('사이드바 닫기');
      fireEvent.click(closeButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('모바일 모드에서 네비게이션 클릭 시 onClose가 호출되어야 함', () => {
      const onClose = vi.fn();
      render(<Sidebar isMobile={true} onClose={onClose} />);

      const dashboardLink = screen.getByText('대시보드');
      fireEvent.click(dashboardLink);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('데스크톱 모드에서 닫기 버튼이 표시되지 않아야 함', () => {
      render(<Sidebar isMobile={false} />);

      expect(screen.queryByLabelText('사이드바 닫기')).not.toBeInTheDocument();
    });
  });

  describe('접근성', () => {
    it('navigation role이 설정되어야 함', () => {
      render(<Sidebar />);
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('aria-label이 설정되어야 함', () => {
      render(<Sidebar />);
      expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', '메인 네비게이션');
    });

    it('활성화된 메뉴에 aria-current가 설정되어야 함', () => {
      mockPathname.mockReturnValue('/dashboard');
      render(<Sidebar />);

      const dashboardLink = screen.getByText('대시보드').closest('a');
      expect(dashboardLink).toHaveAttribute('aria-current', 'page');
    });
  });
});
