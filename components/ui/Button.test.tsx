import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  // TASK-201: 기본 렌더링 테스트
  describe('렌더링', () => {
    it('children을 올바르게 렌더링한다', () => {
      render(<Button>테스트 버튼</Button>);
      expect(screen.getByRole('button', { name: '테스트 버튼' })).toBeInTheDocument();
    });

    it('기본값으로 primary variant와 md size를 사용한다', () => {
      render(<Button>버튼</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('from-primary-600');
      expect(button).toHaveClass('text-sm');
    });
  });

  // TASK-201: Variant 테스트
  describe('Variant', () => {
    it('primary variant 스타일을 적용한다', () => {
      render(<Button variant="primary">Primary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('from-primary-600');
      expect(button).toHaveClass('text-white');
    });

    it('secondary variant 스타일을 적용한다', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-white');
      expect(button).toHaveClass('text-primary-600');
      expect(button).toHaveClass('border');
    });

    it('ghost variant 스타일을 적용한다', () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-transparent');
      expect(button).toHaveClass('text-slate-600');
    });

    it('danger variant 스타일을 적용한다', () => {
      render(<Button variant="danger">Danger</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-danger-500');
      expect(button).toHaveClass('text-white');
    });
  });

  // TASK-201: Size 테스트
  describe('Size', () => {
    it('sm size 스타일을 적용한다', () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-3');
      expect(button).toHaveClass('py-2');
      expect(button).toHaveClass('text-xs');
    });

    it('md size 스타일을 적용한다', () => {
      render(<Button size="md">Medium</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-4');
      expect(button).toHaveClass('py-2.5');
      expect(button).toHaveClass('text-sm');
    });

    it('lg size 스타일을 적용한다', () => {
      render(<Button size="lg">Large</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-6');
      expect(button).toHaveClass('py-3');
      expect(button).toHaveClass('text-base');
    });
  });

  // TASK-202: 상태 테스트
  describe('상태', () => {
    it('disabled 상태에서 비활성화 스타일을 적용한다', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('cursor-not-allowed');
      expect(button).toHaveClass('bg-slate-200');
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('loading 상태에서 스피너와 텍스트를 표시한다', () => {
      render(<Button loading>Submit</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-busy', 'true');
      expect(screen.getByText('처리 중...')).toBeInTheDocument();
    });

    it('loading 상태에서 원래 children을 숨긴다', () => {
      render(<Button loading>Submit</Button>);
      expect(screen.queryByText('Submit')).not.toBeInTheDocument();
    });
  });

  // 클릭 이벤트 테스트
  describe('이벤트', () => {
    it('클릭 이벤트를 처리한다', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click Me</Button>);

      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('disabled 상태에서 클릭 이벤트를 무시한다', () => {
      const handleClick = vi.fn();
      render(<Button disabled onClick={handleClick}>Click Me</Button>);

      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('loading 상태에서 클릭 이벤트를 무시한다', () => {
      const handleClick = vi.fn();
      render(<Button loading onClick={handleClick}>Click Me</Button>);

      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  // fullWidth 테스트
  describe('fullWidth', () => {
    it('fullWidth prop이 true일 때 w-full 클래스를 적용한다', () => {
      render(<Button fullWidth>Full Width</Button>);
      expect(screen.getByRole('button')).toHaveClass('w-full');
    });

    it('fullWidth prop이 false일 때 w-full 클래스를 적용하지 않는다', () => {
      render(<Button>Normal</Button>);
      expect(screen.getByRole('button')).not.toHaveClass('w-full');
    });
  });

  // 아이콘 테스트
  describe('아이콘', () => {
    it('leftIcon을 렌더링한다', () => {
      render(
        <Button leftIcon={<span data-testid="left-icon">←</span>}>
          With Left Icon
        </Button>
      );
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    });

    it('rightIcon을 렌더링한다', () => {
      render(
        <Button rightIcon={<span data-testid="right-icon">→</span>}>
          With Right Icon
        </Button>
      );
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });

    it('양쪽 아이콘을 동시에 렌더링한다', () => {
      render(
        <Button
          leftIcon={<span data-testid="left-icon">←</span>}
          rightIcon={<span data-testid="right-icon">→</span>}
        >
          Both Icons
        </Button>
      );
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });
  });

  // className 전달 테스트
  describe('className', () => {
    it('추가 className을 병합한다', () => {
      render(<Button className="custom-class">Custom</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
      expect(button).toHaveClass('rounded-lg'); // 기본 스타일도 유지
    });
  });

  // ref 전달 테스트
  describe('ref', () => {
    it('ref를 올바르게 전달한다', () => {
      const ref = vi.fn();
      render(<Button ref={ref}>With Ref</Button>);
      expect(ref).toHaveBeenCalled();
    });
  });

  // 접근성 테스트
  describe('접근성', () => {
    it('button role을 가진다', () => {
      render(<Button>Accessible</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('type 속성을 전달받을 수 있다', () => {
      render(<Button type="submit">Submit</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });

    it('aria-label을 전달받을 수 있다', () => {
      render(<Button aria-label="접근성 라벨">버튼</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', '접근성 라벨');
    });
  });
});
