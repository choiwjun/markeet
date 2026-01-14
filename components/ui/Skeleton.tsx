import { HTMLAttributes, forwardRef } from 'react';

export type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'rounded';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

// 스타일 상수 - dashboard.html 스타일 반영
const VARIANT_STYLES: Record<SkeletonVariant, string> = {
  text: 'rounded',
  circular: 'rounded-full',
  rectangular: 'rounded-none',
  rounded: 'rounded-lg',
};

const BASE_STYLES = [
  'bg-slate-200 dark:bg-slate-700',
].join(' ');

const ANIMATION_STYLES = {
  pulse: 'animate-pulse',
  wave: 'animate-shimmer bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 bg-[length:200%_100%]',
  none: '',
};

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      variant = 'text',
      width,
      height,
      animation = 'pulse',
      className,
      style,
      ...props
    },
    ref
  ) => {
    const skeletonClassName = [
      BASE_STYLES,
      VARIANT_STYLES[variant],
      ANIMATION_STYLES[animation],
      className || '',
    ]
      .filter(Boolean)
      .join(' ');

    const skeletonStyle = {
      width: typeof width === 'number' ? `${width}px` : width,
      height: typeof height === 'number' ? `${height}px` : height,
      ...style,
    };

    return (
      <div
        ref={ref}
        className={skeletonClassName}
        style={skeletonStyle}
        aria-hidden="true"
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

// 프리셋 Skeleton 컴포넌트들
interface SkeletonTextProps extends Omit<SkeletonProps, 'variant'> {
  lines?: number;
  lastLineWidth?: string;
}

export const SkeletonText = forwardRef<HTMLDivElement, SkeletonTextProps>(
  ({ lines = 3, lastLineWidth = '60%', className, ...props }, ref) => {
    return (
      <div ref={ref} className={`space-y-2 ${className || ''}`} aria-hidden="true">
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton
            key={index}
            variant="text"
            width={index === lines - 1 ? lastLineWidth : '100%'}
            height={16}
            {...props}
          />
        ))}
      </div>
    );
  }
);

SkeletonText.displayName = 'SkeletonText';

interface SkeletonAvatarProps extends Omit<SkeletonProps, 'variant'> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const AVATAR_SIZES = {
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
};

export const SkeletonAvatar = forwardRef<HTMLDivElement, SkeletonAvatarProps>(
  ({ size = 'md', ...props }, ref) => {
    const dimension = AVATAR_SIZES[size];
    return (
      <Skeleton
        ref={ref}
        variant="circular"
        width={dimension}
        height={dimension}
        {...props}
      />
    );
  }
);

SkeletonAvatar.displayName = 'SkeletonAvatar';

// 카드 스켈레톤
export const SkeletonCard = forwardRef<HTMLDivElement, Omit<SkeletonProps, 'variant'>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 ${className || ''}`}
        aria-hidden="true"
      >
        <div className="flex items-center gap-4 mb-4">
          <SkeletonAvatar {...props} />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="40%" height={16} {...props} />
            <Skeleton variant="text" width="60%" height={12} {...props} />
          </div>
        </div>
        <SkeletonText lines={3} {...props} />
      </div>
    );
  }
);

SkeletonCard.displayName = 'SkeletonCard';

// 테이블 행 스켈레톤
interface SkeletonTableRowProps extends Omit<SkeletonProps, 'variant'> {
  columns?: number;
}

export const SkeletonTableRow = forwardRef<HTMLDivElement, SkeletonTableRowProps>(
  ({ columns = 4, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`flex items-center gap-4 py-3 ${className || ''}`}
        aria-hidden="true"
      >
        {Array.from({ length: columns }).map((_, index) => (
          <div key={index} className="flex-1">
            <Skeleton
              variant="text"
              width={index === 0 ? '80%' : '60%'}
              height={14}
              {...props}
            />
          </div>
        ))}
      </div>
    );
  }
);

SkeletonTableRow.displayName = 'SkeletonTableRow';

// 메트릭 카드 스켈레톤 (대시보드용)
export const SkeletonMetricCard = forwardRef<HTMLDivElement, Omit<SkeletonProps, 'variant'>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 ${className || ''}`}
        aria-hidden="true"
      >
        <Skeleton variant="text" width="50%" height={14} {...props} />
        <Skeleton variant="text" width="70%" height={32} className="mt-2" {...props} />
        <div className="flex items-center gap-2 mt-3">
          <Skeleton variant="rounded" width={60} height={20} {...props} />
          <Skeleton variant="text" width="40%" height={12} {...props} />
        </div>
      </div>
    );
  }
);

SkeletonMetricCard.displayName = 'SkeletonMetricCard';
