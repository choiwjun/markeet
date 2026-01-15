'use client';

import { useState, useEffect, useCallback } from 'react';
import { User, Building2, Phone, Globe, Loader2, Check, Camera } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { Profile } from '@/types/database';

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

const AVATAR_SECTION_STYLES = [
  'flex items-center gap-6',
  'mb-8 pb-6',
  'border-b border-slate-200 dark:border-slate-700',
].join(' ');

const AVATAR_CONTAINER_STYLES = [
  'relative',
  'w-24 h-24',
  'rounded-full',
  'bg-slate-200 dark:bg-slate-700',
  'flex items-center justify-center',
  'overflow-hidden',
].join(' ');

const AVATAR_OVERLAY_STYLES = [
  'absolute inset-0',
  'bg-black/50',
  'flex items-center justify-center',
  'opacity-0 hover:opacity-100',
  'transition-opacity',
  'cursor-pointer',
].join(' ');

const FORM_GRID_STYLES = 'grid grid-cols-1 md:grid-cols-2 gap-6';

const FORM_GROUP_STYLES = 'space-y-2';

const LABEL_STYLES = [
  'block text-sm font-medium',
  'text-slate-700 dark:text-slate-300',
].join(' ');

const INPUT_STYLES = [
  'w-full px-4 py-2.5',
  'bg-white dark:bg-slate-900',
  'border border-slate-300 dark:border-slate-600',
  'rounded-lg',
  'text-slate-900 dark:text-white',
  'placeholder-slate-400 dark:placeholder-slate-500',
  'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
  'transition-colors',
].join(' ');

const SELECT_STYLES = [
  INPUT_STYLES,
  'appearance-none',
  'bg-no-repeat bg-right',
  'pr-10',
].join(' ');

const HELPER_TEXT_STYLES = [
  'text-xs',
  'text-slate-500 dark:text-slate-400',
].join(' ');

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
].join(' ');

// 타임존 목록
const TIMEZONES = [
  { value: 'Asia/Seoul', label: '서울 (GMT+9)' },
  { value: 'Asia/Tokyo', label: '도쿄 (GMT+9)' },
  { value: 'Asia/Shanghai', label: '상하이 (GMT+8)' },
  { value: 'Asia/Singapore', label: '싱가포르 (GMT+8)' },
  { value: 'America/New_York', label: '뉴욕 (GMT-5)' },
  { value: 'America/Los_Angeles', label: '로스앤젤레스 (GMT-8)' },
  { value: 'Europe/London', label: '런던 (GMT+0)' },
  { value: 'Europe/Paris', label: '파리 (GMT+1)' },
];

export default function ProfileSettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 폼 상태
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [timezone, setTimezone] = useState('Asia/Seoul');

  // 프로필 조회
  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (!response.ok) {
        throw new Error('프로필 조회 실패');
      }
      const data = await response.json();
      setProfile(data);
      setFullName(data.full_name || '');
      setCompanyName(data.company_name || '');
      setPhone(data.phone || '');
      setTimezone(data.timezone || 'Asia/Seoul');
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setError('프로필을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // 프로필 저장
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          company_name: companyName,
          phone: phone,
          timezone: timezone,
        }),
      });

      if (!response.ok) {
        throw new Error('프로필 저장 실패');
      }

      const data = await response.json();
      setProfile(data);

      // 성공 메시지 표시
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to save profile:', err);
      setError('프로필 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  // 변경사항 확인
  const hasChanges =
    profile &&
    (fullName !== (profile.full_name || '') ||
      companyName !== (profile.company_name || '') ||
      phone !== (profile.phone || '') ||
      timezone !== (profile.timezone || 'Asia/Seoul'));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div>
      {/* 헤더 */}
      <div className={PAGE_HEADER_STYLES}>
        <h1 className={TITLE_STYLES}>프로필 설정</h1>
        <p className={SUBTITLE_STYLES}>
          계정 정보와 프로필을 관리합니다.
        </p>
      </div>

      {/* 에러 메시지 */}
      {error && <div className={ERROR_MESSAGE_STYLES}>{error}</div>}

      <form onSubmit={handleSave}>
        <div className={SECTION_STYLES}>
          {/* 아바타 섹션 */}
          <div className={AVATAR_SECTION_STYLES}>
            <div className={AVATAR_CONTAINER_STYLES}>
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="프로필"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-slate-400" />
              )}
              <div className={AVATAR_OVERLAY_STYLES}>
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <p className="font-medium text-slate-900 dark:text-white">
                프로필 이미지
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                JPG, PNG 형식 (최대 2MB)
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                disabled
              >
                이미지 변경
              </Button>
            </div>
          </div>

          {/* 기본 정보 */}
          <div className={FORM_GRID_STYLES}>
            {/* 이름 */}
            <div className={FORM_GROUP_STYLES}>
              <label htmlFor="fullName" className={LABEL_STYLES}>
                <User className="w-4 h-4 inline mr-2" />
                이름
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={INPUT_STYLES}
                placeholder="이름을 입력하세요"
              />
            </div>

            {/* 이메일 (읽기 전용) */}
            <div className={FORM_GROUP_STYLES}>
              <label className={LABEL_STYLES}>
                이메일
              </label>
              <input
                type="email"
                value={profile?.email || ''}
                className={`${INPUT_STYLES} bg-slate-50 dark:bg-slate-800 cursor-not-allowed`}
                disabled
              />
              <p className={HELPER_TEXT_STYLES}>
                이메일은 변경할 수 없습니다.
              </p>
            </div>

            {/* 회사명 */}
            <div className={FORM_GROUP_STYLES}>
              <label htmlFor="companyName" className={LABEL_STYLES}>
                <Building2 className="w-4 h-4 inline mr-2" />
                회사/상호명
              </label>
              <input
                id="companyName"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className={INPUT_STYLES}
                placeholder="회사명 또는 상호명"
              />
            </div>

            {/* 전화번호 */}
            <div className={FORM_GROUP_STYLES}>
              <label htmlFor="phone" className={LABEL_STYLES}>
                <Phone className="w-4 h-4 inline mr-2" />
                전화번호
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={INPUT_STYLES}
                placeholder="010-1234-5678"
              />
            </div>

            {/* 타임존 */}
            <div className={FORM_GROUP_STYLES}>
              <label htmlFor="timezone" className={LABEL_STYLES}>
                <Globe className="w-4 h-4 inline mr-2" />
                타임존
              </label>
              <select
                id="timezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className={SELECT_STYLES}
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 저장 버튼 */}
          <div className="flex justify-end mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
            <Button
              type="submit"
              loading={isSaving}
              disabled={!hasChanges}
            >
              변경사항 저장
            </Button>
          </div>
        </div>
      </form>

      {/* 저장 성공 메시지 */}
      {showSuccess && (
        <div className={SUCCESS_MESSAGE_STYLES}>
          <Check className="w-5 h-5" />
          <span>프로필이 저장되었습니다.</span>
        </div>
      )}
    </div>
  );
}
