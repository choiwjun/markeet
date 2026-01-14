import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, PlatformStatus } from '@/types/database';

interface ConnectionRow {
  id: string;
  status: PlatformStatus;
}

export interface OnboardingStatus {
  isComplete: boolean;
  platformCount: number;
  hasActiveConnection: boolean;
}

/**
 * 사용자의 온보딩 완료 여부를 확인합니다.
 *
 * 온보딩 완료 조건:
 * - 1개 이상의 플랫폼 연동이 존재
 *
 * @param supabase - Supabase 클라이언트
 * @param userId - 사용자 ID
 * @returns 온보딩 상태 정보
 */
export async function checkOnboardingStatus(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<OnboardingStatus> {
  try {
    // 사용자의 플랫폼 연동 수 확인
    const { data, error } = await supabase
      .from('platform_connections')
      .select('id, status')
      .eq('user_id', userId);

    if (error) {
      console.error('[OnboardingCheck] Error fetching connections:', error);
      return {
        isComplete: false,
        platformCount: 0,
        hasActiveConnection: false,
      };
    }

    const connections = data as ConnectionRow[] | null;
    const platformCount = connections?.length ?? 0;
    const hasActiveConnection = connections?.some(
      (conn: ConnectionRow) => conn.status === 'active'
    ) ?? false;

    return {
      isComplete: platformCount > 0,
      platformCount,
      hasActiveConnection,
    };
  } catch (error) {
    console.error('[OnboardingCheck] Unexpected error:', error);
    return {
      isComplete: false,
      platformCount: 0,
      hasActiveConnection: false,
    };
  }
}

/**
 * 사용자가 온보딩을 완료했는지 간단히 확인합니다.
 *
 * @param supabase - Supabase 클라이언트
 * @param userId - 사용자 ID
 * @returns 온보딩 완료 여부
 */
export async function isOnboardingComplete(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<boolean> {
  const status = await checkOnboardingStatus(supabase, userId);
  return status.isComplete;
}

/**
 * 온보딩 완료 상태에 따라 리다이렉트 경로를 반환합니다.
 *
 * @param supabase - Supabase 클라이언트
 * @param userId - 사용자 ID
 * @param intendedPath - 사용자가 가려던 경로
 * @returns 리다이렉트 경로 (null이면 리다이렉트 불필요)
 */
export async function getOnboardingRedirectPath(
  supabase: SupabaseClient<Database>,
  userId: string,
  intendedPath: string
): Promise<string | null> {
  const status = await checkOnboardingStatus(supabase, userId);

  // 온보딩 페이지로 가려는데 이미 완료된 경우 -> 대시보드
  if (intendedPath === '/onboarding' && status.isComplete) {
    return '/dashboard';
  }

  // 대시보드 관련 페이지로 가려는데 온보딩이 안 된 경우 -> 온보딩
  const protectedPaths = ['/dashboard', '/settings', '/reports'];
  if (
    protectedPaths.some(path => intendedPath.startsWith(path)) &&
    !status.isComplete
  ) {
    return '/onboarding';
  }

  return null;
}
