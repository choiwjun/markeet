import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// window.location 모킹
const mockLocation = { href: '' };
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

// Next.js hooks 모킹
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
  }),
}));

// Next.js Link 모킹
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Supabase auth 모킹
const mockSignIn = vi.fn();
vi.mock('@/lib/supabase/auth', () => ({
  signIn: (data: any) => mockSignIn(data),
  getAuthErrorMessage: (error: any) => error?.message || '',
}));

import LoginPage from './page';

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation.href = '';
  });

  // 기본 렌더링 테스트
  describe('렌더링', () => {
    it('로그인 페이지를 렌더링한다', () => {
      render(<LoginPage />);
      expect(screen.getByRole('heading', { name: '로그인' })).toBeInTheDocument();
    });

    it('로그인 폼을 렌더링한다', () => {
      render(<LoginPage />);
      expect(screen.getByLabelText('이메일')).toBeInTheDocument();
      expect(screen.getByLabelText('비밀번호')).toBeInTheDocument();
    });
  });

  // 로그인 성공 테스트
  describe('로그인 성공', () => {
    it('로그인 성공 후 대시보드로 이동한다', async () => {
      const user = userEvent.setup();
      mockSignIn.mockResolvedValue({
        user: { id: '123' },
        session: { access_token: 'token' },
        error: null,
      });

      render(<LoginPage />);

      await user.type(screen.getByLabelText('이메일'), 'test@example.com');
      await user.type(screen.getByLabelText('비밀번호'), 'password123');

      const submitButton = screen.getByRole('button', { name: '로그인' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockLocation.href).toBe('/dashboard');
      });
    });
  });

  // 로그인 실패 테스트
  describe('로그인 실패', () => {
    it('잘못된 비밀번호로 로그인 시 에러 메시지를 표시한다', async () => {
      const user = userEvent.setup();
      mockSignIn.mockResolvedValue({
        user: null,
        session: null,
        error: { message: '이메일 또는 비밀번호가 올바르지 않습니다.' },
      });

      render(<LoginPage />);

      await user.type(screen.getByLabelText('이메일'), 'test@example.com');
      await user.type(screen.getByLabelText('비밀번호'), 'wrongpassword');

      await user.click(screen.getByRole('button', { name: '로그인' }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText('이메일 또는 비밀번호가 올바르지 않습니다.')).toBeInTheDocument();
      });
    });

    it('네트워크 오류 시 에러 메시지를 표시한다', async () => {
      const user = userEvent.setup();
      mockSignIn.mockRejectedValue(new Error('Network error'));

      render(<LoginPage />);

      await user.type(screen.getByLabelText('이메일'), 'test@example.com');
      await user.type(screen.getByLabelText('비밀번호'), 'password123');

      await user.click(screen.getByRole('button', { name: '로그인' }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(
          screen.getByText('로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
        ).toBeInTheDocument();
      });
    });
  });

  // API 호출 테스트
  describe('API 호출', () => {
    it('올바른 데이터로 signIn을 호출한다', async () => {
      const user = userEvent.setup();
      mockSignIn.mockResolvedValue({
        user: { id: '123' },
        session: { access_token: 'token' },
        error: null,
      });

      render(<LoginPage />);

      await user.type(screen.getByLabelText('이메일'), 'test@example.com');
      await user.type(screen.getByLabelText('비밀번호'), 'password123');

      await user.click(screen.getByRole('button', { name: '로그인' }));

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
          rememberMe: false,
        });
      });
    });
  });

  // 로딩 상태 테스트
  describe('로딩 상태', () => {
    it('로그인 중에는 버튼이 비활성화된다', async () => {
      const user = userEvent.setup();
      mockSignIn.mockImplementation(() => new Promise(() => {})); // 영원히 pending

      render(<LoginPage />);

      await user.type(screen.getByLabelText('이메일'), 'test@example.com');
      await user.type(screen.getByLabelText('비밀번호'), 'password123');

      const submitButton = screen.getByRole('button', { name: '로그인' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /처리 중/ })).toBeDisabled();
      });
    });
  });
});
