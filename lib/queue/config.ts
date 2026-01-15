/**
 * BullMQ 작업 큐 설정
 *
 * Upstash Redis를 사용한 작업 큐 구성
 */

import { Queue, Worker, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';

// Redis 연결 설정
function getRedisConnection(): IORedis | null {
  const redisUrl = process.env.UPSTASH_REDIS_URL;

  if (!redisUrl) {
    console.warn('[Queue] UPSTASH_REDIS_URL이 설정되지 않았습니다. 작업 큐가 비활성화됩니다.');
    return null;
  }

  return new IORedis(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    tls: redisUrl.startsWith('rediss://') ? {} : undefined,
  });
}

// 작업 큐 이름
export const QUEUE_NAMES = {
  DATA_SYNC: 'data-sync',
  SCHEDULED_SYNC: 'scheduled-sync',
} as const;

// 작업 큐 인스턴스
let dataSyncQueue: Queue | null = null;
let scheduledSyncQueue: Queue | null = null;

/**
 * 데이터 동기화 큐 가져오기
 */
export function getDataSyncQueue(): Queue | null {
  if (!dataSyncQueue) {
    const connection = getRedisConnection();
    if (!connection) return null;

    dataSyncQueue = new Queue(QUEUE_NAMES.DATA_SYNC, {
      connection,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 60000, // 1분부터 시작
        },
        removeOnComplete: {
          age: 24 * 3600, // 24시간 후 완료된 작업 삭제
          count: 100,
        },
        removeOnFail: {
          age: 7 * 24 * 3600, // 7일 후 실패한 작업 삭제
        },
      },
    });
  }

  return dataSyncQueue;
}

/**
 * 스케줄된 동기화 큐 가져오기
 */
export function getScheduledSyncQueue(): Queue | null {
  if (!scheduledSyncQueue) {
    const connection = getRedisConnection();
    if (!connection) return null;

    scheduledSyncQueue = new Queue(QUEUE_NAMES.SCHEDULED_SYNC, {
      connection,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 60000,
        },
        removeOnComplete: {
          age: 24 * 3600,
          count: 50,
        },
        removeOnFail: {
          age: 7 * 24 * 3600,
        },
      },
    });
  }

  return scheduledSyncQueue;
}

/**
 * 큐 이벤트 리스너 생성
 */
export function createQueueEvents(queueName: string): QueueEvents | null {
  const connection = getRedisConnection();
  if (!connection) return null;

  return new QueueEvents(queueName, { connection });
}

/**
 * Worker 생성 헬퍼
 */
export function createWorker<T = unknown, R = unknown>(
  queueName: string,
  processor: (job: import('bullmq').Job<T>) => Promise<R>,
  options?: Omit<import('bullmq').WorkerOptions, 'connection'>
): Worker<T, R> | null {
  const connection = getRedisConnection();
  if (!connection) return null;

  const workerOptions: import('bullmq').WorkerOptions = {
    connection,
    concurrency: 5, // 동시 처리 작업 수
    ...(options || {}),
  };

  return new Worker<T, R>(queueName, processor, workerOptions);
}

/**
 * 모든 큐 연결 종료
 */
export async function closeAllQueues(): Promise<void> {
  const queues = [dataSyncQueue, scheduledSyncQueue].filter(Boolean) as Queue[];

  await Promise.all(queues.map(q => q.close()));

  dataSyncQueue = null;
  scheduledSyncQueue = null;
}
