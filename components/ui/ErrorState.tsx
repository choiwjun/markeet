import { HTMLAttributes, forwardRef } from 'react';
import { AlertCircle, RefreshCw, WifiOff, ServerCrash, ShieldAlert, Ban } from 'lucide-react';
import { Button } from './Button';

export type ErrorStateVariant = 'default' | 'network' | 'server' | 'permission' | 'notFound';

interface ErrorStateProps extends HTMLAttributes<HTMLDivElement> {
  variant?: ErrorStateVariant;
  title?: string;
  description?: string;
  error?: Error | string | null;
  icon?: React.ReactNode;
  onRetry?: () => void;
  retryLabel?: string;
  showRetry?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// 스타일 상수 - dashboard.html 스타일 반영
const CONTAINER_STYLES = [
  'flex flex-col items-center justify-center',
  'text-center',
  'py-12 px-6',
].join(' ');

const ICON_WRAPPER_STYLES = [
  'flex items-center justify-center',
  'w-16 h-16',
  'mb-4',
  'rounded-full',
  'bg-danger-50 dark:bg-danger-500/20',
].join(' ');

const ICON_STYLES = 'w-8 h-8 text-danger-500 dark:text-danger-400';

const TITLE_STYLES = [
  'text-lg font-semibold',
  'text-slate-900 dark:text-white',
  'mb-2',
].join(' ');

const DESCRIPTION_STYLES = [
  'text-sm',
  'text-slate-500 dark:text-slate-400',
  'max-w-sm',
  'mb-2',
].join(' ');

const ERROR_DETAIL_STYLES = [
  'text-xs',
  'text-slate-400 dark:text-slate-500',
  'font-mono',
  'max-w-sm',
  'mb-6',
  'break-all',
].join(' ');

// 기본 아이콘 매핑
const DEFAULT_ICONS: Record<ErrorStateVariant, React.ReactNode> = {
  default: <AlertCircle className={ICON_STYLES} />,
  network: <WifiOff className={ICON_STYLES} />,
  server: <ServerCrash className={ICON_STYLES} />,
  permission: <ShieldAlert className={ICON_STYLES} />,
  notFound: <Ban className={ICON_STYLES} />,
};

// 기본 제목 매핑
const DEFAULT_TITLES: Record<ErrorStateVariant, string> = {
  default: '오류가 발생했습니다',
  network: '네트워크 연결 오류',
  server: '서버 오류',
  permission: '접근 권한이 없습니다',
  notFound: '페이지를 찾을 수 없습니다',
};

// 기본 설명 매핑
const DEFAULT_DESCRIPTIONS: Record<ErrorStateVariant, string> = {
  default: '요청을 처리하는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
  network: '인터넷 연결을 확인하고 다시 시도해주세요.',
  server: '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
  permission: '이 페이지에 접근할 권한이 없습니다. 관리자에게 문의해주세요.',
  notFound: '요청하신 페이지가 존재하지 않거나 이동되었습니다.',
};

export const ErrorState = forwardRef<HTMLDivElement, ErrorStateProps>(
  (
    {
      variant = 'default',
      title,
      description,
      error,
      icon,
      onRetry,
      retryLabel = '다시 시도',
      showRetry = true,
      action,
      className,
      ...props
    },
    ref
  ) => {
    const displayIcon = icon || DEFAULT_ICONS[variant];
    const displayTitle = title || DEFAULT_TITLES[variant];
    const displayDescription = description || DEFAULT_DESCRIPTIONS[variant];

    // 에러 메시지 추출
    const errorMessage = error
      ? typeof error === 'string'
        ? error
        : error.message
      : null;

    return (
      <div
        ref={ref}
        className={`${CONTAINER_STYLES} ${className || ''}`}
        role="alert"
        aria-label={displayTitle}
        {...props}
      >
        <div className={ICON_WRAPPER_STYLES}>{displayIcon}</div>
        <h3 className={TITLE_STYLES}>{displayTitle}</h3>
        <p className={DESCRIPTION_STYLES}>{displayDescription}</p>
        {errorMessage && (
          <p className={ERROR_DETAIL_STYLES}>{errorMessage}</p>
        )}
        <div className="flex items-center gap-3">
          {showRetry && onRetry && (
            <Button
              variant="primary"
              onClick={onRetry}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              {retryLabel}
            </Button>
          )}
          {action && (
            <Button variant="secondary" onClick={action.onClick}>
              {action.label}
            </Button>
          )}
        </div>
      </div>
    );
  }
);

ErrorState.displayName = 'ErrorState';
