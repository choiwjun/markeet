import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ErrorState } from './ErrorState';

describe('ErrorState', () => {
  // TASK-212: 기본 렌더링 테스트
  describe('렌더링', () => {
    it('기본 ErrorState를 렌더링한다', () => {
      render(<ErrorState />);
      expect(screen.getByText('오류가 발생했습니다')).toBeInTheDocument();
    });

    it('기본 설명을 렌더링한다', () => {
      render(<ErrorState />);
      expect(screen.getByText('요청을 처리하는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.')).toBeInTheDocument();
    });

    it('커스텀 title을 렌더링한다', () => {
      render(<ErrorState title="커스텀 에러 제목" />);
      expect(screen.getByText('커스텀 에러 제목')).toBeInTheDocument();
    });

    it('커스텀 description을 렌더링한다', () => {
      render(<ErrorState description="커스텀 에러 설명입니다." />);
      expect(screen.getByText('커스텀 에러 설명입니다.')).toBeInTheDocument();
    });

    it('커스텀 icon을 렌더링한다', () => {
      render(
        <ErrorState icon={<span data-testid="custom-icon">❌</span>} />
      );
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });
  });

  // Variant 테스트
  describe('Variant', () => {
    it('default variant의 기본 텍스트를 표시한다', () => {
      render(<ErrorState variant="default" />);
      expect(screen.getByText('오류가 발생했습니다')).toBeInTheDocument();
    });

    it('network variant의 기본 텍스트를 표시한다', () => {
      render(<ErrorState variant="network" />);
      expect(screen.getByText('네트워크 연결 오류')).toBeInTheDocument();
      expect(screen.getByText('인터넷 연결을 확인하고 다시 시도해주세요.')).toBeInTheDocument();
    });

    it('server variant의 기본 텍스트를 표시한다', () => {
      render(<ErrorState variant="server" />);
      expect(screen.getByText('서버 오류')).toBeInTheDocument();
      expect(screen.getByText('서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.')).toBeInTheDocument();
    });

    it('permission variant의 기본 텍스트를 표시한다', () => {
      render(<ErrorState variant="permission" />);
      expect(screen.getByText('접근 권한이 없습니다')).toBeInTheDocument();
      expect(screen.getByText('이 페이지에 접근할 권한이 없습니다. 관리자에게 문의해주세요.')).toBeInTheDocument();
    });

    it('notFound variant의 기본 텍스트를 표시한다', () => {
      render(<ErrorState variant="notFound" />);
      expect(screen.getByText('페이지를 찾을 수 없습니다')).toBeInTheDocument();
      expect(screen.getByText('요청하신 페이지가 존재하지 않거나 이동되었습니다.')).toBeInTheDocument();
    });
  });

  // Error 메시지 테스트
  describe('Error 메시지', () => {
    it('문자열 error를 표시한다', () => {
      render(<ErrorState error="상세 에러 메시지입니다" />);
      expect(screen.getByText('상세 에러 메시지입니다')).toBeInTheDocument();
    });

    it('Error 객체의 message를 표시한다', () => {
      const error = new Error('테스트 에러 메시지');
      render(<ErrorState error={error} />);
      expect(screen.getByText('테스트 에러 메시지')).toBeInTheDocument();
    });

    it('error가 null이면 에러 메시지를 표시하지 않는다', () => {
      const { container } = render(<ErrorState error={null} />);
      const errorDetail = container.querySelector('.font-mono');
      expect(errorDetail).not.toBeInTheDocument();
    });
  });

  // 재시도 버튼 테스트
  describe('재시도 버튼', () => {
    it('onRetry가 있으면 재시도 버튼을 렌더링한다', () => {
      const handleRetry = vi.fn();
      render(<ErrorState onRetry={handleRetry} />);

      expect(screen.getByRole('button', { name: /다시 시도/ })).toBeInTheDocument();
    });

    it('재시도 버튼 클릭 시 onRetry가 호출된다', () => {
      const handleRetry = vi.fn();
      render(<ErrorState onRetry={handleRetry} />);

      fireEvent.click(screen.getByRole('button', { name: /다시 시도/ }));
      expect(handleRetry).toHaveBeenCalledTimes(1);
    });

    it('retryLabel로 버튼 텍스트를 변경할 수 있다', () => {
      render(<ErrorState onRetry={vi.fn()} retryLabel="재시도하기" />);
      expect(screen.getByRole('button', { name: /재시도하기/ })).toBeInTheDocument();
    });

    it('showRetry가 false면 재시도 버튼을 렌더링하지 않는다', () => {
      render(<ErrorState onRetry={vi.fn()} showRetry={false} />);
      expect(screen.queryByRole('button', { name: /다시 시도/ })).not.toBeInTheDocument();
    });

    it('onRetry가 없으면 재시도 버튼을 렌더링하지 않는다', () => {
      render(<ErrorState />);
      expect(screen.queryByRole('button', { name: /다시 시도/ })).not.toBeInTheDocument();
    });
  });

  // Action 버튼 테스트
  describe('Action 버튼', () => {
    it('action 버튼을 렌더링한다', () => {
      render(
        <ErrorState
          action={{
            label: '홈으로 돌아가기',
            onClick: vi.fn(),
          }}
        />
      );

      expect(screen.getByRole('button', { name: '홈으로 돌아가기' })).toBeInTheDocument();
    });

    it('action 버튼 클릭 시 onClick이 호출된다', () => {
      const handleClick = vi.fn();
      render(
        <ErrorState
          action={{
            label: '홈으로 돌아가기',
            onClick: handleClick,
          }}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: '홈으로 돌아가기' }));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('재시도 버튼과 action 버튼을 함께 렌더링한다', () => {
      render(
        <ErrorState
          onRetry={vi.fn()}
          action={{
            label: '홈으로 돌아가기',
            onClick: vi.fn(),
          }}
        />
      );

      expect(screen.getByRole('button', { name: /다시 시도/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '홈으로 돌아가기' })).toBeInTheDocument();
    });
  });

  // 스타일 테스트
  describe('스타일', () => {
    it('flex 레이아웃을 가진다', () => {
      render(<ErrorState />);
      const container = screen.getByRole('alert');
      expect(container).toHaveClass('flex');
      expect(container).toHaveClass('flex-col');
    });

    it('중앙 정렬을 가진다', () => {
      render(<ErrorState />);
      const container = screen.getByRole('alert');
      expect(container).toHaveClass('items-center');
      expect(container).toHaveClass('justify-center');
      expect(container).toHaveClass('text-center');
    });
  });

  // className 테스트
  describe('className', () => {
    it('추가 className을 병합한다', () => {
      render(<ErrorState className="custom-class" />);
      const container = screen.getByRole('alert');
      expect(container).toHaveClass('custom-class');
      expect(container).toHaveClass('flex'); // 기본 스타일도 유지
    });
  });

  // 접근성 테스트
  describe('접근성', () => {
    it('role="alert"를 가진다', () => {
      render(<ErrorState />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('aria-label을 가진다', () => {
      render(<ErrorState title="테스트 에러" />);
      const container = screen.getByRole('alert');
      expect(container).toHaveAttribute('aria-label', '테스트 에러');
    });
  });

  // ref 테스트
  describe('ref', () => {
    it('ref를 올바르게 전달한다', () => {
      const ref = vi.fn();
      render(<ErrorState ref={ref} />);
      expect(ref).toHaveBeenCalled();
    });
  });
});
