import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Next.js Link 모킹
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

import { SignUpForm, SignUpFormData } from './SignUpForm';

describe('SignUpForm', () => {
  // 기본 렌더링 테스트
  describe('렌더링', () => {
    it('회원가입 폼을 렌더링한다', () => {
      render(<SignUpForm />);
      expect(screen.getByRole('heading', { name: '회원가입' })).toBeInTheDocument();
    });

    it('이메일 입력 필드를 렌더링한다', () => {
      render(<SignUpForm />);
      expect(screen.getByLabelText('이메일')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('이메일 주소를 입력하세요')).toBeInTheDocument();
    });

    it('비밀번호 입력 필드를 렌더링한다', () => {
      render(<SignUpForm />);
      expect(screen.getByLabelText('비밀번호')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('비밀번호를 입력하세요')).toBeInTheDocument();
    });

    it('비밀번호 확인 입력 필드를 렌더링한다', () => {
      render(<SignUpForm />);
      expect(screen.getByLabelText('비밀번호 확인')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('비밀번호를 다시 입력하세요')).toBeInTheDocument();
    });

    it('이름 입력 필드를 렌더링한다', () => {
      render(<SignUpForm />);
      expect(screen.getByLabelText('이름 (선택)')).toBeInTheDocument();
    });

    it('가입하기 버튼을 렌더링한다', () => {
      render(<SignUpForm />);
      expect(screen.getByRole('button', { name: '가입하기' })).toBeInTheDocument();
    });

    it('로그인 링크를 렌더링한다', () => {
      render(<SignUpForm />);
      const loginLink = screen.getByRole('link', { name: '로그인' });
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute('href', '/login');
    });

    it('환영 메시지를 렌더링한다', () => {
      render(<SignUpForm />);
      expect(screen.getByText('마케트에 오신 것을 환영합니다')).toBeInTheDocument();
    });
  });

  // 유효성 검사 테스트
  describe('유효성 검사', () => {
    it('빈 이메일 제출 시 에러 메시지를 표시한다', async () => {
      render(<SignUpForm />);

      const submitButton = screen.getByRole('button', { name: '가입하기' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('이메일을 입력해주세요.')).toBeInTheDocument();
      });
    });

    it('유효하지 않은 이메일 형식이면 에러 메시지를 표시한다', async () => {
      const user = userEvent.setup();
      render(<SignUpForm />);

      const emailInput = screen.getByLabelText('이메일');
      await user.type(emailInput, 'invalid-email');
      fireEvent.blur(emailInput);

      await waitFor(() => {
        expect(screen.getByText('올바른 이메일 형식이 아닙니다.')).toBeInTheDocument();
      });
    });

    it('빈 비밀번호 제출 시 에러 메시지를 표시한다', async () => {
      render(<SignUpForm />);

      const submitButton = screen.getByRole('button', { name: '가입하기' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('비밀번호를 입력해주세요.')).toBeInTheDocument();
      });
    });

    it('비밀번호가 8자 미만이면 에러 메시지를 표시한다', async () => {
      const user = userEvent.setup();
      render(<SignUpForm />);

      const passwordInput = screen.getByLabelText('비밀번호');
      await user.type(passwordInput, 'short');
      fireEvent.blur(passwordInput);

      await waitFor(() => {
        expect(screen.getByText('비밀번호는 8자 이상이어야 합니다.')).toBeInTheDocument();
      });
    });

    it('비밀번호가 일치하지 않으면 에러 메시지를 표시한다', async () => {
      const user = userEvent.setup();
      render(<SignUpForm />);

      const passwordInput = screen.getByLabelText('비밀번호');
      const confirmPasswordInput = screen.getByLabelText('비밀번호 확인');

      await user.type(passwordInput, 'Password123');
      await user.type(confirmPasswordInput, 'DifferentPassword123');
      fireEvent.blur(confirmPasswordInput);

      await waitFor(() => {
        expect(screen.getByText('비밀번호가 일치하지 않습니다.')).toBeInTheDocument();
      });
    });

    it('유효한 폼 제출 시 에러 메시지가 없다', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn();
      render(<SignUpForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByLabelText('이메일');
      const passwordInput = screen.getByLabelText('비밀번호');
      const confirmPasswordInput = screen.getByLabelText('비밀번호 확인');

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'Password123');
      await user.type(confirmPasswordInput, 'Password123');

      const submitButton = screen.getByRole('button', { name: '가입하기' });
      await user.click(submitButton);

      expect(screen.queryByText('이메일을 입력해주세요.')).not.toBeInTheDocument();
      expect(screen.queryByText('비밀번호를 입력해주세요.')).not.toBeInTheDocument();
    });
  });

  // 비밀번호 요구사항 인디케이터 테스트
  describe('비밀번호 요구사항 인디케이터', () => {
    it('비밀번호 입력 시 요구사항 인디케이터를 표시한다', async () => {
      const user = userEvent.setup();
      render(<SignUpForm />);

      const passwordInput = screen.getByLabelText('비밀번호');
      await user.type(passwordInput, 'a');

      expect(screen.getByText('비밀번호 요구사항')).toBeInTheDocument();
      expect(screen.getByText('8자 이상')).toBeInTheDocument();
      expect(screen.getByText('대문자 포함')).toBeInTheDocument();
      expect(screen.getByText('소문자 포함')).toBeInTheDocument();
      expect(screen.getByText('숫자 포함')).toBeInTheDocument();
    });

    it('비밀번호가 비어있으면 인디케이터를 숨긴다', () => {
      render(<SignUpForm />);
      expect(screen.queryByText('비밀번호 요구사항')).not.toBeInTheDocument();
    });
  });

  // 비밀번호 보기/숨기기 테스트
  describe('비밀번호 보기/숨기기', () => {
    it('비밀번호 보기 버튼 클릭 시 비밀번호를 표시한다', async () => {
      const user = userEvent.setup();
      render(<SignUpForm />);

      const passwordInput = screen.getByLabelText('비밀번호');
      expect(passwordInput).toHaveAttribute('type', 'password');

      // 첫 번째 비밀번호 보기 버튼 (비밀번호 필드용)
      const toggleButtons = screen.getAllByRole('button', { name: '비밀번호 보기' });
      await user.click(toggleButtons[0]);

      expect(passwordInput).toHaveAttribute('type', 'text');
    });

    it('비밀번호 숨기기 버튼 클릭 시 비밀번호를 숨긴다', async () => {
      const user = userEvent.setup();
      render(<SignUpForm />);

      const passwordInput = screen.getByLabelText('비밀번호');
      const toggleButtons = screen.getAllByRole('button', { name: '비밀번호 보기' });

      await user.click(toggleButtons[0]);
      expect(passwordInput).toHaveAttribute('type', 'text');

      const hideButtons = screen.getAllByRole('button', { name: '비밀번호 숨기기' });
      await user.click(hideButtons[0]);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  // 폼 제출 테스트
  describe('폼 제출', () => {
    it('유효한 데이터로 폼 제출 시 onSubmit을 호출한다', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn();
      render(<SignUpForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByLabelText('이메일');
      const passwordInput = screen.getByLabelText('비밀번호');
      const confirmPasswordInput = screen.getByLabelText('비밀번호 확인');
      const nameInput = screen.getByLabelText('이름 (선택)');

      await user.type(nameInput, '테스트');
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'Password123');
      await user.type(confirmPasswordInput, 'Password123');

      const submitButton = screen.getByRole('button', { name: '가입하기' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'Password123',
          confirmPassword: 'Password123',
          name: '테스트',
        });
      });
    });

    it('유효하지 않은 데이터로 폼 제출 시 onSubmit을 호출하지 않는다', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn();
      render(<SignUpForm onSubmit={mockOnSubmit} />);

      const submitButton = screen.getByRole('button', { name: '가입하기' });
      await user.click(submitButton);

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  // 로딩 상태 테스트
  describe('로딩 상태', () => {
    it('isLoading이 true면 버튼이 로딩 상태이다', () => {
      render(<SignUpForm isLoading={true} />);
      const submitButton = screen.getByRole('button', { name: /처리 중/ });
      expect(submitButton).toBeDisabled();
    });

    it('isLoading이 true면 입력 필드가 비활성화된다', () => {
      render(<SignUpForm isLoading={true} />);
      expect(screen.getByLabelText('이메일')).toBeDisabled();
      expect(screen.getByLabelText('비밀번호')).toBeDisabled();
      expect(screen.getByLabelText('비밀번호 확인')).toBeDisabled();
    });
  });

  // 에러 표시 테스트
  describe('에러 표시', () => {
    it('error prop이 있으면 에러 메시지를 표시한다', () => {
      render(<SignUpForm error="회원가입에 실패했습니다." />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('회원가입에 실패했습니다.')).toBeInTheDocument();
    });

    it('error prop이 null이면 에러 메시지를 표시하지 않는다', () => {
      render(<SignUpForm error={null} />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  // 접근성 테스트
  describe('접근성', () => {
    it('폼 필드에 적절한 레이블이 있다', () => {
      render(<SignUpForm />);
      expect(screen.getByLabelText('이메일')).toBeInTheDocument();
      expect(screen.getByLabelText('비밀번호')).toBeInTheDocument();
      expect(screen.getByLabelText('비밀번호 확인')).toBeInTheDocument();
    });

    it('필수 필드에 required 속성이 있다', () => {
      render(<SignUpForm />);
      expect(screen.getByLabelText('이메일')).toBeRequired();
      expect(screen.getByLabelText('비밀번호')).toBeRequired();
      expect(screen.getByLabelText('비밀번호 확인')).toBeRequired();
    });

    it('비밀번호 토글 버튼에 aria-label이 있다', () => {
      render(<SignUpForm />);
      const toggleButtons = screen.getAllByRole('button', { name: '비밀번호 보기' });
      expect(toggleButtons.length).toBeGreaterThanOrEqual(1);
    });
  });
});
