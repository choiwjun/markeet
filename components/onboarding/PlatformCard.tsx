'use client';

import { Check, AlertCircle, Clock, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { PlatformIcon } from './PlatformIcon';
import type { PlatformInfo } from '@/lib/constants/platforms';
import type { PlatformStatus } from '@/types/database';
import {
  PLATFORM_STATUS_BADGE_VARIANT,
  PLATFORM_STATUS_LABELS,
} from '@/lib/constants/platforms';

export interface PlatformCardProps {
  platform: PlatformInfo;
  status?: PlatformStatus | null;
  isSelected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

// 스타일 상수
const CARD_BASE_STYLES = [
  'relative',
  'p-4 sm:p-5',
  'rounded-xl',
  'border-2',
  'cursor-pointer',
  'transition-all duration-200',
  'group',
].join(' ');

const CARD_DEFAULT_STYLES = [
  'border-slate-200 dark:border-slate-700',
  'bg-white dark:bg-slate-800',
  'hover:border-primary-300 dark:hover:border-primary-600',
  'hover:shadow-md',
].join(' ');

const CARD_SELECTED_STYLES = [
  'border-primary-500 dark:border-primary-400',
  'bg-primary-50/50 dark:bg-primary-900/20',
  'shadow-md',
].join(' ');

const CARD_CONNECTED_STYLES = [
  'border-success-300 dark:border-success-600',
  'bg-success-50/30 dark:bg-success-900/10',
].join(' ');

const CARD_DISABLED_STYLES = [
  'border-slate-200 dark:border-slate-700',
  'bg-slate-50 dark:bg-slate-800/50',
  'opacity-60',
  'cursor-not-allowed',
].join(' ');

const CHECK_ICON_STYLES = [
  'absolute top-3 right-3',
  'w-6 h-6',
  'rounded-full',
  'flex items-center justify-center',
  'transition-all duration-200',
].join(' ');

const CONTENT_WRAPPER_STYLES = 'flex items-start gap-4';

const TEXT_WRAPPER_STYLES = 'flex-1 min-w-0';

const NAME_STYLES = [
  'font-semibold',
  'text-slate-900 dark:text-white',
  'truncate',
].join(' ');

const DESCRIPTION_STYLES = [
  'mt-1 text-sm',
  'text-slate-500 dark:text-slate-400',
  'line-clamp-2',
].join(' ');

const STATUS_WRAPPER_STYLES = 'mt-3 flex items-center gap-2';

// 상태 아이콘 컴포넌트
function StatusIcon({ status }: { status: PlatformStatus }) {
  switch (status) {
    case 'active':
      return <Check className="w-3.5 h-3.5" />;
    case 'expired':
      return <Clock className="w-3.5 h-3.5" />;
    case 'error':
      return <AlertCircle className="w-3.5 h-3.5" />;
    default:
      return null;
  }
}

export function PlatformCard({
  platform,
  status,
  isSelected = false,
  onClick,
  disabled = false,
}: PlatformCardProps) {
  const isConnected = status !== null && status !== undefined;

  // 카드 스타일 계산
  const getCardStyles = () => {
    if (disabled) {
      return `${CARD_BASE_STYLES} ${CARD_DISABLED_STYLES}`;
    }
    if (isConnected && status === 'active') {
      return `${CARD_BASE_STYLES} ${CARD_CONNECTED_STYLES}`;
    }
    if (isSelected) {
      return `${CARD_BASE_STYLES} ${CARD_SELECTED_STYLES}`;
    }
    return `${CARD_BASE_STYLES} ${CARD_DEFAULT_STYLES}`;
  };

  // 체크 아이콘 스타일
  const getCheckIconStyles = () => {
    if (isConnected && status === 'active') {
      return `${CHECK_ICON_STYLES} bg-success-500 text-white`;
    }
    if (isSelected) {
      return `${CHECK_ICON_STYLES} bg-primary-500 text-white`;
    }
    return `${CHECK_ICON_STYLES} bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100`;
  };

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      className={getCardStyles()}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-pressed={isSelected || isConnected}
      aria-disabled={disabled}
      data-testid={`platform-card-${platform.code}`}
    >
      {/* 체크/연동 아이콘 */}
      <div className={getCheckIconStyles()}>
        {isConnected && status === 'active' ? (
          <Check className="w-4 h-4" />
        ) : isSelected ? (
          <Check className="w-4 h-4" />
        ) : (
          <Plus className="w-4 h-4" />
        )}
      </div>

      {/* 컨텐츠 */}
      <div className={CONTENT_WRAPPER_STYLES}>
        <PlatformIcon
          iconName={platform.iconName}
          color={platform.color}
          size="md"
        />

        <div className={TEXT_WRAPPER_STYLES}>
          <h3 className={NAME_STYLES}>{platform.name}</h3>
          <p className={DESCRIPTION_STYLES}>{platform.description}</p>

          {/* 연동 상태 뱃지 (TASK-411) */}
          {isConnected && status && (
            <div className={STATUS_WRAPPER_STYLES}>
              <Badge
                variant={PLATFORM_STATUS_BADGE_VARIANT[status]}
                size="sm"
                dot
              >
                <StatusIcon status={status} />
                {PLATFORM_STATUS_LABELS[status]}
              </Badge>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
