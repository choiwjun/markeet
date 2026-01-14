import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

/**
 * 서버 사이드 Supabase 클라이언트 생성
 * - Service Role Key 사용 (RLS 우회 가능)
 * - 서버 컴포넌트, API 라우트, 서버 액션에서만 사용
 */
export const createClient = async () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // 환경 변수 검증
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
          // Server Component에서 쿠키 설정 시도 시 발생하는 에러는 무시
          // (Server Component에서는 쿠키를 설정할 수 없음)
          // 그 외 에러는 개발 환경에서 로깅
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
