/**
 * 데이터 동기화 유틸리티
 * TASK-416: 수동 데이터 동기화 트리거 구현
 *
 * 플랫폼 연동 후 데이터 수집을 시작합니다.
 * PostgreSQL(Supabase)을 사용하여 작업 상태를 추적합니다.
 */

import { createAdminClient } from '@/lib/supabase/server';
import { decryptCredentials } from '@/lib/supabase/vault';
import { collectGA4Data, type GA4Credentials } from '@/lib/platforms/collectors/ga4';
import type { PlatformCode, SyncJobStatus, SyncJob, SyncJobInsert, SyncJobUpdate, AdDataInsert } from '@/types/database';

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
 * 실제 플랫폼 API를 호출하여 데이터를 수집합니다.
 */
async function collectPlatformData(
  userId: string,
  platform: PlatformCode
): Promise<SyncResult> {
  const supabase = await createAdminClient();

  // 플랫폼 연결 정보 조회
  const { data: connectionData, error: connectionError } = await supabase
    .from('platform_connections')
    .select('id, api_key_encrypted')
    .eq('user_id', userId)
    .eq('platform', platform)
    .single();

  const connection = connectionData as { id: string; api_key_encrypted: string | null } | null;

  if (connectionError || !connection) {
    return {
      success: false,
      message: '플랫폼 연결 정보를 찾을 수 없습니다.',
    };
  }

  if (!connection.api_key_encrypted) {
    return {
      success: false,
      message: 'API 키가 설정되어 있지 않습니다.',
    };
  }

  // API 키 복호화
  let credentials: Record<string, string>;
  try {
    credentials = await decryptCredentials(connection.api_key_encrypted);
  } catch (error) {
    console.error('[SyncData] Failed to decrypt credentials:', error);
    return {
      success: false,
      message: 'API 키 복호화에 실패했습니다.',
    };
  }

  // 수집 기간 설정 (최근 7일)
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);

  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];

  // 플랫폼별 데이터 수집
  let result: SyncResult;

  switch (platform) {
    case 'ga4':
      result = await collectGA4PlatformData(
        credentials as unknown as GA4Credentials,
        userId,
        connection.id,
        startDateStr,
        endDateStr
      );
      break;

    // 다른 플랫폼들은 추후 구현
    case 'naver':
      result = await collectNaverData();
      break;
    case 'google':
      result = await collectGoogleData();
      break;
    case 'meta':
      result = await collectMetaData();
      break;
    case 'kakao':
      result = await collectKakaoData();
      break;
    case 'coupang':
      result = await collectCoupangData();
      break;
    case 'gmarket':
      result = await collectGmarketData();
      break;
    case 'eleventh':
      result = await collectEleventhData();
      break;
    case 'naver_store':
      result = await collectNaverStoreData();
      break;
    case 'naver_analytics':
      result = await collectNaverAnalyticsData();
      break;
    default:
      result = {
        success: false,
        message: `지원하지 않는 플랫폼: ${platform}`,
      };
  }

  // 마지막 동기화 시간 업데이트
  if (result.success) {
    await supabase
      .from('platform_connections')
      .update({ last_sync_at: new Date().toISOString() } as never)
      .eq('id', connection.id);
  }

  return result;
}

/**
 * GA4 데이터 수집 및 저장
 */
async function collectGA4PlatformData(
  credentials: GA4Credentials,
  userId: string,
  connectionId: string,
  startDate: string,
  endDate: string
): Promise<SyncResult> {
  const collectionResult = await collectGA4Data(
    credentials,
    userId,
    connectionId,
    startDate,
    endDate
  );

  if (!collectionResult.success) {
    return {
      success: false,
      message: collectionResult.message,
      recordCount: 0,
      error: collectionResult.error,
    };
  }

  // 데이터베이스에 저장
  if (collectionResult.data.length > 0) {
    const supabase = await createAdminClient();

    // 기존 데이터 삭제 (같은 기간)
    await supabase
      .from('ad_data')
      .delete()
      .eq('user_id', userId)
      .eq('platform_connection_id', connectionId)
      .gte('date', startDate)
      .lte('date', endDate);

    // 새 데이터 삽입
    const { error: insertError } = await supabase
      .from('ad_data')
      .insert(collectionResult.data as never);

    if (insertError) {
      console.error('[SyncData] Failed to insert GA4 data:', insertError);
      return {
        success: false,
        message: '데이터 저장에 실패했습니다.',
        recordCount: 0,
        error: insertError.message,
      };
    }
  }

  return {
    success: true,
    message: collectionResult.message,
    recordCount: collectionResult.recordCount,
  };
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

// 플랫폼별 데이터 수집 함수 스텁 (추후 구현 예정)
// TODO: 각 플랫폼 API 연동 구현
async function collectNaverData(): Promise<SyncResult> {
  return { success: false, message: '네이버 광고 API 연동이 아직 구현되지 않았습니다.', recordCount: 0 };
}

async function collectGoogleData(): Promise<SyncResult> {
  return { success: false, message: 'Google Ads API 연동이 아직 구현되지 않았습니다.', recordCount: 0 };
}

async function collectMetaData(): Promise<SyncResult> {
  return { success: false, message: 'Meta 광고 API 연동이 아직 구현되지 않았습니다.', recordCount: 0 };
}

async function collectKakaoData(): Promise<SyncResult> {
  return { success: false, message: '카카오모먼트 API 연동이 아직 구현되지 않았습니다.', recordCount: 0 };
}

async function collectCoupangData(): Promise<SyncResult> {
  return { success: false, message: '쿠팡 API 연동이 아직 구현되지 않았습니다.', recordCount: 0 };
}

async function collectGmarketData(): Promise<SyncResult> {
  return { success: false, message: 'G마켓/옥션 API 연동이 아직 구현되지 않았습니다.', recordCount: 0 };
}

async function collectEleventhData(): Promise<SyncResult> {
  return { success: false, message: '11번가 API 연동이 아직 구현되지 않았습니다.', recordCount: 0 };
}

async function collectNaverStoreData(): Promise<SyncResult> {
  return { success: false, message: '네이버 스마트스토어 API 연동이 아직 구현되지 않았습니다.', recordCount: 0 };
}

async function collectNaverAnalyticsData(): Promise<SyncResult> {
  return { success: false, message: '네이버 애널리틱스 API 연동이 아직 구현되지 않았습니다.', recordCount: 0 };
}
