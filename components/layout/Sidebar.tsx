'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  FileText,
  Settings,
  Link2,
  TrendingUp,
  X,
  User,
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

/**
 * 사이드바 네비게이션 컴포넌트
 * dashboard.html 디자인 스타일 적용
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
    <aside className="w-[260px] bg-white dark:bg-[#111827] border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between shrink-0 h-full z-20 shadow-[4px_0_24px_-4px_rgba(0,0,0,0.02)]">
      <div className="flex flex-col gap-6 p-5 h-full">
        {/* 로고 영역 */}
        <div className="flex items-center justify-between px-1 py-1">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary to-indigo-500 rounded-xl w-9 h-9 flex items-center justify-center shadow-lg shadow-primary/25">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-slate-900 dark:text-white text-lg font-extrabold leading-none tracking-tight">
                MARKEET
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] font-bold mt-0.5">
                AI Marketing Console
              </p>
            </div>
          </Link>

          {/* 모바일 닫기 버튼 */}
          {isMobile && onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors duration-200"
              aria-label="사이드바 닫기"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* 네비게이션 메뉴 */}
        <nav className="flex flex-col gap-1.5 flex-1 mt-2" role="navigation" aria-label="메인 네비게이션">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNavClick}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  active
                    ? 'bg-primary/5 text-primary dark:bg-primary/20 dark:text-blue-300 font-bold shadow-sm ring-1 ring-primary/10 dark:ring-primary/30'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 font-medium'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                <span className={`${active ? '' : 'group-hover:scale-105'} transition-transform`}>
                  {item.icon}
                </span>
                <span className="text-[14px]">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* 사용자 프로필 영역 */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
            <div className="relative">
              <div className="bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 rounded-full w-9 h-9 flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm">
                <User className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-slate-800"></div>
            </div>
            <div className="flex flex-col">
              <p className="text-slate-900 dark:text-white text-[13px] font-bold">사용자</p>
              <p className="text-slate-400 dark:text-slate-500 text-[11px] truncate max-w-[100px]">마케트 사용자</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
