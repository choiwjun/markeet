import { InputHTMLAttributes, forwardRef, useId } from 'react';

export type InputSize = 'sm' | 'md' | 'lg';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  size?: InputSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

// 스타일 상수 - dashboard.html 스타일 반영
const SIZE_STYLES: Record<InputSize, string> = {
  sm: 'px-3 py-2 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-4 py-3 text-base',
};

const ICON_SIZE: Record<InputSize, string> = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

const BASE_INPUT_STYLES = [
  'w-full',
  'bg-white dark:bg-slate-800',
  'border border-slate-200 dark:border-slate-700',
  'rounded-lg',
  'text-slate-900 dark:text-white',
  'placeholder:text-slate-400 dark:placeholder:text-slate-500',
  'transition-all duration-200',
  'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:ring-offset-0',
  'focus:border-primary-500 dark:focus:border-primary-400',
].join(' ');

const ERROR_STYLES = [
  'border-danger-500 dark:border-danger-400',
  'focus:ring-danger-500/20',
  'focus:border-danger-500 dark:focus:border-danger-400',
].join(' ');

const DISABLED_STYLES = [
  'bg-slate-100 dark:bg-slate-900',
  'text-slate-400 dark:text-slate-500',
  'cursor-not-allowed',
  'border-slate-200 dark:border-slate-700',
].join(' ');

const LABEL_STYLES = [
  'block',
  'text-sm',
  'font-medium',
  'text-slate-700 dark:text-slate-300',
  'mb-1.5',
].join(' ');

const HELPER_TEXT_STYLES = [
  'mt-1.5',
  'text-xs',
  'text-slate-500 dark:text-slate-400',
].join(' ');

const ERROR_TEXT_STYLES = [
  'mt-1.5',
  'text-xs',
  'text-danger-500 dark:text-danger-400',
].join(' ');

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      size = 'md',
      leftIcon,
      rightIcon,
      fullWidth = true,
      disabled = false,
      className,
      id: propId,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = propId || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    const hasError = Boolean(error);

    const inputClassName = [
      BASE_INPUT_STYLES,
      SIZE_STYLES[size],
      hasError && !disabled ? ERROR_STYLES : '',
      disabled ? DISABLED_STYLES : '',
      leftIcon ? 'pl-10' : '',
      rightIcon ? 'pr-10' : '',
      className || '',
    ]
      .filter(Boolean)
      .join(' ');

    const wrapperClassName = fullWidth ? 'w-full' : 'inline-block';

    return (
      <div className={wrapperClassName}>
        {label && (
          <label htmlFor={inputId} className={LABEL_STYLES}>
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span
              className={`absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 ${ICON_SIZE[size]}`}
              aria-hidden="true"
            >
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={inputClassName}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={
              hasError ? errorId : helperText ? helperId : undefined
            }
            {...props}
          />
          {rightIcon && (
            <span
              className={`absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 ${ICON_SIZE[size]}`}
              aria-hidden="true"
            >
              {rightIcon}
            </span>
          )}
        </div>
        {hasError && (
          <p id={errorId} className={ERROR_TEXT_STYLES} role="alert">
            {error}
          </p>
        )}
        {!hasError && helperText && (
          <p id={helperId} className={HELPER_TEXT_STYLES}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
