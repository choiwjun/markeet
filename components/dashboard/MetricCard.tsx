import { HTMLAttributes, forwardRef } from 'react';
import Link from 'next/link';
import { TrendingUp, TrendingDown, Minus, DollarSign, Wallet, BarChart3, MousePointer, ChevronRight } from 'lucide-react';
import { formatNumber, formatCurrency, formatPercent } from '@/lib/utils/format';

// 지표 값 포맷 타입
export type MetricFormat = 'number' | 'currency' | 'percent' | 'roas';

// 트렌드 방향 타입
export type TrendDirection = 'up' | 'down' | 'neutral';

// 카드 색상 테마 타입
export type CardColorTheme = 'blue' | 'purple' | 'orange' | 'green';

interface MetricCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** 지표 라벨 */
  label: string;
  /** 지표 값 */
  value: number;
  /** 값 포맷 타입 */
  format?: MetricFormat;
  /** 증감률 (%) */
  changePercent?: number;
  /** 비교 기간 텍스트 (예: "전일 대비", "전주 대비") */
  changePeriod?: string;
  /** 아이콘 */
  icon?: React.ReactNode;
  /** 로딩 상태 */
  loading?: boolean;
  /** 카드 색상 테마 */
  colorTheme?: CardColorTheme;
  /** 클릭 시 이동할 URL */
  href?: string;
}

// 색상 테마별 스타일
const COLOR_THEMES: Record<CardColorTheme, { border: string; iconBg: string; iconColor: string; bgIcon: string }> = {
  blue: {
    border: 'hover:border-blue-300',
    iconBg: 'bg-blue-50 dark:bg-blue-900/30',
    iconColor: 'text-primary',
    bgIcon: 'text-blue-500',
  },
  purple: {
    border: 'hover:border-purple-300',
    iconBg: 'bg-purple-50 dark:bg-purple-900/30',
    iconColor: 'text-purple-600 dark:text-purple-400',
    bgIcon: 'text-purple-500',
  },
  orange: {
    border: 'hover:border-orange-300',
    iconBg: 'bg-orange-50 dark:bg-orange-900/30',
    iconColor: 'text-orange-600 dark:text-orange-400',
    bgIcon: 'text-orange-500',
  },
  green: {
    border: 'hover:border-green-300',
    iconBg: 'bg-green-50 dark:bg-green-900/30',
    iconColor: 'text-green-600 dark:text-green-400',
    bgIcon: 'text-green-500',
  },
};

// 배경 아이콘 컴포넌트
const BG_ICONS: Record<CardColorTheme, React.ReactNode> = {
  blue: <DollarSign className="w-20 h-20" />,
  purple: <Wallet className="w-20 h-20" />,
  orange: <BarChart3 className="w-20 h-20" />,
  green: <MousePointer className="w-20 h-20" />,
};

/**
 * 값을 포맷 타입에 따라 문자열로 변환
 */
function formatValue(value: number, format: MetricFormat): string {
  switch (format) {
    case 'currency':
      return formatCurrency(value);
    case 'percent':
      return formatPercent(value);
    case 'roas':
      return value.toFixed(2);
    case 'number':
    default:
      return formatNumber(value);
  }
}

/**
 * 증감 방향 결정
 */
function getTrendDirection(changePercent: number): TrendDirection {
  if (changePercent > 0) return 'up';
  if (changePercent < 0) return 'down';
  return 'neutral';
}

/**
 * 트렌드 아이콘 컴포넌트
 * TASK-506: 증감률에 따라 아이콘 표시
 */
function TrendIcon({ direction }: { direction: TrendDirection }) {
  switch (direction) {
    case 'up':
      return <TrendingUp className="w-3 h-3" />;
    case 'down':
      return <TrendingDown className="w-3 h-3" />;
    case 'neutral':
    default:
      return <Minus className="w-3 h-3" />;
  }
}

/**
 * 지표 카드 컴포넌트
 * dashboard.html 디자인 스타일 적용
 */
export const MetricCard = forwardRef<HTMLDivElement, MetricCardProps>(
  (
    {
      label,
      value,
      format = 'number',
      changePercent,
      changePeriod = '전월 동기 대비',
      icon,
      loading = false,
      colorTheme = 'blue',
      href,
      className,
      ...props
    },
    ref
  ) => {
    const formattedValue = formatValue(value, format);
    const trendDirection = changePercent !== undefined ? getTrendDirection(changePercent) : null;
    const theme = COLOR_THEMES[colorTheme];

    const cardContent = (
      <>
        {/* 배경 아이콘 */}
        <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity ${theme.bgIcon}`}>
          {BG_ICONS[colorTheme]}
        </div>

        {/* 헤더: 라벨 + 아이콘 */}
        <div className="flex justify-between items-center z-10">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wide">
            {label}
          </p>
          {icon && (
            <div className={`${theme.iconBg} p-1.5 rounded-md ${theme.iconColor}`}>
              {icon}
            </div>
          )}
        </div>

        {/* 값 */}
        <div className="z-10 mt-2">
          <h3
            className="text-slate-900 dark:text-white text-3xl font-bold tracking-tight font-mono"
            data-testid="metric-value"
          >
            {formattedValue}
          </h3>

          {/* 증감 표시 */}
          {changePercent !== undefined && (
            <div className="flex items-center gap-2 mt-2">
              <div
                className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-bold ${
                  trendDirection === 'up'
                    ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
                    : trendDirection === 'down'
                    ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
                    : 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800'
                }`}
                data-testid="change-badge"
              >
                <TrendIcon direction={trendDirection!} />
                <span>
                  {changePercent > 0 ? '+' : ''}
                  {changePercent.toFixed(1)}%
                </span>
              </div>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                {changePeriod}
              </span>
            </div>
          )}
        </div>

        {/* 드릴다운 화살표 */}
        {href && (
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </div>
        )}
      </>
    );

    const cardClasses = `bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] flex flex-col justify-between gap-2 group ${theme.border} hover:-translate-y-1 transition-all duration-300 relative overflow-hidden ${href ? 'cursor-pointer' : 'cursor-default'} ${className || ''}`;

    if (href) {
      return (
        <Link href={href} className={cardClasses}>
          {cardContent}
        </Link>
      );
    }

    return (
      <div
        ref={ref}
        className={cardClasses}
        {...props}
      >
        {cardContent}
      </div>
    );
  }
);

MetricCard.displayName = 'MetricCard';

export default MetricCard;
