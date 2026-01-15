'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface SessionExpiredAlertProps {
  isVisible: boolean;
  onClose: () => void;
}

// 스타일 상수
const OVERLAY_STYLES = [
  'fixed inset-0 z-50',
  'bg-black/50 backdrop-blur-sm',
  'flex items-center justify-center',
  'p-4',
].join(' ');

const MODAL_STYLES = [
  'bg-white dark:bg-slate-800',
  'rounded-2xl shadow-xl',
  'max-w-md w-full',
  'p-6',
  'animate-in fade-in zoom-in-95',
  'duration-200',
].join(' ');

const ICON_CONTAINER_STYLES = [
  'mx-auto w-16 h-16',
  'bg-warning-50 dark:bg-warning-500/10',
  'rounded-full',
  'flex items-center justify-center',
  'mb-4',
].join(' ');

const TITLE_STYLES = 'text-xl font-bold text-slate-900 dark:text-white text-center mb-2';
const DESCRIPTION_STYLES = 'text-sm text-slate-500 dark:text-slate-400 text-center mb-6';

/**
 * 세션 만료 알림 모달
 *
 * 세션이 만료되었을 때 사용자에게 알리고
 * 로그인 페이지로 리다이렉트합니다.
 */
export function SessionExpiredAlert({ isVisible, onClose }: SessionExpiredAlertProps) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  // 자동 리다이렉트 카운트다운
  useEffect(() => {
    if (!isVisible) {
      setCountdown(5);
      return;
    }

    if (countdown <= 0) {
      handleLogin();
      return;
    }

    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [isVisible, countdown]);

  const handleLogin = () => {
    onClose();
    router.push('/login');
  };

  const handleClose = () => {
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className={OVERLAY_STYLES} role="dialog" aria-modal="true" aria-labelledby="session-expired-title">
      <div className={MODAL_STYLES}>
        {/* 닫기 버튼 */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          aria-label="닫기"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 아이콘 */}
        <div className={ICON_CONTAINER_STYLES}>
          <AlertCircle className="w-8 h-8 text-warning-500" />
        </div>

        {/* 제목 */}
        <h2 id="session-expired-title" className={TITLE_STYLES}>
          세션이 만료되었습니다
        </h2>

        {/* 설명 */}
        <p className={DESCRIPTION_STYLES}>
          보안을 위해 로그인 세션이 만료되었습니다.
          <br />
          다시 로그인해주세요.
        </p>

        {/* 카운트다운 */}
        <p className="text-xs text-slate-400 dark:text-slate-500 text-center mb-4">
          {countdown}초 후 자동으로 로그인 페이지로 이동합니다
        </p>

        {/* 버튼 */}
        <div className="space-y-3">
          <Button onClick={handleLogin} fullWidth>
            로그인 페이지로 이동
          </Button>
          <Button variant="ghost" onClick={handleClose} fullWidth>
            닫기
          </Button>
        </div>
      </div>
    </div>
  );
}
