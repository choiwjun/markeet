import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Input } from './Input';

describe('Input', () => {
  // TASK-203: 기본 렌더링 테스트
  describe('렌더링', () => {
    it('기본 input을 렌더링한다', () => {
      render(<Input placeholder="테스트 입력" />);
      expect(screen.getByPlaceholderText('테스트 입력')).toBeInTheDocument();
    });

    it('기본값으로 md size를 사용한다', () => {
      render(<Input placeholder="입력" />);
      const input = screen.getByPlaceholderText('입력');
      expect(input).toHaveClass('text-sm');
      expect(input).toHaveClass('py-2.5');
    });

    it('label을 렌더링한다', () => {
      render(<Input label="이메일" />);
      expect(screen.getByText('이메일')).toBeInTheDocument();
    });

    it('label과 input이 연결되어 있다', () => {
      render(<Input label="이메일" placeholder="입력" />);
      const label = screen.getByText('이메일');
      const input = screen.getByPlaceholderText('입력');
      expect(label).toHaveAttribute('for', input.id);
    });
  });

  // TASK-203: Size 테스트
  describe('Size', () => {
    it('sm size 스타일을 적용한다', () => {
      render(<Input size="sm" placeholder="Small" />);
      const input = screen.getByPlaceholderText('Small');
      expect(input).toHaveClass('px-3');
      expect(input).toHaveClass('py-2');
      expect(input).toHaveClass('text-xs');
    });

    it('md size 스타일을 적용한다', () => {
      render(<Input size="md" placeholder="Medium" />);
      const input = screen.getByPlaceholderText('Medium');
      expect(input).toHaveClass('px-4');
      expect(input).toHaveClass('py-2.5');
      expect(input).toHaveClass('text-sm');
    });

    it('lg size 스타일을 적용한다', () => {
      render(<Input size="lg" placeholder="Large" />);
      const input = screen.getByPlaceholderText('Large');
      expect(input).toHaveClass('px-4');
      expect(input).toHaveClass('py-3');
      expect(input).toHaveClass('text-base');
    });
  });

  // TASK-204: 상태 테스트
  describe('상태', () => {
    it('disabled 상태에서 비활성화 스타일을 적용한다', () => {
      render(<Input disabled placeholder="Disabled" />);
      const input = screen.getByPlaceholderText('Disabled');
      expect(input).toBeDisabled();
      expect(input).toHaveClass('cursor-not-allowed');
      expect(input).toHaveClass('bg-slate-100');
    });

    it('error 상태에서 에러 스타일을 적용한다', () => {
      render(<Input error="에러 메시지" placeholder="Error" />);
      const input = screen.getByPlaceholderText('Error');
      expect(input).toHaveClass('border-danger-500');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('error 메시지를 표시한다', () => {
      render(<Input error="이메일 형식이 올바르지 않습니다" placeholder="Error" />);
      expect(screen.getByText('이메일 형식이 올바르지 않습니다')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('focus 상태에서 포커스 스타일을 적용한다', () => {
      render(<Input placeholder="Focus" />);
      const input = screen.getByPlaceholderText('Focus');
      expect(input).toHaveClass('focus:ring-2');
      expect(input).toHaveClass('focus:border-primary-500');
    });
  });

  // 이벤트 테스트
  describe('이벤트', () => {
    it('입력 이벤트를 처리한다', () => {
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} placeholder="입력" />);

      fireEvent.change(screen.getByPlaceholderText('입력'), {
        target: { value: 'test' },
      });
      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('disabled 상태에서 입력이 불가능하다', () => {
      const handleChange = vi.fn();
      render(<Input disabled onChange={handleChange} placeholder="Disabled" />);

      const input = screen.getByPlaceholderText('Disabled');
      expect(input).toBeDisabled();
    });
  });

  // helperText 테스트
  describe('helperText', () => {
    it('helperText를 표시한다', () => {
      render(<Input helperText="도움말 텍스트입니다" placeholder="Helper" />);
      expect(screen.getByText('도움말 텍스트입니다')).toBeInTheDocument();
    });

    it('error가 있으면 helperText 대신 error를 표시한다', () => {
      render(
        <Input
          error="에러 메시지"
          helperText="도움말 텍스트입니다"
          placeholder="Error"
        />
      );
      expect(screen.getByText('에러 메시지')).toBeInTheDocument();
      expect(screen.queryByText('도움말 텍스트입니다')).not.toBeInTheDocument();
    });
  });

  // 아이콘 테스트
  describe('아이콘', () => {
    it('leftIcon을 렌더링한다', () => {
      render(
        <Input
          leftIcon={<span data-testid="left-icon">🔍</span>}
          placeholder="With Left Icon"
        />
      );
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    });

    it('rightIcon을 렌더링한다', () => {
      render(
        <Input
          rightIcon={<span data-testid="right-icon">✓</span>}
          placeholder="With Right Icon"
        />
      );
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });

    it('양쪽 아이콘을 동시에 렌더링한다', () => {
      render(
        <Input
          leftIcon={<span data-testid="left-icon">🔍</span>}
          rightIcon={<span data-testid="right-icon">✓</span>}
          placeholder="Both Icons"
        />
      );
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });

    it('leftIcon이 있으면 왼쪽 패딩을 추가한다', () => {
      render(
        <Input
          leftIcon={<span>🔍</span>}
          placeholder="With Left Icon"
        />
      );
      expect(screen.getByPlaceholderText('With Left Icon')).toHaveClass('pl-10');
    });

    it('rightIcon이 있으면 오른쪽 패딩을 추가한다', () => {
      render(
        <Input
          rightIcon={<span>✓</span>}
          placeholder="With Right Icon"
        />
      );
      expect(screen.getByPlaceholderText('With Right Icon')).toHaveClass('pr-10');
    });
  });

  // fullWidth 테스트
  describe('fullWidth', () => {
    it('기본값으로 fullWidth가 true이다', () => {
      render(<Input placeholder="Full Width" />);
      expect(screen.getByPlaceholderText('Full Width')).toHaveClass('w-full');
    });
  });

  // className 테스트
  describe('className', () => {
    it('추가 className을 병합한다', () => {
      render(<Input className="custom-class" placeholder="Custom" />);
      const input = screen.getByPlaceholderText('Custom');
      expect(input).toHaveClass('custom-class');
      expect(input).toHaveClass('rounded-lg'); // 기본 스타일도 유지
    });
  });

  // ref 테스트
  describe('ref', () => {
    it('ref를 올바르게 전달한다', () => {
      const ref = vi.fn();
      render(<Input ref={ref} placeholder="With Ref" />);
      expect(ref).toHaveBeenCalled();
    });
  });

  // 접근성 테스트
  describe('접근성', () => {
    it('type 속성을 전달받을 수 있다', () => {
      render(<Input type="email" placeholder="Email" />);
      expect(screen.getByPlaceholderText('Email')).toHaveAttribute('type', 'email');
    });

    it('error 상태에서 aria-invalid가 true이다', () => {
      render(<Input error="에러" placeholder="Error" />);
      expect(screen.getByPlaceholderText('Error')).toHaveAttribute('aria-invalid', 'true');
    });

    it('error 메시지와 aria-describedby가 연결되어 있다', () => {
      render(<Input error="에러 메시지" placeholder="Error" />);
      const input = screen.getByPlaceholderText('Error');
      const errorMessage = screen.getByRole('alert');
      expect(input).toHaveAttribute('aria-describedby', errorMessage.id);
    });

    it('helperText와 aria-describedby가 연결되어 있다', () => {
      render(<Input helperText="도움말" placeholder="Helper" />);
      const input = screen.getByPlaceholderText('Helper');
      expect(input).toHaveAttribute('aria-describedby');
    });
  });
});
