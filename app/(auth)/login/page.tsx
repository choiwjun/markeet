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
      const result = await signIn({
        email: data.email,
        password: data.password,
      });

      if (result.error) {
        setError(getAuthErrorMessage(result.error));
        return;
      }

      // 로그인 성공 시 대시보드로 이동
      router.push('/dashboard');
    } catch {
      setError('로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return <LoginForm onSubmit={handleLogin} isLoading={isLoading} error={error} />;
}
