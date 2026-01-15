'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm, LoginFormData } from '@/components/auth/LoginForm';
import { signIn, getAuthErrorMessage } from '@/lib/supabase/auth';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('[Login] Attempting sign in...');
      const result = await signIn({
        email: data.email,
        password: data.password,
      });
      console.log('[Login] Sign in result:', { user: result.user?.email, error: result.error?.message });

      if (result.error) {
        setError(getAuthErrorMessage(result.error));
        setIsLoading(false);
        return;
      }

      // 로그인 성공 시 대시보드로 이동 (하드 네비게이션으로 쿠키 반영)
      console.log('[Login] Success! Redirecting to dashboard...');
      window.location.href = '/dashboard';
    } catch (err) {
      console.error('[Login] Unexpected error:', err);
      setError('로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      setIsLoading(false);
    }
  };

  return <LoginForm onSubmit={handleLogin} isLoading={isLoading} error={error} />;
}
