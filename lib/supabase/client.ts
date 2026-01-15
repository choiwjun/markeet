import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabaseInstance: SupabaseClient<Database> | null = null;

/**
 * Supabase 브라우저 클라이언트를 가져옵니다.
 * 쿠키 기반 세션 관리를 지원합니다.
 */
export function getSupabaseClient(): SupabaseClient<Database> {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be defined');
  }

  if (!supabaseInstance) {
    supabaseInstance = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
  }

  return supabaseInstance;
}

// 기존 코드와의 호환성을 위해 lazy 초기화된 getter 제공
export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get(_target, prop) {
    return getSupabaseClient()[prop as keyof SupabaseClient<Database>];
  },
});
