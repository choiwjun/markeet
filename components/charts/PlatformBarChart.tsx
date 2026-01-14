'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card } from '@/components/ui/Card';
import { ChartTooltip } from './ChartTooltip';
import { formatCurrency, formatCompactNumber } from '@/lib/utils/format';
import { PLATFORMS } from '@/lib/constants/platforms';
import type { PlatformCode } from '@/types/database';

// 플랫폼별 데이터 타입
export interface PlatformData {
  platform: PlatformCode;
  spend: number;
  revenue: number;
  roas: number;
}

interface PlatformBarChartProps {
  /** 플랫폼별 데이터 배열 */
  data: PlatformData[];
  /** 차트 제목 */
  title?: string;
  /** 로딩 상태 */
  loading?: boolean;
  /** 차트 높이 */
  height?: number;
}

// 차트 색상 설정
const CHART_COLORS = {
  spend: '#3B82F6', // Primary-500
  revenue: '#22C55E', // Success-500
};

// 스타일 상수
const CARD_STYLES = '';

const TITLE_STYLES = [
  'text-lg font-semibold',
  'text-slate-900 dark:text-white',
  'mb-4',
].join(' ');

const EMPTY_STATE_STYLES = [
  'flex items-center justify-center',
  'h-64',
  'text-slate-500 dark:text-slate-400',
].join(' ');

/**
 * 플랫폼 이름 변환
 */
function getPlatformName(platformCode: PlatformCode): string {
  return PLATFORMS[platformCode]?.name || platformCode;
}

/**
 * 차트 데이터 변환
 */
function transformChartData(data: PlatformData[]) {
  return data.map((item) => ({
    ...item,
    name: getPlatformName(item.platform),
  }));
}

/**
 * Y축 틱 포맷터
 */
function yAxisFormatter(value: number): string {
  return formatCompactNumber(value);
}

/**
 * 플랫폼별 비교 막대 차트 컴포넌트
 * TASK-513: Recharts를 사용한 플랫폼별 성과 비교 막대 차트
 */
export function PlatformBarChart({
  data,
  title = '플랫폼별 성과 비교',
  loading = false,
  height = 400,
}: PlatformBarChartProps) {
  // 데이터가 없는 경우
  if (!data || data.length === 0) {
    return (
      <Card className={CARD_STYLES}>
        {title && <h3 className={TITLE_STYLES}>{title}</h3>}
        <div className={EMPTY_STATE_STYLES}>
          <p>표시할 데이터가 없습니다.</p>
        </div>
      </Card>
    );
  }

  const chartData = transformChartData(data);

  return (
    <Card className={CARD_STYLES}>
      {title && <h3 className={TITLE_STYLES}>{title}</h3>}

      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          barGap={4}
          barCategoryGap="20%"
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#E5E7EB"
            vertical={false}
          />
          <XAxis
            dataKey="name"
            tick={{ fill: '#6B7280', fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: '#E5E7EB' }}
          />
          <YAxis
            tick={{ fill: '#6B7280', fontSize: 12 }}
            tickFormatter={yAxisFormatter}
            tickLine={false}
            axisLine={false}
            width={80}
          />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
          />
          <Legend
            wrapperStyle={{
              paddingTop: '20px',
            }}
            iconType="circle"
            iconSize={8}
          />
          <Bar
            dataKey="spend"
            name="광고비"
            fill={CHART_COLORS.spend}
            radius={[4, 4, 0, 0]}
            maxBarSize={60}
          />
          <Bar
            dataKey="revenue"
            name="매출"
            fill={CHART_COLORS.revenue}
            radius={[4, 4, 0, 0]}
            maxBarSize={60}
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

export default PlatformBarChart;
