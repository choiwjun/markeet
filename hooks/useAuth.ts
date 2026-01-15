'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { User, Session } from '@supabase/supabase-js';
import {
  getCurrentUser,
  getSession,
  signOut as authSignOut,
  onAuthStateChange
} from '@/lib/supabase/auth';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  sessionExpired: boolean;
}

interface UseAuthReturn extends AuthState {
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearSessionExpired: () => void;
}

/**
 * 인증 상태 관리 커스텀 훅
 *
 * 현재 사용자 세션 상태를 관리하고,
 * 인증 상태 변경을 감지하여 자동으로 상태를 업데이트합니다.
 *
 * @example
 * ```tsx
 * const { user, isAuthenticated, isLoading, signOut } = useAuth();
 *
 * if (isLoading) return <Loading />;
 * if (!isAuthenticated) return <Redirect to="/login" />;
 *
 * return <Dashboard user={user} />;
 * ```
 */
export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
    sessionExpired: false,
  });

  // 사용자 정보 새로고침
  const refreshUser = useCallback(async () => {
    try {
      const [user, session] = await Promise.all([
        getCurrentUser(),
        getSession(),
      ]);

      setState(prev => ({
        user,
        session,
        isLoading: false,
        isAuthenticated: !!user && !!session,
        sessionExpired: prev.sessionExpired,
      }));
    } catch {
      setState(prev => ({
        user: null,
        session: null,
        isLoading: false,
        isAuthenticated: false,
        sessionExpired: prev.sessionExpired,
      }));
    }
  }, []);

  // 로그아웃
  const signOut = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      await authSignOut();
      setState({
        user: null,
        session: null,
        isLoading: false,
        isAuthenticated: false,
        sessionExpired: false,
      });
      router.push('/login');
    } catch {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [router]);

  // 세션 만료 상태 초기화
  const clearSessionExpired = useCallback(() => {
    setState(prev => ({ ...prev, sessionExpired: false }));
  }, []);

  // 초기화 및 인증 상태 변경 감지
  useEffect(() => {
    // 초기 세션 로드
    refreshUser();

    // 인증 상태 변경 구독
    const { data: { subscription } } = onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setState({
          user: session?.user ?? null,
          session,
          isLoading: false,
          isAuthenticated: !!session?.user,
          sessionExpired: false,
        });
      } else if (event === 'SIGNED_OUT') {
        setState(prev => ({
          user: null,
          session: null,
          isLoading: false,
          isAuthenticated: false,
          // 이전에 인증된 상태였다면 세션 만료로 간주
          sessionExpired: prev.isAuthenticated,
        }));
      } else if (event === 'TOKEN_REFRESHED') {
        setState(prev => ({
          ...prev,
          session,
          sessionExpired: false,
        }));
      } else if (event === 'USER_UPDATED') {
        setState(prev => ({
          ...prev,
          user: session?.user ?? null,
          session,
        }));
      }
    });

    // 클린업
    return () => {
      subscription.unsubscribe();
    };
  }, [refreshUser]);

  return {
    ...state,
    signOut,
    refreshUser,
    clearSessionExpired,
  };
}

/**
 * 인증이 필요한 페이지에서 사용하는 훅
 * 비인증 사용자는 로그인 페이지로 리다이렉트
 *
 * @example
 * ```tsx
 * const { user, isLoading } = useRequireAuth();
 *
 * if (isLoading) return <Loading />;
 *
 * return <ProtectedContent user={user} />;
 * ```
 */
export function useRequireAuth(): UseAuthReturn {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      router.replace('/login');
    }
  }, [auth.isLoading, auth.isAuthenticated, router]);

  return auth;
}
