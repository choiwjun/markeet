import { HTMLAttributes, forwardRef } from 'react';

export type CardVariant = 'default' | 'elevated' | 'outlined';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  hoverable?: boolean;
  clickable?: boolean;
  children: React.ReactNode;
}

// 스타일 상수 - design.html 스타일 반영
const VARIANT_STYLES: Record<CardVariant, string> = {
  default: [
    'bg-white dark:bg-slate-800',
    'border border-slate-100 dark:border-slate-700',
    'shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]',
  ].join(' '),
  elevated: [
    'bg-white dark:bg-slate-800',
    'shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05),0_8px_10px_-6px_rgba(0,0,0,0.05)]',
    'border border-slate-100 dark:border-slate-700',
  ].join(' '),
  outlined: [
    'bg-transparent',
    'border-2 border-slate-200 dark:border-slate-700',
  ].join(' '),
};

const PADDING_STYLES: Record<CardPadding, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

const BASE_STYLES = [
  'rounded-2xl',
  'transition-all duration-200',
].join(' ');

const HOVER_STYLES = [
  'hover:shadow-md dark:hover:shadow-slate-900/30',
  'hover:border-slate-300 dark:hover:border-slate-600',
  'hover:-translate-y-0.5',
].join(' ');

const CLICKABLE_STYLES = [
  'cursor-pointer',
  'active:scale-[0.98]',
  'active:shadow-sm',
].join(' ');

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      padding = 'md',
      hoverable = false,
      clickable = false,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const cardClassName = [
      BASE_STYLES,
      VARIANT_STYLES[variant],
      PADDING_STYLES[padding],
      hoverable ? HOVER_STYLES : '',
      clickable ? CLICKABLE_STYLES : '',
      className || '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={cardClassName} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card 서브컴포넌트
interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`pb-4 border-b border-slate-100 dark:border-slate-700 ${className || ''}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={`py-4 ${className || ''}`} {...props}>
        {children}
      </div>
    );
  }
);

CardBody.displayName = 'CardBody';

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`pt-4 border-t border-slate-100 dark:border-slate-700 ${className || ''}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ children, className, as: Component = 'h3', ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={`text-lg font-bold text-slate-900 dark:text-white ${className || ''}`}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

CardTitle.displayName = 'CardTitle';

interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={`text-sm text-slate-500 dark:text-slate-400 ${className || ''}`}
        {...props}
      >
        {children}
      </p>
    );
  }
);

CardDescription.displayName = 'CardDescription';
