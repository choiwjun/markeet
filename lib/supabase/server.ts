import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

/**
 * 서버 사이드 Supabase 클라이언트 생성 (RLS 적용)
 * - Anon Key 사용 (RLS 정책 준수)
 * - 일반 사용자 요청에서 사용
 * - 서버 컴포넌트, API 라우트, 서버 액션에서 사용
 */
export const createClient = async () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL is not defined. Check your .env.local file.'
    );
  }

  if (!supabaseAnonKey) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined. Check your .env.local file.'
    );
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch (error) {
          // Server Component에서 쿠키 설정 시도 시 발생하는 에러는 무시
          if (process.env.NODE_ENV === 'development') {
            const errorMessage =
              error instanceof Error ? error.message : 'Unknown error';
            if (!errorMessage.includes('cookies')) {
              console.warn('[Supabase Server] Cookie set failed:', errorMessage);
            }
          }
        }
      },
    },
  });
};

/**
 * 관리자용 Supabase 클라이언트 생성 (RLS 우회)
 * - Service Role Key 사용 (RLS 우회)
 * - 백그라운드 작업, 관리자 작업에서만 사용
 * - ⚠️ 주의: user_id 필터를 반드시 적용해야 함
 */
export const createAdminClient = async () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL is not defined. Check your .env.local file.'
    );
  }

  if (!serviceRoleKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not defined. Check your .env.local file. ' +
        'WARNING: Never expose this key to the client.'
    );
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl, serviceRoleKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            const errorMessage =
              error instanceof Error ? error.message : 'Unknown error';
            if (!errorMessage.includes('cookies')) {
              console.warn('[Supabase Admin] Cookie set failed:', errorMessage);
            }
          }
        }
      },
    },
  });
};
