'use client';

import { useState } from 'react';
import { ForgotPasswordForm, ForgotPasswordFormData } from '@/components/auth/ForgotPasswordForm';
import { resetPassword, getAuthErrorMessage } from '@/lib/supabase/auth';

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successEmail, setSuccessEmail] = useState('');

  const handleForgotPassword = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await resetPassword(data.email);

      if (result.error) {
        setError(getAuthErrorMessage(result.error));
        setIsLoading(false);
        return;
      }

      // 이메일 전송 성공
      setSuccessEmail(data.email);
      setIsSuccess(true);
      setIsLoading(false);
    } catch {
      setError('비밀번호 재설정 이메일 전송 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      setIsLoading(false);
    }
  };

  return <ForgotPasswordForm onSubmit={handleForgotPassword} isLoading={isLoading} error={error} isSuccess={isSuccess} successEmail={successEmail} />;
}
