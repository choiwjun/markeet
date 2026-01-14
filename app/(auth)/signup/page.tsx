'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SignUpForm, SignUpFormData } from '@/components/auth/SignUpForm';
import { signUp, getAuthErrorMessage } from '@/lib/supabase/auth';

export default function SignUpPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async (data: SignUpFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signUp({
        email: data.email,
        password: data.password,
        name: data.name,
      });

      if (result.error) {
        setError(getAuthErrorMessage(result.error));
        return;
      }

      // 이메일 인증이 필요한 경우
      if (result.user && !result.session) {
        router.push('/signup/verify-email');
        return;
      }

      // 회원가입 성공 시 온보딩 페이지로 이동
      router.push('/onboarding');
    } catch {
      setError('회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return <SignUpForm onSubmit={handleSignUp} isLoading={isLoading} error={error} />;
}
