import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResetPasswordForm } from './ResetPasswordForm';

// Next.js Link 모킹
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('ResetPasswordForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 헬퍼 함수: 비밀번호 입력 필드 가져오기
  const getPasswordInput = () => screen.getByPlaceholderText('새 비밀번호를 입력하세요');
  const getConfirmInput = () => screen.getByPlaceholderText('비밀번호를 다시 입력하세요');

  describe('렌더링', () => {
    it('기본 폼 요소들이 렌더링된다', () => {
      render(<ResetPasswordForm />);

      expect(screen.getByText('새 비밀번호 설정')).toBeInTheDocument();
      expect(screen.getByText('새 비밀번호')).toBeInTheDocument();
      expect(screen.getByText('비밀번호 확인')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /비밀번호 변경/i })).toBeInTheDocument();
    });

    it('로그인 링크가 표시된다', () => {
      render(<ResetPasswordForm />);

      const links = screen.getAllByRole('link', { name: /로그인/i });
      expect(links[0]).toHaveAttribute('href', '/login');
    });

    it('에러 메시지가 전달되면 표시된다', () => {
      render(<ResetPasswordForm error="테스트 에러 메시지" />);

      expect(screen.getByText('테스트 에러 메시지')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('로딩 상태에서 버튼이 비활성화된다', () => {
      render(<ResetPasswordForm isLoading={true} />);

      // 로딩 중에는 버튼 텍스트가 변경될 수 있으므로 submit 버튼을 찾음
      const submitButton = screen.getByRole('button', { name: /비밀번호 변경|처리 중/i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe('성공 화면', () => {
    it('isSuccess가 true이면 성공 메시지가 표시된다', () => {
      render(<ResetPasswordForm isSuccess={true} />);

      expect(screen.getByText('비밀번호 변경 완료')).toBeInTheDocument();
      expect(screen.getByText('비밀번호가 변경되었습니다')).toBeInTheDocument();
    });

    it('성공 화면에서 폼이 표시되지 않는다', () => {
      render(<ResetPasswordForm isSuccess={true} />);

      expect(screen.queryByPlaceholderText('새 비밀번호를 입력하세요')).not.toBeInTheDocument();
    });
  });

  describe('유효성 검사', () => {
    it('빈 필드로 제출하면 에러 메시지가 표시된다', async () => {
      render(<ResetPasswordForm onSubmit={mockOnSubmit} />);

      fireEvent.click(screen.getByRole('button', { name: /비밀번호 변경/i }));

      await waitFor(() => {
        expect(screen.getByText('비밀번호를 입력해주세요.')).toBeInTheDocument();
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('비밀번호가 8자 미만이면 에러 메시지가 표시된다', async () => {
      const user = userEvent.setup();
      render(<ResetPasswordForm onSubmit={mockOnSubmit} />);

      await user.type(getPasswordInput(), 'short1');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText('비밀번호는 최소 8자 이상이어야 합니다.')).toBeInTheDocument();
      });
    });

    it('비밀번호에 영문이 없으면 에러 메시지가 표시된다', async () => {
      const user = userEvent.setup();
      render(<ResetPasswordForm onSubmit={mockOnSubmit} />);

      await user.type(getPasswordInput(), '12345678');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText('비밀번호에 영문자를 포함해주세요.')).toBeInTheDocument();
      });
    });

    it('비밀번호에 숫자가 없으면 에러 메시지가 표시된다', async () => {
      const user = userEvent.setup();
      render(<ResetPasswordForm onSubmit={mockOnSubmit} />);

      await user.type(getPasswordInput(), 'abcdefgh');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText('비밀번호에 숫자를 포함해주세요.')).toBeInTheDocument();
      });
    });

    it('비밀번호 확인이 일치하지 않으면 에러 메시지가 표시된다', async () => {
      const user = userEvent.setup();
      render(<ResetPasswordForm onSubmit={mockOnSubmit} />);

      await user.type(getPasswordInput(), 'password123');
      await user.type(getConfirmInput(), 'different123');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText('비밀번호가 일치하지 않습니다.')).toBeInTheDocument();
      });
    });
  });

  describe('비밀번호 요구사항 인디케이터', () => {
    it('비밀번호 입력 시 요구사항 인디케이터가 표시된다', async () => {
      const user = userEvent.setup();
      render(<ResetPasswordForm />);

      await user.type(getPasswordInput(), 'a');

      await waitFor(() => {
        expect(screen.getByText('8자 이상')).toBeInTheDocument();
        expect(screen.getByText('영문 포함')).toBeInTheDocument();
        expect(screen.getByText('숫자 포함')).toBeInTheDocument();
      });
    });

    it('요구사항 충족 시 시각적으로 표시된다', async () => {
      const user = userEvent.setup();
      render(<ResetPasswordForm />);

      await user.type(getPasswordInput(), 'password123');

      await waitFor(() => {
        const requirement = screen.getByText('8자 이상').closest('div');
        expect(requirement).toHaveClass('text-success-600');
      });
    });
  });

  describe('비밀번호 표시/숨기기', () => {
    it('비밀번호 입력 필드의 기본 타입은 password이다', () => {
      render(<ResetPasswordForm />);

      expect(getPasswordInput()).toHaveAttribute('type', 'password');
      expect(getConfirmInput()).toHaveAttribute('type', 'password');
    });
  });

  describe('폼 제출', () => {
    it('유효한 데이터로 제출하면 onSubmit이 호출된다', async () => {
      const user = userEvent.setup();
      render(<ResetPasswordForm onSubmit={mockOnSubmit} />);

      await user.type(getPasswordInput(), 'newpassword123');
      await user.type(getConfirmInput(), 'newpassword123');
      await user.click(screen.getByRole('button', { name: /비밀번호 변경/i }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          password: 'newpassword123',
          confirmPassword: 'newpassword123',
        });
      });
    });

    it('유효하지 않은 데이터로는 제출되지 않는다', async () => {
      const user = userEvent.setup();
      render(<ResetPasswordForm onSubmit={mockOnSubmit} />);

      await user.type(getPasswordInput(), 'short');
      await user.click(screen.getByRole('button', { name: /비밀번호 변경/i }));

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });
});
