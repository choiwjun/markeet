'use client';

import {
  LineChart,
  Line,
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
import { useIsMobile } from '@/hooks/useMediaQuery';

// 일자별 데이터 타입
export interface TrendData {
  date: string;
  spend: number;
  revenue: number;
  roas?: number;
}

interface TrendLineChartProps {
  /** 일자별 데이터 배열 */
  data: TrendData[];
  /** 차트 제목 */
  title?: string;
  /** 로딩 상태 */
  loading?: boolean;
  /** 차트 높이 */
  height?: number;
  /** 표시할 데이터 키 */
  dataKeys?: Array<'spend' | 'revenue' | 'roas'>;
}

// 차트 색상 설정
const CHART_COLORS = {
  spend: '#3B82F6', // Primary-500
  revenue: '#22C55E', // Success-500
  roas: '#F59E0B', // Warning-500
};

// 데이터 키별 라벨
const DATA_KEY_LABELS: Record<string, string> = {
  spend: '광고비',
  revenue: '매출',
  roas: 'ROAS',
};

// 스타일 상수
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
 * 날짜 포맷터 (MM/DD 형식)
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}/${day}`;
}

/**
 * Y축 틱 포맷터
 */
function yAxisFormatter(value: number): string {
  return formatCompactNumber(value);
}

/**
 * 일자별 추이 라인 차트 컴포넌트
 * TASK-517: Recharts를 사용한 일자별 추이 라인 차트
 * TASK-1303: 모바일에서 간소화된 차트 표시
 */
export function TrendLineChart({
  data,
  title = '일자별 추이',
  loading = false,
  height = 400,
  dataKeys = ['spend', 'revenue'],
}: TrendLineChartProps) {
  const isMobile = useIsMobile();

  // 모바일 최적화 설정
  const mobileHeight = 250;
  const chartHeight = isMobile ? mobileHeight : height;
  const margin = isMobile
    ? { top: 10, right: 10, left: 0, bottom: 5 }
    : { top: 20, right: 30, left: 20, bottom: 5 };
  const yAxisWidth = isMobile ? 50 : 80;
  const fontSize = isMobile ? 10 : 12;
  const dotRadius = isMobile ? 2 : 4;
  const activeDotRadius = isMobile ? 4 : 6;
  const strokeWidth = isMobile ? 1.5 : 2;

  // 데이터가 없는 경우
  if (!data || data.length === 0) {
    return (
      <Card>
        {title && <h3 className={TITLE_STYLES}>{title}</h3>}
        <div className={EMPTY_STATE_STYLES}>
          <p>표시할 데이터가 없습니다.</p>
        </div>
      </Card>
    );
  }

  // 날짜 포맷팅된 데이터
  const chartData = data.map((item) => ({
    ...item,
    formattedDate: formatDate(item.date),
  }));

  // 모바일에서 데이터 간소화 (7일 이상이면 격일로 표시)
  const displayData = isMobile && chartData.length > 7
    ? chartData.filter((_, index) => index % 2 === 0 || index === chartData.length - 1)
    : chartData;

  return (
    <Card>
      {title && <h3 className={TITLE_STYLES}>{title}</h3>}

      <ResponsiveContainer width="100%" height={chartHeight}>
        <LineChart data={displayData} margin={margin}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#E5E7EB"
            vertical={false}
          />
          <XAxis
            dataKey="formattedDate"
            tick={{ fill: '#6B7280', fontSize }}
            tickLine={false}
            axisLine={{ stroke: '#E5E7EB' }}
            interval={isMobile ? 'preserveStartEnd' : 'preserveStartEnd'}
            tickMargin={8}
          />
          <YAxis
            tick={{ fill: '#6B7280', fontSize }}
            tickFormatter={yAxisFormatter}
            tickLine={false}
            axisLine={false}
            width={yAxisWidth}
          />
          <Tooltip
            content={
              <ChartTooltip
                labelFormatter={(label) => {
                  // 원래 날짜를 찾아서 전체 형식으로 표시
                  const originalData = chartData.find(
                    (d) => d.formattedDate === label
                  );
                  if (originalData) {
                    const date = new Date(originalData.date);
                    return date.toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: isMobile ? 'short' : 'long',
                      day: 'numeric',
                    });
                  }
                  return label;
                }}
              />
            }
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

          {dataKeys.includes('spend') && (
            <Line
              type="monotone"
              dataKey="spend"
              name={DATA_KEY_LABELS.spend}
              stroke={CHART_COLORS.spend}
              strokeWidth={strokeWidth}
              dot={isMobile ? false : { fill: CHART_COLORS.spend, strokeWidth: 0, r: dotRadius }}
              activeDot={{ r: activeDotRadius, fill: CHART_COLORS.spend }}
            />
          )}

          {dataKeys.includes('revenue') && (
            <Line
              type="monotone"
              dataKey="revenue"
              name={DATA_KEY_LABELS.revenue}
              stroke={CHART_COLORS.revenue}
              strokeWidth={strokeWidth}
              dot={isMobile ? false : { fill: CHART_COLORS.revenue, strokeWidth: 0, r: dotRadius }}
              activeDot={{ r: activeDotRadius, fill: CHART_COLORS.revenue }}
            />
          )}

          {dataKeys.includes('roas') && (
            <Line
              type="monotone"
              dataKey="roas"
              name={DATA_KEY_LABELS.roas}
              stroke={CHART_COLORS.roas}
              strokeWidth={strokeWidth}
              dot={isMobile ? false : { fill: CHART_COLORS.roas, strokeWidth: 0, r: dotRadius }}
              activeDot={{ r: activeDotRadius, fill: CHART_COLORS.roas }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>

      {/* 모바일용 범례 (차트 아래에 간단히 표시) */}
      {isMobile && (
        <div className="flex justify-center gap-4 mt-2 text-xs">
          {dataKeys.includes('spend') && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS.spend }} />
              <span className="text-slate-600 dark:text-slate-400">광고비</span>
            </div>
          )}
          {dataKeys.includes('revenue') && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS.revenue }} />
              <span className="text-slate-600 dark:text-slate-400">매출</span>
            </div>
          )}
          {dataKeys.includes('roas') && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS.roas }} />
              <span className="text-slate-600 dark:text-slate-400">ROAS</span>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

export default TrendLineChart;
