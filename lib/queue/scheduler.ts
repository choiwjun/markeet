/**
 * 정기 데이터 수집 스케줄러
 *
 * 매일 새벽 3시에 모든 사용자의 플랫폼 데이터를 동기화합니다.
 * TRD 요구사항: 매일 새벽 3시 BullMQ 작업 실행
 */

import { getScheduledSyncQueue, createWorker, QUEUE_NAMES } from './config';
import { queueSyncJob, type SyncJobData } from './syncWorker';
import type { PlatformCode } from '@/types/database';

// 스케줄 작업 데이터 타입
interface ScheduledSyncJobData {
  type: 'daily_sync';
  scheduledAt: string;
}

// 스케줄 작업 결과 타입
interface ScheduledSyncResult {
  success: boolean;
  message: string;
  jobsQueued: number;
}

/**
 * 스케줄 작업 처리 함수
 * 모든 활성 사용자의 연동된 플랫폼에 대해 동기화 작업을 큐에 추가합니다.
 */
async function processScheduledSync(): Promise<ScheduledSyncResult> {
  console.log('[Scheduler] Starting daily sync job');

  try {
    // 동적 import로 Supabase 클라이언트 로드
    const { createAdminClient } = await import('@/lib/supabase/server');
    const supabase = await createAdminClient();

    // 모든 활성 플랫폼 연결 조회
    const { data: connections, error } = await supabase
      .from('platform_connections')
      .select('id, user_id, platform')
      .eq('status', 'active')
      .returns<Array<{ id: string; user_id: string; platform: string }>>();

    if (error) {
      console.error('[Scheduler] Failed to fetch connections:', error);
      return {
        success: false,
        message: '연결 목록 조회 실패',
        jobsQueued: 0,
      };
    }

    if (!connections || connections.length === 0) {
      console.log('[Scheduler] No active connections found');
      return {
        success: true,
        message: '동기화할 연결이 없습니다.',
        jobsQueued: 0,
      };
    }

    // 각 연결에 대해 동기화 작업 큐에 추가
    let jobsQueued = 0;

    for (const connection of connections) {
      const jobData: SyncJobData = {
        userId: connection.user_id,
        platform: connection.platform as PlatformCode,
        connectionId: connection.id,
      };

      const jobId = await queueSyncJob(jobData, {
        // 작업 간 지연을 두어 API 부하 분산
        delay: jobsQueued * 2000, // 2초 간격
      });

      if (jobId) {
        jobsQueued++;
      }
    }

    console.log(`[Scheduler] Queued ${jobsQueued} sync jobs`);

    return {
      success: true,
      message: `${jobsQueued}개 동기화 작업이 큐에 추가되었습니다.`,
      jobsQueued,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    console.error('[Scheduler] Daily sync failed:', errorMessage);

    return {
      success: false,
      message: '일일 동기화 실패',
      jobsQueued: 0,
    };
  }
}

/**
 * 스케줄러 Worker 시작
 */
export function startSchedulerWorker() {
  const worker = createWorker<ScheduledSyncJobData, ScheduledSyncResult>(
    QUEUE_NAMES.SCHEDULED_SYNC,
    async (job) => {
      const data = job.data;

      if (data.type === 'daily_sync') {
        return await processScheduledSync();
      }

      return { success: false, message: '알 수 없는 작업 유형', jobsQueued: 0 };
    }
  );

  if (!worker) {
    console.warn('[Scheduler] Redis 연결이 없어 Worker를 시작할 수 없습니다.');
    return null;
  }

  worker.on('completed', (job, result) => {
    console.log(`[Scheduler] Job ${job.id} completed:`, result);
  });

  worker.on('failed', (job, err) => {
    console.error(`[Scheduler] Job ${job?.id} failed:`, err.message);
  });

  console.log('[Scheduler] Scheduler worker started');

  return worker;
}

/**
 * 일일 동기화 스케줄 설정
 * 매일 새벽 3시(KST)에 실행되도록 반복 작업 추가
 */
export async function setupDailySyncSchedule(): Promise<boolean> {
  const queue = getScheduledSyncQueue();

  if (!queue) {
    console.warn('[Scheduler] Queue가 없어 스케줄을 설정할 수 없습니다.');
    return false;
  }

  // 기존 반복 작업 제거
  const repeatableJobs = await queue.getRepeatableJobs();
  for (const job of repeatableJobs) {
    if (job.name === 'daily_sync') {
      await queue.removeRepeatableByKey(job.key);
    }
  }

  // 새 반복 작업 추가
  // 매일 새벽 3시 (KST = UTC+9, 그러므로 UTC 기준 18:00)
  await queue.add(
    'daily_sync',
    {
      type: 'daily_sync',
      scheduledAt: new Date().toISOString(),
    },
    {
      repeat: {
        pattern: '0 18 * * *', // UTC 18:00 = KST 03:00
      },
    }
  );

  console.log('[Scheduler] Daily sync schedule set for 03:00 KST');

  return true;
}

/**
 * 즉시 일일 동기화 실행 (테스트/수동 실행용)
 */
export async function triggerDailySyncNow(): Promise<string | null> {
  const queue = getScheduledSyncQueue();

  if (!queue) {
    console.warn('[Scheduler] Queue가 없어 동기화를 트리거할 수 없습니다.');
    return null;
  }

  const job = await queue.add('daily_sync', {
    type: 'daily_sync',
    scheduledAt: new Date().toISOString(),
  });

  console.log(`[Scheduler] Triggered daily sync: job ${job.id}`);

  return job.id ?? null;
}
