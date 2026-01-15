'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { EMAIL_REGEX } from '@/lib/utils/validation';

interface LoginFormProps {
  onSubmit?: (data: LoginFormData) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
}

// 스타일 상수
const FORM_STYLES = 'space-y-5';

const HEADER_STYLES = 'text-center mb-8';
const TITLE_STYLES = 'text-2xl font-bold text-slate-900 dark:text-white mb-2';
const SUBTITLE_STYLES = 'text-sm text-slate-500 dark:text-slate-400';

const LINK_STYLES = [
  'text-sm text-primary-600 dark:text-primary-400',
  'hover:text-primary-700 dark:hover:text-primary-300',
  'font-medium',
  'transition-colors',
].join(' ');

const FORGOT_PASSWORD_WRAPPER = 'flex items-center justify-between mt-2';

const CHECKBOX_CONTAINER_STYLES = 'flex items-center gap-2';

const CHECKBOX_STYLES = [
  'w-4 h-4',
  'rounded',
  'border-slate-300 dark:border-slate-600',
  'text-primary-600',
  'focus:ring-primary-500 focus:ring-offset-0',
  'cursor-pointer',
].join(' ');

const CHECKBOX_LABEL_STYLES = [
  'text-sm text-slate-600 dark:text-slate-400',
  'cursor-pointer select-none',
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

export function LoginForm({ onSubmit, isLoading = false, error }: LoginFormProps) {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // 필드 유효성 검사
  const validateField = (name: keyof LoginFormData, value: string): string | undefined => {
    switch (name) {
      case 'email':
        if (!value.trim()) return '이메일을 입력해주세요.';
        if (!EMAIL_REGEX.test(value)) return '올바른 이메일 형식이 아닙니다.';
        return undefined;
      case 'password':
        if (!value) return '비밀번호를 입력해주세요.';
        return undefined;
      default:
        return undefined;
    }
  };

  // 전체 폼 유효성 검사
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    newErrors.email = validateField('email', formData.email);
    newErrors.password = validateField('password', formData.password);

    setErrors(newErrors);

    return !Object.values(newErrors).some(error => error !== undefined);
  };

  // 입력 변경 핸들러
  const handleChange = (name: keyof LoginFormData) => (
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
  const handleBlur = (name: 'email' | 'password') => () => {
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({
      ...prev,
      [name]: validateField(name, formData[name] as string),
    }));
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 모든 필드를 터치 상태로 변경
    setTouched({
      email: true,
      password: true,
    });

    if (!validateForm()) {
      return;
    }

    if (onSubmit) {
      await onSubmit(formData);
    }
  };

  return (
    <div>
      {/* 헤더 */}
      <div className={HEADER_STYLES}>
        <h1 className={TITLE_STYLES}>로그인</h1>
        <p className={SUBTITLE_STYLES}>
          마케트에 다시 오신 것을 환영합니다
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
          placeholder="이메일 주소를 입력하세요"
          value={formData.email}
          onChange={handleChange('email')}
          onBlur={handleBlur('email')}
          leftIcon={<Mail className="w-5 h-5" />}
          error={errors.email}
          disabled={isLoading}
          required
          autoComplete="email"
        />

        {/* 비밀번호 */}
        <div>
          <Input
            type={showPassword ? 'text' : 'password'}
            label="비밀번호"
            placeholder="비밀번호를 입력하세요"
            value={formData.password}
            onChange={handleChange('password')}
            onBlur={handleBlur('password')}
            leftIcon={<Lock className="w-5 h-5" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            }
            error={errors.password}
            disabled={isLoading}
            required
            autoComplete="current-password"
          />

          {/* 로그인 유지 & 비밀번호 찾기 */}
          <div className={FORGOT_PASSWORD_WRAPPER}>
            {/* 로그인 유지 체크박스 */}
            <label className={CHECKBOX_CONTAINER_STYLES}>
              <input
                type="checkbox"
                checked={formData.rememberMe}
                onChange={(e) => setFormData(prev => ({ ...prev, rememberMe: e.target.checked }))}
                className={CHECKBOX_STYLES}
                disabled={isLoading}
              />
              <span className={CHECKBOX_LABEL_STYLES}>로그인 유지</span>
            </label>

            {/* 비밀번호 찾기 링크 */}
            <Link href="/forgot-password" className={LINK_STYLES}>
              비밀번호를 잊으셨나요?
            </Link>
          </div>
        </div>

        {/* 제출 버튼 */}
        <Button
          type="submit"
          fullWidth
          loading={isLoading}
          disabled={isLoading}
        >
          로그인
        </Button>
      </form>

      {/* 푸터 */}
      <div className={FOOTER_STYLES}>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          계정이 없으신가요?{' '}
          <Link href="/signup" className={LINK_STYLES}>
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
