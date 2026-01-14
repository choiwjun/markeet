'use client';

import { HTMLAttributes, forwardRef, useEffect, useCallback, useRef, useImperativeHandle } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface ModalProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: string;
  size?: ModalSize;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  children: React.ReactNode;
}

// 스타일 상수 - dashboard.html 스타일 반영
const SIZE_STYLES: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-[90vw] min-h-[80vh]',
};

const OVERLAY_STYLES = [
  'fixed inset-0 z-50',
  'bg-black/50 dark:bg-black/70',
  'backdrop-blur-sm',
  'flex items-center justify-center',
  'p-4',
  'animate-fadeIn',
].join(' ');

const MODAL_STYLES = [
  'relative',
  'w-full',
  'bg-white dark:bg-slate-800',
  'rounded-2xl',
  'shadow-2xl shadow-slate-900/20 dark:shadow-slate-900/50',
  'animate-slideUp',
  'max-h-[90vh]',
  'overflow-hidden',
  'flex flex-col',
].join(' ');

const HEADER_STYLES = [
  'flex items-center justify-between',
  'px-6 py-4',
  'border-b border-slate-100 dark:border-slate-700',
].join(' ');

const TITLE_STYLES = [
  'text-lg font-bold',
  'text-slate-900 dark:text-white',
].join(' ');

const DESCRIPTION_STYLES = [
  'mt-1 text-sm',
  'text-slate-500 dark:text-slate-400',
].join(' ');

const CLOSE_BUTTON_STYLES = [
  'p-2',
  'rounded-lg',
  'text-slate-400 dark:text-slate-500',
  'hover:text-slate-600 dark:hover:text-slate-300',
  'hover:bg-slate-100 dark:hover:bg-slate-700',
  'transition-colors duration-200',
  'focus:outline-none focus:ring-2 focus:ring-primary-500/20',
].join(' ');

const BODY_STYLES = [
  'flex-1',
  'overflow-y-auto',
  'px-6 py-4',
].join(' ');

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      isOpen,
      onClose,
      title,
      description,
      size = 'md',
      showCloseButton = true,
      closeOnOverlayClick = true,
      closeOnEscape = true,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const previousActiveElement = useRef<HTMLElement | null>(null);

    // 외부 ref와 내부 ref 연결
    useImperativeHandle(ref, () => modalRef.current as HTMLDivElement);

    // ESC 키로 닫기
    const handleKeyDown = useCallback(
      (event: KeyboardEvent) => {
        if (closeOnEscape && event.key === 'Escape') {
          onClose();
        }
      },
      [closeOnEscape, onClose]
    );

    // 오버레이 클릭으로 닫기
    const handleOverlayClick = useCallback(
      (event: React.MouseEvent<HTMLDivElement>) => {
        if (closeOnOverlayClick && event.target === event.currentTarget) {
          onClose();
        }
      },
      [closeOnOverlayClick, onClose]
    );

    // 포커스 트랩
    useEffect(() => {
      if (!isOpen) return;

      // 현재 포커스된 요소 저장
      previousActiveElement.current = document.activeElement as HTMLElement;

      // 모달 내부로 포커스 이동
      const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements && focusableElements.length > 0) {
        focusableElements[0].focus();
      }

      // 스크롤 방지
      document.body.style.overflow = 'hidden';

      // ESC 키 이벤트 리스너 추가
      document.addEventListener('keydown', handleKeyDown);

      return () => {
        // 스크롤 복원
        document.body.style.overflow = '';

        // 이벤트 리스너 제거
        document.removeEventListener('keydown', handleKeyDown);

        // 포커스 복원
        previousActiveElement.current?.focus();
      };
    }, [isOpen, handleKeyDown]);

    // 포커스 트랩 - Tab 키 처리
    const handleTabKey = useCallback((event: React.KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }, []);

    if (!isOpen) return null;

    const modalContent = (
      <div
        className={OVERLAY_STYLES}
        onClick={handleOverlayClick}
        role="presentation"
      >
        <div
          ref={modalRef}
          className={`${MODAL_STYLES} ${SIZE_STYLES[size]} ${className || ''}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
          aria-describedby={description ? 'modal-description' : undefined}
          onKeyDown={handleTabKey}
          {...props}
        >
          {(title || showCloseButton) && (
            <div className={HEADER_STYLES}>
              <div>
                {title && (
                  <h2 id="modal-title" className={TITLE_STYLES}>
                    {title}
                  </h2>
                )}
                {description && (
                  <p id="modal-description" className={DESCRIPTION_STYLES}>
                    {description}
                  </p>
                )}
              </div>
              {showCloseButton && (
                <button
                  type="button"
                  className={CLOSE_BUTTON_STYLES}
                  onClick={onClose}
                  aria-label="닫기"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
          <div className={BODY_STYLES}>{children}</div>
        </div>
      </div>
    );

    // Portal로 렌더링
    if (typeof window !== 'undefined') {
      return createPortal(modalContent, document.body);
    }

    return null;
  }
);

Modal.displayName = 'Modal';

// Modal Footer 컴포넌트
interface ModalFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const ModalFooter = forwardRef<HTMLDivElement, ModalFooterProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-700 ${className || ''}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ModalFooter.displayName = 'ModalFooter';
