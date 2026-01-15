'use client';

import { useParams } from 'next/navigation';
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
  LayoutGrid,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { TrendLineChart } from '@/components/charts';
import { CampaignTable, CampaignData } from '@/components/dashboard/CampaignTable';
import { useDateRange } from '@/hooks/useDateRange';
import { DateRangeFilter } from '@/components/dashboard';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils/format';

// 플랫폼 정보
const PLATFORM_INFO: Record<string, {
  name: string;
  color: string;
  icon: string;
}> = {
  naver: {
    name: '네이버 광고',
    color: 'bg-green-500',
    icon: '🟢',
  },
  google: {
    name: 'Google Ads',
    color: 'bg-blue-500',
    icon: '🔵',
  },
  meta: {
    name: 'Meta Ads',
    color: 'bg-indigo-500',
    icon: '🔷',
  },
  kakao: {
    name: '카카오 광고',
    color: 'bg-yellow-500',
    icon: '🟡',
  },
  coupang: {
    name: '쿠팡 광고',
    color: 'bg-red-500',
    icon: '🔴',
  },
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

const PLATFORM_HEADER_STYLES = 'flex items-center gap-3';

const PLATFORM_ICON_STYLES = [
  'w-12 h-12 rounded-xl flex items-center justify-center text-2xl',
].join(' ');

const TITLE_STYLES = 'text-2xl font-bold text-slate-900 dark:text-white';

const SUBTITLE_STYLES = 'text-sm text-slate-500 dark:text-slate-400 mt-1';

const METRIC_GRID_STYLES = 'grid grid-cols-2 md:grid-cols-4 gap-4 mb-8';

const METRIC_CARD_STYLES = [
  'bg-white dark:bg-slate-800',
  'rounded-xl p-4',
  'border border-slate-200 dark:border-slate-700',
].join(' ');

const SECTION_STYLES = 'mb-8';

const SECTION_TITLE_STYLES = 'text-lg font-semibold text-slate-900 dark:text-white mb-4';

interface PlatformData {
  platform: string;
  period: { startDate: string; endDate: string };
  summary: {
    totalSpend: number;
    totalRevenue: number;
    totalImpressions: number;
    totalClicks: number;
    totalConversions: number;
    avgRoas: number;
    avgCtr: number;
    avgCvr: number;
    campaignCount: number;
  };
  campaigns: CampaignData[];
  dailyTrend: Array<{
    date: string;
    spend: number;
    revenue: number;
    roas: number;
  }>;
}

export default function PlatformDetailPage() {
  const params = useParams();
  const platform = params.platform as string;

  const { selectedOption, setOption, startDateISO, endDateISO } = useDateRange('7d');

  const [data, setData] = useState<PlatformData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const platformInfo = PLATFORM_INFO[platform];

  // 데이터 조회
  const fetchData = useCallback(async () => {
    if (!platform) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/dashboard/platforms/${platform}?startDate=${startDateISO}&endDate=${endDateISO}`
      );

      if (!response.ok) {
        throw new Error('데이터 조회에 실패했습니다.');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error('Failed to fetch platform data:', err);
      setError(err instanceof Error ? err.message : '데이터 조회에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [platform, startDateISO, endDateISO]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 유효하지 않은 플랫폼
  if (!platformInfo) {
    return (
      <div className={PAGE_STYLES}>
        <Link href="/dashboard" className={BACK_LINK_STYLES}>
          <ArrowLeft className="w-4 h-4" />
          대시보드로 돌아가기
        </Link>
        <Card className="p-8 text-center">
          <p className="text-slate-500">유효하지 않은 플랫폼입니다.</p>
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
          <div className={PLATFORM_HEADER_STYLES}>
            <div className={`${PLATFORM_ICON_STYLES} ${platformInfo.color}`}>
              {platformInfo.icon}
            </div>
            <div>
              <h1 className={TITLE_STYLES}>{platformInfo.name}</h1>
              <p className={SUBTITLE_STYLES}>
                캠페인별 상세 성과를 확인하세요
              </p>
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
          {/* 주요 지표 카드 */}
          <div className={METRIC_GRID_STYLES}>
            <div className={METRIC_CARD_STYLES}>
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-blue-500" />
                <span className="text-xs text-slate-500 dark:text-slate-400">총 광고비</span>
              </div>
              <p className="text-xl font-bold text-slate-900 dark:text-white font-mono">
                {formatCurrency(data.summary.totalSpend)}
              </p>
            </div>

            <div className={METRIC_CARD_STYLES}>
              <div className="flex items-center gap-2 mb-2">
                <ShoppingCart className="w-4 h-4 text-purple-500" />
                <span className="text-xs text-slate-500 dark:text-slate-400">총 매출</span>
              </div>
              <p className="text-xl font-bold text-slate-900 dark:text-white font-mono">
                {formatCurrency(data.summary.totalRevenue)}
              </p>
            </div>

            <div className={METRIC_CARD_STYLES}>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-orange-500" />
                <span className="text-xs text-slate-500 dark:text-slate-400">평균 ROAS</span>
              </div>
              <p className="text-xl font-bold text-slate-900 dark:text-white font-mono">
                {data.summary.avgRoas.toFixed(2)}
              </p>
            </div>

            <div className={METRIC_CARD_STYLES}>
              <div className="flex items-center gap-2 mb-2">
                <LayoutGrid className="w-4 h-4 text-green-500" />
                <span className="text-xs text-slate-500 dark:text-slate-400">캠페인 수</span>
              </div>
              <p className="text-xl font-bold text-slate-900 dark:text-white font-mono">
                {formatNumber(data.summary.campaignCount)}
              </p>
            </div>
          </div>

          {/* 추가 지표 */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className={METRIC_CARD_STYLES}>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">노출</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white font-mono">
                {formatNumber(data.summary.totalImpressions)}
              </p>
            </div>
            <div className={METRIC_CARD_STYLES}>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">클릭</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white font-mono">
                {formatNumber(data.summary.totalClicks)}
              </p>
            </div>
            <div className={METRIC_CARD_STYLES}>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">CTR</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white font-mono">
                {formatPercent(data.summary.avgCtr)}
              </p>
            </div>
            <div className={METRIC_CARD_STYLES}>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">전환</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white font-mono">
                {formatNumber(data.summary.totalConversions)}
              </p>
            </div>
            <div className={METRIC_CARD_STYLES}>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">CVR</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white font-mono">
                {formatPercent(data.summary.avgCvr)}
              </p>
            </div>
          </div>

          {/* 일별 추이 차트 */}
          <section className={SECTION_STYLES}>
            <h2 className={SECTION_TITLE_STYLES}>일별 추이</h2>
            {data.dailyTrend.length > 0 ? (
              <TrendLineChart
                data={data.dailyTrend}
                title=""
                height={300}
                dataKeys={['spend', 'revenue']}
              />
            ) : (
              <Card className="p-8 text-center">
                <p className="text-slate-500">데이터가 없습니다.</p>
              </Card>
            )}
          </section>

          {/* 캠페인 테이블 */}
          <section className={SECTION_STYLES}>
            <h2 className={SECTION_TITLE_STYLES}>
              캠페인별 성과 ({data.campaigns.length}개)
            </h2>
            <CampaignTable campaigns={data.campaigns} />
          </section>
        </>
      )}
    </div>
  );
}
