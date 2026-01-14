'use client';

import { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useToastStore, Toast as ToastType } from '@/lib/stores';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

// 스타일 상수 - dashboard.html 스타일 반영
const VARIANT_STYLES: Record<ToastVariant, string> = {
  success: [
    'bg-success-50 dark:bg-success-500/20',
    'border-success-200 dark:border-success-500/30',
    'text-success-800 dark:text-success-300',
  ].join(' '),
  error: [
    'bg-danger-50 dark:bg-danger-500/20',
    'border-danger-200 dark:border-danger-500/30',
    'text-danger-800 dark:text-danger-300',
  ].join(' '),
  warning: [
    'bg-warning-50 dark:bg-warning-500/20',
    'border-warning-200 dark:border-warning-500/30',
    'text-warning-800 dark:text-warning-300',
  ].join(' '),
  info: [
    'bg-info-50 dark:bg-info-500/20',
    'border-info-200 dark:border-info-500/30',
    'text-info-800 dark:text-info-300',
  ].join(' '),
};

const ICON_STYLES: Record<ToastVariant, string> = {
  success: 'text-success-500',
  error: 'text-danger-500',
  warning: 'text-warning-500',
  info: 'text-info-500',
};

const TOAST_STYLES = [
  'flex items-start gap-3',
  'w-full max-w-sm',
  'p-4',
  'border',
  'rounded-lg',
  'shadow-lg shadow-slate-900/10 dark:shadow-slate-900/30',
  'animate-slideIn',
].join(' ');

const CLOSE_BUTTON_STYLES = [
  'flex-shrink-0',
  'p-1',
  'rounded',
  'opacity-60',
  'hover:opacity-100',
  'transition-opacity duration-200',
  'focus:outline-none focus:ring-2 focus:ring-offset-1',
].join(' ');

// 아이콘 컴포넌트
const ToastIcon = ({ variant }: { variant: ToastVariant }) => {
  const iconClass = `w-5 h-5 flex-shrink-0 ${ICON_STYLES[variant]}`;

  switch (variant) {
    case 'success':
      return <CheckCircle className={iconClass} />;
    case 'error':
      return <AlertCircle className={iconClass} />;
    case 'warning':
      return <AlertTriangle className={iconClass} />;
    case 'info':
      return <Info className={iconClass} />;
    default:
      return null;
  }
};

// 개별 Toast 아이템 컴포넌트
interface ToastItemProps {
  toast: ToastType;
  onClose: (id: string) => void;
}

const ToastItem = ({ toast, onClose }: ToastItemProps) => {
  const { id, message, type, duration = 5000 } = toast;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  return (
    <div
      className={`${TOAST_STYLES} ${VARIANT_STYLES[type]}`}
      role="alert"
      aria-live="polite"
    >
      <ToastIcon variant={type} />
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        type="button"
        className={CLOSE_BUTTON_STYLES}
        onClick={() => onClose(id)}
        aria-label="닫기"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// Toast 컨테이너 컴포넌트
export const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore();

  const handleClose = useCallback(
    (id: string) => {
      removeToast(id);
    },
    [removeToast]
  );

  if (toasts.length === 0) return null;

  const content = (
    <div
      className="fixed top-4 right-4 z-[100] flex flex-col gap-3"
      aria-label="알림"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={handleClose} />
      ))}
    </div>
  );

  if (typeof window !== 'undefined') {
    return createPortal(content, document.body);
  }

  return null;
};

// useToast 훅
export const useToast = () => {
  const { addToast, removeToast, clearToasts } = useToastStore();

  const toast = useCallback(
    (message: string, type: ToastVariant = 'info', duration?: number) => {
      addToast({ message, type, duration });
    },
    [addToast]
  );

  const success = useCallback(
    (message: string, duration?: number) => {
      addToast({ message, type: 'success', duration });
    },
    [addToast]
  );

  const error = useCallback(
    (message: string, duration?: number) => {
      addToast({ message, type: 'error', duration });
    },
    [addToast]
  );

  const warning = useCallback(
    (message: string, duration?: number) => {
      addToast({ message, type: 'warning', duration });
    },
    [addToast]
  );

  const info = useCallback(
    (message: string, duration?: number) => {
      addToast({ message, type: 'info', duration });
    },
    [addToast]
  );

  return {
    toast,
    success,
    error,
    warning,
    info,
    removeToast,
    clearToasts,
  };
};
