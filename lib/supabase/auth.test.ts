import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getAuthErrorMessage,
  signUp,
  signIn,
  signOut,
  getSession,
  getCurrentUser
} from './auth';
import { supabase } from './client';

// Supabase 클라이언트 모킹
vi.mock('./client', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      getUser: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
  },
}));

describe('auth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 에러 메시지 변환 테스트
  describe('getAuthErrorMessage', () => {
    it('null 에러에 대해 빈 문자열을 반환한다', () => {
      expect(getAuthErrorMessage(null)).toBe('');
    });

    it('Invalid login credentials를 한글로 변환한다', () => {
      const error = { message: 'Invalid login credentials' } as any;
      expect(getAuthErrorMessage(error)).toBe('이메일 또는 비밀번호가 올바르지 않습니다.');
    });

    it('User already registered를 한글로 변환한다', () => {
      const error = { message: 'User already registered' } as any;
      expect(getAuthErrorMessage(error)).toBe('이미 가입된 이메일입니다.');
    });

    it('Email not confirmed를 한글로 변환한다', () => {
      const error = { message: 'Email not confirmed' } as any;
      expect(getAuthErrorMessage(error)).toBe('이메일 인증이 필요합니다. 이메일을 확인해주세요.');
    });

    it('알 수 없는 에러는 원본 메시지를 반환한다', () => {
      const error = { message: 'Unknown error message' } as any;
      expect(getAuthErrorMessage(error)).toBe('Unknown error message');
    });
  });

  // 회원가입 테스트
  describe('signUp', () => {
    it('유효한 정보로 회원가입 시 성공 응답을 반환한다', async () => {
      const mockUser = { id: '123', email: 'test@example.com' };
      const mockSession = { access_token: 'token123' };

      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      } as any);

      const result = await signUp({
        email: 'test@example.com',
        password: 'Password123',
        name: '테스트',
      });

      expect(result.user).toEqual(mockUser);
      expect(result.session).toEqual(mockSession);
      expect(result.error).toBeNull();
    });

    it('회원가입 실패 시 에러를 반환한다', async () => {
      const mockError = { message: 'User already registered' };

      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: null, session: null },
        error: mockError,
      } as any);

      const result = await signUp({
        email: 'test@example.com',
        password: 'Password123',
      });

      expect(result.user).toBeNull();
      expect(result.session).toBeNull();
      expect(result.error).toEqual(mockError);
    });

    it('이름 없이 회원가입할 수 있다', async () => {
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: { id: '123' }, session: null },
        error: null,
      } as any);

      await signUp({
        email: 'test@example.com',
        password: 'Password123',
      });

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password123',
        options: {
          data: {
            name: null,
          },
        },
      });
    });
  });

  // 로그인 테스트
  describe('signIn', () => {
    it('유효한 자격증명으로 로그인 시 세션을 생성한다', async () => {
      const mockUser = { id: '123', email: 'test@example.com' };
      const mockSession = { access_token: 'token123' };

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      } as any);

      const result = await signIn({
        email: 'test@example.com',
        password: 'Password123',
      });

      expect(result.user).toEqual(mockUser);
      expect(result.session).toEqual(mockSession);
      expect(result.error).toBeNull();
    });

    it('잘못된 자격증명으로 로그인 시 에러를 반환한다', async () => {
      const mockError = { message: 'Invalid login credentials' };

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: mockError,
      } as any);

      const result = await signIn({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      expect(result.user).toBeNull();
      expect(result.session).toBeNull();
      expect(result.error).toEqual(mockError);
    });
  });

  // 로그아웃 테스트
  describe('signOut', () => {
    it('로그아웃 시 세션을 제거한다', async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValue({
        error: null,
      } as any);

      const result = await signOut();

      expect(result.error).toBeNull();
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });

    it('로그아웃 실패 시 에러를 반환한다', async () => {
      const mockError = { message: 'Signout failed' };

      vi.mocked(supabase.auth.signOut).mockResolvedValue({
        error: mockError,
      } as any);

      const result = await signOut();

      expect(result.error).toEqual(mockError);
    });
  });

  // 세션 가져오기 테스트
  describe('getSession', () => {
    it('세션이 있으면 세션을 반환한다', async () => {
      const mockSession = { access_token: 'token123' };

      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      } as any);

      const result = await getSession();

      expect(result).toEqual(mockSession);
    });

    it('세션이 없으면 null을 반환한다', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      } as any);

      const result = await getSession();

      expect(result).toBeNull();
    });

    it('에러 발생 시 null을 반환한다', async () => {
      vi.mocked(supabase.auth.getSession).mockRejectedValue(new Error('Error'));

      const result = await getSession();

      expect(result).toBeNull();
    });
  });

  // 현재 사용자 가져오기 테스트
  describe('getCurrentUser', () => {
    it('로그인 상태에서 사용자 정보를 반환한다', async () => {
      const mockUser = { id: '123', email: 'test@example.com' };

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      } as any);

      const result = await getCurrentUser();

      expect(result).toEqual(mockUser);
    });

    it('비로그인 상태에서 null을 반환한다', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null,
      } as any);

      const result = await getCurrentUser();

      expect(result).toBeNull();
    });

    it('에러 발생 시 null을 반환한다', async () => {
      vi.mocked(supabase.auth.getUser).mockRejectedValue(new Error('Error'));

      const result = await getCurrentUser();

      expect(result).toBeNull();
    });
  });
});
