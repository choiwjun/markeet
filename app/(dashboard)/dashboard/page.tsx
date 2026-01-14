'use client';

import { DollarSign, TrendingUp, MousePointer, ShoppingCart } from 'lucide-react';
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
const PAGE_HEADER_STYLES = [
  'flex flex-col sm:flex-row sm:items-center sm:justify-between',
  'gap-4 mb-6',
].join(' ');

const PAGE_TITLE_STYLES = [
  'text-2xl font-bold',
  'text-slate-900 dark:text-white',
].join(' ');

const METRIC_GRID_STYLES = [
  'grid gap-4',
  'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  'mb-6',
].join(' ');

const CHART_GRID_STYLES = [
  'grid gap-6',
  'grid-cols-1 lg:grid-cols-2',
].join(' ');

const SKELETON_CHART_STYLES = [
  'h-[400px]',
  'bg-slate-100 dark:bg-slate-800',
  'rounded-2xl',
  'animate-pulse',
].join(' ');

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
        />
        <MetricCard
          label="총 매출"
          value={metrics.totalRevenue}
          format="currency"
          changePercent={changes.revenueChange}
          changePeriod={changePeriod}
          icon={<ShoppingCart className="w-5 h-5" />}
        />
        <MetricCard
          label="평균 ROAS"
          value={metrics.avgRoas}
          format="roas"
          changePercent={changes.roasChange}
          changePeriod={changePeriod}
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <MetricCard
          label="총 클릭수"
          value={metrics.totalClicks}
          format="number"
          changePercent={changes.clicksChange}
          changePeriod={changePeriod}
          icon={<MousePointer className="w-5 h-5" />}
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
    <div>
      {/* 페이지 헤더 */}
      <div className={PAGE_HEADER_STYLES}>
        <h1 className={PAGE_TITLE_STYLES}>대시보드</h1>
        <DateRangeFilter
          value={selectedOption}
          onChange={(option) => setOption(option)}
        />
      </div>

      {/* 지표 카드 그리드 */}
      {renderMetricCards()}

      {/* 차트 영역 */}
      <div className={CHART_GRID_STYLES}>
        {renderPlatformChart()}
        {renderTrendChart()}
      </div>
    </div>
  );
}
