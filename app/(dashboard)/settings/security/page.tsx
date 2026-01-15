'use client';

import { useState } from 'react';
import { Shield, Lock, Eye, EyeOff, Loader2, Check, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// 스타일 상수
const PAGE_HEADER_STYLES = 'mb-8';

const TITLE_STYLES = [
  'text-2xl font-bold',
  'text-slate-900 dark:text-white',
].join(' ');

const SUBTITLE_STYLES = [
  'mt-2 text-sm',
  'text-slate-500 dark:text-slate-400',
].join(' ');

const SECTION_STYLES = [
  'bg-white dark:bg-slate-800',
  'rounded-xl',
  'border border-slate-200 dark:border-slate-700',
  'p-6 mb-6',
].join(' ');

const SECTION_HEADER_STYLES = [
  'flex items-center gap-3',
  'mb-6 pb-4',
  'border-b border-slate-200 dark:border-slate-700',
].join(' ');

const SECTION_ICON_STYLES = [
  'w-10 h-10',
  'rounded-lg',
  'flex items-center justify-center',
].join(' ');

const SECTION_TITLE_STYLES = [
  'text-lg font-semibold',
  'text-slate-800 dark:text-slate-200',
].join(' ');

const SECTION_SUBTITLE_STYLES = [
  'text-sm',
  'text-slate-500 dark:text-slate-400',
].join(' ');

const FORM_GROUP_STYLES = 'space-y-2 mb-4';

const LABEL_STYLES = [
  'block text-sm font-medium',
  'text-slate-700 dark:text-slate-300',
].join(' ');

const INPUT_CONTAINER_STYLES = 'relative';

const INPUT_STYLES = [
  'w-full px-4 py-2.5 pr-12',
  'bg-white dark:bg-slate-900',
  'border border-slate-300 dark:border-slate-600',
  'rounded-lg',
  'text-slate-900 dark:text-white',
  'placeholder-slate-400 dark:placeholder-slate-500',
  'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
  'transition-colors',
].join(' ');

const PASSWORD_TOGGLE_STYLES = [
  'absolute right-3 top-1/2 -translate-y-1/2',
  'text-slate-400 hover:text-slate-600',
  'dark:text-slate-500 dark:hover:text-slate-300',
  'cursor-pointer',
].join(' ');

const HELPER_TEXT_STYLES = [
  'text-xs',
  'text-slate-500 dark:text-slate-400',
].join(' ');

const PASSWORD_REQUIREMENTS_STYLES = [
  'mt-4 p-4',
  'bg-slate-50 dark:bg-slate-900/50',
  'rounded-lg',
  'text-sm',
].join(' ');

const REQUIREMENT_ITEM_STYLES = 'flex items-center gap-2 mt-2';

const SUCCESS_MESSAGE_STYLES = [
  'fixed bottom-4 right-4',
  'flex items-center gap-2',
  'px-4 py-3',
  'bg-success-500 text-white',
  'rounded-lg shadow-lg',
  'animate-fade-in',
].join(' ');

const ERROR_MESSAGE_STYLES = [
  'mb-6 p-4',
  'bg-danger-50 dark:bg-danger-500/10',
  'border border-danger-200 dark:border-danger-500/20',
  'rounded-lg',
  'text-danger-700 dark:text-danger-400',
  'flex items-center gap-2',
].join(' ');

export default function SecuritySettingsPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 비밀번호 요구사항 체크
  const hasMinLength = newPassword.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword && newPassword.length > 0;

  const isValid = hasMinLength && hasLetter && hasNumber && passwordsMatch;

  // 비밀번호 변경
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isValid) {
      setError('비밀번호 요구사항을 모두 충족해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/user/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '비밀번호 변경에 실패했습니다.');
      }

      // 성공
      setNewPassword('');
      setConfirmPassword('');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to change password:', err);
      setError(err instanceof Error ? err.message : '비밀번호 변경에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* 헤더 */}
      <div className={PAGE_HEADER_STYLES}>
        <h1 className={TITLE_STYLES}>보안 설정</h1>
        <p className={SUBTITLE_STYLES}>
          계정 보안을 위한 비밀번호를 관리합니다.
        </p>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className={ERROR_MESSAGE_STYLES}>
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 비밀번호 변경 섹션 */}
      <section className={SECTION_STYLES}>
        <div className={SECTION_HEADER_STYLES}>
          <div className={`${SECTION_ICON_STYLES} bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400`}>
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className={SECTION_TITLE_STYLES}>비밀번호 변경</h2>
            <p className={SECTION_SUBTITLE_STYLES}>안전한 새 비밀번호를 설정하세요.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* 새 비밀번호 */}
          <div className={FORM_GROUP_STYLES}>
            <label htmlFor="newPassword" className={LABEL_STYLES}>
              새 비밀번호
            </label>
            <div className={INPUT_CONTAINER_STYLES}>
              <input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={INPUT_STYLES}
                placeholder="새 비밀번호 입력"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className={PASSWORD_TOGGLE_STYLES}
              >
                {showNewPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* 새 비밀번호 확인 */}
          <div className={FORM_GROUP_STYLES}>
            <label htmlFor="confirmPassword" className={LABEL_STYLES}>
              새 비밀번호 확인
            </label>
            <div className={INPUT_CONTAINER_STYLES}>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={INPUT_STYLES}
                placeholder="새 비밀번호 다시 입력"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className={PASSWORD_TOGGLE_STYLES}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {confirmPassword && !passwordsMatch && (
              <p className="text-xs text-danger-500 mt-1">
                비밀번호가 일치하지 않습니다.
              </p>
            )}
          </div>

          {/* 비밀번호 요구사항 */}
          <div className={PASSWORD_REQUIREMENTS_STYLES}>
            <p className="font-medium text-slate-700 dark:text-slate-300">
              비밀번호 요구사항
            </p>
            <div className={REQUIREMENT_ITEM_STYLES}>
              <Check
                className={`w-4 h-4 ${
                  hasMinLength ? 'text-success-500' : 'text-slate-300 dark:text-slate-600'
                }`}
              />
              <span className={hasMinLength ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'}>
                8자 이상
              </span>
            </div>
            <div className={REQUIREMENT_ITEM_STYLES}>
              <Check
                className={`w-4 h-4 ${
                  hasLetter ? 'text-success-500' : 'text-slate-300 dark:text-slate-600'
                }`}
              />
              <span className={hasLetter ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'}>
                영문 포함
              </span>
            </div>
            <div className={REQUIREMENT_ITEM_STYLES}>
              <Check
                className={`w-4 h-4 ${
                  hasNumber ? 'text-success-500' : 'text-slate-300 dark:text-slate-600'
                }`}
              />
              <span className={hasNumber ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'}>
                숫자 포함
              </span>
            </div>
            <div className={REQUIREMENT_ITEM_STYLES}>
              <Check
                className={`w-4 h-4 ${
                  passwordsMatch ? 'text-success-500' : 'text-slate-300 dark:text-slate-600'
                }`}
              />
              <span className={passwordsMatch ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'}>
                비밀번호 일치
              </span>
            </div>
          </div>

          {/* 저장 버튼 */}
          <div className="flex justify-end mt-6">
            <Button
              type="submit"
              loading={isLoading}
              disabled={!isValid}
            >
              비밀번호 변경
            </Button>
          </div>
        </form>
      </section>

      {/* 성공 메시지 */}
      {showSuccess && (
        <div className={SUCCESS_MESSAGE_STYLES}>
          <Check className="w-5 h-5" />
          <span>비밀번호가 변경되었습니다.</span>
        </div>
      )}
    </div>
  );
}
