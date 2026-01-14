import { HTMLAttributes, forwardRef } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { formatNumber, formatCurrency, formatPercent } from '@/lib/utils/format';

// 지표 값 포맷 타입
export type MetricFormat = 'number' | 'currency' | 'percent' | 'roas';

// 트렌드 방향 타입
export type TrendDirection = 'up' | 'down' | 'neutral';

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
}

// 스타일 상수
const CARD_STYLES = 'relative overflow-hidden';

const HEADER_STYLES = [
  'flex items-center justify-between',
  'mb-3',
].join(' ');

const LABEL_STYLES = [
  'text-sm font-medium',
  'text-slate-500 dark:text-slate-400',
].join(' ');

const ICON_WRAPPER_STYLES = [
  'flex items-center justify-center',
  'w-10 h-10',
  'rounded-xl',
  'bg-primary-50 dark:bg-primary-900/20',
  'text-primary-600 dark:text-primary-400',
].join(' ');

const VALUE_STYLES = [
  'text-2xl lg:text-3xl font-bold',
  'text-slate-900 dark:text-white',
  'font-mono',
  'tracking-tight',
].join(' ');

const CHANGE_WRAPPER_STYLES = [
  'flex items-center gap-2',
  'mt-3',
].join(' ');

const CHANGE_BADGE_BASE_STYLES = [
  'inline-flex items-center gap-1',
  'px-2 py-1',
  'rounded-full',
  'text-xs font-semibold',
].join(' ');

const CHANGE_BADGE_UP_STYLES = [
  'bg-success-50 dark:bg-success-900/20',
  'text-success-600 dark:text-success-400',
].join(' ');

const CHANGE_BADGE_DOWN_STYLES = [
  'bg-danger-50 dark:bg-danger-900/20',
  'text-danger-600 dark:text-danger-400',
].join(' ');

const CHANGE_BADGE_NEUTRAL_STYLES = [
  'bg-slate-100 dark:bg-slate-800',
  'text-slate-500 dark:text-slate-400',
].join(' ');

const CHANGE_PERIOD_STYLES = [
  'text-xs',
  'text-slate-400 dark:text-slate-500',
].join(' ');

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
 * TASK-505: 숫자 지표를 표시하는 카드 (라벨, 값, 증감 표시)
 * TASK-506: 전일/전주 대비 증감률 표시 (TrendingUp/Down 아이콘)
 */
export const MetricCard = forwardRef<HTMLDivElement, MetricCardProps>(
  (
    {
      label,
      value,
      format = 'number',
      changePercent,
      changePeriod = '전일 대비',
      icon,
      loading = false,
      className,
      ...props
    },
    ref
  ) => {
    const formattedValue = formatValue(value, format);
    const trendDirection = changePercent !== undefined ? getTrendDirection(changePercent) : null;

    // 증감 뱃지 스타일 결정
    const getChangeBadgeStyles = () => {
      if (!trendDirection) return CHANGE_BADGE_NEUTRAL_STYLES;

      switch (trendDirection) {
        case 'up':
          return CHANGE_BADGE_UP_STYLES;
        case 'down':
          return CHANGE_BADGE_DOWN_STYLES;
        case 'neutral':
        default:
          return CHANGE_BADGE_NEUTRAL_STYLES;
      }
    };

    return (
      <Card
        ref={ref}
        className={`${CARD_STYLES} ${className || ''}`}
        padding="md"
        {...props}
      >
        {/* 헤더: 라벨 + 아이콘 */}
        <div className={HEADER_STYLES}>
          <span className={LABEL_STYLES}>{label}</span>
          {icon && <div className={ICON_WRAPPER_STYLES}>{icon}</div>}
        </div>

        {/* 값 */}
        <div className={VALUE_STYLES} data-testid="metric-value">
          {formattedValue}
        </div>

        {/* 증감 표시 */}
        {changePercent !== undefined && (
          <div className={CHANGE_WRAPPER_STYLES}>
            <span
              className={`${CHANGE_BADGE_BASE_STYLES} ${getChangeBadgeStyles()}`}
              data-testid="change-badge"
            >
              <TrendIcon direction={trendDirection!} />
              <span>
                {changePercent > 0 ? '+' : ''}
                {changePercent.toFixed(1)}%
              </span>
            </span>
            <span className={CHANGE_PERIOD_STYLES}>{changePeriod}</span>
          </div>
        )}
      </Card>
    );
  }
);

MetricCard.displayName = 'MetricCard';

export default MetricCard;
