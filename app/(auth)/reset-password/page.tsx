'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ResetPasswordForm, ResetPasswordFormData } from '@/components/auth/ResetPasswordForm';
import { updatePassword, getAuthErrorMessage } from '@/lib/supabase/auth';
import { supabase } from '@/lib/supabase/client';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

/**
 * 비밀번호 재설정 완료 페이지
 * TASK-703: 이메일 링크 클릭 후 새 비밀번호 입력
 *
 * Supabase는 이메일 링크에 토큰을 포함하여 자동으로 세션을 복구합니다.
 */
export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // 토큰 유효성 검사 (페이지 로드 시)
  useEffect(() => {
    const validateToken = async () => {
      setIsValidating(true);

      try {
        // URL에서 에러 확인
        const errorParam = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        if (errorParam) {
          setError(errorDescription || '유효하지 않은 링크입니다.');
          setIsValidToken(false);
          setIsValidating(false);
          return;
        }

        // Supabase는 URL의 토큰으로 자동 세션 복구를 시도합니다
        // onAuthStateChange로 PASSWORD_RECOVERY 이벤트를 감지합니다
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          setIsValidToken(true);
        } else {
          // 세션이 없으면 토큰이 유효하지 않거나 만료됨
          setError('링크가 만료되었거나 유효하지 않습니다. 비밀번호 찾기를 다시 시도해주세요.');
          setIsValidToken(false);
        }
      } catch {
        setError('토큰 검증 중 오류가 발생했습니다.');
        setIsValidToken(false);
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [searchParams]);

  // 비밀번호 변경 핸들러
  const handleResetPassword = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await updatePassword(data.password);

      if (result.error) {
        setError(getAuthErrorMessage(result.error));
        setIsLoading(false);
        return;
      }

      // 비밀번호 변경 성공
      setIsSuccess(true);
      setIsLoading(false);

      // 3초 후 로그인 페이지로 리다이렉트
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch {
      setError('비밀번호 변경 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      setIsLoading(false);
    }
  };

  // 로딩 중 (토큰 검증)
  if (isValidating) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          링크 유효성 확인 중...
        </p>
      </div>
    );
  }

  // 유효하지 않은 토큰
  if (!isValidToken) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-6 bg-danger-50 dark:bg-danger-500/10 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-danger-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          링크가 유효하지 않습니다
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
          {error || '비밀번호 재설정 링크가 만료되었거나 이미 사용되었습니다.'}
        </p>
        <div className="space-y-3">
          <Link href="/forgot-password">
            <Button fullWidth>비밀번호 찾기 다시하기</Button>
          </Link>
          <Link href="/login">
            <Button variant="ghost" fullWidth>
              로그인으로 돌아가기
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // 유효한 토큰 - 비밀번호 재설정 폼 표시
  return (
    <ResetPasswordForm
      onSubmit={handleResetPassword}
      isLoading={isLoading}
      error={error}
      isSuccess={isSuccess}
    />
  );
}
