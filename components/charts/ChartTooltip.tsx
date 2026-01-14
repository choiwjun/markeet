'use client';

import { formatCurrency, formatNumber } from '@/lib/utils/format';

// 툴팁 payload 타입
interface PayloadItem {
  name: string;
  value: number;
  color: string;
  dataKey: string;
  payload: Record<string, unknown>;
}

// ChartTooltip props - Recharts TooltipProps와 호환되는 독립적인 타입
export interface ChartTooltipProps {
  /** 툴팁 활성화 여부 */
  active?: boolean;
  /** 툴팁에 표시할 데이터 항목들 */
  payload?: PayloadItem[];
  /** 툴팁 라벨 (날짜 등) */
  label?: string | number;
  /** 값 포맷팅 함수 */
  formatter?: (value: number, name: string) => string;
  /** 라벨 포맷팅 함수 */
  labelFormatter?: (label: string) => string;
}

// 스타일 상수
const TOOLTIP_CONTAINER_STYLES = [
  'bg-white dark:bg-slate-800',
  'border border-slate-200 dark:border-slate-700',
  'rounded-xl',
  'shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50',
  'p-4',
  'min-w-[160px]',
].join(' ');

const TOOLTIP_LABEL_STYLES = [
  'text-sm font-semibold',
  'text-slate-900 dark:text-white',
  'mb-2 pb-2',
  'border-b border-slate-100 dark:border-slate-700',
].join(' ');

const TOOLTIP_ITEM_STYLES = [
  'flex items-center justify-between gap-4',
  'py-1',
].join(' ');

const TOOLTIP_NAME_STYLES = [
  'flex items-center gap-2',
  'text-sm',
  'text-slate-600 dark:text-slate-400',
].join(' ');

const TOOLTIP_VALUE_STYLES = [
  'text-sm font-semibold',
  'text-slate-900 dark:text-white',
  'font-mono',
].join(' ');

const TOOLTIP_DOT_STYLES = 'w-2 h-2 rounded-full';

/**
 * 기본 값 포맷터
 */
function defaultFormatter(value: number, name: string): string {
  // 이름에 따라 적절한 포맷 적용
  const currencyNames = ['spend', 'revenue', '광고비', '매출'];
  const isCurrency = currencyNames.some((n) =>
    name.toLowerCase().includes(n.toLowerCase())
  );

  if (isCurrency) {
    return formatCurrency(value);
  }

  return formatNumber(value);
}

/**
 * 차트 툴팁 컴포넌트
 * TASK-514: 차트 호버 시 표시되는 커스텀 툴팁
 */
export function ChartTooltip({
  active,
  payload,
  label,
  formatter = defaultFormatter,
  labelFormatter,
}: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const formattedLabel = labelFormatter ? labelFormatter(String(label)) : label;

  return (
    <div className={TOOLTIP_CONTAINER_STYLES}>
      {/* 라벨 (날짜 또는 카테고리) */}
      {formattedLabel && <div className={TOOLTIP_LABEL_STYLES}>{formattedLabel}</div>}

      {/* 데이터 항목들 */}
      <div className="space-y-1">
        {payload.map((item: PayloadItem, index: number) => {
          const formattedValue = formatter(item.value, item.name);

          return (
            <div key={index} className={TOOLTIP_ITEM_STYLES}>
              <span className={TOOLTIP_NAME_STYLES}>
                <span
                  className={TOOLTIP_DOT_STYLES}
                  style={{ backgroundColor: item.color }}
                />
                <span>{item.name}</span>
              </span>
              <span className={TOOLTIP_VALUE_STYLES}>{formattedValue}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ChartTooltip;
