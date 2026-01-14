import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Next.js Link 모킹
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Supabase auth 모킹
const mockResetPassword = vi.fn();
vi.mock('@/lib/supabase/auth', () => ({
  resetPassword: (email: string) => mockResetPassword(email),
  getAuthErrorMessage: (error: any) => error?.message || '',
}));

import ForgotPasswordPage from './page';

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 기본 렌더링 테스트
  describe('렌더링', () => {
    it('비밀번호 찾기 페이지를 렌더링한다', () => {
      render(<ForgotPasswordPage />);
      expect(screen.getByRole('heading', { name: '비밀번호 찾기' })).toBeInTheDocument();
    });

    it('비밀번호 찾기 폼을 렌더링한다', () => {
      render(<ForgotPasswordPage />);
      expect(screen.getByLabelText('이메일')).toBeInTheDocument();
    });

    it('뒤로가기 링크를 렌더링한다', () => {
      render(<ForgotPasswordPage />);
      const backLink = screen.getByRole('link', { name: /로그인으로 돌아가기/ });
      expect(backLink).toBeInTheDocument();
      expect(backLink).toHaveAttribute('href', '/login');
    });
  });

  // 비밀번호 재설정 요청 성공 테스트
  describe('비밀번호 재설정 요청 성공', () => {
    it('이메일 전송 성공 후 성공 메시지를 표시한다', async () => {
      const user = userEvent.setup();
      mockResetPassword.mockResolvedValue({
        error: null,
      });

      render(<ForgotPasswordPage />);

      await user.type(screen.getByLabelText('이메일'), 'test@example.com');

      const submitButton = screen.getByRole('button', { name: '비밀번호 재설정 링크 전송' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: '이메일 전송 완료' })).toBeInTheDocument();
        expect(screen.getByText('비밀번호 재설정 링크가 이메일로 전송되었습니다')).toBeInTheDocument();
      });
    });

    it('성공 메시지에서 로그인 페이지로 이동 링크를 표시한다', async () => {
      const user = userEvent.setup();
      mockResetPassword.mockResolvedValue({
        error: null,
      });

      render(<ForgotPasswordPage />);

      await user.type(screen.getByLabelText('이메일'), 'test@example.com');

      const submitButton = screen.getByRole('button', { name: '비밀번호 재설정 링크 전송' });
      await user.click(submitButton);

      await waitFor(() => {
        const loginLink = screen.getByRole('link', { name: '로그인 페이지로 이동' });
        expect(loginLink).toBeInTheDocument();
        expect(loginLink).toHaveAttribute('href', '/login');
      });
    });
  });

  // 비밀번호 재설정 요청 실패 테스트
  describe('비밀번호 재설정 요청 실패', () => {
    it('이메일을 찾을 수 없을 때 에러 메시지를 표시한다', async () => {
      const user = userEvent.setup();
      mockResetPassword.mockResolvedValue({
        error: { message: 'User not found' },
      });

      render(<ForgotPasswordPage />);

      await user.type(screen.getByLabelText('이메일'), 'nonexistent@example.com');

      const submitButton = screen.getByRole('button', { name: '비밀번호 재설정 링크 전송' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText('User not found')).toBeInTheDocument();
      });
    });

    it('네트워크 오류 시 에러 메시지를 표시한다', async () => {
      const user = userEvent.setup();
      mockResetPassword.mockRejectedValue(new Error('Network error'));

      render(<ForgotPasswordPage />);

      await user.type(screen.getByLabelText('이메일'), 'test@example.com');

      const submitButton = screen.getByRole('button', { name: '비밀번호 재설정 링크 전송' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(
          screen.getByText('비밀번호 재설정 이메일 전송 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
        ).toBeInTheDocument();
      });
    });
  });

  // API 호출 테스트
  describe('API 호출', () => {
    it('올바른 이메일로 resetPassword를 호출한다', async () => {
      const user = userEvent.setup();
      mockResetPassword.mockResolvedValue({
        error: null,
      });

      render(<ForgotPasswordPage />);

      await user.type(screen.getByLabelText('이메일'), 'test@example.com');

      const submitButton = screen.getByRole('button', { name: '비밀번호 재설정 링크 전송' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockResetPassword).toHaveBeenCalledWith('test@example.com');
      });
    });
  });

  // 로딩 상태 테스트
  describe('로딩 상태', () => {
    it('이메일 전송 중에는 버튼이 비활성화된다', async () => {
      const user = userEvent.setup();
      mockResetPassword.mockImplementation(() => new Promise(() => {})); // 영원히 pending

      render(<ForgotPasswordPage />);

      await user.type(screen.getByLabelText('이메일'), 'test@example.com');

      const submitButton = screen.getByRole('button', { name: '비밀번호 재설정 링크 전송' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /처리 중/ })).toBeDisabled();
      });
    });
  });
});
