import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

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
const mockSignUp = vi.fn();
vi.mock('@/lib/supabase/auth', () => ({
  signUp: (data: any) => mockSignUp(data),
  getAuthErrorMessage: (error: any) => error?.message || '',
}));

import SignUpPage from './page';

describe('SignUpPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 기본 렌더링 테스트
  describe('렌더링', () => {
    it('회원가입 페이지를 렌더링한다', () => {
      render(<SignUpPage />);
      expect(screen.getByRole('heading', { name: '회원가입' })).toBeInTheDocument();
    });

    it('회원가입 폼을 렌더링한다', () => {
      render(<SignUpPage />);
      expect(screen.getByLabelText('이메일')).toBeInTheDocument();
      expect(screen.getByLabelText('비밀번호')).toBeInTheDocument();
      expect(screen.getByLabelText('비밀번호 확인')).toBeInTheDocument();
    });
  });

  // 회원가입 성공 테스트
  describe('회원가입 성공', () => {
    it('회원가입 성공 후 온보딩 페이지로 이동한다', async () => {
      const user = userEvent.setup();
      mockSignUp.mockResolvedValue({
        user: { id: '123' },
        session: { access_token: 'token' },
        error: null,
      });

      render(<SignUpPage />);

      await user.type(screen.getByLabelText('이메일'), 'test@example.com');
      await user.type(screen.getByLabelText('비밀번호'), 'Password123');
      await user.type(screen.getByLabelText('비밀번호 확인'), 'Password123');

      const submitButton = screen.getByRole('button', { name: '가입하기' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/onboarding');
      });
    });

    it('이메일 인증이 필요한 경우 인증 페이지로 이동한다', async () => {
      const user = userEvent.setup();
      mockSignUp.mockResolvedValue({
        user: { id: '123' },
        session: null, // 세션이 없으면 이메일 인증 필요
        error: null,
      });

      render(<SignUpPage />);

      await user.type(screen.getByLabelText('이메일'), 'test@example.com');
      await user.type(screen.getByLabelText('비밀번호'), 'Password123');
      await user.type(screen.getByLabelText('비밀번호 확인'), 'Password123');

      await user.click(screen.getByRole('button', { name: '가입하기' }));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/signup/verify-email');
      });
    });
  });

  // 회원가입 실패 테스트
  describe('회원가입 실패', () => {
    it('이미 가입된 이메일이면 에러 메시지를 표시한다', async () => {
      const user = userEvent.setup();
      mockSignUp.mockResolvedValue({
        user: null,
        session: null,
        error: { message: '이미 가입된 이메일입니다.' },
      });

      render(<SignUpPage />);

      await user.type(screen.getByLabelText('이메일'), 'existing@example.com');
      await user.type(screen.getByLabelText('비밀번호'), 'Password123');
      await user.type(screen.getByLabelText('비밀번호 확인'), 'Password123');

      await user.click(screen.getByRole('button', { name: '가입하기' }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText('이미 가입된 이메일입니다.')).toBeInTheDocument();
      });
    });

    it('네트워크 오류 시 에러 메시지를 표시한다', async () => {
      const user = userEvent.setup();
      mockSignUp.mockRejectedValue(new Error('Network error'));

      render(<SignUpPage />);

      await user.type(screen.getByLabelText('이메일'), 'test@example.com');
      await user.type(screen.getByLabelText('비밀번호'), 'Password123');
      await user.type(screen.getByLabelText('비밀번호 확인'), 'Password123');

      await user.click(screen.getByRole('button', { name: '가입하기' }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(
          screen.getByText('회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
        ).toBeInTheDocument();
      });
    });
  });

  // API 호출 테스트
  describe('API 호출', () => {
    it('올바른 데이터로 signUp을 호출한다', async () => {
      const user = userEvent.setup();
      mockSignUp.mockResolvedValue({
        user: { id: '123' },
        session: { access_token: 'token' },
        error: null,
      });

      render(<SignUpPage />);

      await user.type(screen.getByLabelText('이름 (선택)'), '테스트');
      await user.type(screen.getByLabelText('이메일'), 'test@example.com');
      await user.type(screen.getByLabelText('비밀번호'), 'Password123');
      await user.type(screen.getByLabelText('비밀번호 확인'), 'Password123');

      await user.click(screen.getByRole('button', { name: '가입하기' }));

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'Password123',
          name: '테스트',
        });
      });
    });
  });
});
