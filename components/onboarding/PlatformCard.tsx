'use client';

import { Check, AlertCircle, Clock } from 'lucide-react';
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

// 스타일 상수 - dashboard.html 디자인 적용
const CARD_BASE_STYLES = [
  'relative',
  'p-6',
  'rounded-xl',
  'border',
  'cursor-pointer',
  'transition-all duration-300',
  'group',
  'overflow-hidden',
].join(' ');

const CARD_DEFAULT_STYLES = [
  'border-slate-200 dark:border-slate-800',
  'bg-white dark:bg-slate-800',
  'shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)]',
  'hover:shadow-[0_10px_30px_-5px_rgba(0,0,0,0.1)]',
  'hover:-translate-y-0.5',
].join(' ');

const CARD_SELECTED_STYLES = [
  'border-primary-500 dark:border-primary-400',
  'bg-primary-50/50 dark:bg-primary-900/20',
  'shadow-[0_10px_30px_-5px_rgba(0,0,0,0.1)]',
].join(' ');

const CARD_CONNECTED_STYLES = [
  'border-success-300 dark:border-success-600',
  'bg-success-50/30 dark:bg-success-900/10',
  'shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)]',
].join(' ');

const CARD_DISABLED_STYLES = [
  'border-slate-200 dark:border-slate-700',
  'bg-slate-50 dark:bg-slate-800/50',
  'opacity-60',
  'cursor-not-allowed',
  'shadow-none',
].join(' ');

const CONTENT_WRAPPER_STYLES = 'flex items-start justify-between';

const ICON_TEXT_WRAPPER_STYLES = 'flex items-center gap-4';

const TEXT_WRAPPER_STYLES = 'flex-1 min-w-0';

const NAME_STYLES = [
  'font-bold',
  'text-slate-900 dark:text-white',
].join(' ');

const DESCRIPTION_STYLES = [
  'text-xs',
  'text-slate-500 dark:text-slate-400',
].join(' ');

const STATUS_WRAPPER_STYLES = 'mt-3 flex items-center gap-2';

const CONNECT_BUTTON_STYLES = [
  'text-xs font-bold text-primary',
  'px-3 py-1.5 rounded-full',
  'border border-blue-100 dark:border-blue-900/50',
  'bg-blue-50 dark:bg-blue-900/20',
  'hover:bg-blue-100 dark:hover:bg-blue-900/40',
  'transition-colors',
  'whitespace-nowrap',
].join(' ');

const CONNECTED_BUTTON_STYLES = [
  'text-xs font-bold text-success-600 dark:text-success-400',
  'px-3 py-1.5 rounded-full',
  'border border-success-100 dark:border-success-900/50',
  'bg-success-50 dark:bg-success-900/20',
  'whitespace-nowrap',
].join(' ');

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
      {/* 컨텐츠 - dashboard.html 스타일 */}
      <div className={CONTENT_WRAPPER_STYLES}>
        <div className={ICON_TEXT_WRAPPER_STYLES}>
          <PlatformIcon
            iconName={platform.iconName}
            color={platform.color}
            size="lg"
          />
          <div className={TEXT_WRAPPER_STYLES}>
            <h3 className={NAME_STYLES}>{platform.name}</h3>
            <p className={DESCRIPTION_STYLES}>{platform.description}</p>
          </div>
        </div>

        {/* 연동 버튼 */}
        {isConnected && status === 'active' ? (
          <span className={CONNECTED_BUTTON_STYLES}>
            <Check className="w-3 h-3 inline mr-1" />
            연동됨
          </span>
        ) : (
          <span className={CONNECT_BUTTON_STYLES}>연동하기</span>
        )}
      </div>

      {/* 에러/만료 상태 뱃지 (TASK-411) */}
      {isConnected && status && status !== 'active' && (
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
  );
}
