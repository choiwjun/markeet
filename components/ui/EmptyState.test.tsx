import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  // TASK-211: 기본 렌더링 테스트
  describe('렌더링', () => {
    it('기본 EmptyState를 렌더링한다', () => {
      render(<EmptyState />);
      expect(screen.getByText('데이터가 없습니다')).toBeInTheDocument();
    });

    it('기본 설명을 렌더링한다', () => {
      render(<EmptyState />);
      expect(screen.getByText('아직 표시할 데이터가 없습니다. 새로운 항목을 추가해보세요.')).toBeInTheDocument();
    });

    it('커스텀 title을 렌더링한다', () => {
      render(<EmptyState title="커스텀 제목" />);
      expect(screen.getByText('커스텀 제목')).toBeInTheDocument();
    });

    it('커스텀 description을 렌더링한다', () => {
      render(<EmptyState description="커스텀 설명입니다." />);
      expect(screen.getByText('커스텀 설명입니다.')).toBeInTheDocument();
    });

    it('커스텀 icon을 렌더링한다', () => {
      render(
        <EmptyState icon={<span data-testid="custom-icon">🔍</span>} />
      );
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });
  });

  // Variant 테스트
  describe('Variant', () => {
    it('default variant의 기본 텍스트를 표시한다', () => {
      render(<EmptyState variant="default" />);
      expect(screen.getByText('데이터가 없습니다')).toBeInTheDocument();
    });

    it('search variant의 기본 텍스트를 표시한다', () => {
      render(<EmptyState variant="search" />);
      expect(screen.getByText('검색 결과가 없습니다')).toBeInTheDocument();
      expect(screen.getByText('검색어를 변경하거나 필터를 조정해보세요.')).toBeInTheDocument();
    });

    it('data variant의 기본 텍스트를 표시한다', () => {
      render(<EmptyState variant="data" />);
      expect(screen.getByText('연동된 데이터가 없습니다')).toBeInTheDocument();
      expect(screen.getByText('플랫폼을 연동하면 데이터가 자동으로 수집됩니다.')).toBeInTheDocument();
    });

    it('file variant의 기본 텍스트를 표시한다', () => {
      render(<EmptyState variant="file" />);
      expect(screen.getByText('파일이 없습니다')).toBeInTheDocument();
    });

    it('folder variant의 기본 텍스트를 표시한다', () => {
      render(<EmptyState variant="folder" />);
      expect(screen.getByText('폴더가 비어있습니다')).toBeInTheDocument();
    });
  });

  // Action 버튼 테스트
  describe('Action', () => {
    it('action 버튼을 렌더링한다', () => {
      const handleClick = vi.fn();
      render(
        <EmptyState
          action={{
            label: '새로 추가',
            onClick: handleClick,
          }}
        />
      );

      expect(screen.getByRole('button', { name: '새로 추가' })).toBeInTheDocument();
    });

    it('action 버튼 클릭 시 onClick이 호출된다', () => {
      const handleClick = vi.fn();
      render(
        <EmptyState
          action={{
            label: '새로 추가',
            onClick: handleClick,
          }}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: '새로 추가' }));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('secondaryAction 버튼을 렌더링한다', () => {
      const handleClick = vi.fn();
      render(
        <EmptyState
          secondaryAction={{
            label: '도움말 보기',
            onClick: handleClick,
          }}
        />
      );

      expect(screen.getByRole('button', { name: '도움말 보기' })).toBeInTheDocument();
    });

    it('secondaryAction 버튼 클릭 시 onClick이 호출된다', () => {
      const handleClick = vi.fn();
      render(
        <EmptyState
          secondaryAction={{
            label: '도움말 보기',
            onClick: handleClick,
          }}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: '도움말 보기' }));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('action과 secondaryAction 버튼을 함께 렌더링한다', () => {
      render(
        <EmptyState
          action={{
            label: '새로 추가',
            onClick: vi.fn(),
          }}
          secondaryAction={{
            label: '도움말 보기',
            onClick: vi.fn(),
          }}
        />
      );

      expect(screen.getByRole('button', { name: '새로 추가' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '도움말 보기' })).toBeInTheDocument();
    });

    it('action이 없으면 버튼을 렌더링하지 않는다', () => {
      render(<EmptyState />);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  // 스타일 테스트
  describe('스타일', () => {
    it('flex 레이아웃을 가진다', () => {
      render(<EmptyState />);
      const container = screen.getByRole('status');
      expect(container).toHaveClass('flex');
      expect(container).toHaveClass('flex-col');
    });

    it('중앙 정렬을 가진다', () => {
      render(<EmptyState />);
      const container = screen.getByRole('status');
      expect(container).toHaveClass('items-center');
      expect(container).toHaveClass('justify-center');
      expect(container).toHaveClass('text-center');
    });
  });

  // className 테스트
  describe('className', () => {
    it('추가 className을 병합한다', () => {
      render(<EmptyState className="custom-class" />);
      const container = screen.getByRole('status');
      expect(container).toHaveClass('custom-class');
      expect(container).toHaveClass('flex'); // 기본 스타일도 유지
    });
  });

  // 접근성 테스트
  describe('접근성', () => {
    it('role="status"를 가진다', () => {
      render(<EmptyState />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('aria-label을 가진다', () => {
      render(<EmptyState title="테스트 제목" />);
      const container = screen.getByRole('status');
      expect(container).toHaveAttribute('aria-label', '테스트 제목');
    });
  });

  // ref 테스트
  describe('ref', () => {
    it('ref를 올바르게 전달한다', () => {
      const ref = vi.fn();
      render(<EmptyState ref={ref} />);
      expect(ref).toHaveBeenCalled();
    });
  });
});
