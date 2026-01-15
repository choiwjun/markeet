'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface ResetPasswordFormProps {
  onSubmit?: (data: ResetPasswordFormData) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  isSuccess?: boolean;
}

export interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  password?: string;
  confirmPassword?: string;
}

// 비밀번호 요구사항 체크
interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  { label: '8자 이상', test: (pw) => pw.length >= 8 },
  { label: '영문 포함', test: (pw) => /[a-zA-Z]/.test(pw) },
  { label: '숫자 포함', test: (pw) => /[0-9]/.test(pw) },
];

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

const REQUIREMENTS_CONTAINER_STYLES = [
  'mt-2 p-3',
  'bg-slate-50 dark:bg-slate-800/50',
  'border border-slate-200 dark:border-slate-700',
  'rounded-lg',
].join(' ');

const REQUIREMENT_ITEM_STYLES = 'flex items-center gap-2 text-xs';

export function ResetPasswordForm({
  onSubmit,
  isLoading = false,
  error,
  isSuccess = false,
}: ResetPasswordFormProps) {
  const [formData, setFormData] = useState<ResetPasswordFormData>({
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 필드 유효성 검사
  const validateField = (
    name: keyof ResetPasswordFormData,
    value: string
  ): string | undefined => {
    switch (name) {
      case 'password':
        if (!value) return '비밀번호를 입력해주세요.';
        if (value.length < 8) return '비밀번호는 최소 8자 이상이어야 합니다.';
        if (!/[a-zA-Z]/.test(value)) return '비밀번호에 영문자를 포함해주세요.';
        if (!/[0-9]/.test(value)) return '비밀번호에 숫자를 포함해주세요.';
        return undefined;
      case 'confirmPassword':
        if (!value) return '비밀번호 확인을 입력해주세요.';
        if (value !== formData.password) return '비밀번호가 일치하지 않습니다.';
        return undefined;
      default:
        return undefined;
    }
  };

  // 전체 폼 유효성 검사
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    newErrors.password = validateField('password', formData.password);
    newErrors.confirmPassword = validateField(
      'confirmPassword',
      formData.confirmPassword
    );

    setErrors(newErrors);

    return !Object.values(newErrors).some((error) => error !== undefined);
  };

  // 입력 변경 핸들러
  const handleChange =
    (name: keyof ResetPasswordFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFormData((prev) => ({ ...prev, [name]: value }));

      // 터치된 필드만 유효성 검사
      if (touched[name]) {
        setErrors((prev) => ({
          ...prev,
          [name]: validateField(name, value),
        }));
      }

      // 비밀번호 변경 시 확인 필드도 재검증
      if (name === 'password' && touched.confirmPassword) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword:
            formData.confirmPassword !== value
              ? '비밀번호가 일치하지 않습니다.'
              : undefined,
        }));
      }
    };

  // 포커스 아웃 핸들러
  const handleBlur = (name: keyof ResetPasswordFormData) => () => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, formData[name]),
    }));
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 모든 필드를 터치 상태로 변경
    setTouched({
      password: true,
      confirmPassword: true,
    });

    if (!validateForm()) {
      return;
    }

    if (onSubmit) {
      await onSubmit(formData);
    }
  };

  // 비밀번호 표시 토글
  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword(!showConfirmPassword);

  // 성공 화면
  if (isSuccess) {
    return (
      <div>
        {/* 헤더 */}
        <div className={HEADER_STYLES}>
          <h1 className={TITLE_STYLES}>비밀번호 변경 완료</h1>
          <p className={SUBTITLE_STYLES}>
            새 비밀번호로 로그인할 수 있습니다
          </p>
        </div>

        {/* 성공 알림 */}
        <div className={SUCCESS_ALERT_STYLES} role="alert">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium mb-1">비밀번호가 변경되었습니다</p>
            <p className="text-xs opacity-80">
              새 비밀번호로 로그인해주세요.
            </p>
          </div>
        </div>

        {/* 로그인 버튼 */}
        <Link href="/login">
          <Button fullWidth>로그인하기</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* 헤더 */}
      <div className={HEADER_STYLES}>
        <h1 className={TITLE_STYLES}>새 비밀번호 설정</h1>
        <p className={SUBTITLE_STYLES}>
          새로운 비밀번호를 입력해주세요
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
        {/* 새 비밀번호 */}
        <div>
          <Input
            type={showPassword ? 'text' : 'password'}
            label="새 비밀번호"
            placeholder="새 비밀번호를 입력하세요"
            value={formData.password}
            onChange={handleChange('password')}
            onBlur={handleBlur('password')}
            leftIcon={<Lock className="w-5 h-5" />}
            rightIcon={
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                tabIndex={-1}
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
            autoComplete="new-password"
          />

          {/* 비밀번호 요구사항 */}
          {formData.password && (
            <div className={REQUIREMENTS_CONTAINER_STYLES}>
              <div className="space-y-1.5">
                {PASSWORD_REQUIREMENTS.map((req) => {
                  const isMet = req.test(formData.password);
                  return (
                    <div
                      key={req.label}
                      className={`${REQUIREMENT_ITEM_STYLES} ${
                        isMet
                          ? 'text-success-600 dark:text-success-400'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {isMet ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <X className="w-3.5 h-3.5" />
                      )}
                      <span>{req.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 비밀번호 확인 */}
        <Input
          type={showConfirmPassword ? 'text' : 'password'}
          label="비밀번호 확인"
          placeholder="비밀번호를 다시 입력하세요"
          value={formData.confirmPassword}
          onChange={handleChange('confirmPassword')}
          onBlur={handleBlur('confirmPassword')}
          leftIcon={<Lock className="w-5 h-5" />}
          rightIcon={
            <button
              type="button"
              onClick={toggleConfirmPasswordVisibility}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              tabIndex={-1}
            >
              {showConfirmPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          }
          error={errors.confirmPassword}
          disabled={isLoading}
          required
          autoComplete="new-password"
        />

        {/* 제출 버튼 */}
        <Button type="submit" fullWidth loading={isLoading} disabled={isLoading}>
          비밀번호 변경
        </Button>
      </form>

      {/* 푸터 */}
      <div className={FOOTER_STYLES}>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          계정이 기억나셨나요?{' '}
          <Link href="/login" className={LINK_STYLES}>
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
