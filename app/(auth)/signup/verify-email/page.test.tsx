import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// URL 파라미터 모킹
let mockEmail = '';
vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: (key: string) => (key === 'email' ? mockEmail : null),
  }),
}));

// Next.js Link 모킹
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Supabase auth 모킹
const mockResendVerificationEmail = vi.fn();
vi.mock('@/lib/supabase/auth', () => ({
  resendVerificationEmail: (email: string) => mockResendVerificationEmail(email),
  getAuthErrorMessage: (error: { message: string } | null) => error?.message || '',
}));

import VerifyEmailPage from './page';

describe('VerifyEmailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEmail = '';
    mockResendVerificationEmail.mockReset();
  });

  describe('렌더링', () => {
    it('이메일 확인 안내 페이지를 렌더링한다', () => {
      render(<VerifyEmailPage />);

      expect(screen.getByRole('heading', { name: '이메일을 확인해주세요' })).toBeInTheDocument();
      expect(screen.getByText(/회원가입을 완료하기 위해/)).toBeInTheDocument();
    });

    it('로그인 페이지 링크가 표시된다', () => {
      render(<VerifyEmailPage />);

      const loginLink = screen.getByRole('link', { name: '로그인 페이지로 이동' });
      expect(loginLink).toHaveAttribute('href', '/login');
    });

    it('홈으로 돌아가기 링크가 표시된다', () => {
      render(<VerifyEmailPage />);

      const homeLink = screen.getByRole('link', { name: /홈으로 돌아가기/ });
      expect(homeLink).toHaveAttribute('href', '/');
    });
  });

  describe('이메일 URL 파라미터', () => {
    it('URL에 이메일이 없으면 이메일 입력 필드가 표시된다', () => {
      mockEmail = '';
      render(<VerifyEmailPage />);

      expect(screen.getByPlaceholderText('이메일 주소를 입력하세요')).toBeInTheDocument();
    });

    it('URL에 이메일이 있으면 이메일이 표시되고 입력 필드는 없다', () => {
      mockEmail = 'test@example.com';
      render(<VerifyEmailPage />);

      expect(screen.getByText(/test@example.com/)).toBeInTheDocument();
      expect(screen.queryByPlaceholderText('이메일 주소를 입력하세요')).not.toBeInTheDocument();
    });
  });

  describe('이메일 재발송', () => {
    it('재발송 버튼이 표시된다', () => {
      render(<VerifyEmailPage />);

      expect(screen.getByRole('button', { name: /인증 이메일 재발송/ })).toBeInTheDocument();
    });

    it('이메일이 없으면 재발송 버튼이 비활성화된다', () => {
      mockEmail = '';
      render(<VerifyEmailPage />);

      expect(screen.getByRole('button', { name: /인증 이메일 재발송/ })).toBeDisabled();
    });

    it('이메일이 있으면 재발송 버튼이 활성화된다', () => {
      mockEmail = 'test@example.com';
      render(<VerifyEmailPage />);

      expect(screen.getByRole('button', { name: /인증 이메일 재발송/ })).not.toBeDisabled();
    });

    it('재발송 성공 시 성공 메시지가 표시된다', async () => {
      const user = userEvent.setup();
      mockEmail = 'test@example.com';
      mockResendVerificationEmail.mockResolvedValue({ error: null });

      render(<VerifyEmailPage />);

      await user.click(screen.getByRole('button', { name: /인증 이메일 재발송/ }));

      await waitFor(() => {
        expect(screen.getByText(/인증 이메일이 재발송되었습니다/)).toBeInTheDocument();
      });
    });

    it('재발송 실패 시 에러 메시지가 표시된다', async () => {
      const user = userEvent.setup();
      mockEmail = 'test@example.com';
      mockResendVerificationEmail.mockResolvedValue({
        error: { message: '이메일 발송 실패' },
      });

      render(<VerifyEmailPage />);

      await user.click(screen.getByRole('button', { name: /인증 이메일 재발송/ }));

      await waitFor(() => {
        expect(screen.getByText('이메일 발송 실패')).toBeInTheDocument();
      });
    });

    it('재발송 후 쿨다운이 시작되어 버튼이 비활성화된다', async () => {
      const user = userEvent.setup();
      mockEmail = 'test@example.com';
      mockResendVerificationEmail.mockResolvedValue({ error: null });

      render(<VerifyEmailPage />);

      await user.click(screen.getByRole('button', { name: /인증 이메일 재발송/ }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /재발송 가능/ })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /재발송 가능/ })).toBeDisabled();
      });
    });
  });

  describe('API 호출', () => {
    it('올바른 이메일로 resendVerificationEmail을 호출한다', async () => {
      const user = userEvent.setup();
      mockEmail = 'test@example.com';
      mockResendVerificationEmail.mockResolvedValue({ error: null });

      render(<VerifyEmailPage />);

      await user.click(screen.getByRole('button', { name: /인증 이메일 재발송/ }));

      await waitFor(() => {
        expect(mockResendVerificationEmail).toHaveBeenCalledWith('test@example.com');
      });
    });
  });
});
