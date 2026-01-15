/**
 * 모바일 하단 네비게이션 바
 * TASK-1301: 모바일에서 하단 탭 네비게이션
 */

'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  FileText,
  Settings,
  MessageSquare,
  Bell,
} from 'lucide-react';

// 네비게이션 아이템 정의
const NAV_ITEMS = [
  {
    href: '/dashboard',
    label: '대시보드',
    icon: LayoutDashboard,
  },
  {
    href: '/reports',
    label: '리포트',
    icon: FileText,
  },
  {
    href: '/dashboard',
    label: 'AI 질의',
    icon: MessageSquare,
    query: 'ai=open',
  },
  {
    href: '/notifications',
    label: '알림',
    icon: Bell,
  },
  {
    href: '/settings',
    label: '설정',
    icon: Settings,
  },
];

// 스타일 상수
const TAB_BAR_STYLES = [
  'fixed bottom-0 left-0 right-0 z-40',
  'lg:hidden', // 데스크톱에서는 숨김
  'bg-white dark:bg-slate-900',
  'border-t border-slate-200 dark:border-slate-700',
  'safe-area-inset-bottom', // iOS safe area 대응
].join(' ');

const TAB_BAR_CONTENT_STYLES = [
  'flex items-center justify-around',
  'h-16',
  'px-2',
].join(' ');

const TAB_ITEM_STYLES = [
  'flex flex-col items-center justify-center',
  'flex-1',
  'py-2 px-1',
  'transition-colors duration-200',
  'rounded-lg',
  'min-w-0',
].join(' ');

const TAB_ITEM_ACTIVE_STYLES = [
  'text-primary-600 dark:text-primary-400',
].join(' ');

const TAB_ITEM_INACTIVE_STYLES = [
  'text-slate-500 dark:text-slate-400',
  'hover:text-slate-700 dark:hover:text-slate-300',
  'active:bg-slate-100 dark:active:bg-slate-800',
].join(' ');

const TAB_ICON_STYLES = 'w-5 h-5 mb-1';

const TAB_LABEL_STYLES = [
  'text-[10px]',
  'font-medium',
  'truncate',
  'max-w-full',
].join(' ');

/**
 * 모바일 하단 탭 바 컴포넌트
 */
export function MobileTabBar() {
  const pathname = usePathname();

  // 현재 경로가 활성화된 탭인지 확인
  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname?.startsWith('/dashboard/');
    }
    if (href === '/reports') {
      return pathname === '/reports' || pathname?.startsWith('/reports/');
    }
    if (href === '/settings') {
      return pathname?.startsWith('/settings');
    }
    return pathname === href;
  };

  return (
    <nav className={TAB_BAR_STYLES} aria-label="모바일 네비게이션">
      <div className={TAB_BAR_CONTENT_STYLES}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          const href = item.query ? `${item.href}?${item.query}` : item.href;

          return (
            <Link
              key={item.href + (item.query || '')}
              href={href}
              className={`${TAB_ITEM_STYLES} ${
                active ? TAB_ITEM_ACTIVE_STYLES : TAB_ITEM_INACTIVE_STYLES
              }`}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className={TAB_ICON_STYLES} />
              <span className={TAB_LABEL_STYLES}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default MobileTabBar;
