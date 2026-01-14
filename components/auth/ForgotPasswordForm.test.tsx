import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

// Next.js Link 모킹
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

import { ForgotPasswordForm, ForgotPasswordFormData } from './ForgotPasswordForm';

describe('ForgotPasswordForm', () => {
  // 기본 렌더링 테스트
  describe('렌더링', () => {
    it('비밀번호 찾기 폼을 렌더링한다', () => {
      render(<ForgotPasswordForm />);
      expect(screen.getByRole('heading', { name: '비밀번호 찾기' })).toBeInTheDocument();
    });

    it('이메일 입력 필드를 렌더링한다', () => {
      render(<ForgotPasswordForm />);
      expect(screen.getByLabelText('이메일')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('가입한 이메일 주소를 입력하세요')).toBeInTheDocument();
    });

    it('제출 버튼을 렌더링한다', () => {
      render(<ForgotPasswordForm />);
      expect(screen.getByRole('button', { name: '비밀번호 재설정 링크 전송' })).toBeInTheDocument();
    });

    it('로그인 링크를 렌더링한다', () => {
      render(<ForgotPasswordForm />);
      const loginLink = screen.getByRole('link', { name: '로그인' });
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute('href', '/login');
    });

    it('뒤로가기 링크를 렌더링한다', () => {
      render(<ForgotPasswordForm />);
      const backLink = screen.getByRole('link', { name: /로그인으로 돌아가기/ });
      expect(backLink).toBeInTheDocument();
      expect(backLink).toHaveAttribute('href', '/login');
    });

    it('설명 메시지를 렌더링한다', () => {
      render(<ForgotPasswordForm />);
      expect(screen.getByText('가입한 이메일 주소를 입력하면 비밀번호 재설정 링크를 보내드립니다')).toBeInTheDocument();
    });
  });

  // 유효성 검사 테스트
  describe('유효성 검사', () => {
    it('빈 이메일 제출 시 에러 메시지를 표시한다', async () => {
      render(<ForgotPasswordForm />);

      const submitButton = screen.getByRole('button', { name: '비밀번호 재설정 링크 전송' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('이메일을 입력해주세요.')).toBeInTheDocument();
      });
    });

    it('유효하지 않은 이메일 형식이면 에러 메시지를 표시한다', async () => {
      const user = userEvent.setup();
      render(<ForgotPasswordForm />);

      const emailInput = screen.getByLabelText('이메일');
      await user.type(emailInput, 'invalid-email');
      fireEvent.blur(emailInput);

      await waitFor(() => {
        expect(screen.getByText('올바른 이메일 형식이 아닙니다.')).toBeInTheDocument();
      });
    });

    it('유효한 폼 제출 시 에러 메시지가 없다', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn();
      render(<ForgotPasswordForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByLabelText('이메일');

      await user.type(emailInput, 'test@example.com');

      const submitButton = screen.getByRole('button', { name: '비밀번호 재설정 링크 전송' });
      await user.click(submitButton);

      expect(screen.queryByText('이메일을 입력해주세요.')).not.toBeInTheDocument();
    });
  });

  // 폼 제출 테스트
  describe('폼 제출', () => {
    it('유효한 데이터로 폼 제출 시 onSubmit을 호출한다', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn();
      render(<ForgotPasswordForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByLabelText('이메일');

      await user.type(emailInput, 'test@example.com');

      const submitButton = screen.getByRole('button', { name: '비밀번호 재설정 링크 전송' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          email: 'test@example.com',
        });
      });
    });

    it('유효하지 않은 데이터로 폼 제출 시 onSubmit을 호출하지 않는다', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn();
      render(<ForgotPasswordForm onSubmit={mockOnSubmit} />);

      const submitButton = screen.getByRole('button', { name: '비밀번호 재설정 링크 전송' });
      await user.click(submitButton);

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  // 성공 상태 테스트
  describe('성공 상태', () => {
    it('폼 제출 성공 후 성공 메시지를 표시한다', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn();
      render(<ForgotPasswordForm onSubmit={mockOnSubmit} isSuccess={true} />);

      expect(screen.getByRole('heading', { name: '이메일 전송 완료' })).toBeInTheDocument();
      expect(screen.getByText('비밀번호 재설정 링크가 이메일로 전송되었습니다')).toBeInTheDocument();
    });

    it('성공 메시지에서 이메일을 표시한다', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn();
      render(<ForgotPasswordForm onSubmit={mockOnSubmit} isSuccess={true} successEmail="test@example.com" />);

      const alertElement = screen.getByRole('alert');
      expect(alertElement.textContent).toContain('test@example.com');
    });
  });

  // 로딩 상태 테스트
  describe('로딩 상태', () => {
    it('isLoading이 true면 버튼이 로딩 상태이다', () => {
      render(<ForgotPasswordForm isLoading={true} />);
      const submitButton = screen.getByRole('button', { name: /처리 중/ });
      expect(submitButton).toBeDisabled();
    });

    it('isLoading이 true면 입력 필드가 비활성화된다', () => {
      render(<ForgotPasswordForm isLoading={true} />);
      expect(screen.getByLabelText('이메일')).toBeDisabled();
    });
  });

  // 에러 표시 테스트
  describe('에러 표시', () => {
    it('error prop이 있으면 에러 메시지를 표시한다', () => {
      render(<ForgotPasswordForm error="이메일을 찾을 수 없습니다." />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('이메일을 찾을 수 없습니다.')).toBeInTheDocument();
    });

    it('error prop이 null이면 에러 메시지를 표시하지 않는다', () => {
      render(<ForgotPasswordForm error={null} />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  // 접근성 테스트
  describe('접근성', () => {
    it('폼 필드에 적절한 레이블이 있다', () => {
      render(<ForgotPasswordForm />);
      expect(screen.getByLabelText('이메일')).toBeInTheDocument();
    });

    it('필수 필드에 required 속성이 있다', () => {
      render(<ForgotPasswordForm />);
      expect(screen.getByLabelText('이메일')).toBeRequired();
    });
  });
});
