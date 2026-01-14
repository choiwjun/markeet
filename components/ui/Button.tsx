import { ButtonHTMLAttributes, forwardRef } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

// 스타일 상수 - dashboard.html 스타일 반영
const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary: [
    'bg-gradient-to-r from-primary-600 to-primary-500',
    'hover:from-primary-700 hover:to-primary-600',
    'active:from-primary-800 active:to-primary-700',
    'text-white',
    'shadow-md shadow-primary-600/25',
    'hover:shadow-lg hover:shadow-primary-600/30',
    'hover:-translate-y-0.5',
  ].join(' '),
  secondary: [
    'bg-white dark:bg-slate-800',
    'text-primary-600 dark:text-primary-400',
    'border border-slate-200 dark:border-slate-700',
    'hover:bg-slate-50 dark:hover:bg-slate-700',
    'hover:border-primary-300 dark:hover:border-primary-600',
    'active:bg-slate-100 dark:active:bg-slate-600',
    'shadow-sm',
  ].join(' '),
  ghost: [
    'bg-transparent',
    'text-slate-600 dark:text-slate-400',
    'hover:bg-slate-100 dark:hover:bg-slate-800',
    'hover:text-slate-900 dark:hover:text-slate-200',
    'active:bg-slate-200 dark:active:bg-slate-700',
  ].join(' '),
  danger: [
    'bg-danger-500',
    'hover:bg-danger-700',
    'active:bg-red-800',
    'text-white',
    'shadow-md shadow-danger-500/25',
    'hover:shadow-lg hover:shadow-danger-500/30',
  ].join(' '),
};

const SIZE_STYLES: Record<ButtonSize, string> = {
  sm: 'px-3 py-2 text-xs gap-1.5',
  md: 'px-4 py-2.5 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2.5',
};

const ICON_SIZE: Record<ButtonSize, string> = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

const DISABLED_STYLES = [
  'bg-slate-200 dark:bg-slate-700',
  'text-slate-400 dark:text-slate-500',
  'cursor-not-allowed',
  'shadow-none',
  'hover:transform-none',
].join(' ');

const LOADING_STYLES = 'opacity-80 cursor-wait';

// 로딩 스피너 컴포넌트
const LoadingSpinner = ({ size }: { size: ButtonSize }) => (
  <svg
    className={`animate-spin ${ICON_SIZE[size]}`}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      disabled = false,
      loading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const buttonClassName = [
      // 기본 스타일 (dashboard.html 기반)
      'inline-flex items-center justify-center',
      'rounded-lg',
      'font-bold',
      'transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:ring-offset-2',
      'select-none',
      // variant 스타일 (disabled가 아닐 때만)
      !isDisabled ? VARIANT_STYLES[variant] : DISABLED_STYLES,
      // size 스타일
      SIZE_STYLES[size],
      // loading 스타일
      loading ? LOADING_STYLES : '',
      // fullWidth
      fullWidth ? 'w-full' : '',
      // 외부에서 전달받은 className
      className || '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        className={buttonClassName}
        disabled={isDisabled}
        aria-busy={loading}
        aria-disabled={isDisabled}
        {...props}
      >
        {loading ? (
          <>
            <LoadingSpinner size={size} />
            <span>처리 중...</span>
          </>
        ) : (
          <>
            {leftIcon && (
              <span className={`flex-shrink-0 ${ICON_SIZE[size]}`}>
                {leftIcon}
              </span>
            )}
            {children}
            {rightIcon && (
              <span className={`flex-shrink-0 ${ICON_SIZE[size]}`}>
                {rightIcon}
              </span>
            )}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
