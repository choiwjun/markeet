/**
 * 커스텀 훅 모듈
 */

export { useAuth, useRequireAuth } from './useAuth';
export { useDateRange } from './useDateRange';
export { useDashboardData, usePrefetchDashboardData } from './useDashboardData';
export { usePlatformData } from './usePlatformData';
export { useTrendData } from './useTrendData';

export type { DateRangeOption, DateRange } from './useDateRange';
export type { DashboardMetrics, MetricsChange, DashboardResponse } from './useDashboardData';
export type { PlatformMetrics, PlatformResponse } from './usePlatformData';
export type { DailyMetrics, TrendResponse } from './useTrendData';
