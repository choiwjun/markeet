'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { EMAIL_REGEX } from '@/lib/utils/validation';

interface ForgotPasswordFormProps {
  onSubmit?: (data: ForgotPasswordFormData) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  isSuccess?: boolean;
  successEmail?: string;
}

export interface ForgotPasswordFormData {
  email: string;
}

interface FormErrors {
  email?: string;
}

// 스타일 상수
const FORM_STYLES = 'space-y-5';

const HEADER_STYLES = 'text-center mb-8';
const TITLE_STYLES = 'text-2xl font-bold text-slate-900 dark:text-white mb-2';
const SUBTITLE_STYLES = 'text-sm text-slate-500 dark:text-slate-400';

const BACK_LINK_STYLES = [
  'inline-flex items-center gap-2',
  'text-sm text-slate-600 dark:text-slate-400',
  'hover:text-slate-900 dark:hover:text-white',
  'transition-colors',
  'mb-6',
].join(' ');

const LINK_STYLES = [
  'text-sm text-primary-600 dark:text-primary-400',
  'hover:text-primary-700 dark:hover:text-primary-300',
  'font-medium',
  'transition-colors',
].join(' ');

const FOOTER_STYLES = [
  'mt-6 pt-6',
  'border-t border-slate-200 dark:border-slate-700',
  'text-center',
].join(' ');

const ERROR_ALERT_STYLES = [
  'mb-6 p-4',
  'bg-danger-50 dark:bg-danger-500/10',
  'border border-danger-200 dark:border-danger-500/20',
  'rounded-lg',
  'text-sm text-danger-700 dark:text-danger-400',
  'flex items-start gap-3',
].join(' ');

const SUCCESS_ALERT_STYLES = [
  'mb-6 p-4',
  'bg-success-50 dark:bg-success-500/10',
  'border border-success-200 dark:border-success-500/20',
  'rounded-lg',
  'text-sm text-success-700 dark:text-success-400',
  'flex items-start gap-3',
].join(' ');

export function ForgotPasswordForm({ onSubmit, isLoading = false, error, isSuccess = false, successEmail = '' }: ForgotPasswordFormProps) {
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // 필드 유효성 검사
  const validateField = (name: keyof ForgotPasswordFormData, value: string): string | undefined => {
    switch (name) {
      case 'email':
        if (!value.trim()) return '이메일을 입력해주세요.';
        if (!EMAIL_REGEX.test(value)) return '올바른 이메일 형식이 아닙니다.';
        return undefined;
      default:
        return undefined;
    }
  };

  // 전체 폼 유효성 검사
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    newErrors.email = validateField('email', formData.email);

    setErrors(newErrors);

    return !Object.values(newErrors).some(error => error !== undefined);
  };

  // 입력 변경 핸들러
  const handleChange = (name: keyof ForgotPasswordFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [name]: value }));

    // 터치된 필드만 유효성 검사
    if (touched[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: validateField(name, value),
      }));
    }
  };

  // 포커스 아웃 핸들러
  const handleBlur = (name: keyof ForgotPasswordFormData) => () => {
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({
      ...prev,
      [name]: validateField(name, formData[name]),
    }));
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 모든 필드를 터치 상태로 변경
    setTouched({
      email: true,
    });

    if (!validateForm()) {
      return;
    }

    if (onSubmit) {
      await onSubmit(formData);
    }
  };

  if (isSuccess) {
    return (
      <div>
        {/* 헤더 */}
        <div className={HEADER_STYLES}>
          <h1 className={TITLE_STYLES}>이메일 전송 완료</h1>
          <p className={SUBTITLE_STYLES}>
            비밀번호 재설정 링크가 이메일로 전송되었습니다
          </p>
        </div>

        {/* 성공 알림 */}
        <div className={SUCCESS_ALERT_STYLES} role="alert">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium mb-1">이메일을 확인해주세요</p>
            <p className="text-xs opacity-80">
              {successEmail}로 비밀번호 재설정 링크가 전송되었습니다.
            </p>
          </div>
        </div>

        {/* 푸터 */}
        <div className={FOOTER_STYLES}>
          <Link href="/login" className={LINK_STYLES}>
            로그인 페이지로 이동
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* 뒤로가기 링크 */}
      <Link href="/login" className={BACK_LINK_STYLES}>
        <ArrowLeft className="w-4 h-4" />
        로그인으로 돌아가기
      </Link>

      {/* 헤더 */}
      <div className={HEADER_STYLES}>
        <h1 className={TITLE_STYLES}>비밀번호 찾기</h1>
        <p className={SUBTITLE_STYLES}>
          가입한 이메일 주소를 입력하면 비밀번호 재설정 링크를 보내드립니다
        </p>
      </div>

      {/* 에러 알림 */}
      {error && (
        <div className={ERROR_ALERT_STYLES} role="alert">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* 폼 */}
      <form onSubmit={handleSubmit} className={FORM_STYLES} noValidate>
        {/* 이메일 */}
        <Input
          type="email"
          label="이메일"
          placeholder="가입한 이메일 주소를 입력하세요"
          value={formData.email}
          onChange={handleChange('email')}
          onBlur={handleBlur('email')}
          leftIcon={<Mail className="w-5 h-5" />}
          error={errors.email}
          disabled={isLoading}
          required
          autoComplete="email"
        />

        {/* 제출 버튼 */}
        <Button
          type="submit"
          fullWidth
          loading={isLoading}
          disabled={isLoading}
        >
          비밀번호 재설정 링크 전송
        </Button>
      </form>

      {/* 푸터 */}
      <div className={FOOTER_STYLES}>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          계정이 기억나셨나요?{` `}
          <Link href="/login" className={LINK_STYLES}>
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
