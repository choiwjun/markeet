import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  checkOnboardingStatus,
  isOnboardingComplete,
  getOnboardingRedirectPath,
} from './onboardingCheck';

// Supabase 클라이언트 모킹
const mockSelect = vi.fn();
const mockEq = vi.fn();

const createMockSupabase = () => ({
  from: vi.fn(() => ({
    select: mockSelect.mockReturnThis(),
    eq: mockEq,
  })),
});

describe('onboardingCheck', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkOnboardingStatus', () => {
    it('연동된 플랫폼이 없으면 온보딩 미완료 상태를 반환한다', async () => {
      const mockSupabase = createMockSupabase();
      mockEq.mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await checkOnboardingStatus(mockSupabase as any, 'user-123');

      expect(result).toEqual({
        isComplete: false,
        platformCount: 0,
        hasActiveConnection: false,
      });
    });

    it('연동된 플랫폼이 있으면 온보딩 완료 상태를 반환한다', async () => {
      const mockSupabase = createMockSupabase();
      mockEq.mockResolvedValue({
        data: [
          { id: 'conn-1', status: 'active' },
          { id: 'conn-2', status: 'expired' },
        ],
        error: null,
      });

      const result = await checkOnboardingStatus(mockSupabase as any, 'user-123');

      expect(result).toEqual({
        isComplete: true,
        platformCount: 2,
        hasActiveConnection: true,
      });
    });

    it('활성 연동이 없으면 hasActiveConnection이 false이다', async () => {
      const mockSupabase = createMockSupabase();
      mockEq.mockResolvedValue({
        data: [{ id: 'conn-1', status: 'expired' }],
        error: null,
      });

      const result = await checkOnboardingStatus(mockSupabase as any, 'user-123');

      expect(result).toEqual({
        isComplete: true,
        platformCount: 1,
        hasActiveConnection: false,
      });
    });

    it('에러 발생 시 기본값을 반환한다', async () => {
      const mockSupabase = createMockSupabase();
      mockEq.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      const result = await checkOnboardingStatus(mockSupabase as any, 'user-123');

      expect(result).toEqual({
        isComplete: false,
        platformCount: 0,
        hasActiveConnection: false,
      });
    });
  });

  describe('isOnboardingComplete', () => {
    it('연동된 플랫폼이 있으면 true를 반환한다', async () => {
      const mockSupabase = createMockSupabase();
      mockEq.mockResolvedValue({
        data: [{ id: 'conn-1', status: 'active' }],
        error: null,
      });

      const result = await isOnboardingComplete(mockSupabase as any, 'user-123');

      expect(result).toBe(true);
    });

    it('연동된 플랫폼이 없으면 false를 반환한다', async () => {
      const mockSupabase = createMockSupabase();
      mockEq.mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await isOnboardingComplete(mockSupabase as any, 'user-123');

      expect(result).toBe(false);
    });
  });

  describe('getOnboardingRedirectPath', () => {
    it('온보딩 완료 후 /onboarding 접근 시 /dashboard를 반환한다', async () => {
      const mockSupabase = createMockSupabase();
      mockEq.mockResolvedValue({
        data: [{ id: 'conn-1', status: 'active' }],
        error: null,
      });

      const result = await getOnboardingRedirectPath(
        mockSupabase as any,
        'user-123',
        '/onboarding'
      );

      expect(result).toBe('/dashboard');
    });

    it('온보딩 미완료 상태에서 /dashboard 접근 시 /onboarding을 반환한다', async () => {
      const mockSupabase = createMockSupabase();
      mockEq.mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await getOnboardingRedirectPath(
        mockSupabase as any,
        'user-123',
        '/dashboard'
      );

      expect(result).toBe('/onboarding');
    });

    it('온보딩 미완료 상태에서 /settings 접근 시 /onboarding을 반환한다', async () => {
      const mockSupabase = createMockSupabase();
      mockEq.mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await getOnboardingRedirectPath(
        mockSupabase as any,
        'user-123',
        '/settings/connections'
      );

      expect(result).toBe('/onboarding');
    });

    it('온보딩 완료 상태에서 /dashboard 접근 시 null을 반환한다', async () => {
      const mockSupabase = createMockSupabase();
      mockEq.mockResolvedValue({
        data: [{ id: 'conn-1', status: 'active' }],
        error: null,
      });

      const result = await getOnboardingRedirectPath(
        mockSupabase as any,
        'user-123',
        '/dashboard'
      );

      expect(result).toBeNull();
    });

    it('온보딩 미완료 상태에서 /onboarding 접근 시 null을 반환한다', async () => {
      const mockSupabase = createMockSupabase();
      mockEq.mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await getOnboardingRedirectPath(
        mockSupabase as any,
        'user-123',
        '/onboarding'
      );

      expect(result).toBeNull();
    });
  });
});
