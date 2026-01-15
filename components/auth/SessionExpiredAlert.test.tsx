import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SessionExpiredAlert } from './SessionExpiredAlert';

// Next.js 모킹
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('SessionExpiredAlert', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('렌더링', () => {
    it('isVisible이 true일 때 알림이 표시된다', () => {
      render(<SessionExpiredAlert isVisible={true} onClose={mockOnClose} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('세션이 만료되었습니다')).toBeInTheDocument();
    });

    it('isVisible이 false일 때 알림이 표시되지 않는다', () => {
      render(<SessionExpiredAlert isVisible={false} onClose={mockOnClose} />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('로그인 페이지 이동 버튼이 표시된다', () => {
      render(<SessionExpiredAlert isVisible={true} onClose={mockOnClose} />);

      expect(screen.getByRole('button', { name: '로그인 페이지로 이동' })).toBeInTheDocument();
    });

    it('닫기 버튼들이 표시된다', () => {
      render(<SessionExpiredAlert isVisible={true} onClose={mockOnClose} />);

      // X 버튼과 하단 닫기 버튼 총 2개
      const closeButtons = screen.getAllByRole('button', { name: '닫기' });
      expect(closeButtons).toHaveLength(2);
    });
  });

  describe('사용자 상호작용', () => {
    it('로그인 페이지 버튼 클릭 시 /login으로 이동한다', async () => {
      const user = userEvent.setup();
      render(<SessionExpiredAlert isVisible={true} onClose={mockOnClose} />);

      await user.click(screen.getByRole('button', { name: '로그인 페이지로 이동' }));

      expect(mockOnClose).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/login');
    });

    it('하단 닫기 버튼 클릭 시 onClose가 호출된다', async () => {
      const user = userEvent.setup();
      render(<SessionExpiredAlert isVisible={true} onClose={mockOnClose} />);

      // 하단 닫기 버튼 (두 번째)
      const closeButtons = screen.getAllByRole('button', { name: '닫기' });
      await user.click(closeButtons[1]);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('X 버튼 클릭 시 onClose가 호출된다', async () => {
      const user = userEvent.setup();
      render(<SessionExpiredAlert isVisible={true} onClose={mockOnClose} />);

      // aria-label="닫기"인 버튼 찾기
      const closeButtons = screen.getAllByRole('button', { name: '닫기' });
      // X 버튼 (첫 번째) 클릭
      await user.click(closeButtons[0]);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('카운트다운', () => {
    it('카운트다운 메시지가 표시된다', () => {
      render(<SessionExpiredAlert isVisible={true} onClose={mockOnClose} />);

      expect(screen.getByText(/초 후 자동으로 로그인 페이지로 이동합니다/)).toBeInTheDocument();
    });
  });

  describe('접근성', () => {
    it('모달에 role="dialog"가 설정되어 있다', () => {
      render(<SessionExpiredAlert isVisible={true} onClose={mockOnClose} />);

      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    });

    it('모달 제목이 aria-labelledby로 연결되어 있다', () => {
      render(<SessionExpiredAlert isVisible={true} onClose={mockOnClose} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby', 'session-expired-title');
    });
  });
});
