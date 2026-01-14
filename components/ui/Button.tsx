import { ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

// 스타일 객체를 컴포넌트 외부로 이동 (메모이제이션)
const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary:
    'bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white',
  secondary:
    'bg-transparent text-primary-600 border-2 border-primary-600 hover:bg-primary-50 active:bg-primary-100',
  ghost: 'text-gray-600 hover:text-gray-700 hover:bg-gray-100',
};

const SIZE_STYLES: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

const DISABLED_STYLES = 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50';
const LOADING_STYLES = 'opacity-75 cursor-wait';

export const Button = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  children,
  className,
  ...props
}: ButtonProps) => {
  const isDisabled = disabled || loading;

  const buttonClassName = [
    // 기본 스타일
    'inline-flex items-center justify-center rounded-lg font-semibold',
    'transition-colors duration-200',
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
      className={buttonClassName}
      disabled={isDisabled}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
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
          <span>처리 중...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};
