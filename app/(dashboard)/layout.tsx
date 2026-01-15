'use client';

import { ReactNode, useState } from 'react';
import { Sidebar, Header, MobileMenu, MobileTabBar } from '@/components/layout';
import { SessionExpiredAlert } from '@/components/auth';
import { useAuth } from '@/hooks/useAuth';

interface DashboardLayoutProps {
  children: ReactNode;
}

// 스타일 상수
const CONTAINER_STYLES = [
  'min-h-screen',
  'bg-slate-50 dark:bg-slate-900',
].join(' ');

const LAYOUT_WRAPPER_STYLES = 'flex h-screen overflow-hidden';

const SIDEBAR_CONTAINER_STYLES = [
  'hidden lg:flex',
  'flex-shrink-0',
].join(' ');

const MAIN_CONTAINER_STYLES = [
  'flex-1',
  'flex flex-col',
  'min-w-0',
  'overflow-hidden',
].join(' ');

const CONTENT_STYLES = [
  'flex-1',
  'overflow-y-auto',
  'p-4 lg:p-8',
  'pb-20 lg:pb-8', // 모바일 하단 탭바 공간 확보
  // Grid pattern background
  'bg-[radial-gradient(#e2e8f0_1px,transparent_1px)]',
  'dark:bg-[radial-gradient(#334155_1px,transparent_1px)]',
  '[background-size:24px_24px]',
].join(' ');

/**
 * 대시보드 레이아웃
 * TASK-501: 사이드바 + 헤더 + 메인 콘텐츠 레이아웃
 */
export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { sessionExpired, clearSessionExpired } = useAuth();

  const openMobileMenu = () => {
    setIsMobileMenuOpen(true);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className={CONTAINER_STYLES}>
      <div className={LAYOUT_WRAPPER_STYLES}>
        {/* 데스크톱 사이드바 */}
        <div className={SIDEBAR_CONTAINER_STYLES}>
          <Sidebar />
        </div>

        {/* 모바일 사이드바 */}
        <MobileMenu isOpen={isMobileMenuOpen} onClose={closeMobileMenu} />

        {/* 메인 영역 */}
        <div className={MAIN_CONTAINER_STYLES}>
          {/* 헤더 */}
          <Header onMenuClick={openMobileMenu} />

          {/* 콘텐츠 */}
          <main className={CONTENT_STYLES}>
            {children}
          </main>
        </div>
      </div>

      {/* 세션 만료 알림 */}
      <SessionExpiredAlert
        isVisible={sessionExpired}
        onClose={clearSessionExpired}
      />

      {/* 모바일 하단 네비게이션 바 */}
      <MobileTabBar />
    </div>
  );
}
