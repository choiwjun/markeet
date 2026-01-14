'use client';

import {
  ShoppingCart,
  BarChart3,
  TrendingUp,
  Store,
  Package,
} from 'lucide-react';

interface PlatformIconProps {
  iconName: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// 아이콘 크기 스타일
const SIZE_STYLES = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
};

const ICON_SIZE = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

// 플랫폼별 SVG 아이콘 (간단한 형태로 구현)
export function PlatformIcon({
  iconName,
  color,
  size = 'md',
  className = '',
}: PlatformIconProps) {
  const containerStyles = [
    SIZE_STYLES[size],
    'rounded-xl',
    'flex items-center justify-center',
    'transition-transform duration-200',
    className,
  ].join(' ');

  const iconClass = ICON_SIZE[size];

  // 플랫폼별 아이콘 렌더링
  const renderIcon = () => {
    switch (iconName) {
      case 'naver':
        return (
          <svg viewBox="0 0 24 24" className={iconClass} fill="currentColor">
            <path d="M16.273 12.845L7.376 0H0v24h7.726V11.155L16.624 24H24V0h-7.727z" />
          </svg>
        );
      case 'google':
        return (
          <svg viewBox="0 0 24 24" className={iconClass} fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
        );
      case 'meta':
        return (
          <svg viewBox="0 0 24 24" className={iconClass} fill="currentColor">
            <path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.52 1.49-3.92 3.78-3.92 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 008.44-9.9c0-5.53-4.5-10.02-10-10.02z" />
          </svg>
        );
      case 'kakao':
        return (
          <svg viewBox="0 0 24 24" className={iconClass} fill="currentColor">
            <path d="M12 3c-4.97 0-9 3.185-9 7.115 0 2.557 1.707 4.8 4.27 6.054-.188.702-.683 2.545-.78 2.94-.121.49.18.483.378.352.156-.103 2.476-1.68 3.478-2.363.54.08 1.097.122 1.654.122 4.97 0 9-3.185 9-7.105C21 6.185 16.97 3 12 3z" />
          </svg>
        );
      case 'coupang':
        return <ShoppingCart className={iconClass} />;
      case 'gmarket':
        return <Store className={iconClass} />;
      case 'eleventh':
        return <Package className={iconClass} />;
      default:
        // 기본 아이콘
        if (iconName.includes('analytics')) {
          return <BarChart3 className={iconClass} />;
        }
        return <TrendingUp className={iconClass} />;
    }
  };

  return (
    <div
      className={containerStyles}
      style={{ backgroundColor: `${color}15`, color }}
    >
      {renderIcon()}
    </div>
  );
}
