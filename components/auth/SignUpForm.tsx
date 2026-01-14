'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, User, CheckCircle, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  EMAIL_REGEX,
  PASSWORD_MIN_LENGTH,
  PASSWORD_REQUIREMENTS,
} from '@/lib/utils/validation';

interface SignUpFormProps {
  onSubmit?: (data: SignUpFormData) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export interface SignUpFormData {
  email: string;
  password: string;
  confirmPassword: string;
  name?: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  name?: string;
}

// 스타일 상수
const FORM_STYLES = 'space-y-5';

const HEADER_STYLES = 'text-center mb-8';
const TITLE_STYLES = 'text-2xl font-bold text-slate-900 dark:text-white mb-2';
const SUBTITLE_STYLES = 'text-sm text-slate-500 dark:text-slate-400';

const PASSWORD_INDICATOR_WRAPPER = 'mt-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg';
const PASSWORD_INDICATOR_TITLE = 'text-xs font-medium text-slate-600 dark:text-slate-300 mb-2';
const PASSWORD_INDICATOR_GRID = 'grid grid-cols-2 gap-2';
const PASSWORD_INDICATOR_ITEM = 'flex items-center gap-1.5 text-xs';
const PASSWORD_INDICATOR_MET = 'text-success-500 dark:text-success-400';
const PASSWORD_INDICATOR_UNMET = 'text-slate-400 dark:text-slate-500';

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

export function SignUpForm({ onSubmit, isLoading = false, error }: SignUpFormProps) {
  const [formData, setFormData] = useState<SignUpFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // 필드 유효성 검사
  const validateField = (name: keyof SignUpFormData, value: string): string | undefined => {
    switch (name) {
      case 'email':
        if (!value.trim()) return '이메일을 입력해주세요.';
        if (!EMAIL_REGEX.test(value)) return '올바른 이메일 형식이 아닙니다.';
        return undefined;
      case 'password':
        if (!value) return '비밀번호를 입력해주세요.';
        if (value.length < PASSWORD_MIN_LENGTH) return `비밀번호는 ${PASSWORD_MIN_LENGTH}자 이상이어야 합니다.`;
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

    newErrors.email = validateField('email', formData.email);
    newErrors.password = validateField('password', formData.password);
    newErrors.confirmPassword = validateField('confirmPassword', formData.confirmPassword);

    setErrors(newErrors);

    return !Object.values(newErrors).some(error => error !== undefined);
  };

  // 입력 변경 핸들러
  const handleChange = (name: keyof SignUpFormData) => (
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
  const handleBlur = (name: keyof SignUpFormData) => () => {
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({
      ...prev,
      [name]: validateField(name, formData[name] || ''),
    }));
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 모든 필드를 터치 상태로 변경
    setTouched({
      email: true,
      password: true,
      confirmPassword: true,
      name: true,
    });

    if (!validateForm()) {
      return;
    }

    if (onSubmit) {
      await onSubmit(formData);
    }
  };

  // 비밀번호 요구사항 충족 여부
  const passwordRequirementsMet = PASSWORD_REQUIREMENTS.map(req => ({
    ...req,
    met: req.test(formData.password),
  }));

  return (
    <div>
      {/* 헤더 */}
      <div className={HEADER_STYLES}>
        <h1 className={TITLE_STYLES}>회원가입</h1>
        <p className={SUBTITLE_STYLES}>
          마케트에 오신 것을 환영합니다
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
        {/* 이름 (선택) */}
        <Input
          type="text"
          label="이름 (선택)"
          placeholder="이름을 입력하세요"
          value={formData.name}
          onChange={handleChange('name')}
          onBlur={handleBlur('name')}
          leftIcon={<User className="w-5 h-5" />}
          error={errors.name}
          disabled={isLoading}
          autoComplete="name"
        />

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
            autoComplete="new-password"
          />

          {/* 비밀번호 요구사항 인디케이터 */}
          {formData.password && (
            <div className={PASSWORD_INDICATOR_WRAPPER}>
              <p className={PASSWORD_INDICATOR_TITLE}>비밀번호 요구사항</p>
              <div className={PASSWORD_INDICATOR_GRID}>
                {passwordRequirementsMet.map(req => (
                  <div
                    key={req.id}
                    className={`${PASSWORD_INDICATOR_ITEM} ${
                      req.met ? PASSWORD_INDICATOR_MET : PASSWORD_INDICATOR_UNMET
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{req.label}</span>
                  </div>
                ))}
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
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              tabIndex={-1}
              aria-label={showConfirmPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
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
        <Button
          type="submit"
          fullWidth
          loading={isLoading}
          disabled={isLoading}
        >
          가입하기
        </Button>
      </form>

      {/* 푸터 */}
      <div className={FOOTER_STYLES}>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          이미 계정이 있으신가요?{' '}
          <Link href="/login" className={LINK_STYLES}>
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
