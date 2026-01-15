import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DashboardLayout from './layout';

// Next.js 모킹
vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
}));

// useAuth 모킹
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      email: 'test@example.com',
      user_metadata: { full_name: '테스트 사용자' },
    },
    isLoading: false,
    isAuthenticated: true,
    signOut: vi.fn(),
  }),
}));

describe('DashboardLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('렌더링', () => {
    it('자식 컴포넌트가 렌더링되어야 함', () => {
      render(
        <DashboardLayout>
          <div data-testid="child-content">테스트 콘텐츠</div>
        </DashboardLayout>
      );

      expect(screen.getByTestId('child-content')).toBeInTheDocument();
      expect(screen.getByText('테스트 콘텐츠')).toBeInTheDocument();
    });

    it('사이드바가 렌더링되어야 함 (데스크톱)', () => {
      render(
        <DashboardLayout>
          <div>테스트</div>
        </DashboardLayout>
      );

      expect(screen.getByText('MARKEET')).toBeInTheDocument();
    });

    it('헤더가 렌더링되어야 함', () => {
      render(
        <DashboardLayout>
          <div>테스트</div>
        </DashboardLayout>
      );

      expect(screen.getByLabelText('알림')).toBeInTheDocument();
      expect(screen.getByLabelText('사용자 메뉴')).toBeInTheDocument();
    });

    it('네비게이션 메뉴가 렌더링되어야 함', () => {
      render(
        <DashboardLayout>
          <div>테스트</div>
        </DashboardLayout>
      );

      expect(screen.getByText('대시보드')).toBeInTheDocument();
      expect(screen.getByText('리포트')).toBeInTheDocument();
      expect(screen.getByText('설정')).toBeInTheDocument();
    });
  });

  describe('모바일 메뉴', () => {
    it('모바일 메뉴 버튼이 헤더에 렌더링되어야 함', () => {
      render(
        <DashboardLayout>
          <div>테스트</div>
        </DashboardLayout>
      );

      expect(screen.getByLabelText('메뉴 열기')).toBeInTheDocument();
    });

    it('모바일 메뉴 버튼 클릭 시 사이드바가 열려야 함', () => {
      render(
        <DashboardLayout>
          <div>테스트</div>
        </DashboardLayout>
      );

      const menuButton = screen.getByLabelText('메뉴 열기');
      fireEvent.click(menuButton);

      // 모바일 메뉴가 열리면 dialog가 나타남
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('레이아웃 구조', () => {
    it('main 요소가 존재해야 함', () => {
      render(
        <DashboardLayout>
          <div>테스트</div>
        </DashboardLayout>
      );

      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('콘텐츠가 main 내부에 렌더링되어야 함', () => {
      render(
        <DashboardLayout>
          <div data-testid="child-content">테스트 콘텐츠</div>
        </DashboardLayout>
      );

      const main = screen.getByRole('main');
      expect(main).toContainElement(screen.getByTestId('child-content'));
    });
  });
});
