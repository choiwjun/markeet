'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Menu, Bell, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface HeaderProps {
  onMenuClick?: () => void;
}

// 스타일 상수
const HEADER_STYLES = [
  'sticky top-0 z-30',
  'h-16',
  'bg-white/80 dark:bg-slate-900/80',
  'backdrop-blur-md',
  'border-b border-slate-200 dark:border-slate-700',
].join(' ');

const HEADER_CONTENT_STYLES = [
  'h-full',
  'px-4 lg:px-6',
  'flex items-center justify-between',
].join(' ');

const LEFT_SECTION_STYLES = 'flex items-center gap-4';

const MENU_BUTTON_STYLES = [
  'lg:hidden',
  'p-2 rounded-lg',
  'text-slate-600 dark:text-slate-400',
  'hover:bg-slate-100 dark:hover:bg-slate-800',
  'hover:text-slate-900 dark:hover:text-slate-200',
  'transition-colors duration-200',
].join(' ');

const RIGHT_SECTION_STYLES = 'flex items-center gap-2';

const NOTIFICATION_BUTTON_STYLES = [
  'relative p-2 rounded-lg',
  'text-slate-600 dark:text-slate-400',
  'hover:bg-slate-100 dark:hover:bg-slate-800',
  'hover:text-slate-900 dark:hover:text-slate-200',
  'transition-colors duration-200',
].join(' ');

const NOTIFICATION_DOT_STYLES = [
  'absolute top-1.5 right-1.5',
  'w-2 h-2',
  'bg-danger-500',
  'rounded-full',
].join(' ');

const USER_MENU_BUTTON_STYLES = [
  'flex items-center gap-2',
  'px-3 py-2 rounded-lg',
  'text-slate-600 dark:text-slate-400',
  'hover:bg-slate-100 dark:hover:bg-slate-800',
  'hover:text-slate-900 dark:hover:text-slate-200',
  'transition-colors duration-200',
].join(' ');

const USER_AVATAR_STYLES = [
  'w-8 h-8',
  'bg-primary-100 dark:bg-primary-900/30',
  'text-primary-600 dark:text-primary-400',
  'rounded-full',
  'flex items-center justify-center',
].join(' ');

const USER_NAME_STYLES = [
  'hidden sm:block',
  'text-sm font-medium',
  'max-w-[120px] truncate',
].join(' ');

const DROPDOWN_STYLES = [
  'absolute right-0 top-full mt-2',
  'w-56',
  'bg-white dark:bg-slate-800',
  'border border-slate-200 dark:border-slate-700',
  'rounded-xl',
  'shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50',
  'py-2',
  'z-50',
].join(' ');

const DROPDOWN_HEADER_STYLES = [
  'px-4 py-2',
  'border-b border-slate-200 dark:border-slate-700',
].join(' ');

const DROPDOWN_EMAIL_STYLES = [
  'text-xs',
  'text-slate-500 dark:text-slate-400',
  'truncate',
].join(' ');

const DROPDOWN_ITEM_STYLES = [
  'flex items-center gap-3',
  'w-full px-4 py-2.5',
  'text-sm',
  'text-slate-600 dark:text-slate-400',
  'hover:bg-slate-100 dark:hover:bg-slate-700',
  'hover:text-slate-900 dark:hover:text-slate-200',
  'transition-colors duration-200',
].join(' ');

const DROPDOWN_DIVIDER_STYLES = [
  'my-2',
  'border-t border-slate-200 dark:border-slate-700',
].join(' ');

const LOGOUT_BUTTON_STYLES = [
  'flex items-center gap-3',
  'w-full px-4 py-2.5',
  'text-sm',
  'text-danger-600 dark:text-danger-400',
  'hover:bg-danger-50 dark:hover:bg-danger-900/20',
  'transition-colors duration-200',
].join(' ');

/**
 * 헤더 컴포넌트
 * TASK-504: 로고, 알림, 사용자 메뉴가 있는 헤더
 */
export function Header({ onMenuClick }: HeaderProps) {
  const { user, signOut } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 드롭다운 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // ESC 키로 드롭다운 닫기
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isDropdownOpen) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDropdownOpen]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSignOut = async () => {
    setIsDropdownOpen(false);
    await signOut();
  };

  // 사용자 이름 또는 이메일에서 표시명 추출
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || '사용자';

  return (
    <header className={HEADER_STYLES}>
      <div className={HEADER_CONTENT_STYLES}>
        {/* 왼쪽 영역 */}
        <div className={LEFT_SECTION_STYLES}>
          {/* 모바일 햄버거 메뉴 버튼 */}
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className={MENU_BUTTON_STYLES}
              aria-label="메뉴 열기"
            >
              <Menu className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* 오른쪽 영역 */}
        <div className={RIGHT_SECTION_STYLES}>
          {/* 알림 버튼 */}
          <button
            className={NOTIFICATION_BUTTON_STYLES}
            aria-label="알림"
          >
            <Bell className="w-5 h-5" />
            {/* 알림 표시 (하드코딩 - 추후 실제 알림 시스템 연동) */}
            <span className={NOTIFICATION_DOT_STYLES} aria-hidden="true" />
          </button>

          {/* 사용자 메뉴 */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleDropdown}
              className={USER_MENU_BUTTON_STYLES}
              aria-expanded={isDropdownOpen}
              aria-haspopup="true"
              aria-label="사용자 메뉴"
            >
              <div className={USER_AVATAR_STYLES}>
                <User className="w-4 h-4" />
              </div>
              <span className={USER_NAME_STYLES}>{displayName}</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* 드롭다운 메뉴 */}
            {isDropdownOpen && (
              <div className={DROPDOWN_STYLES} role="menu">
                <div className={DROPDOWN_HEADER_STYLES}>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {displayName}
                  </p>
                  {user?.email && (
                    <p className={DROPDOWN_EMAIL_STYLES}>{user.email}</p>
                  )}
                </div>

                <Link
                  href="/settings"
                  className={DROPDOWN_ITEM_STYLES}
                  role="menuitem"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <Settings className="w-4 h-4" />
                  <span>설정</span>
                </Link>

                <div className={DROPDOWN_DIVIDER_STYLES} />

                <button
                  onClick={handleSignOut}
                  className={LOGOUT_BUTTON_STYLES}
                  role="menuitem"
                >
                  <LogOut className="w-4 h-4" />
                  <span>로그아웃</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
