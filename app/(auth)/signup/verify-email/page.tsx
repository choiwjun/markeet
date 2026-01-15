'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, ArrowLeft, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { resendVerificationEmail, getAuthErrorMessage } from '@/lib/supabase/auth';

// 재발송 쿨다운 시간 (초)
const RESEND_COOLDOWN = 60;

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const emailFromUrl = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailFromUrl);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // 쿨다운 타이머
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // 이메일 재발송 핸들러
  const handleResend = async () => {
    if (!email || cooldown > 0 || isResending) return;

    setIsResending(true);
    setResendError(null);
    setResendSuccess(false);

    try {
      const { error } = await resendVerificationEmail(email);

      if (error) {
        setResendError(getAuthErrorMessage(error));
      } else {
        setResendSuccess(true);
        setCooldown(RESEND_COOLDOWN);
      }
    } catch {
      setResendError('이메일 재발송 중 오류가 발생했습니다.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft p-8">
          {/* 아이콘 */}
          <div className="mx-auto w-16 h-16 bg-primary-50 dark:bg-primary-500/10 rounded-full flex items-center justify-center mb-6">
            <Mail className="w-8 h-8 text-primary" aria-hidden="true" />
          </div>

          {/* 제목 */}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            이메일을 확인해주세요
          </h1>

          {/* 설명 */}
          <p className="text-gray-600 dark:text-slate-400 mb-6">
            회원가입을 완료하기 위해 이메일로 발송된 인증 링크를 클릭해주세요.
            <br />
            <span className="text-sm text-gray-500 dark:text-slate-500 mt-2 block">
              이메일이 보이지 않으면 스팸 폴더를 확인해주세요.
            </span>
          </p>

          {/* 성공/에러 메시지 */}
          {resendSuccess && (
            <div
              className="mb-6 p-4 bg-success-50 dark:bg-success-500/10 border border-success-200 dark:border-success-500/20 rounded-lg text-sm text-success-700 dark:text-success-400 flex items-start gap-3"
              role="alert"
            >
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>인증 이메일이 재발송되었습니다. 이메일을 확인해주세요.</span>
            </div>
          )}

          {resendError && (
            <div
              className="mb-6 p-4 bg-danger-50 dark:bg-danger-500/10 border border-danger-200 dark:border-danger-500/20 rounded-lg text-sm text-danger-700 dark:text-danger-400 flex items-start gap-3"
              role="alert"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{resendError}</span>
            </div>
          )}

          {/* 이메일 재발송 섹션 */}
          <div className="bg-gray-50 dark:bg-slate-900/50 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              인증 이메일을 받지 못하셨나요?
            </p>

            {!emailFromUrl && (
              <div className="mb-3">
                <Input
                  type="email"
                  placeholder="이메일 주소를 입력하세요"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail className="w-5 h-5" />}
                />
              </div>
            )}

            {emailFromUrl && (
              <p className="text-sm text-gray-600 dark:text-slate-400 mb-3">
                발송 이메일: <span className="font-medium text-gray-900 dark:text-white">{emailFromUrl}</span>
              </p>
            )}

            <Button
              variant="outline"
              fullWidth
              onClick={handleResend}
              disabled={!email || cooldown > 0 || isResending}
              loading={isResending}
            >
              {cooldown > 0 ? (
                `재발송 가능 (${cooldown}초)`
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
                  인증 이메일 재발송
                </>
              )}
            </Button>
          </div>

          {/* 안내 사항 */}
          <div className="bg-gray-50 dark:bg-slate-900/50 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-gray-600 dark:text-slate-400">
              <strong className="text-gray-900 dark:text-white">다음 단계:</strong>
            </p>
            <ol className="text-sm text-gray-600 dark:text-slate-400 mt-2 space-y-1 list-decimal list-inside">
              <li>이메일 수신함을 확인하세요</li>
              <li>마케트에서 보낸 인증 메일을 열어주세요</li>
              <li>인증 링크를 클릭하면 가입이 완료됩니다</li>
            </ol>
          </div>

          {/* 버튼 */}
          <div className="space-y-3">
            <Link href="/login" className="block">
              <Button variant="primary" fullWidth>
                로그인 페이지로 이동
              </Button>
            </Link>
            <Link href="/" className="block">
              <Button variant="ghost" fullWidth>
                <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
                홈으로 돌아가기
              </Button>
            </Link>
          </div>
        </div>

        {/* 도움말 */}
        <p className="mt-6 text-sm text-gray-500 dark:text-slate-500">
          문제가 있으신가요?{' '}
          <a href="mailto:support@markeet.io" className="text-primary hover:underline">
            고객센터에 문의하세요
          </a>
        </p>
      </div>
    </div>
  );
}
