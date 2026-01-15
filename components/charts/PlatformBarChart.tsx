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
import { formatCompactNumber } from '@/lib/utils/format';
import { PLATFORMS } from '@/lib/constants/platforms';
import { useIsMobile } from '@/hooks/useMediaQuery';
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
 * 플랫폼 약칭 변환 (모바일용)
 */
function getPlatformShortName(platformCode: PlatformCode): string {
  const shortNames: Record<string, string> = {
    naver: '네이버',
    google: 'Google',
    meta: 'Meta',
    kakao: '카카오',
    coupang: '쿠팡',
  };
  return shortNames[platformCode] || platformCode;
}

/**
 * 차트 데이터 변환
 */
function transformChartData(data: PlatformData[], isMobile: boolean) {
  return data.map((item) => ({
    ...item,
    name: isMobile ? getPlatformShortName(item.platform) : getPlatformName(item.platform),
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
 * TASK-1303: 모바일에서 간소화된 차트 표시
 */
export function PlatformBarChart({
  data,
  title = '플랫폼별 성과 비교',
  loading = false,
  height = 400,
}: PlatformBarChartProps) {
  const isMobile = useIsMobile();

  // 모바일 최적화 설정
  const mobileHeight = 250;
  const chartHeight = isMobile ? mobileHeight : height;
  const margin = isMobile
    ? { top: 10, right: 10, left: 0, bottom: 5 }
    : { top: 20, right: 30, left: 20, bottom: 5 };
  const yAxisWidth = isMobile ? 50 : 80;
  const fontSize = isMobile ? 10 : 12;
  const maxBarSize = isMobile ? 30 : 60;
  const barRadius = isMobile ? 2 : 4;

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

  const chartData = transformChartData(data, isMobile);

  return (
    <Card className={CARD_STYLES}>
      {title && <h3 className={TITLE_STYLES}>{title}</h3>}

      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={chartData}
          margin={margin}
          barGap={isMobile ? 2 : 4}
          barCategoryGap={isMobile ? '15%' : '20%'}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#E5E7EB"
            vertical={false}
          />
          <XAxis
            dataKey="name"
            tick={{ fill: '#6B7280', fontSize }}
            tickLine={false}
            axisLine={{ stroke: '#E5E7EB' }}
            interval={0}
            angle={isMobile ? -45 : 0}
            textAnchor={isMobile ? 'end' : 'middle'}
            height={isMobile ? 50 : 30}
          />
          <YAxis
            tick={{ fill: '#6B7280', fontSize }}
            tickFormatter={yAxisFormatter}
            tickLine={false}
            axisLine={false}
            width={yAxisWidth}
          />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
          />
          {/* 모바일에서는 범례 숨김 */}
          {!isMobile && (
            <Legend
              wrapperStyle={{
                paddingTop: '20px',
              }}
              iconType="circle"
              iconSize={8}
            />
          )}
          <Bar
            dataKey="spend"
            name="광고비"
            fill={CHART_COLORS.spend}
            radius={[barRadius, barRadius, 0, 0]}
            maxBarSize={maxBarSize}
          />
          <Bar
            dataKey="revenue"
            name="매출"
            fill={CHART_COLORS.revenue}
            radius={[barRadius, barRadius, 0, 0]}
            maxBarSize={maxBarSize}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* 모바일용 범례 (차트 아래에 간단히 표시) */}
      {isMobile && (
        <div className="flex justify-center gap-4 mt-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS.spend }} />
            <span className="text-slate-600 dark:text-slate-400">광고비</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS.revenue }} />
            <span className="text-slate-600 dark:text-slate-400">매출</span>
          </div>
        </div>
      )}
    </Card>
  );
}

export default PlatformBarChart;
