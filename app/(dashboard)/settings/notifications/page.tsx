'use client';

import { useState, useEffect, useCallback } from 'react';
import { Mail, Smartphone, TrendingUp, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { NotificationSettings } from '@/types/database';

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

const SETTING_ROW_STYLES = [
  'flex items-center justify-between',
  'py-4',
  'border-b border-slate-100 dark:border-slate-700/50',
  'last:border-0',
].join(' ');

const SETTING_LABEL_STYLES = [
  'font-medium',
  'text-slate-700 dark:text-slate-300',
].join(' ');

const SETTING_DESCRIPTION_STYLES = [
  'text-sm',
  'text-slate-500 dark:text-slate-400',
  'mt-0.5',
].join(' ');

const TOGGLE_STYLES = [
  'relative inline-flex h-6 w-11',
  'flex-shrink-0 cursor-pointer',
  'rounded-full border-2 border-transparent',
  'transition-colors duration-200 ease-in-out',
  'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
].join(' ');

const TOGGLE_KNOB_STYLES = [
  'pointer-events-none inline-block h-5 w-5',
  'transform rounded-full bg-white shadow',
  'ring-0 transition duration-200 ease-in-out',
].join(' ');

const SUCCESS_MESSAGE_STYLES = [
  'fixed bottom-4 right-4',
  'flex items-center gap-2',
  'px-4 py-3',
  'bg-success-500 text-white',
  'rounded-lg shadow-lg',
  'animate-fade-in',
].join(' ');

// 토글 컴포넌트
function Toggle({
  enabled,
  onChange,
  disabled,
}: {
  enabled: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className={`${TOGGLE_STYLES} ${enabled ? 'bg-primary-600' : 'bg-slate-200 dark:bg-slate-600'}`}
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      disabled={disabled}
    >
      <span
        className={`${TOGGLE_KNOB_STYLES} ${enabled ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  );
}

export default function NotificationSettingsPage() {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 설정 조회
  const fetchSettings = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/settings');
      if (!response.ok) {
        throw new Error('설정 조회 실패');
      }
      const data = await response.json();
      setSettings(data);
    } catch (err) {
      console.error('Failed to fetch notification settings:', err);
      setError('알림 설정을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // 설정 업데이트
  const updateSettings = async (updates: Partial<NotificationSettings>) => {
    if (!settings) return;

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/notifications/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('설정 업데이트 실패');
      }

      const data = await response.json();
      setSettings(data);

      // 성공 메시지 표시
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to update notification settings:', err);
      setError('설정 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  // 설정 변경 핸들러
  const handleToggle = (key: keyof NotificationSettings) => {
    if (!settings) return;
    updateSettings({ [key]: !settings[key] });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 dark:text-slate-400">
          설정을 불러오는데 실패했습니다.
        </p>
        <Button variant="outline" onClick={fetchSettings} className="mt-4">
          다시 시도
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* 헤더 */}
      <div className={PAGE_HEADER_STYLES}>
        <h1 className={TITLE_STYLES}>알림 설정</h1>
        <p className={SUBTITLE_STYLES}>
          이메일 및 인앱 알림 수신 설정을 관리합니다.
        </p>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-6 p-4 bg-danger-50 dark:bg-danger-500/10 border border-danger-200 dark:border-danger-500/20 rounded-lg text-danger-700 dark:text-danger-400">
          {error}
        </div>
      )}

      {/* 이메일 알림 섹션 */}
      <section className={SECTION_STYLES}>
        <div className={SECTION_HEADER_STYLES}>
          <div className={`${SECTION_ICON_STYLES} bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400`}>
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h2 className={SECTION_TITLE_STYLES}>이메일 알림</h2>
            <p className={SECTION_SUBTITLE_STYLES}>중요한 알림을 이메일로 받습니다.</p>
          </div>
        </div>

        <div>
          <div className={SETTING_ROW_STYLES}>
            <div>
              <p className={SETTING_LABEL_STYLES}>이메일 알림 활성화</p>
              <p className={SETTING_DESCRIPTION_STYLES}>
                모든 이메일 알림을 활성화하거나 비활성화합니다.
              </p>
            </div>
            <Toggle
              enabled={settings.email_enabled}
              onChange={() => handleToggle('email_enabled')}
              disabled={isSaving}
            />
          </div>

          <div className={SETTING_ROW_STYLES}>
            <div>
              <p className={SETTING_LABEL_STYLES}>일일 성과 요약</p>
              <p className={SETTING_DESCRIPTION_STYLES}>
                매일 아침 전일 광고 성과 요약을 받습니다.
              </p>
            </div>
            <Toggle
              enabled={settings.email_daily_summary}
              onChange={() => handleToggle('email_daily_summary')}
              disabled={isSaving || !settings.email_enabled}
            />
          </div>

          <div className={SETTING_ROW_STYLES}>
            <div>
              <p className={SETTING_LABEL_STYLES}>주간 리포트</p>
              <p className={SETTING_DESCRIPTION_STYLES}>
                매주 월요일 주간 광고 성과 리포트를 받습니다.
              </p>
            </div>
            <Toggle
              enabled={settings.email_weekly_report}
              onChange={() => handleToggle('email_weekly_report')}
              disabled={isSaving || !settings.email_enabled}
            />
          </div>
        </div>
      </section>

      {/* 인앱 알림 섹션 */}
      <section className={SECTION_STYLES}>
        <div className={SECTION_HEADER_STYLES}>
          <div className={`${SECTION_ICON_STYLES} bg-success-100 dark:bg-success-500/20 text-success-600 dark:text-success-400`}>
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h2 className={SECTION_TITLE_STYLES}>인앱 알림</h2>
            <p className={SECTION_SUBTITLE_STYLES}>대시보드 내에서 실시간 알림을 받습니다.</p>
          </div>
        </div>

        <div>
          <div className={SETTING_ROW_STYLES}>
            <div>
              <p className={SETTING_LABEL_STYLES}>인앱 알림 활성화</p>
              <p className={SETTING_DESCRIPTION_STYLES}>
                대시보드에서 알림 아이콘을 통해 알림을 받습니다.
              </p>
            </div>
            <Toggle
              enabled={settings.push_enabled}
              onChange={() => handleToggle('push_enabled')}
              disabled={isSaving}
            />
          </div>

          <div className={SETTING_ROW_STYLES}>
            <div>
              <p className={SETTING_LABEL_STYLES}>이상 징후 알림</p>
              <p className={SETTING_DESCRIPTION_STYLES}>
                광고비나 ROAS에 급격한 변화가 감지되면 알림을 받습니다.
              </p>
            </div>
            <Toggle
              enabled={settings.anomaly_alerts}
              onChange={() => handleToggle('anomaly_alerts')}
              disabled={isSaving || !settings.push_enabled}
            />
          </div>

          <div className={SETTING_ROW_STYLES}>
            <div>
              <p className={SETTING_LABEL_STYLES}>API 키 관련 알림</p>
              <p className={SETTING_DESCRIPTION_STYLES}>
                API 키 만료 및 동기화 오류 알림을 받습니다.
              </p>
            </div>
            <Toggle
              enabled={settings.api_key_alerts}
              onChange={() => handleToggle('api_key_alerts')}
              disabled={isSaving || !settings.push_enabled}
            />
          </div>
        </div>
      </section>

      {/* 저장 성공 메시지 */}
      {showSuccess && (
        <div className={SUCCESS_MESSAGE_STYLES}>
          <Check className="w-5 h-5" />
          <span>설정이 저장되었습니다.</span>
        </div>
      )}
    </div>
  );
}
