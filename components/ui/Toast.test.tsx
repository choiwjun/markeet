import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ToastContainer, useToast } from './Toast';
import { useToastStore } from '@/lib/stores';

// 테스트용 컴포넌트
const TestComponent = () => {
  const { success, error, warning, info, clearToasts } = useToast();

  return (
    <div>
      <button onClick={() => success('성공 메시지')}>Success</button>
      <button onClick={() => error('에러 메시지')}>Error</button>
      <button onClick={() => warning('경고 메시지')}>Warning</button>
      <button onClick={() => info('정보 메시지')}>Info</button>
      <button onClick={() => clearToasts()}>Clear All</button>
      <ToastContainer />
    </div>
  );
};

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // 스토어 초기화
    useToastStore.getState().clearToasts();
  });

  afterEach(() => {
    vi.useRealTimers();
    useToastStore.getState().clearToasts();
  });

  // TASK-209: 기본 렌더링 테스트
  describe('렌더링', () => {
    it('토스트가 없을 때 아무것도 렌더링하지 않는다', () => {
      render(<ToastContainer />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('success 토스트를 렌더링한다', async () => {
      render(<TestComponent />);

      await act(async () => {
        fireEvent.click(screen.getByText('Success'));
      });

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('성공 메시지')).toBeInTheDocument();
    });

    it('error 토스트를 렌더링한다', async () => {
      render(<TestComponent />);

      await act(async () => {
        fireEvent.click(screen.getByText('Error'));
      });

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('에러 메시지')).toBeInTheDocument();
    });

    it('warning 토스트를 렌더링한다', async () => {
      render(<TestComponent />);

      await act(async () => {
        fireEvent.click(screen.getByText('Warning'));
      });

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('경고 메시지')).toBeInTheDocument();
    });

    it('info 토스트를 렌더링한다', async () => {
      render(<TestComponent />);

      await act(async () => {
        fireEvent.click(screen.getByText('Info'));
      });

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('정보 메시지')).toBeInTheDocument();
    });
  });

  // Variant 스타일 테스트
  describe('Variant 스타일', () => {
    it('success 토스트에 success 스타일을 적용한다', async () => {
      render(<TestComponent />);

      await act(async () => {
        fireEvent.click(screen.getByText('Success'));
      });

      const toast = screen.getByRole('alert');
      expect(toast).toHaveClass('bg-success-50');
    });

    it('error 토스트에 danger 스타일을 적용한다', async () => {
      render(<TestComponent />);

      await act(async () => {
        fireEvent.click(screen.getByText('Error'));
      });

      const toast = screen.getByRole('alert');
      expect(toast).toHaveClass('bg-danger-50');
    });

    it('warning 토스트에 warning 스타일을 적용한다', async () => {
      render(<TestComponent />);

      await act(async () => {
        fireEvent.click(screen.getByText('Warning'));
      });

      const toast = screen.getByRole('alert');
      expect(toast).toHaveClass('bg-warning-50');
    });

    it('info 토스트에 info 스타일을 적용한다', async () => {
      render(<TestComponent />);

      await act(async () => {
        fireEvent.click(screen.getByText('Info'));
      });

      const toast = screen.getByRole('alert');
      expect(toast).toHaveClass('bg-info-50');
    });
  });

  // 자동 사라짐 테스트
  describe('자동 사라짐', () => {
    it('기본 5초 후에 토스트가 자동으로 사라진다', async () => {
      render(<TestComponent />);

      await act(async () => {
        fireEvent.click(screen.getByText('Success'));
      });

      expect(screen.getByRole('alert')).toBeInTheDocument();

      await act(async () => {
        vi.advanceTimersByTime(5000);
      });

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  // 닫기 버튼 테스트
  describe('닫기 버튼', () => {
    it('닫기 버튼을 클릭하면 토스트가 사라진다', async () => {
      render(<TestComponent />);

      await act(async () => {
        fireEvent.click(screen.getByText('Success'));
      });

      expect(screen.getByRole('alert')).toBeInTheDocument();

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: '닫기' }));
      });

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  // 여러 토스트 테스트
  describe('여러 토스트', () => {
    it('여러 개의 토스트를 동시에 표시한다', async () => {
      render(<TestComponent />);

      await act(async () => {
        fireEvent.click(screen.getByText('Success'));
        fireEvent.click(screen.getByText('Error'));
        fireEvent.click(screen.getByText('Warning'));
      });

      const alerts = screen.getAllByRole('alert');
      expect(alerts).toHaveLength(3);
    });

    it('clearToasts로 모든 토스트를 제거한다', async () => {
      render(<TestComponent />);

      await act(async () => {
        fireEvent.click(screen.getByText('Success'));
        fireEvent.click(screen.getByText('Error'));
      });

      expect(screen.getAllByRole('alert')).toHaveLength(2);

      await act(async () => {
        fireEvent.click(screen.getByText('Clear All'));
      });

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  // 접근성 테스트
  describe('접근성', () => {
    it('토스트에 role="alert"가 있다', async () => {
      render(<TestComponent />);

      await act(async () => {
        fireEvent.click(screen.getByText('Success'));
      });

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('토스트에 aria-live="polite"가 있다', async () => {
      render(<TestComponent />);

      await act(async () => {
        fireEvent.click(screen.getByText('Success'));
      });

      expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'polite');
    });

    it('닫기 버튼에 aria-label이 있다', async () => {
      render(<TestComponent />);

      await act(async () => {
        fireEvent.click(screen.getByText('Success'));
      });

      expect(screen.getByRole('button', { name: '닫기' })).toBeInTheDocument();
    });
  });
});

describe('useToast', () => {
  beforeEach(() => {
    useToastStore.getState().clearToasts();
  });

  afterEach(() => {
    useToastStore.getState().clearToasts();
  });

  it('toast 함수로 토스트를 추가할 수 있다', () => {
    const TestHookComponent = () => {
      const { toast } = useToast();
      return (
        <div>
          <button onClick={() => toast('테스트 메시지', 'info')}>Add Toast</button>
          <ToastContainer />
        </div>
      );
    };

    render(<TestHookComponent />);

    act(() => {
      fireEvent.click(screen.getByText('Add Toast'));
    });

    expect(screen.getByText('테스트 메시지')).toBeInTheDocument();
  });

  it('각 타입별 함수로 토스트를 추가할 수 있다', () => {
    const TestHookComponent = () => {
      const { success, error, warning, info } = useToast();
      return (
        <div>
          <button onClick={() => success('Success')}>Success</button>
          <button onClick={() => error('Error')}>Error</button>
          <button onClick={() => warning('Warning')}>Warning</button>
          <button onClick={() => info('Info')}>Info</button>
          <ToastContainer />
        </div>
      );
    };

    render(<TestHookComponent />);

    act(() => {
      fireEvent.click(screen.getByText('Success'));
      fireEvent.click(screen.getByText('Error'));
      fireEvent.click(screen.getByText('Warning'));
      fireEvent.click(screen.getByText('Info'));
    });

    expect(screen.getAllByRole('alert')).toHaveLength(4);
  });
});
