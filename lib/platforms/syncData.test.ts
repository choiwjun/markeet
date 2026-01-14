import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  triggerDataSync,
  getSyncJobStatus,
  triggerFullSync,
  getUserSyncJobs,
} from './syncData';

// 모킹 함수들
let mockSingleResult: { data: unknown; error: unknown } = { data: null, error: null };
let mockLimitResult: { data: unknown; error: unknown } = { data: null, error: null };

// 체이닝 함수 모킹
const mockSingle = vi.fn(() => Promise.resolve(mockSingleResult));
const mockLimit = vi.fn(() => Promise.resolve(mockLimitResult));
const mockOrder = vi.fn(() => ({ limit: mockLimit }));
const mockSelect = vi.fn(() => ({ single: mockSingle, eq: mockEq, order: mockOrder }));
const mockEq = vi.fn(() => ({ single: mockSingle, order: mockOrder }));
const mockUpdate = vi.fn(() => ({ eq: mockEq }));
const mockInsert = vi.fn(() => ({ select: mockSelect }));

const mockSupabaseClient = {
  from: vi.fn(() => ({
    insert: mockInsert,
    update: mockUpdate,
    select: mockSelect,
  })),
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabaseClient)),
}));

describe('syncData', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'test');
    vi.clearAllMocks();

    // 기본 성공 응답 설정
    mockSingleResult = { data: { id: 'test-job-id-123' }, error: null };
    mockLimitResult = { data: [], error: null };
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('triggerDataSync', () => {
    it('동기화 작업 ID를 반환해야 함', async () => {
      mockSingleResult = { data: { id: 'new-job-id-456' }, error: null };

      const jobId = await triggerDataSync('user-123', 'naver');

      expect(jobId).toBe('new-job-id-456');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('sync_jobs');
      expect(mockInsert).toHaveBeenCalled();
    });

    it('DB 에러 시 예외를 발생시켜야 함', async () => {
      mockSingleResult = { data: null, error: { message: 'DB error' } };

      await expect(triggerDataSync('user-123', 'google')).rejects.toThrow(
        '동기화 작업 생성에 실패했습니다.'
      );
    });
  });

  describe('getSyncJobStatus', () => {
    it('존재하지 않는 작업에 대해 null을 반환해야 함', async () => {
      mockSingleResult = { data: null, error: { message: 'Not found' } };

      const status = await getSyncJobStatus('non-existent-job-id');
      expect(status).toBeNull();
    });

    it('유효한 작업 ID에 대해 상태를 반환해야 함', async () => {
      mockSingleResult = {
        data: {
          status: 'completed',
          result: { success: true, message: '완료' },
        },
        error: null,
      };

      const status = await getSyncJobStatus('valid-job-id');
      expect(status).not.toBeNull();
      expect(status?.status).toBe('completed');
      expect(status?.result?.success).toBe(true);
    });
  });

  describe('triggerFullSync', () => {
    it('여러 플랫폼에 대해 동기화를 트리거해야 함', async () => {
      let callCount = 0;
      mockSingle.mockImplementation(() => {
        callCount++;
        return Promise.resolve({
          data: { id: `job-${callCount}` },
          error: null,
        });
      });

      const platforms = ['naver', 'google', 'meta'] as const;
      const jobIds = await triggerFullSync('user-789', [...platforms]);

      expect(jobIds).toHaveLength(3);
      jobIds.forEach(jobId => {
        expect(typeof jobId).toBe('string');
      });
    });

    it('빈 플랫폼 목록에 대해 빈 배열을 반환해야 함', async () => {
      const jobIds = await triggerFullSync('user-000', []);
      expect(jobIds).toHaveLength(0);
    });
  });

  describe('getUserSyncJobs', () => {
    it('사용자의 동기화 작업 목록을 반환해야 함', async () => {
      const mockJobs = [
        { id: 'job-1', platform: 'naver', status: 'completed' },
        { id: 'job-2', platform: 'google', status: 'running' },
      ];
      mockLimitResult = { data: mockJobs, error: null };

      const jobs = await getUserSyncJobs('user-123', 10);

      expect(jobs).toHaveLength(2);
      expect(jobs[0].id).toBe('job-1');
    });

    it('에러 발생 시 빈 배열을 반환해야 함', async () => {
      mockLimitResult = { data: null, error: { message: 'DB error' } };

      const jobs = await getUserSyncJobs('user-123', 10);
      expect(jobs).toHaveLength(0);
    });
  });
});
