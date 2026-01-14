import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Modal, ModalFooter } from './Modal';

describe('Modal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    children: <div>모달 내용</div>,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // body overflow 스타일 정리
    document.body.style.overflow = '';
  });

  // TASK-206: 기본 렌더링 테스트
  describe('렌더링', () => {
    it('isOpen이 true일 때 모달을 렌더링한다', () => {
      render(<Modal {...defaultProps} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('모달 내용')).toBeInTheDocument();
    });

    it('isOpen이 false일 때 모달을 렌더링하지 않는다', () => {
      render(<Modal {...defaultProps} isOpen={false} />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('title을 렌더링한다', () => {
      render(<Modal {...defaultProps} title="모달 제목" />);
      expect(screen.getByText('모달 제목')).toBeInTheDocument();
    });

    it('description을 렌더링한다', () => {
      render(<Modal {...defaultProps} title="제목" description="모달 설명입니다" />);
      expect(screen.getByText('모달 설명입니다')).toBeInTheDocument();
    });

    it('닫기 버튼을 렌더링한다', () => {
      render(<Modal {...defaultProps} showCloseButton />);
      expect(screen.getByRole('button', { name: '닫기' })).toBeInTheDocument();
    });

    it('showCloseButton이 false일 때 닫기 버튼을 렌더링하지 않는다', () => {
      render(<Modal {...defaultProps} showCloseButton={false} />);
      expect(screen.queryByRole('button', { name: '닫기' })).not.toBeInTheDocument();
    });
  });

  // Size 테스트
  describe('Size', () => {
    it('sm size 스타일을 적용한다', () => {
      render(<Modal {...defaultProps} size="sm" />);
      expect(screen.getByRole('dialog')).toHaveClass('max-w-sm');
    });

    it('md size 스타일을 적용한다', () => {
      render(<Modal {...defaultProps} size="md" />);
      expect(screen.getByRole('dialog')).toHaveClass('max-w-md');
    });

    it('lg size 스타일을 적용한다', () => {
      render(<Modal {...defaultProps} size="lg" />);
      expect(screen.getByRole('dialog')).toHaveClass('max-w-lg');
    });

    it('xl size 스타일을 적용한다', () => {
      render(<Modal {...defaultProps} size="xl" />);
      expect(screen.getByRole('dialog')).toHaveClass('max-w-xl');
    });

    it('full size 스타일을 적용한다', () => {
      render(<Modal {...defaultProps} size="full" />);
      expect(screen.getByRole('dialog')).toHaveClass('max-w-[90vw]');
    });
  });

  // TASK-207: 접근성 테스트
  describe('접근성', () => {
    it('dialog role을 가진다', () => {
      render(<Modal {...defaultProps} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('aria-modal이 true이다', () => {
      render(<Modal {...defaultProps} />);
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    });

    it('title이 있으면 aria-labelledby가 설정된다', () => {
      render(<Modal {...defaultProps} title="모달 제목" />);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
    });

    it('description이 있으면 aria-describedby가 설정된다', () => {
      render(<Modal {...defaultProps} title="제목" description="설명" />);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-describedby', 'modal-description');
    });

    it('ESC 키를 누르면 모달이 닫힌다', () => {
      const onClose = vi.fn();
      render(<Modal {...defaultProps} onClose={onClose} closeOnEscape />);

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('closeOnEscape가 false일 때 ESC 키로 닫히지 않는다', () => {
      const onClose = vi.fn();
      render(<Modal {...defaultProps} onClose={onClose} closeOnEscape={false} />);

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onClose).not.toHaveBeenCalled();
    });

    it('모달이 열리면 body 스크롤이 비활성화된다', () => {
      render(<Modal {...defaultProps} />);
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('모달이 닫히면 body 스크롤이 복원된다', () => {
      const { rerender } = render(<Modal {...defaultProps} />);
      expect(document.body.style.overflow).toBe('hidden');

      rerender(<Modal {...defaultProps} isOpen={false} />);
      expect(document.body.style.overflow).toBe('');
    });
  });

  // 이벤트 테스트
  describe('이벤트', () => {
    it('닫기 버튼을 클릭하면 onClose가 호출된다', () => {
      const onClose = vi.fn();
      render(<Modal {...defaultProps} onClose={onClose} />);

      fireEvent.click(screen.getByRole('button', { name: '닫기' }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('오버레이를 클릭하면 onClose가 호출된다', () => {
      const onClose = vi.fn();
      render(<Modal {...defaultProps} onClose={onClose} closeOnOverlayClick />);

      // 오버레이 요소 찾기 (presentation role)
      const overlay = screen.getByRole('presentation');
      fireEvent.click(overlay);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('closeOnOverlayClick이 false일 때 오버레이 클릭으로 닫히지 않는다', () => {
      const onClose = vi.fn();
      render(<Modal {...defaultProps} onClose={onClose} closeOnOverlayClick={false} />);

      const overlay = screen.getByRole('presentation');
      fireEvent.click(overlay);
      expect(onClose).not.toHaveBeenCalled();
    });

    it('모달 내용을 클릭해도 닫히지 않는다', () => {
      const onClose = vi.fn();
      render(<Modal {...defaultProps} onClose={onClose} closeOnOverlayClick />);

      fireEvent.click(screen.getByText('모달 내용'));
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  // className 테스트
  describe('className', () => {
    it('추가 className을 병합한다', () => {
      render(<Modal {...defaultProps} className="custom-class" />);
      expect(screen.getByRole('dialog')).toHaveClass('custom-class');
      expect(screen.getByRole('dialog')).toHaveClass('rounded-2xl'); // 기본 스타일도 유지
    });
  });
});

describe('ModalFooter', () => {
  it('children을 렌더링한다', () => {
    render(<ModalFooter>푸터 내용</ModalFooter>);
    expect(screen.getByText('푸터 내용')).toBeInTheDocument();
  });

  it('상단 border를 가진다', () => {
    render(<ModalFooter>푸터</ModalFooter>);
    const footer = screen.getByText('푸터');
    expect(footer).toHaveClass('border-t');
  });

  it('flex 레이아웃을 가진다', () => {
    render(<ModalFooter>푸터</ModalFooter>);
    const footer = screen.getByText('푸터');
    expect(footer).toHaveClass('flex');
    expect(footer).toHaveClass('justify-end');
  });

  it('추가 className을 병합한다', () => {
    render(<ModalFooter className="custom-class">푸터</ModalFooter>);
    const footer = screen.getByText('푸터');
    expect(footer).toHaveClass('custom-class');
  });
});
