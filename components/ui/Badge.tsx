import { HTMLAttributes, forwardRef } from 'react';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary';
export type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  children: React.ReactNode;
}

// 스타일 상수 - dashboard.html 스타일 반영
const VARIANT_STYLES: Record<BadgeVariant, string> = {
  default: [
    'bg-slate-100 dark:bg-slate-700',
    'text-slate-700 dark:text-slate-300',
  ].join(' '),
  success: [
    'bg-success-50 dark:bg-success-500/20',
    'text-success-700 dark:text-success-400',
  ].join(' '),
  warning: [
    'bg-warning-50 dark:bg-warning-500/20',
    'text-warning-700 dark:text-warning-400',
  ].join(' '),
  danger: [
    'bg-danger-50 dark:bg-danger-500/20',
    'text-danger-700 dark:text-danger-400',
  ].join(' '),
  info: [
    'bg-info-50 dark:bg-info-500/20',
    'text-info-700 dark:text-info-400',
  ].join(' '),
  primary: [
    'bg-primary-50 dark:bg-primary-500/20',
    'text-primary-700 dark:text-primary-400',
  ].join(' '),
};

const DOT_COLORS: Record<BadgeVariant, string> = {
  default: 'bg-slate-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  danger: 'bg-danger-500',
  info: 'bg-info-500',
  primary: 'bg-primary-500',
};

const SIZE_STYLES: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

const DOT_SIZE: Record<BadgeSize, string> = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
  lg: 'w-2.5 h-2.5',
};

const BASE_STYLES = [
  'inline-flex items-center gap-1.5',
  'font-medium',
  'rounded-full',
  'transition-colors duration-200',
].join(' ');

const REMOVE_BUTTON_STYLES = [
  'ml-0.5',
  '-mr-1',
  'p-0.5',
  'rounded-full',
  'hover:bg-black/10 dark:hover:bg-white/10',
  'focus:outline-none focus:ring-2 focus:ring-offset-1',
  'transition-colors duration-200',
].join(' ');

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = 'default',
      size = 'md',
      dot = false,
      removable = false,
      onRemove,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const badgeClassName = [
      BASE_STYLES,
      VARIANT_STYLES[variant],
      SIZE_STYLES[size],
      className || '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <span ref={ref} className={badgeClassName} {...props}>
        {dot && (
          <span
            className={`rounded-full ${DOT_COLORS[variant]} ${DOT_SIZE[size]}`}
            aria-hidden="true"
          />
        )}
        {children}
        {removable && (
          <button
            type="button"
            className={REMOVE_BUTTON_STYLES}
            onClick={onRemove}
            aria-label="제거"
          >
            <svg
              className="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
