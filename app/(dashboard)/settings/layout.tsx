'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Shield, Bell, Link2, Download, Trash2 } from 'lucide-react';

// 설정 메뉴 항목
const SETTINGS_MENU = [
  {
    label: '프로필',
    href: '/settings/profile',
    icon: User,
    description: '이름, 이메일, 프로필 이미지',
  },
  {
    label: '보안',
    href: '/settings/security',
    icon: Shield,
    description: '비밀번호 변경',
  },
  {
    label: '알림',
    href: '/settings/notifications',
    icon: Bell,
    description: '이메일, 인앱 알림 설정',
  },
  {
    label: '플랫폼 연동',
    href: '/settings/connections',
    icon: Link2,
    description: '광고/커머스 플랫폼 연동',
  },
  {
    label: '데이터 내보내기',
    href: '/settings/export',
    icon: Download,
    description: 'CSV, JSON 내보내기',
  },
  {
    label: '계정 삭제',
    href: '/settings/delete-account',
    icon: Trash2,
    description: '계정 및 데이터 삭제',
    danger: true,
  },
];

// 스타일 상수
const LAYOUT_STYLES = 'flex flex-col lg:flex-row gap-8';

const SIDEBAR_STYLES = [
  'w-full lg:w-64 flex-shrink-0',
  'bg-white dark:bg-slate-800',
  'rounded-xl',
  'border border-slate-200 dark:border-slate-700',
  'p-4',
  'h-fit',
].join(' ');

const SIDEBAR_TITLE_STYLES = [
  'text-lg font-semibold',
  'text-slate-900 dark:text-white',
  'px-3 pb-4 mb-2',
  'border-b border-slate-200 dark:border-slate-700',
].join(' ');

const MENU_ITEM_BASE_STYLES = [
  'flex items-center gap-3',
  'px-3 py-3',
  'rounded-lg',
  'transition-colors duration-200',
  'cursor-pointer',
].join(' ');

const MENU_ITEM_ACTIVE_STYLES = [
  'bg-primary-50 dark:bg-primary-500/10',
  'text-primary-600 dark:text-primary-400',
].join(' ');

const MENU_ITEM_INACTIVE_STYLES = [
  'text-slate-600 dark:text-slate-400',
  'hover:bg-slate-50 dark:hover:bg-slate-700/50',
].join(' ');

const MENU_ITEM_DANGER_STYLES = [
  'text-danger-600 dark:text-danger-400',
  'hover:bg-danger-50 dark:hover:bg-danger-500/10',
].join(' ');

const MENU_ICON_STYLES = 'w-5 h-5 flex-shrink-0';

const MENU_TEXT_STYLES = 'flex flex-col';

const MENU_LABEL_STYLES = 'font-medium text-sm';

const MENU_DESCRIPTION_STYLES = [
  'text-xs',
  'text-slate-400 dark:text-slate-500',
  'mt-0.5',
].join(' ');

const CONTENT_STYLES = 'flex-1 min-w-0';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className={LAYOUT_STYLES}>
      {/* 사이드바 */}
      <nav className={SIDEBAR_STYLES}>
        <h2 className={SIDEBAR_TITLE_STYLES}>설정</h2>
        <ul className="space-y-1">
          {SETTINGS_MENU.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            let itemStyles = MENU_ITEM_BASE_STYLES;
            if (isActive) {
              itemStyles += ' ' + MENU_ITEM_ACTIVE_STYLES;
            } else if (item.danger) {
              itemStyles += ' ' + MENU_ITEM_DANGER_STYLES;
            } else {
              itemStyles += ' ' + MENU_ITEM_INACTIVE_STYLES;
            }

            return (
              <li key={item.href}>
                <Link href={item.href} className={itemStyles}>
                  <Icon className={MENU_ICON_STYLES} />
                  <div className={MENU_TEXT_STYLES}>
                    <span className={MENU_LABEL_STYLES}>{item.label}</span>
                    <span className={MENU_DESCRIPTION_STYLES}>
                      {item.description}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* 컨텐츠 */}
      <main className={CONTENT_STYLES}>{children}</main>
    </div>
  );
}
