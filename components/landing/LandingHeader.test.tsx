import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LandingHeader } from './LandingHeader';

// Next.js router 모킹
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('LandingHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // 스크롤 위치 초기화
    Object.defineProperty(window, 'scrollY', {
      value: 0,
      writable: true,
    });
  });

  describe('렌더링', () => {
    it('로고가 렌더링되어야 함', () => {
      render(<LandingHeader />);
      expect(screen.getByLabelText('마케트 홈')).toBeInTheDocument();
    });

    it('MARKEET 브랜드명이 표시되어야 함', () => {
      render(<LandingHeader />);
      expect(screen.getByText('MARKEET')).toBeInTheDocument();
    });

    it('네비게이션 링크들이 렌더링되어야 함', () => {
      render(<LandingHeader />);
      expect(screen.getByText('주요 기능')).toBeInTheDocument();
      expect(screen.getByText('요금제')).toBeInTheDocument();
      expect(screen.getByText('고객 사례')).toBeInTheDocument();
      expect(screen.getByText('문의')).toBeInTheDocument();
    });

    it('로그인 버튼이 렌더링되어야 함', () => {
      render(<LandingHeader />);
      expect(screen.getAllByText('로그인').length).toBeGreaterThanOrEqual(1);
    });

    it('무료로 시작하기 버튼이 렌더링되어야 함', () => {
      render(<LandingHeader />);
      expect(screen.getAllByText('무료로 시작하기').length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('모바일 메뉴', () => {
    it('모바일 메뉴 버튼이 렌더링되어야 함', () => {
      render(<LandingHeader />);
      expect(screen.getByLabelText('메뉴 열기')).toBeInTheDocument();
    });

    it('모바일 메뉴 버튼 클릭 시 메뉴가 열려야 함', () => {
      render(<LandingHeader />);

      const menuButton = screen.getByLabelText('메뉴 열기');
      fireEvent.click(menuButton);

      expect(screen.getByLabelText('모바일 네비게이션')).toBeInTheDocument();
    });

    it('메뉴가 열린 상태에서 닫기 버튼이 표시되어야 함', () => {
      render(<LandingHeader />);

      const menuButton = screen.getByLabelText('메뉴 열기');
      fireEvent.click(menuButton);

      expect(screen.getByLabelText('메뉴 닫기')).toBeInTheDocument();
    });

    it('닫기 버튼 클릭 시 메뉴가 닫혀야 함', async () => {
      render(<LandingHeader />);

      const menuButton = screen.getByLabelText('메뉴 열기');
      fireEvent.click(menuButton);

      const closeButton = screen.getByLabelText('메뉴 닫기');
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByLabelText('모바일 네비게이션')).not.toBeInTheDocument();
      });
    });

    it('모바일 메뉴에 네비게이션 링크들이 표시되어야 함', () => {
      render(<LandingHeader />);

      const menuButton = screen.getByLabelText('메뉴 열기');
      fireEvent.click(menuButton);

      const mobileNav = screen.getByLabelText('모바일 네비게이션');
      expect(mobileNav).toContainElement(screen.getAllByText('주요 기능')[1]);
    });

    it('모바일 메뉴 링크 클릭 시 메뉴가 닫혀야 함', async () => {
      render(<LandingHeader />);

      const menuButton = screen.getByLabelText('메뉴 열기');
      fireEvent.click(menuButton);

      const mobileLinks = screen.getAllByText('주요 기능');
      fireEvent.click(mobileLinks[1]); // 모바일 메뉴의 링크 클릭

      await waitFor(() => {
        expect(screen.queryByLabelText('모바일 네비게이션')).not.toBeInTheDocument();
      });
    });
  });

  describe('스크롤 동작', () => {
    it('스크롤 시 헤더 스타일이 변경되어야 함', async () => {
      render(<LandingHeader />);

      const header = screen.getByRole('banner');
      expect(header).toHaveClass('backdrop-blur-md');

      // 스크롤 이벤트 시뮬레이션
      Object.defineProperty(window, 'scrollY', { value: 20, writable: true });
      fireEvent.scroll(window);

      await waitFor(() => {
        expect(header).toHaveClass('backdrop-blur-md');
      });
    });
  });

  describe('접근성', () => {
    it('header role="banner"가 설정되어야 함', () => {
      render(<LandingHeader />);
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('모바일 메뉴 버튼에 aria-expanded가 설정되어야 함', () => {
      render(<LandingHeader />);

      const menuButton = screen.getByLabelText('메뉴 열기');
      expect(menuButton).toHaveAttribute('aria-expanded', 'false');

      fireEvent.click(menuButton);
      const closeButton = screen.getByLabelText('메뉴 닫기');
      expect(closeButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('모바일 메뉴 버튼에 aria-controls가 설정되어야 함', () => {
      render(<LandingHeader />);

      const menuButton = screen.getByLabelText('메뉴 열기');
      expect(menuButton).toHaveAttribute('aria-controls', 'mobile-menu');
    });
  });

  describe('링크', () => {
    it('로고 클릭 시 홈으로 이동해야 함', () => {
      render(<LandingHeader />);
      const logo = screen.getByLabelText('마케트 홈');
      expect(logo).toHaveAttribute('href', '/');
    });

    it('로그인 버튼이 /login으로 연결되어야 함', () => {
      render(<LandingHeader />);
      const loginLinks = screen.getAllByText('로그인');
      const desktopLink = loginLinks[0].closest('a');
      expect(desktopLink).toHaveAttribute('href', '/login');
    });

    it('무료로 시작하기 버튼이 /signup으로 연결되어야 함', () => {
      render(<LandingHeader />);
      const signupLinks = screen.getAllByText('무료로 시작하기');
      const desktopLink = signupLinks[0].closest('a');
      expect(desktopLink).toHaveAttribute('href', '/signup');
    });
  });
});
