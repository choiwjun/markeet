/**
 * 데이터 동기화 Worker
 *
 * BullMQ Worker로 데이터 동기화 작업을 처리합니다.
 */

import { Job } from 'bullmq';
import { createWorker, QUEUE_NAMES } from './config';
import type { PlatformCode } from '@/types/database';

// 동기화 작업 데이터 타입
export interface SyncJobData {
  userId: string;
  platform: PlatformCode;
  connectionId: string;
  startDate?: string;
  endDate?: string;
}

// 동기화 작업 결과 타입
export interface SyncJobResult {
  success: boolean;
  message: string;
  recordCount: number;
  error?: string;
}

/**
 * 동기화 작업 처리 함수
 */
async function processSyncJob(job: Job<SyncJobData>): Promise<SyncJobResult> {
  const { userId, platform, connectionId, startDate, endDate } = job.data;

  console.log(`[SyncWorker] Processing job ${job.id}: user=${userId}, platform=${platform}`);

  try {
    // 동적 import로 syncData 모듈 로드 (순환 참조 방지)
    const { triggerDataSync } = await import('@/lib/platforms/syncData');

    // 동기화 트리거
    await triggerDataSync(userId, platform);

    console.log(`[SyncWorker] Job ${job.id} completed successfully`);

    return {
      success: true,
      message: `${platform} 데이터 동기화 완료`,
      recordCount: 0, // 실제 결과에서 업데이트됨
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    console.error(`[SyncWorker] Job ${job.id} failed:`, errorMessage);

    return {
      success: false,
      message: '데이터 동기화 실패',
      recordCount: 0,
      error: errorMessage,
    };
  }
}

/**
 * 동기화 Worker 시작
 */
export function startSyncWorker() {
  const worker = createWorker<SyncJobData, SyncJobResult>(QUEUE_NAMES.DATA_SYNC, processSyncJob);

  if (!worker) {
    console.warn('[SyncWorker] Redis 연결이 없어 Worker를 시작할 수 없습니다.');
    return null;
  }

  worker.on('completed', (job) => {
    console.log(`[SyncWorker] Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[SyncWorker] Job ${job?.id} failed:`, err.message);
  });

  worker.on('error', (err) => {
    console.error('[SyncWorker] Worker error:', err.message);
  });

  console.log('[SyncWorker] Worker started');

  return worker;
}

/**
 * 동기화 작업 큐에 추가
 */
export async function queueSyncJob(
  data: SyncJobData,
  options?: { delay?: number; priority?: number }
): Promise<string | null> {
  const { getDataSyncQueue } = await import('./config');
  const queue = getDataSyncQueue();

  if (!queue) {
    console.warn('[SyncWorker] Queue가 없어 작업을 추가할 수 없습니다.');
    return null;
  }

  const job = await queue.add('sync', data, {
    delay: options?.delay,
    priority: options?.priority,
  });

  console.log(`[SyncWorker] Job ${job.id} queued: platform=${data.platform}`);

  return job.id ?? null;
}

/**
 * 대량 동기화 작업 큐에 추가
 */
export async function queueBulkSyncJobs(
  jobs: SyncJobData[]
): Promise<(string | null)[]> {
  const results = await Promise.all(
    jobs.map((data, index) =>
      queueSyncJob(data, { delay: index * 1000 }) // 1초 간격으로 지연
    )
  );

  return results;
}
