'use client';

import { DollarSign, TrendingUp, MousePointer, ShoppingCart, Sparkles, Calendar, Download, Search } from 'lucide-react';
import { MetricCard, DateRangeFilter } from '@/components/dashboard';
import { PlatformBarChart, TrendLineChart } from '@/components/charts';
import { useDateRange } from '@/hooks/useDateRange';
import { useDashboardData } from '@/hooks/useDashboardData';
import { usePlatformData } from '@/hooks/usePlatformData';
import { useTrendData } from '@/hooks/useTrendData';
import { SkeletonMetricCard } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Card } from '@/components/ui/Card';

// 스타일 상수
const METRIC_GRID_STYLES = 'grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-6';

const CHART_GRID_STYLES = 'grid gap-6 grid-cols-1 lg:grid-cols-3';

const SKELETON_CHART_STYLES = 'h-[400px] bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse';

/**
 * 대시보드 메인 페이지
 * TASK-507: 지표 카드 그리드 + 차트 영역 배치
 * TASK-512: 지표 카드에 실제 데이터 연동
 * TASK-516: 플랫폼별 차트에 실제 데이터 연동
 * TASK-519: 일자별 차트에 실제 데이터 연동
 * TASK-520: 대시보드 로딩/에러 상태 처리
 */
export default function DashboardPage() {
  // 기간 선택 상태
  const { selectedOption, setOption, startDateISO, endDateISO } = useDateRange('7d');

  // 데이터 조회
  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    isError: isDashboardError,
    error: dashboardError,
    refetch: refetchDashboard,
  } = useDashboardData({
    startDate: startDateISO,
    endDate: endDateISO,
  });

  const {
    data: platformData,
    isLoading: isPlatformLoading,
    isError: isPlatformError,
    error: platformError,
    refetch: refetchPlatform,
  } = usePlatformData({
    startDate: startDateISO,
    endDate: endDateISO,
  });

  const {
    data: trendData,
    isLoading: isTrendLoading,
    isError: isTrendError,
    error: trendError,
    refetch: refetchTrend,
  } = useTrendData({
    startDate: startDateISO,
    endDate: endDateISO,
  });

  // 전체 다시 시도
  const handleRetryAll = () => {
    refetchDashboard();
    refetchPlatform();
    refetchTrend();
  };

  // 비교 기간 텍스트
  const getChangePeriodText = () => {
    switch (selectedOption) {
      case '7d':
        return '전주 대비';
      case '30d':
        return '전월 대비';
      case '90d':
        return '전분기 대비';
      default:
        return '이전 기간 대비';
    }
  };

  // 지표 카드 렌더링
  const renderMetricCards = () => {
    if (isDashboardLoading) {
      return (
        <div className={METRIC_GRID_STYLES}>
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonMetricCard key={i} />
          ))}
        </div>
      );
    }

    if (isDashboardError) {
      return (
        <Card className="mb-6">
          <ErrorState
            variant="server"
            title="데이터 로드 실패"
            description="대시보드 데이터를 불러오는데 실패했습니다."
            error={dashboardError}
            onRetry={refetchDashboard}
          />
        </Card>
      );
    }

    if (!dashboardData) {
      return (
        <Card className="mb-6">
          <EmptyState
            title="데이터가 없습니다"
            description="선택한 기간에 광고 데이터가 없습니다. 플랫폼을 연동하고 데이터를 수집해주세요."
            actionLabel="플랫폼 연동하기"
            actionHref="/settings/connections"
          />
        </Card>
      );
    }

    const { metrics, changes } = dashboardData;
    const changePeriod = getChangePeriodText();

    return (
      <div className={METRIC_GRID_STYLES}>
        <MetricCard
          label="총 광고비"
          value={metrics.totalSpend}
          format="currency"
          changePercent={changes.spendChange}
          changePeriod={changePeriod}
          icon={<DollarSign className="w-5 h-5" />}
          colorTheme="blue"
        />
        <MetricCard
          label="총 매출액"
          value={metrics.totalRevenue}
          format="currency"
          changePercent={changes.revenueChange}
          changePeriod={changePeriod}
          icon={<ShoppingCart className="w-5 h-5" />}
          colorTheme="purple"
        />
        <MetricCard
          label="ROAS (광고 수익률)"
          value={metrics.avgRoas}
          format="roas"
          changePercent={changes.roasChange}
          changePeriod={changePeriod}
          icon={<TrendingUp className="w-5 h-5" />}
          colorTheme="orange"
        />
      </div>
    );
  };

  // 플랫폼별 차트 렌더링
  const renderPlatformChart = () => {
    if (isPlatformLoading) {
      return <div className={SKELETON_CHART_STYLES} />;
    }

    if (isPlatformError) {
      return (
        <Card>
          <ErrorState
            variant="server"
            title="플랫폼 데이터 로드 실패"
            description="플랫폼별 데이터를 불러오는데 실패했습니다."
            error={platformError}
            onRetry={refetchPlatform}
          />
        </Card>
      );
    }

    if (!platformData || platformData.data.length === 0) {
      return (
        <Card>
          <EmptyState
            title="플랫폼 데이터 없음"
            description="연동된 플랫폼의 광고 데이터가 없습니다."
            variant="chart"
          />
        </Card>
      );
    }

    return (
      <PlatformBarChart
        data={platformData.data}
        title="플랫폼별 성과 비교"
        height={350}
      />
    );
  };

  // 일자별 추이 차트 렌더링
  const renderTrendChart = () => {
    if (isTrendLoading) {
      return <div className={SKELETON_CHART_STYLES} />;
    }

    if (isTrendError) {
      return (
        <Card>
          <ErrorState
            variant="server"
            title="추이 데이터 로드 실패"
            description="일자별 추이 데이터를 불러오는데 실패했습니다."
            error={trendError}
            onRetry={refetchTrend}
          />
        </Card>
      );
    }

    if (!trendData || trendData.data.length === 0) {
      return (
        <Card>
          <EmptyState
            title="추이 데이터 없음"
            description="선택한 기간에 일자별 데이터가 없습니다."
            variant="chart"
          />
        </Card>
      );
    }

    return (
      <TrendLineChart
        data={trendData.data}
        title="일자별 추이"
        height={350}
        dataKeys={['spend', 'revenue']}
      />
    );
  };

  return (
    <div className="max-w-[1280px] mx-auto flex flex-col gap-6">
      {/* AI Insight 배너 */}
      <div className="w-full bg-gradient-to-r from-slate-900 via-[#1e293b] to-slate-900 text-white rounded-xl shadow-lg p-0.5 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-50 group-hover:opacity-100 transition-opacity"></div>
        <div className="relative bg-[#0f172a] rounded-[10px] px-5 py-3 flex items-start md:items-center gap-4">
          <div className="bg-indigo-500/20 p-2 rounded-lg shrink-0">
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
              <span className="text-indigo-300 font-bold text-sm uppercase tracking-wider">AI Insight</span>
              <div className="h-1 w-1 rounded-full bg-slate-600 hidden md:block"></div>
              <p className="text-sm md:text-[15px] font-medium leading-snug text-slate-200">
                <span className="text-white font-bold">데이터를 분석 중입니다.</span> 플랫폼을 연동하면 AI가 인사이트를 제공합니다.
              </p>
            </div>
          </div>
          <button className="text-xs text-indigo-300 hover:text-white font-bold underline decoration-indigo-500/50 underline-offset-4 transition-colors shrink-0">
            자세히 보기
          </button>
        </div>
      </div>

      {/* 페이지 헤더 */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="flex flex-col gap-1.5 max-w-lg w-full">
          <h2 className="text-slate-900 dark:text-white text-2xl font-extrabold tracking-tight">대시보드 개요</h2>
          <div className="relative mt-2 w-full group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
            </div>
            <input
              className="block w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
              placeholder='AI에게 질문하기: "지난주 대비 네이버 광고 효율은 어때?"'
              type="text"
            />
            <div className="absolute inset-y-0 right-2 flex items-center">
              <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600">Enter</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm shrink-0 self-end">
          <DateRangeFilter
            value={selectedOption}
            onChange={(option) => setOption(option)}
          />
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-500 transition-colors" title="데이터 내보내기">
            <Download className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* 지표 카드 그리드 */}
      {renderMetricCards()}

      {/* 차트 영역 */}
      <section className={CHART_GRID_STYLES}>
        <div className="lg:col-span-2">
          {renderTrendChart()}
        </div>
        <div className="lg:col-span-1">
          {renderPlatformChart()}
        </div>
      </section>
    </div>
  );
}
