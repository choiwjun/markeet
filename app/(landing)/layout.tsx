import { ReactNode } from 'react';
import { LandingHeader, Footer } from '@/components/landing';

interface LandingLayoutProps {
  children: ReactNode;
}

// 스타일 상수
const LAYOUT_STYLES = [
  'min-h-screen',
  'bg-white dark:bg-slate-900',
  'flex flex-col',
].join(' ');

const MAIN_STYLES = 'flex-1';

/**
 * 랜딩페이지 레이아웃
 * TASK-601: 헤더 + 메인 콘텐츠 + 푸터 구조
 */
export default function LandingLayout({ children }: LandingLayoutProps) {
  return (
    <div className={LAYOUT_STYLES}>
      {/* 고정 헤더 */}
      <LandingHeader />

      {/* 메인 콘텐츠 */}
      <main className={MAIN_STYLES}>
        {children}
      </main>

      {/* 푸터 */}
      <Footer />
    </div>
  );
}
