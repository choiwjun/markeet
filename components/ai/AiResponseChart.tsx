'use client';

/**
 * AI 응답 차트 자동 생성
 * TASK-907: 질의 결과에 맞는 차트 자동 생성
 */

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

// 차트 색상
const CHART_COLORS = [
  '#667eea', // primary
  '#10b981', // success
  '#f59e0b', // warning
  '#ef4444', // danger
  '#8b5cf6', // purple
  '#06b6d4', // cyan
];

// 스타일 상수
const CHART_CONTAINER_STYLES = [
  'bg-white dark:bg-slate-800',
  'rounded-xl',
  'border border-slate-200 dark:border-slate-700',
  'p-4',
  'mt-4',
].join(' ');

const CHART_TITLE_STYLES = [
  'text-sm font-medium',
  'text-slate-700 dark:text-slate-300',
  'mb-4',
].join(' ');

const TABLE_STYLES = [
  'w-full',
  'text-sm',
  'text-left',
].join(' ');

const TABLE_HEADER_STYLES = [
  'bg-slate-50 dark:bg-slate-700/50',
  'text-slate-600 dark:text-slate-300',
  'font-medium',
].join(' ');

const TABLE_CELL_STYLES = [
  'px-4 py-3',
  'border-b border-slate-100 dark:border-slate-700',
].join(' ');

interface AiResponseChartProps {
  chartType: 'bar' | 'line' | 'pie' | 'table';
  data: Record<string, unknown>[];
}

export function AiResponseChart({ chartType, data }: AiResponseChartProps) {
  if (!data || data.length === 0) {
    return null;
  }

  // 데이터 키 추출
  const keys = Object.keys(data[0]);
  const labelKey = keys[0]; // 첫 번째 컬럼을 라벨로 사용
  const valueKeys = keys.slice(1); // 나머지를 값으로 사용

  // 숫자 포맷팅
  const formatValue = (value: unknown): string => {
    if (typeof value === 'number') {
      return value.toLocaleString('ko-KR');
    }
    return String(value);
  };

  // 막대 차트
  if (chartType === 'bar') {
    return (
      <div className={CHART_CONTAINER_STYLES}>
        <div className={CHART_TITLE_STYLES}>비교 차트</div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey={labelKey}
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip
              formatter={(value) => (typeof value === 'number' ? value.toLocaleString() : value)}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
              }}
            />
            <Legend />
            {valueKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={CHART_COLORS[index % CHART_COLORS.length]}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // 라인 차트
  if (chartType === 'line') {
    return (
      <div className={CHART_CONTAINER_STYLES}>
        <div className={CHART_TITLE_STYLES}>추이 차트</div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey={labelKey}
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip
              formatter={(value) => (typeof value === 'number' ? value.toLocaleString() : value)}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
              }}
            />
            <Legend />
            {valueKeys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={CHART_COLORS[index % CHART_COLORS.length]}
                strokeWidth={2}
                dot={{ fill: CHART_COLORS[index % CHART_COLORS.length], r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // 파이 차트
  if (chartType === 'pie') {
    const pieData = data.map((item) => ({
      name: String(item[labelKey]),
      value: Number(item[valueKeys[0]]) || 0,
    }));

    return (
      <div className={CHART_CONTAINER_STYLES}>
        <div className={CHART_TITLE_STYLES}>비중 차트</div>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={100}
              innerRadius={40}
              paddingAngle={2}
              dataKey="value"
              label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
            >
              {pieData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => (typeof value === 'number' ? value.toLocaleString() : value)} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // 테이블
  if (chartType === 'table') {
    return (
      <div className={CHART_CONTAINER_STYLES}>
        <div className={CHART_TITLE_STYLES}>상세 데이터</div>
        <div className="overflow-x-auto">
          <table className={TABLE_STYLES}>
            <thead>
              <tr className={TABLE_HEADER_STYLES}>
                {keys.map((key) => (
                  <th key={key} className={TABLE_CELL_STYLES}>
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  {keys.map((key) => (
                    <td key={key} className={`${TABLE_CELL_STYLES} text-slate-700 dark:text-slate-300`}>
                      {formatValue(row[key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return null;
}
