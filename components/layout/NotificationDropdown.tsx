'use client';

/**
 * 알림 드롭다운 컴포넌트
 * TASK-803: 헤더 알림 드롭다운
 * TASK-804: 알림 뱃지 (읽지 않은 알림 수)
 */

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Bell, Check, Trash2, X, Loader2 } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import {
  NOTIFICATION_ICONS,
  NOTIFICATION_COLORS,
  formatNotificationTime,
} from '@/lib/notifications';
import type { Notification } from '@/types/database';

// 스타일 상수
const BUTTON_STYLES = [
  'relative p-2 rounded-lg',
  'text-slate-600 dark:text-slate-400',
  'hover:bg-slate-100 dark:hover:bg-slate-800',
  'hover:text-slate-900 dark:hover:text-slate-200',
  'transition-colors duration-200',
].join(' ');

const BADGE_STYLES = [
  'absolute -top-0.5 -right-0.5',
  'min-w-[18px] h-[18px]',
  'px-1',
  'bg-danger-500 text-white',
  'text-xs font-medium',
  'rounded-full',
  'flex items-center justify-center',
].join(' ');

const DROPDOWN_STYLES = [
  'absolute right-0 top-full mt-2',
  'w-80 sm:w-96',
  'max-h-[70vh]',
  'bg-white dark:bg-slate-800',
  'border border-slate-200 dark:border-slate-700',
  'rounded-xl',
  'shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50',
  'overflow-hidden',
  'z-50',
].join(' ');

const HEADER_STYLES = [
  'flex items-center justify-between',
  'px-4 py-3',
  'border-b border-slate-200 dark:border-slate-700',
].join(' ');

const HEADER_TITLE_STYLES = 'text-sm font-semibold text-slate-900 dark:text-white';

const MARK_ALL_BUTTON_STYLES = [
  'text-xs text-primary-600 dark:text-primary-400',
  'hover:text-primary-700 dark:hover:text-primary-300',
  'flex items-center gap-1',
  'transition-colors',
].join(' ');

const LIST_STYLES = 'overflow-y-auto max-h-[50vh]';

const ITEM_STYLES = [
  'flex gap-3 p-4',
  'border-b border-slate-100 dark:border-slate-700/50',
  'hover:bg-slate-50 dark:hover:bg-slate-700/50',
  'transition-colors cursor-pointer',
].join(' ');

const UNREAD_ITEM_STYLES = 'bg-primary-50/50 dark:bg-primary-900/10';

const ICON_CONTAINER_STYLES = [
  'flex-shrink-0',
  'w-10 h-10',
  'rounded-full',
  'flex items-center justify-center',
  'text-lg',
].join(' ');

const CONTENT_STYLES = 'flex-1 min-w-0';

const TITLE_STYLES = [
  'text-sm font-medium',
  'text-slate-900 dark:text-white',
  'truncate',
].join(' ');

const MESSAGE_STYLES = [
  'text-xs',
  'text-slate-600 dark:text-slate-400',
  'line-clamp-2 mt-0.5',
].join(' ');

const TIME_STYLES = [
  'text-xs',
  'text-slate-400 dark:text-slate-500',
  'mt-1',
].join(' ');

const ACTIONS_STYLES = 'flex-shrink-0 flex items-center gap-1';

const ACTION_BUTTON_STYLES = [
  'p-1 rounded',
  'text-slate-400 dark:text-slate-500',
  'hover:text-slate-600 dark:hover:text-slate-300',
  'hover:bg-slate-100 dark:hover:bg-slate-700',
  'transition-colors',
].join(' ');

const EMPTY_STYLES = [
  'flex flex-col items-center justify-center',
  'py-12 px-4',
  'text-slate-500 dark:text-slate-400',
].join(' ');

const FOOTER_STYLES = [
  'px-4 py-3',
  'border-t border-slate-200 dark:border-slate-700',
  'text-center',
].join(' ');

const VIEW_ALL_LINK_STYLES = [
  'text-sm text-primary-600 dark:text-primary-400',
  'hover:text-primary-700 dark:hover:text-primary-300',
  'font-medium',
].join(' ');

const LOADING_STYLES = 'flex items-center justify-center py-8';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

function NotificationItem({ notification, onMarkAsRead, onDelete }: NotificationItemProps) {
  const icon = NOTIFICATION_ICONS[notification.type];
  const colorClass = NOTIFICATION_COLORS[notification.type];

  const handleClick = () => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }
    // 알림의 data에 link가 있으면 이동
    if (notification.data && typeof notification.data === 'object' && 'link' in notification.data) {
      window.location.href = notification.data.link as string;
    }
  };

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMarkAsRead(notification.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(notification.id);
  };

  return (
    <div
      className={`${ITEM_STYLES} ${!notification.is_read ? UNREAD_ITEM_STYLES : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
    >
      <div className={`${ICON_CONTAINER_STYLES} bg-slate-100 dark:bg-slate-700`}>
        <span className={colorClass}>{icon}</span>
      </div>

      <div className={CONTENT_STYLES}>
        <p className={TITLE_STYLES}>{notification.title}</p>
        <p className={MESSAGE_STYLES}>{notification.message}</p>
        <p className={TIME_STYLES}>{formatNotificationTime(notification.created_at)}</p>
      </div>

      <div className={ACTIONS_STYLES}>
        {!notification.is_read && (
          <button
            onClick={handleMarkAsRead}
            className={ACTION_BUTTON_STYLES}
            aria-label="읽음으로 표시"
            title="읽음으로 표시"
          >
            <Check className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={handleDelete}
          className={ACTION_BUTTON_STYLES}
          aria-label="삭제"
          title="삭제"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    remove,
  } = useNotifications({ limit: 10 });

  // 드롭다운 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ESC 키로 드롭다운 닫기
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 알림 버튼 */}
      <button
        onClick={toggleDropdown}
        className={BUTTON_STYLES}
        aria-label={`알림 ${unreadCount > 0 ? `(${unreadCount}개의 읽지 않은 알림)` : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className={BADGE_STYLES} aria-hidden="true">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* 드롭다운 */}
      {isOpen && (
        <div className={DROPDOWN_STYLES} role="menu">
          {/* 헤더 */}
          <div className={HEADER_STYLES}>
            <h3 className={HEADER_TITLE_STYLES}>알림</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className={MARK_ALL_BUTTON_STYLES}
              >
                <Check className="w-3 h-3" />
                모두 읽음
              </button>
            )}
          </div>

          {/* 알림 목록 */}
          <div className={LIST_STYLES}>
            {isLoading ? (
              <div className={LOADING_STYLES}>
                <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
              </div>
            ) : notifications.length === 0 ? (
              <div className={EMPTY_STYLES}>
                <Bell className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm">알림이 없습니다</p>
              </div>
            ) : (
              notifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onDelete={remove}
                />
              ))
            )}
          </div>

          {/* 푸터 */}
          {notifications.length > 0 && (
            <div className={FOOTER_STYLES}>
              <Link
                href="/settings/notifications"
                className={VIEW_ALL_LINK_STYLES}
                onClick={() => setIsOpen(false)}
              >
                알림 설정
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationDropdown;
