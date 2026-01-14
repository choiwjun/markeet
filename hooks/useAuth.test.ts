import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Next.js router 모킹
const mockPush = vi.fn();
const mockReplace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: vi.fn(),
  }),
}));

// Auth 함수 모킹
const mockGetCurrentUser = vi.fn();
const mockGetSession = vi.fn();
const mockSignOut = vi.fn();
const mockSubscription = { unsubscribe: vi.fn() };
const mockOnAuthStateChange = vi.fn(() => ({
  data: { subscription: mockSubscription },
}));

vi.mock('@/lib/supabase/auth', () => ({
  getCurrentUser: () => mockGetCurrentUser(),
  getSession: () => mockGetSession(),
  signOut: () => mockSignOut(),
  onAuthStateChange: () => mockOnAuthStateChange(),
}));

import { useAuth, useRequireAuth } from './useAuth';

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  // 초기 상태 테스트
  describe('초기 상태', () => {
    it('초기에 isLoading이 true이다', () => {
      mockGetCurrentUser.mockResolvedValue(null);
      mockGetSession.mockResolvedValue(null);

      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(true);
    });

    it('초기 로드 후 isLoading이 false가 된다', async () => {
      mockGetCurrentUser.mockResolvedValue(null);
      mockGetSession.mockResolvedValue(null);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  // 로그인 상태 테스트
  describe('로그인 상태', () => {
    it('로그인 상태에서 사용자 정보를 반환한다', async () => {
      const mockUser = { id: '123', email: 'test@example.com' };
      const mockSession = { access_token: 'token123' };

      mockGetCurrentUser.mockResolvedValue(mockUser);
      mockGetSession.mockResolvedValue(mockSession);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.session).toEqual(mockSession);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('비로그인 상태에서 user가 null이다', async () => {
      mockGetCurrentUser.mockResolvedValue(null);
      mockGetSession.mockResolvedValue(null);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  // 로그아웃 테스트
  describe('signOut', () => {
    it('로그아웃 시 세션을 제거하고 로그인 페이지로 이동한다', async () => {
      const mockUser = { id: '123', email: 'test@example.com' };
      const mockSession = { access_token: 'token123' };

      mockGetCurrentUser.mockResolvedValue(mockUser);
      mockGetSession.mockResolvedValue(mockSession);
      mockSignOut.mockResolvedValue({ error: null });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.signOut();
      });

      expect(mockSignOut).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/login');
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  // refreshUser 테스트
  describe('refreshUser', () => {
    it('refreshUser를 호출하면 사용자 정보를 다시 로드한다', async () => {
      const mockUser = { id: '123', email: 'test@example.com' };
      const mockSession = { access_token: 'token123' };

      mockGetCurrentUser.mockResolvedValue(null);
      mockGetSession.mockResolvedValue(null);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // 사용자 정보 변경
      mockGetCurrentUser.mockResolvedValue(mockUser);
      mockGetSession.mockResolvedValue(mockSession);

      await act(async () => {
        await result.current.refreshUser();
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  // 인증 상태 변경 구독 테스트
  describe('인증 상태 변경 구독', () => {
    it('마운트 시 onAuthStateChange를 구독한다', async () => {
      mockGetCurrentUser.mockResolvedValue(null);
      mockGetSession.mockResolvedValue(null);

      renderHook(() => useAuth());

      expect(mockOnAuthStateChange).toHaveBeenCalled();
    });

    it('언마운트 시 구독을 해제한다', async () => {
      mockGetCurrentUser.mockResolvedValue(null);
      mockGetSession.mockResolvedValue(null);

      const { unmount } = renderHook(() => useAuth());

      unmount();

      expect(mockSubscription.unsubscribe).toHaveBeenCalled();
    });
  });
});

describe('useRequireAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('비인증 상태에서 로그인 페이지로 리다이렉트한다', async () => {
    mockGetCurrentUser.mockResolvedValue(null);
    mockGetSession.mockResolvedValue(null);

    renderHook(() => useRequireAuth());

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/login');
    });
  });

  it('인증 상태에서 리다이렉트하지 않는다', async () => {
    const mockUser = { id: '123', email: 'test@example.com' };
    const mockSession = { access_token: 'token123' };

    mockGetCurrentUser.mockResolvedValue(mockUser);
    mockGetSession.mockResolvedValue(mockSession);

    const { result } = renderHook(() => useRequireAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockReplace).not.toHaveBeenCalled();
    expect(result.current.isAuthenticated).toBe(true);
  });
});
