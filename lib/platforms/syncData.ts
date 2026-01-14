/**
 * 데이터 동기화 유틸리티
 * TASK-416: 수동 데이터 동기화 트리거 구현
 *
 * 플랫폼 연동 후 데이터 수집을 시작합니다.
 * PostgreSQL(Supabase)을 사용하여 작업 상태를 추적합니다.
 */

import { createAdminClient } from '@/lib/supabase/server';
import type { PlatformCode, SyncJobStatus, SyncJob, SyncJobInsert, SyncJobUpdate } from '@/types/database';

// 동기화 결과 타입
export interface SyncResult {
  success: boolean;
  message: string;
  recordCount?: number;
  error?: string;
}

// 동기화 상태 타입 (re-export for backward compatibility)
export type SyncStatus = SyncJobStatus;

// Supabase 쿼리 결과 타입
interface SyncJobRow {
  id: string;
  status: string;
  result: SyncResult | null;
}

/**
 * 동기화 작업 생성
 * PostgreSQL에 새 작업 레코드를 생성합니다.
 */
async function createSyncJob(
  userId: string,
  platform: PlatformCode
): Promise<string> {
  const supabase = await createAdminClient();

  const insertData: SyncJobInsert = {
    user_id: userId,
    platform,
    status: 'pending',
    started_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('sync_jobs')
    .insert(insertData as never)
    .select('id')
    .single();

  if (error || !data) {
    console.error('[SyncData] Failed to create sync job:', error);
    throw new Error('동기화 작업 생성에 실패했습니다.');
  }

  return (data as { id: string }).id;
}

/**
 * 동기화 작업 상태 업데이트
 */
async function updateSyncJobStatus(
  jobId: string,
  status: SyncJobStatus,
  result?: SyncResult
): Promise<void> {
  const supabase = await createAdminClient();

  const updateData: SyncJobUpdate = { status };

  if (status === 'completed' || status === 'failed') {
    updateData.completed_at = new Date().toISOString();
  }

  if (result) {
    updateData.result = result as unknown as typeof updateData.result;
    if (!result.success && result.error) {
      updateData.error_message = result.error;
    }
  }

  const { error } = await supabase
    .from('sync_jobs')
    .update(updateData as never)
    .eq('id', jobId);

  if (error) {
    console.error('[SyncData] Failed to update sync job:', error);
  }
}

/**
 * 데이터 동기화를 트리거합니다.
 * 비동기로 실행되며, 실패해도 연동 자체는 성공으로 처리됩니다.
 *
 * @param userId - 사용자 ID
 * @param platform - 플랫폼 코드
 * @returns 동기화 작업 ID
 */
export async function triggerDataSync(
  userId: string,
  platform: PlatformCode
): Promise<string> {
  // 작업 생성
  const jobId = await createSyncJob(userId, platform);

  // 비동기로 동기화 실행
  executeSyncJob(jobId, userId, platform).catch(error => {
    console.error(`[SyncData] Job ${jobId} failed:`, error);
    updateSyncJobStatus(jobId, 'failed', {
      success: false,
      message: '동기화 실패',
      error: error instanceof Error ? error.message : '알 수 없는 오류',
    }).catch(updateError => {
      console.error('[SyncData] Failed to update job status:', updateError);
    });
  });

  return jobId;
}

/**
 * 동기화 작업 실행
 */
async function executeSyncJob(
  jobId: string,
  userId: string,
  platform: PlatformCode
): Promise<void> {
  // 상태 업데이트: 실행 중
  await updateSyncJobStatus(jobId, 'running');

  try {
    // 플랫폼별 데이터 수집 실행
    const result = await collectPlatformData(userId, platform);

    // 결과에 따라 상태 분기 처리
    if (result.success) {
      await updateSyncJobStatus(jobId, 'completed', result);
      console.log(`[SyncData] Job ${jobId} completed:`, result);
    } else {
      // 실패한 경우 failed 상태로 저장
      await updateSyncJobStatus(jobId, 'failed', result);
      console.warn(`[SyncData] Job ${jobId} failed:`, result);
    }
  } catch (error) {
    throw error;
  }
}

/**
 * 플랫폼별 데이터 수집
 * 개발/테스트 환경에서는 시뮬레이션 데이터를 반환합니다.
 */
async function collectPlatformData(
  userId: string,
  platform: PlatformCode
): Promise<SyncResult> {
  // 개발/테스트 환경에서는 시뮬레이션
  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    // 가상의 지연 시간
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log(`[SyncData] Simulating data collection for user ${userId}, platform ${platform}`);

    return {
      success: true,
      message: `${platform} 데이터 수집이 시작되었습니다.`,
      recordCount: 0,
    };
  }

  // 프로덕션 환경에서의 실제 데이터 수집
  // TODO: 각 플랫폼별 API를 호출하여 데이터 수집 구현
  const platformHandlers: Record<PlatformCode, () => Promise<SyncResult>> = {
    naver: () => collectNaverData(),
    google: () => collectGoogleData(),
    meta: () => collectMetaData(),
    kakao: () => collectKakaoData(),
    coupang: () => collectCoupangData(),
    gmarket: () => collectGmarketData(),
    eleventh: () => collectEleventhData(),
    naver_store: () => collectNaverStoreData(),
    ga4: () => collectGA4Data(),
    naver_analytics: () => collectNaverAnalyticsData(),
  };

  const handler = platformHandlers[platform];
  if (!handler) {
    return {
      success: false,
      message: `지원하지 않는 플랫폼: ${platform}`,
    };
  }

  return handler();
}

/**
 * 동기화 작업 상태 조회
 */
export async function getSyncJobStatus(jobId: string): Promise<{
  status: SyncJobStatus;
  result?: SyncResult;
} | null> {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from('sync_jobs')
    .select('status, result')
    .eq('id', jobId)
    .single();

  if (error || !data) {
    return null;
  }

  const jobData = data as SyncJobRow;

  return {
    status: jobData.status as SyncJobStatus,
    result: jobData.result || undefined,
  };
}

/**
 * 사용자의 모든 플랫폼 데이터 동기화
 */
export async function triggerFullSync(
  userId: string,
  platforms: PlatformCode[]
): Promise<string[]> {
  const jobIds = await Promise.all(
    platforms.map(platform => triggerDataSync(userId, platform))
  );

  return jobIds;
}

/**
 * 사용자의 최근 동기화 작업 목록 조회
 */
export async function getUserSyncJobs(
  userId: string,
  limit: number = 10
): Promise<SyncJob[]> {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from('sync_jobs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[SyncData] Failed to fetch user sync jobs:', error);
    return [];
  }

  return (data || []) as SyncJob[];
}

// 플랫폼별 데이터 수집 함수 스텁 (실제 구현은 Phase 2에서)
async function collectNaverData(): Promise<SyncResult> {
  return { success: true, message: '네이버 광고 데이터 수집 완료', recordCount: 0 };
}

async function collectGoogleData(): Promise<SyncResult> {
  return { success: true, message: 'Google Ads 데이터 수집 완료', recordCount: 0 };
}

async function collectMetaData(): Promise<SyncResult> {
  return { success: true, message: 'Meta 광고 데이터 수집 완료', recordCount: 0 };
}

async function collectKakaoData(): Promise<SyncResult> {
  return { success: true, message: '카카오모먼트 데이터 수집 완료', recordCount: 0 };
}

async function collectCoupangData(): Promise<SyncResult> {
  return { success: true, message: '쿠팡 데이터 수집 완료', recordCount: 0 };
}

async function collectGmarketData(): Promise<SyncResult> {
  return { success: true, message: 'G마켓/옥션 데이터 수집 완료', recordCount: 0 };
}

async function collectEleventhData(): Promise<SyncResult> {
  return { success: true, message: '11번가 데이터 수집 완료', recordCount: 0 };
}

async function collectNaverStoreData(): Promise<SyncResult> {
  return { success: true, message: '네이버 스마트스토어 데이터 수집 완료', recordCount: 0 };
}

async function collectGA4Data(): Promise<SyncResult> {
  return { success: true, message: 'GA4 데이터 수집 완료', recordCount: 0 };
}

async function collectNaverAnalyticsData(): Promise<SyncResult> {
  return { success: true, message: '네이버 애널리틱스 데이터 수집 완료', recordCount: 0 };
}
