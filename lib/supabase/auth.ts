import { supabase } from './client';
import type { User, Session, AuthError } from '@supabase/supabase-js';

// 인증 응답 타입
export interface AuthResponse {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}

// 회원가입 데이터 타입
export interface SignUpData {
  email: string;
  password: string;
  name?: string;
}

// 로그인 데이터 타입
export interface SignInData {
  email: string;
  password: string;
}

// 에러 메시지 매핑
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'Invalid login credentials': '이메일 또는 비밀번호가 올바르지 않습니다.',
  'Email not confirmed': '이메일 인증이 필요합니다. 이메일을 확인해주세요.',
  'User already registered': '이미 가입된 이메일입니다.',
  'Password should be at least 6 characters': '비밀번호는 최소 8자 이상이어야 합니다.',
  'Password should be at least 8 characters': '비밀번호는 최소 8자 이상이어야 합니다.',
  'Invalid email': '올바른 이메일 형식이 아닙니다.',
  'Email rate limit exceeded': '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.',
  'Signup requires a valid password': '유효한 비밀번호를 입력해주세요.',
  'Unable to validate email address: invalid format': '올바른 이메일 형식이 아닙니다.',
};

/**
 * Supabase 에러 메시지를 한글로 변환
 */
export function getAuthErrorMessage(error: AuthError | null): string {
  if (!error) return '';

  const message = AUTH_ERROR_MESSAGES[error.message] || error.message;
  return message || '인증 중 오류가 발생했습니다.';
}

/**
 * 이메일/비밀번호로 회원가입
 */
export async function signUp({ email, password, name }: SignUpData): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || null,
        },
      },
    });

    return {
      user: data.user,
      session: data.session,
      error: error,
    };
  } catch (err) {
    const error = err as AuthError;
    return {
      user: null,
      session: null,
      error,
    };
  }
}

/**
 * 이메일/비밀번호로 로그인
 */
export async function signIn({ email, password }: SignInData): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return {
      user: data.user,
      session: data.session,
      error: error,
    };
  } catch (err) {
    const error = err as AuthError;
    return {
      user: null,
      session: null,
      error,
    };
  }
}

/**
 * 로그아웃
 */
export async function signOut(): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (err) {
    const error = err as AuthError;
    return { error };
  }
}

/**
 * 현재 세션 가져오기
 */
export async function getSession(): Promise<Session | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch {
    return null;
  }
}

/**
 * 현재 사용자 가져오기
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

/**
 * 비밀번호 재설정 이메일 전송
 *
 * @param email - 재설정 이메일을 받을 주소
 * @param redirectUrl - 재설정 완료 후 리다이렉트할 URL (선택, 기본값: 환경변수 또는 /reset-password)
 */
export async function resetPassword(
  email: string,
  redirectUrl?: string
): Promise<{ error: AuthError | null }> {
  try {
    // 서버/클라이언트 환경 모두 지원
    const baseUrl = typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || '';

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl || `${baseUrl}/reset-password`,
    });
    return { error };
  } catch (err) {
    const error = err as AuthError;
    return { error };
  }
}

/**
 * 새 비밀번호로 업데이트
 */
export async function updatePassword(newPassword: string): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { error };
  } catch (err) {
    const error = err as AuthError;
    return { error };
  }
}

/**
 * 인증 상태 변경 리스너
 */
export function onAuthStateChange(
  callback: (event: string, session: Session | null) => void
) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}
