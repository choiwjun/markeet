'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  MousePointer,
  Eye,
  Target,
  Loader2,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { TrendLineChart } from '@/components/charts';
import { useDateRange } from '@/hooks/useDateRange';
import { DateRangeFilter } from '@/components/dashboard';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils/format';

// 지표 타입 정보
const METRIC_INFO: Record<string, {
  label: string;
  icon: React.ReactNode;
  format: 'currency' | 'number' | 'percent' | 'roas';
  description: string;
  colorTheme: string;
}> = {
  spend: {
    label: '총 광고비',
    icon: <DollarSign className="w-6 h-6" />,
    format: 'currency',
    description: '선택한 기간 동안 지출된 총 광고비입니다.',
    colorTheme: 'blue',
  },
  revenue: {
    label: '총 매출액',
    icon: <ShoppingCart className="w-6 h-6" />,
    format: 'currency',
    description: '광고를 통해 발생한 총 매출액입니다.',
    colorTheme: 'purple',
  },
  roas: {
    label: 'ROAS (광고 수익률)',
    icon: <TrendingUp className="w-6 h-6" />,
    format: 'roas',
    description: '광고비 대비 매출 비율입니다. 1 이상이면 손익분기점입니다.',
    colorTheme: 'orange',
  },
  conversions: {
    label: '전환 수',
    icon: <Target className="w-6 h-6" />,
    format: 'number',
    description: '광고를 통해 발생한 총 전환(구매, 가입 등) 수입니다.',
    colorTheme: 'green',
  },
  clicks: {
    label: '클릭 수',
    icon: <MousePointer className="w-6 h-6" />,
    format: 'number',
    description: '광고가 클릭된 총 횟수입니다.',
    colorTheme: 'blue',
  },
  impressions: {
    label: '노출 수',
    icon: <Eye className="w-6 h-6" />,
    format: 'number',
    description: '광고가 노출된 총 횟수입니다.',
    colorTheme: 'purple',
  },
  ctr: {
    label: 'CTR (클릭률)',
    icon: <MousePointer className="w-6 h-6" />,
    format: 'percent',
    description: '노출 대비 클릭 비율입니다.',
    colorTheme: 'orange',
  },
  cvr: {
    label: 'CVR (전환율)',
    icon: <Target className="w-6 h-6" />,
    format: 'percent',
    description: '클릭 대비 전환 비율입니다.',
    colorTheme: 'green',
  },
};

// 플랫폼 이름 매핑
const PLATFORM_NAMES: Record<string, string> = {
  naver: '네이버 광고',
  google: 'Google Ads',
  meta: 'Meta Ads',
  kakao: '카카오 광고',
  coupang: '쿠팡 광고',
};

// 스타일 상수
const PAGE_STYLES = 'max-w-[1280px] mx-auto';

const HEADER_STYLES = 'mb-8';

const BACK_LINK_STYLES = [
  'inline-flex items-center gap-2',
  'text-sm text-slate-500 dark:text-slate-400',
  'hover:text-primary transition-colors',
  'mb-4',
].join(' ');

const TITLE_SECTION_STYLES = 'flex flex-col md:flex-row justify-between items-start md:items-center gap-4';

const METRIC_HEADER_STYLES = 'flex items-center gap-3';

const METRIC_ICON_STYLES = [
  'p-3 rounded-xl',
  'bg-primary-100 dark:bg-primary-500/20',
  'text-primary-600 dark:text-primary-400',
].join(' ');

const TITLE_STYLES = 'text-2xl font-bold text-slate-900 dark:text-white';

const DESCRIPTION_STYLES = 'text-sm text-slate-500 dark:text-slate-400 mt-1';

const MAIN_VALUE_CARD_STYLES = [
  'bg-gradient-to-br from-primary-50 to-white',
  'dark:from-slate-800 dark:to-slate-900',
  'rounded-2xl p-6 mb-6',
  'border border-primary-100 dark:border-slate-700',
].join(' ');

const MAIN_VALUE_STYLES = 'text-4xl font-bold text-slate-900 dark:text-white font-mono';

const SECTION_STYLES = 'mb-8';

const SECTION_TITLE_STYLES = 'text-lg font-semibold text-slate-900 dark:text-white mb-4';

const PLATFORM_GRID_STYLES = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';

const PLATFORM_CARD_STYLES = [
  'bg-white dark:bg-slate-800',
  'rounded-xl p-4',
  'border border-slate-200 dark:border-slate-700',
  'hover:border-primary-300 dark:hover:border-primary-500/50',
  'transition-colors',
].join(' ');

interface MetricData {
  type: string;
  period: { startDate: string; endDate: string };
  totalValue: number;
  dailyTrend: Array<{ date: string; value: number }>;
  platformBreakdown: Array<{ platform: string; value: number; spend: number; revenue: number }>;
  summary: {
    totalSpend: number;
    totalRevenue: number;
    totalImpressions: number;
    totalClicks: number;
    totalConversions: number;
    avgRoas: number;
    avgCtr: number;
    avgCvr: number;
  };
}

export default function MetricDrilldownPage() {
  const params = useParams();
  const type = params.type as string;

  const { selectedOption, setOption, startDateISO, endDateISO } = useDateRange('7d');

  const [data, setData] = useState<MetricData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const metricInfo = METRIC_INFO[type];

  // 데이터 조회
  const fetchData = useCallback(async () => {
    if (!type || !metricInfo) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/dashboard/metrics/${type}?startDate=${startDateISO}&endDate=${endDateISO}`
      );

      if (!response.ok) {
        throw new Error('데이터 조회에 실패했습니다.');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error('Failed to fetch metric data:', err);
      setError(err instanceof Error ? err.message : '데이터 조회에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [type, metricInfo, startDateISO, endDateISO]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 값 포맷팅
  const formatValue = (value: number): string => {
    if (!metricInfo) return String(value);

    switch (metricInfo.format) {
      case 'currency':
        return formatCurrency(value);
      case 'percent':
        return formatPercent(value);
      case 'roas':
        return value.toFixed(2);
      default:
        return formatNumber(value);
    }
  };

  // 유효하지 않은 지표 타입
  if (!metricInfo) {
    return (
      <div className={PAGE_STYLES}>
        <Link href="/dashboard" className={BACK_LINK_STYLES}>
          <ArrowLeft className="w-4 h-4" />
          대시보드로 돌아가기
        </Link>
        <Card className="p-8 text-center">
          <p className="text-slate-500">유효하지 않은 지표입니다.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className={PAGE_STYLES}>
      {/* 헤더 */}
      <header className={HEADER_STYLES}>
        <Link href="/dashboard" className={BACK_LINK_STYLES}>
          <ArrowLeft className="w-4 h-4" />
          대시보드로 돌아가기
        </Link>

        <div className={TITLE_SECTION_STYLES}>
          <div className={METRIC_HEADER_STYLES}>
            <div className={METRIC_ICON_STYLES}>{metricInfo.icon}</div>
            <div>
              <h1 className={TITLE_STYLES}>{metricInfo.label}</h1>
              <p className={DESCRIPTION_STYLES}>{metricInfo.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <DateRangeFilter value={selectedOption} onChange={setOption} />
          </div>
        </div>
      </header>

      {/* 로딩 */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      )}

      {/* 에러 */}
      {error && (
        <Card className="p-8 text-center">
          <p className="text-danger-500">{error}</p>
        </Card>
      )}

      {/* 데이터 */}
      {!isLoading && !error && data && (
        <>
          {/* 메인 값 */}
          <div className={MAIN_VALUE_CARD_STYLES}>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
              총 {metricInfo.label}
            </p>
            <p className={MAIN_VALUE_STYLES}>{formatValue(data.totalValue)}</p>
          </div>

          {/* 일별 추이 차트 */}
          <section className={SECTION_STYLES}>
            <h2 className={SECTION_TITLE_STYLES}>일별 추이</h2>
            {data.dailyTrend.length > 0 ? (
              <TrendLineChart
                data={data.dailyTrend.map((d) => ({
                  date: d.date,
                  spend: type === 'spend' ? d.value : 0,
                  revenue: type === 'revenue' ? d.value : 0,
                  roas: type === 'roas' ? d.value : undefined,
                }))}
                title=""
                height={300}
                dataKeys={type === 'roas' ? ['roas'] : type === 'revenue' ? ['revenue'] : ['spend']}
              />
            ) : (
              <Card className="p-8 text-center">
                <p className="text-slate-500">데이터가 없습니다.</p>
              </Card>
            )}
          </section>

          {/* 플랫폼별 비교 */}
          <section className={SECTION_STYLES}>
            <h2 className={SECTION_TITLE_STYLES}>플랫폼별 비교</h2>
            {data.platformBreakdown.length > 0 ? (
              <div className={PLATFORM_GRID_STYLES}>
                {data.platformBreakdown.map((item) => (
                  <div key={item.platform} className={PLATFORM_CARD_STYLES}>
                    <div className="flex justify-between items-start mb-3">
                      <p className="font-medium text-slate-900 dark:text-white">
                        {PLATFORM_NAMES[item.platform] || item.platform}
                      </p>
                      <p className="text-lg font-bold text-primary-600 dark:text-primary-400 font-mono">
                        {formatValue(item.value)}
                      </p>
                    </div>
                    <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
                      <span>광고비: {formatCurrency(item.spend)}</span>
                      <span>매출: {formatCurrency(item.revenue)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <p className="text-slate-500">플랫폼 데이터가 없습니다.</p>
              </Card>
            )}
          </section>

          {/* 요약 정보 */}
          <section className={SECTION_STYLES}>
            <h2 className={SECTION_TITLE_STYLES}>기간 요약</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">총 광고비</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white font-mono">
                  {formatCurrency(data.summary.totalSpend)}
                </p>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">총 매출</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white font-mono">
                  {formatCurrency(data.summary.totalRevenue)}
                </p>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">평균 ROAS</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white font-mono">
                  {data.summary.avgRoas.toFixed(2)}
                </p>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">총 전환</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white font-mono">
                  {formatNumber(data.summary.totalConversions)}
                </p>
              </Card>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
