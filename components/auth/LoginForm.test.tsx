import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Next.js Link 모킹
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

import { LoginForm, LoginFormData } from './LoginForm';

describe('LoginForm', () => {
  // 기본 렌더링 테스트
  describe('렌더링', () => {
    it('로그인 폼을 렌더링한다', () => {
      render(<LoginForm />);
      expect(screen.getByRole('heading', { name: '로그인' })).toBeInTheDocument();
    });

    it('이메일 입력 필드를 렌더링한다', () => {
      render(<LoginForm />);
      expect(screen.getByLabelText('이메일')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('이메일 주소를 입력하세요')).toBeInTheDocument();
    });

    it('비밀번호 입력 필드를 렌더링한다', () => {
      render(<LoginForm />);
      expect(screen.getByLabelText('비밀번호')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('비밀번호를 입력하세요')).toBeInTheDocument();
    });

    it('로그인 버튼을 렌더링한다', () => {
      render(<LoginForm />);
      expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument();
    });

    it('회원가입 링크를 렌더링한다', () => {
      render(<LoginForm />);
      const signupLink = screen.getByRole('link', { name: '회원가입' });
      expect(signupLink).toBeInTheDocument();
      expect(signupLink).toHaveAttribute('href', '/signup');
    });

    it('비밀번호 찾기 링크를 렌더링한다', () => {
      render(<LoginForm />);
      const forgotPasswordLink = screen.getByRole('link', { name: '비밀번호를 잊으셨나요?' });
      expect(forgotPasswordLink).toBeInTheDocument();
      expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password');
    });

    it('환영 메시지를 렌더링한다', () => {
      render(<LoginForm />);
      expect(screen.getByText('마케트에 다시 오신 것을 환영합니다')).toBeInTheDocument();
    });
  });

  // 유효성 검사 테스트
  describe('유효성 검사', () => {
    it('빈 이메일 제출 시 에러 메시지를 표시한다', async () => {
      render(<LoginForm />);

      const submitButton = screen.getByRole('button', { name: '로그인' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('이메일을 입력해주세요.')).toBeInTheDocument();
      });
    });

    it('유효하지 않은 이메일 형식이면 에러 메시지를 표시한다', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const emailInput = screen.getByLabelText('이메일');
      await user.type(emailInput, 'invalid-email');
      fireEvent.blur(emailInput);

      await waitFor(() => {
        expect(screen.getByText('올바른 이메일 형식이 아닙니다.')).toBeInTheDocument();
      });
    });

    it('빈 비밀번호 제출 시 에러 메시지를 표시한다', async () => {
      render(<LoginForm />);

      const submitButton = screen.getByRole('button', { name: '로그인' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('비밀번호를 입력해주세요.')).toBeInTheDocument();
      });
    });

    it('빈 필드 제출 시 에러 메시지를 표시한다', async () => {
      render(<LoginForm />);

      const submitButton = screen.getByRole('button', { name: '로그인' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('이메일을 입력해주세요.')).toBeInTheDocument();
        expect(screen.getByText('비밀번호를 입력해주세요.')).toBeInTheDocument();
      });
    });

    it('유효한 폼 제출 시 에러 메시지가 없다', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn();
      render(<LoginForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByLabelText('이메일');
      const passwordInput = screen.getByLabelText('비밀번호');

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: '로그인' });
      await user.click(submitButton);

      expect(screen.queryByText('이메일을 입력해주세요.')).not.toBeInTheDocument();
      expect(screen.queryByText('비밀번호를 입력해주세요.')).not.toBeInTheDocument();
    });
  });

  // 비밀번호 보기/숨기기 테스트
  describe('비밀번호 보기/숨기기', () => {
    it('비밀번호 보기 버튼 클릭 시 비밀번호를 표시한다', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const passwordInput = screen.getByLabelText('비밀번호');
      expect(passwordInput).toHaveAttribute('type', 'password');

      const toggleButton = screen.getByRole('button', { name: '비밀번호 보기' });
      await user.click(toggleButton);

      expect(passwordInput).toHaveAttribute('type', 'text');
    });

    it('비밀번호 숨기기 버튼 클릭 시 비밀번호를 숨긴다', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const passwordInput = screen.getByLabelText('비밀번호');
      const toggleButton = screen.getByRole('button', { name: '비밀번호 보기' });

      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');

      const hideButton = screen.getByRole('button', { name: '비밀번호 숨기기' });
      await user.click(hideButton);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  // 폼 제출 테스트
  describe('폼 제출', () => {
    it('유효한 데이터로 폼 제출 시 onSubmit을 호출한다', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn();
      render(<LoginForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByLabelText('이메일');
      const passwordInput = screen.getByLabelText('비밀번호');

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: '로그인' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });
    });

    it('유효하지 않은 데이터로 폼 제출 시 onSubmit을 호출하지 않는다', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn();
      render(<LoginForm onSubmit={mockOnSubmit} />);

      const submitButton = screen.getByRole('button', { name: '로그인' });
      await user.click(submitButton);

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  // 로딩 상태 테스트
  describe('로딩 상태', () => {
    it('isLoading이 true면 버튼이 로딩 상태이다', () => {
      render(<LoginForm isLoading={true} />);
      const submitButton = screen.getByRole('button', { name: /처리 중/ });
      expect(submitButton).toBeDisabled();
    });

    it('isLoading이 true면 입력 필드가 비활성화된다', () => {
      render(<LoginForm isLoading={true} />);
      expect(screen.getByLabelText('이메일')).toBeDisabled();
      expect(screen.getByLabelText('비밀번호')).toBeDisabled();
    });
  });

  // 에러 표시 테스트
  describe('에러 표시', () => {
    it('error prop이 있으면 에러 메시지를 표시한다', () => {
      render(<LoginForm error="이메일 또는 비밀번호가 올바르지 않습니다." />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('이메일 또는 비밀번호가 올바르지 않습니다.')).toBeInTheDocument();
    });

    it('error prop이 null이면 에러 메시지를 표시하지 않는다', () => {
      render(<LoginForm error={null} />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  // 접근성 테스트
  describe('접근성', () => {
    it('폼 필드에 적절한 레이블이 있다', () => {
      render(<LoginForm />);
      expect(screen.getByLabelText('이메일')).toBeInTheDocument();
      expect(screen.getByLabelText('비밀번호')).toBeInTheDocument();
    });

    it('필수 필드에 required 속성이 있다', () => {
      render(<LoginForm />);
      expect(screen.getByLabelText('이메일')).toBeRequired();
      expect(screen.getByLabelText('비밀번호')).toBeRequired();
    });

    it('비밀번호 토글 버튼에 aria-label이 있다', () => {
      render(<LoginForm />);
      expect(screen.getByRole('button', { name: '비밀번호 보기' })).toBeInTheDocument();
    });
  });
});
