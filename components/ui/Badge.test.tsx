import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Badge } from './Badge';

describe('Badge', () => {
  // TASK-208: 기본 렌더링 테스트
  describe('렌더링', () => {
    it('children을 올바르게 렌더링한다', () => {
      render(<Badge>뱃지 텍스트</Badge>);
      expect(screen.getByText('뱃지 텍스트')).toBeInTheDocument();
    });

    it('기본값으로 default variant와 md size를 사용한다', () => {
      render(<Badge>기본 뱃지</Badge>);
      const badge = screen.getByText('기본 뱃지');
      expect(badge).toHaveClass('bg-slate-100');
      expect(badge).toHaveClass('text-xs');
      expect(badge).toHaveClass('px-2.5');
    });
  });

  // Variant 테스트
  describe('Variant', () => {
    it('default variant 스타일을 적용한다', () => {
      render(<Badge variant="default">Default</Badge>);
      const badge = screen.getByText('Default');
      expect(badge).toHaveClass('bg-slate-100');
      expect(badge).toHaveClass('text-slate-700');
    });

    it('success variant 스타일을 적용한다', () => {
      render(<Badge variant="success">Success</Badge>);
      const badge = screen.getByText('Success');
      expect(badge).toHaveClass('bg-success-50');
      expect(badge).toHaveClass('text-success-700');
    });

    it('warning variant 스타일을 적용한다', () => {
      render(<Badge variant="warning">Warning</Badge>);
      const badge = screen.getByText('Warning');
      expect(badge).toHaveClass('bg-warning-50');
      expect(badge).toHaveClass('text-warning-700');
    });

    it('danger variant 스타일을 적용한다', () => {
      render(<Badge variant="danger">Danger</Badge>);
      const badge = screen.getByText('Danger');
      expect(badge).toHaveClass('bg-danger-50');
      expect(badge).toHaveClass('text-danger-700');
    });

    it('info variant 스타일을 적용한다', () => {
      render(<Badge variant="info">Info</Badge>);
      const badge = screen.getByText('Info');
      expect(badge).toHaveClass('bg-info-50');
      expect(badge).toHaveClass('text-info-700');
    });

    it('primary variant 스타일을 적용한다', () => {
      render(<Badge variant="primary">Primary</Badge>);
      const badge = screen.getByText('Primary');
      expect(badge).toHaveClass('bg-primary-50');
      expect(badge).toHaveClass('text-primary-700');
    });
  });

  // Size 테스트
  describe('Size', () => {
    it('sm size 스타일을 적용한다', () => {
      render(<Badge size="sm">Small</Badge>);
      const badge = screen.getByText('Small');
      expect(badge).toHaveClass('px-2');
      expect(badge).toHaveClass('py-0.5');
      expect(badge).toHaveClass('text-xs');
    });

    it('md size 스타일을 적용한다', () => {
      render(<Badge size="md">Medium</Badge>);
      const badge = screen.getByText('Medium');
      expect(badge).toHaveClass('px-2.5');
      expect(badge).toHaveClass('py-1');
      expect(badge).toHaveClass('text-xs');
    });

    it('lg size 스타일을 적용한다', () => {
      render(<Badge size="lg">Large</Badge>);
      const badge = screen.getByText('Large');
      expect(badge).toHaveClass('px-3');
      expect(badge).toHaveClass('py-1.5');
      expect(badge).toHaveClass('text-sm');
    });
  });

  // Dot 테스트
  describe('Dot', () => {
    it('dot이 true일 때 dot을 렌더링한다', () => {
      render(<Badge dot>With Dot</Badge>);
      const badge = screen.getByText('With Dot');
      const dot = badge.querySelector('span[aria-hidden="true"]');
      expect(dot).toBeInTheDocument();
      expect(dot).toHaveClass('rounded-full');
    });

    it('dot이 false일 때 dot을 렌더링하지 않는다', () => {
      render(<Badge>Without Dot</Badge>);
      const badge = screen.getByText('Without Dot');
      const dot = badge.querySelector('span[aria-hidden="true"]');
      expect(dot).not.toBeInTheDocument();
    });

    it('success variant에서 success 색상의 dot을 렌더링한다', () => {
      render(<Badge variant="success" dot>Success Dot</Badge>);
      const badge = screen.getByText('Success Dot');
      const dot = badge.querySelector('span[aria-hidden="true"]');
      expect(dot).toHaveClass('bg-success-500');
    });

    it('danger variant에서 danger 색상의 dot을 렌더링한다', () => {
      render(<Badge variant="danger" dot>Danger Dot</Badge>);
      const badge = screen.getByText('Danger Dot');
      const dot = badge.querySelector('span[aria-hidden="true"]');
      expect(dot).toHaveClass('bg-danger-500');
    });
  });

  // Removable 테스트
  describe('Removable', () => {
    it('removable이 true일 때 제거 버튼을 렌더링한다', () => {
      render(<Badge removable>Removable</Badge>);
      expect(screen.getByRole('button', { name: '제거' })).toBeInTheDocument();
    });

    it('removable이 false일 때 제거 버튼을 렌더링하지 않는다', () => {
      render(<Badge>Not Removable</Badge>);
      expect(screen.queryByRole('button', { name: '제거' })).not.toBeInTheDocument();
    });

    it('제거 버튼 클릭 시 onRemove가 호출된다', () => {
      const onRemove = vi.fn();
      render(<Badge removable onRemove={onRemove}>Removable</Badge>);

      fireEvent.click(screen.getByRole('button', { name: '제거' }));
      expect(onRemove).toHaveBeenCalledTimes(1);
    });
  });

  // 스타일 테스트
  describe('스타일', () => {
    it('rounded-full 클래스를 가진다', () => {
      render(<Badge>Rounded</Badge>);
      expect(screen.getByText('Rounded')).toHaveClass('rounded-full');
    });

    it('inline-flex 레이아웃을 가진다', () => {
      render(<Badge>Flex</Badge>);
      expect(screen.getByText('Flex')).toHaveClass('inline-flex');
    });

    it('font-medium을 가진다', () => {
      render(<Badge>Medium Font</Badge>);
      expect(screen.getByText('Medium Font')).toHaveClass('font-medium');
    });
  });

  // className 테스트
  describe('className', () => {
    it('추가 className을 병합한다', () => {
      render(<Badge className="custom-class">Custom</Badge>);
      const badge = screen.getByText('Custom');
      expect(badge).toHaveClass('custom-class');
      expect(badge).toHaveClass('rounded-full'); // 기본 스타일도 유지
    });
  });

  // ref 테스트
  describe('ref', () => {
    it('ref를 올바르게 전달한다', () => {
      const ref = vi.fn();
      render(<Badge ref={ref}>With Ref</Badge>);
      expect(ref).toHaveBeenCalled();
    });
  });
});
