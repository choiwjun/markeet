'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface OnboardingLayoutProps {
  children: ReactNode;
}

// 스타일 상수
const CONTAINER_STYLES = [
  'min-h-screen',
  'bg-white dark:bg-slate-900',
  // Grid pattern background - dashboard.html 스타일
  'bg-[radial-gradient(#e2e8f0_1px,transparent_1px)]',
  'dark:bg-[radial-gradient(#334155_1px,transparent_1px)]',
  '[background-size:24px_24px]',
].join(' ');

const HEADER_STYLES = [
  'fixed top-0 left-0 right-0 z-10',
  'h-16',
  'bg-white/80 dark:bg-slate-900/80',
  'backdrop-blur-md',
  'border-b border-slate-200 dark:border-slate-700',
].join(' ');

const HEADER_CONTENT_STYLES = [
  'h-full',
  'max-w-4xl mx-auto',
  'px-4 sm:px-6 lg:px-8',
  'flex items-center justify-between',
].join(' ');

const LOGO_WRAPPER_STYLES = 'flex items-center gap-2';

const LOGO_ICON_STYLES = [
  'w-8 h-8',
  'bg-gradient-to-br from-primary-500 to-primary-600',
  'rounded-lg',
  'flex items-center justify-center',
  'text-white',
].join(' ');

const LOGO_TEXT_STYLES = [
  'text-xl font-bold',
  'bg-gradient-to-r from-primary-600 to-primary-500',
  'bg-clip-text text-transparent',
].join(' ');

const MAIN_CONTENT_STYLES = [
  'pt-10 pb-12',
  'max-w-4xl mx-auto',
  'px-4 sm:px-6 lg:px-8',
].join(' ');

const SKIP_BUTTON_STYLES = [
  'text-sm text-slate-500 dark:text-slate-400',
  'hover:text-slate-700 dark:hover:text-slate-300',
].join(' ');

export default function OnboardingLayout({ children }: OnboardingLayoutProps) {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleSkip = () => {
    router.push('/dashboard');
  };

  return (
    <div className={CONTAINER_STYLES}>
      {/* Header */}
      <header className={HEADER_STYLES}>
        <div className={HEADER_CONTENT_STYLES}>
          {/* Logo */}
          <div className={LOGO_WRAPPER_STYLES}>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="mr-2"
              aria-label="뒤로 가기"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className={LOGO_ICON_STYLES}>
              <Zap className="w-5 h-5" />
            </div>
            <span className={LOGO_TEXT_STYLES}>마케트</span>
          </div>

          {/* Skip Button */}
          <button
            onClick={handleSkip}
            className={SKIP_BUTTON_STYLES}
            type="button"
          >
            나중에 하기
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className={MAIN_CONTENT_STYLES}>
        {children}
      </main>
    </div>
  );
}
