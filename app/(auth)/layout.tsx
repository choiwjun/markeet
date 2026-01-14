'use client';

import { ReactNode } from 'react';
import Link from 'next/link';

interface AuthLayoutProps {
  children: ReactNode;
}

// 스타일 상수 - dashboard.html 스타일 반영
const CONTAINER_STYLES = [
  'min-h-screen',
  'bg-gradient-to-br from-slate-50 via-white to-primary-50',
  'dark:from-slate-900 dark:via-slate-900 dark:to-slate-800',
  'flex flex-col items-center justify-center',
  'px-4 py-12',
].join(' ');

const LOGO_STYLES = [
  'text-2xl font-bold',
  'text-transparent bg-clip-text',
  'bg-gradient-to-r from-primary-600 to-primary-500',
  'mb-8',
].join(' ');

const CARD_STYLES = [
  'w-full max-w-md',
  'bg-white dark:bg-slate-800',
  'border border-slate-200 dark:border-slate-700',
  'rounded-2xl',
  'shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50',
  'p-8',
].join(' ');

const FOOTER_STYLES = [
  'mt-8',
  'text-sm',
  'text-slate-500 dark:text-slate-400',
  'text-center',
].join(' ');

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className={CONTAINER_STYLES}>
      {/* 로고 */}
      <Link href="/" className={LOGO_STYLES}>
        마케트
      </Link>

      {/* 인증 카드 */}
      <div className={CARD_STYLES}>{children}</div>

      {/* 푸터 */}
      <footer className={FOOTER_STYLES}>
        <p>© 2026 마케트(Markeet). All rights reserved.</p>
      </footer>
    </div>
  );
}
