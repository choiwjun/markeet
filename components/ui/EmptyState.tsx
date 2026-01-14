import { HTMLAttributes, forwardRef } from 'react';
import Link from 'next/link';
import { Inbox, FileQuestion, Search, FolderOpen, Database, BarChart3 } from 'lucide-react';
import { Button } from './Button';

export type EmptyStateVariant = 'default' | 'search' | 'data' | 'file' | 'folder' | 'chart';

interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  variant?: EmptyStateVariant;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  /** 액션 버튼 링크 (action과 함께 사용 불가) */
  actionLabel?: string;
  actionHref?: string;
  secondaryAction?: {
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
  'bg-slate-100 dark:bg-slate-800',
].join(' ');

const ICON_STYLES = 'w-8 h-8 text-slate-400 dark:text-slate-500';

const TITLE_STYLES = [
  'text-lg font-semibold',
  'text-slate-900 dark:text-white',
  'mb-2',
].join(' ');

const DESCRIPTION_STYLES = [
  'text-sm',
  'text-slate-500 dark:text-slate-400',
  'max-w-sm',
  'mb-6',
].join(' ');

// 기본 아이콘 매핑
const DEFAULT_ICONS: Record<EmptyStateVariant, React.ReactNode> = {
  default: <Inbox className={ICON_STYLES} />,
  search: <Search className={ICON_STYLES} />,
  data: <Database className={ICON_STYLES} />,
  file: <FileQuestion className={ICON_STYLES} />,
  folder: <FolderOpen className={ICON_STYLES} />,
  chart: <BarChart3 className={ICON_STYLES} />,
};

// 기본 제목 매핑
const DEFAULT_TITLES: Record<EmptyStateVariant, string> = {
  default: '데이터가 없습니다',
  search: '검색 결과가 없습니다',
  data: '연동된 데이터가 없습니다',
  file: '파일이 없습니다',
  folder: '폴더가 비어있습니다',
  chart: '차트 데이터가 없습니다',
};

// 기본 설명 매핑
const DEFAULT_DESCRIPTIONS: Record<EmptyStateVariant, string> = {
  default: '아직 표시할 데이터가 없습니다. 새로운 항목을 추가해보세요.',
  search: '검색어를 변경하거나 필터를 조정해보세요.',
  data: '플랫폼을 연동하면 데이터가 자동으로 수집됩니다.',
  file: '업로드된 파일이 없습니다.',
  folder: '이 폴더에 파일이 없습니다.',
  chart: '선택한 기간에 표시할 차트 데이터가 없습니다.',
};

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      variant = 'default',
      title,
      description,
      icon,
      action,
      actionLabel,
      actionHref,
      secondaryAction,
      className,
      ...props
    },
    ref
  ) => {
    const displayIcon = icon || DEFAULT_ICONS[variant];
    const displayTitle = title || DEFAULT_TITLES[variant];
    const displayDescription = description || DEFAULT_DESCRIPTIONS[variant];

    const hasAction = action || (actionLabel && actionHref) || secondaryAction;

    return (
      <div
        ref={ref}
        className={`${CONTAINER_STYLES} ${className || ''}`}
        role="status"
        aria-label={displayTitle}
        {...props}
      >
        <div className={ICON_WRAPPER_STYLES}>{displayIcon}</div>
        <h3 className={TITLE_STYLES}>{displayTitle}</h3>
        <p className={DESCRIPTION_STYLES}>{displayDescription}</p>
        {hasAction && (
          <div className="flex items-center gap-3">
            {action && (
              <Button variant="primary" onClick={action.onClick}>
                {action.label}
              </Button>
            )}
            {actionLabel && actionHref && (
              <Link href={actionHref}>
                <Button variant="primary">
                  {actionLabel}
                </Button>
              </Link>
            )}
            {secondaryAction && (
              <Button variant="secondary" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }
);

EmptyState.displayName = 'EmptyState';
