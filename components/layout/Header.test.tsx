import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Header } from './Header';

// useAuth 모킹
const mockSignOut = vi.fn();
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      email: 'test@example.com',
      user_metadata: { full_name: '테스트 사용자' },
    },
    signOut: mockSignOut,
  }),
}));

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('렌더링', () => {
    it('알림 버튼이 렌더링되어야 함', () => {
      render(<Header />);
      expect(screen.getByLabelText('알림')).toBeInTheDocument();
    });

    it('사용자 메뉴 버튼이 렌더링되어야 함', () => {
      render(<Header />);
      expect(screen.getByLabelText('사용자 메뉴')).toBeInTheDocument();
    });

    it('사용자 이름이 표시되어야 함', () => {
      render(<Header />);
      expect(screen.getByText('테스트 사용자')).toBeInTheDocument();
    });
  });

  describe('모바일 메뉴 버튼', () => {
    it('onMenuClick이 제공되면 햄버거 메뉴 버튼이 표시되어야 함', () => {
      const onMenuClick = vi.fn();
      render(<Header onMenuClick={onMenuClick} />);

      expect(screen.getByLabelText('메뉴 열기')).toBeInTheDocument();
    });

    it('햄버거 메뉴 버튼 클릭 시 onMenuClick이 호출되어야 함', () => {
      const onMenuClick = vi.fn();
      render(<Header onMenuClick={onMenuClick} />);

      const menuButton = screen.getByLabelText('메뉴 열기');
      fireEvent.click(menuButton);

      expect(onMenuClick).toHaveBeenCalledTimes(1);
    });

    it('onMenuClick이 제공되지 않으면 햄버거 메뉴 버튼이 표시되지 않아야 함', () => {
      render(<Header />);
      expect(screen.queryByLabelText('메뉴 열기')).not.toBeInTheDocument();
    });
  });

  describe('사용자 드롭다운 메뉴', () => {
    it('사용자 메뉴 버튼 클릭 시 드롭다운이 열려야 함', () => {
      render(<Header />);

      const userMenuButton = screen.getByLabelText('사용자 메뉴');
      fireEvent.click(userMenuButton);

      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('드롭다운에 사용자 이메일이 표시되어야 함', () => {
      render(<Header />);

      const userMenuButton = screen.getByLabelText('사용자 메뉴');
      fireEvent.click(userMenuButton);

      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    it('설정 메뉴 항목이 표시되어야 함', () => {
      render(<Header />);

      const userMenuButton = screen.getByLabelText('사용자 메뉴');
      fireEvent.click(userMenuButton);

      expect(screen.getByText('설정')).toBeInTheDocument();
    });

    it('로그아웃 버튼이 표시되어야 함', () => {
      render(<Header />);

      const userMenuButton = screen.getByLabelText('사용자 메뉴');
      fireEvent.click(userMenuButton);

      expect(screen.getByText('로그아웃')).toBeInTheDocument();
    });

    it('로그아웃 버튼 클릭 시 signOut이 호출되어야 함', async () => {
      render(<Header />);

      const userMenuButton = screen.getByLabelText('사용자 메뉴');
      fireEvent.click(userMenuButton);

      const logoutButton = screen.getByText('로그아웃');
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalledTimes(1);
      });
    });

    it('드롭다운 외부 클릭 시 드롭다운이 닫혀야 함', async () => {
      render(<Header />);

      const userMenuButton = screen.getByLabelText('사용자 메뉴');
      fireEvent.click(userMenuButton);

      expect(screen.getByRole('menu')).toBeInTheDocument();

      // 외부 클릭 시뮬레이션
      fireEvent.mouseDown(document.body);

      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      });
    });

    it('ESC 키 입력 시 드롭다운이 닫혀야 함', async () => {
      render(<Header />);

      const userMenuButton = screen.getByLabelText('사용자 메뉴');
      fireEvent.click(userMenuButton);

      expect(screen.getByRole('menu')).toBeInTheDocument();

      fireEvent.keyDown(document, { key: 'Escape' });

      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      });
    });
  });

  describe('접근성', () => {
    it('사용자 메뉴 버튼에 aria-expanded가 설정되어야 함', () => {
      render(<Header />);

      const userMenuButton = screen.getByLabelText('사용자 메뉴');
      expect(userMenuButton).toHaveAttribute('aria-expanded', 'false');

      fireEvent.click(userMenuButton);
      expect(userMenuButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('사용자 메뉴 버튼에 aria-haspopup이 설정되어야 함', () => {
      render(<Header />);

      const userMenuButton = screen.getByLabelText('사용자 메뉴');
      expect(userMenuButton).toHaveAttribute('aria-haspopup', 'true');
    });

    it('드롭다운 메뉴 항목에 role="menuitem"이 설정되어야 함', () => {
      render(<Header />);

      const userMenuButton = screen.getByLabelText('사용자 메뉴');
      fireEvent.click(userMenuButton);

      const menuItems = screen.getAllByRole('menuitem');
      expect(menuItems.length).toBeGreaterThan(0);
    });
  });
});
