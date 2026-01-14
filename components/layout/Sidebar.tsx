'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  FileText,
  Settings,
  Link2,
  Zap,
  X,
} from 'lucide-react';

// 네비게이션 아이템 타입
interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

// 사이드바 Props
interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isMobile?: boolean;
}

// 네비게이션 메뉴 정의
const NAV_ITEMS: NavItem[] = [
  {
    label: '대시보드',
    href: '/dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    label: '리포트',
    href: '/reports',
    icon: <FileText className="w-5 h-5" />,
  },
  {
    label: '플랫폼 연동',
    href: '/settings/connections',
    icon: <Link2 className="w-5 h-5" />,
  },
  {
    label: '설정',
    href: '/settings',
    icon: <Settings className="w-5 h-5" />,
  },
];

// 스타일 상수
const SIDEBAR_STYLES = [
  'flex flex-col',
  'w-64 h-full',
  'bg-white dark:bg-slate-900',
  'border-r border-slate-200 dark:border-slate-700',
].join(' ');

const LOGO_WRAPPER_STYLES = [
  'flex items-center justify-between',
  'h-16 px-4',
  'border-b border-slate-200 dark:border-slate-700',
].join(' ');

const LOGO_CONTENT_STYLES = 'flex items-center gap-2';

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

const NAV_CONTAINER_STYLES = [
  'flex-1',
  'py-4 px-3',
  'overflow-y-auto',
].join(' ');

const NAV_ITEM_BASE_STYLES = [
  'flex items-center gap-3',
  'w-full px-3 py-2.5',
  'rounded-lg',
  'text-sm font-medium',
  'transition-all duration-200',
].join(' ');

const NAV_ITEM_ACTIVE_STYLES = [
  'bg-primary-50 dark:bg-primary-900/20',
  'text-primary-600 dark:text-primary-400',
].join(' ');

const NAV_ITEM_INACTIVE_STYLES = [
  'text-slate-600 dark:text-slate-400',
  'hover:bg-slate-100 dark:hover:bg-slate-800',
  'hover:text-slate-900 dark:hover:text-slate-200',
].join(' ');

const CLOSE_BUTTON_STYLES = [
  'lg:hidden',
  'p-1.5 rounded-lg',
  'text-slate-500 dark:text-slate-400',
  'hover:bg-slate-100 dark:hover:bg-slate-800',
  'hover:text-slate-700 dark:hover:text-slate-200',
  'transition-colors duration-200',
].join(' ');

const FOOTER_STYLES = [
  'p-4',
  'border-t border-slate-200 dark:border-slate-700',
].join(' ');

const VERSION_TEXT_STYLES = [
  'text-xs',
  'text-slate-400 dark:text-slate-500',
].join(' ');

/**
 * 사이드바 네비게이션 컴포넌트
 * TASK-502: 대시보드, 리포트, 설정 메뉴가 있는 사이드바
 */
export function Sidebar({ isOpen = true, onClose, isMobile = false }: SidebarProps) {
  const pathname = usePathname();

  // 현재 경로가 네비게이션 아이템의 경로와 일치하는지 확인
  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    if (href === '/settings') {
      return pathname === '/settings' && !pathname.includes('/connections');
    }
    return pathname.startsWith(href);
  };

  // 모바일에서 닫기 핸들러
  const handleNavClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <aside className={SIDEBAR_STYLES}>
      {/* 로고 영역 */}
      <div className={LOGO_WRAPPER_STYLES}>
        <Link href="/dashboard" className={LOGO_CONTENT_STYLES}>
          <div className={LOGO_ICON_STYLES}>
            <Zap className="w-5 h-5" />
          </div>
          <span className={LOGO_TEXT_STYLES}>마케트</span>
        </Link>

        {/* 모바일 닫기 버튼 */}
        {isMobile && onClose && (
          <button
            onClick={onClose}
            className={CLOSE_BUTTON_STYLES}
            aria-label="사이드바 닫기"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 네비게이션 메뉴 */}
      <nav className={NAV_CONTAINER_STYLES} role="navigation" aria-label="메인 네비게이션">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={handleNavClick}
                  className={`${NAV_ITEM_BASE_STYLES} ${
                    active ? NAV_ITEM_ACTIVE_STYLES : NAV_ITEM_INACTIVE_STYLES
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* 푸터 영역 */}
      <div className={FOOTER_STYLES}>
        <p className={VERSION_TEXT_STYLES}>마케트 v1.0.0</p>
      </div>
    </aside>
  );
}

export default Sidebar;
