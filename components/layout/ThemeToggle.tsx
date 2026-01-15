'use client';

import { useState, useEffect, useCallback } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

type Theme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'markeet_theme';

// 스타일 상수
const TOGGLE_CONTAINER_STYLES = [
  'flex items-center gap-1',
  'p-1',
  'bg-slate-100 dark:bg-slate-800',
  'rounded-lg',
].join(' ');

const TOGGLE_BUTTON_STYLES = [
  'p-2 rounded-md',
  'transition-all duration-200',
].join(' ');

const TOGGLE_BUTTON_ACTIVE_STYLES = [
  'bg-white dark:bg-slate-700',
  'text-primary-600 dark:text-primary-400',
  'shadow-sm',
].join(' ');

const TOGGLE_BUTTON_INACTIVE_STYLES = [
  'text-slate-400 dark:text-slate-500',
  'hover:text-slate-600 dark:hover:text-slate-300',
  'hover:bg-slate-200 dark:hover:bg-slate-700',
].join(' ');

interface ThemeToggleProps {
  className?: string;
  showLabels?: boolean;
  compact?: boolean;
}

/**
 * 다크모드 토글 컴포넌트
 * TASK-1207: 다크모드 전환 시 즉시 반영 및 설정 저장
 */
export function ThemeToggle({ className, showLabels, compact }: ThemeToggleProps) {
  const [theme, setTheme] = useState<Theme>('system');
  const [mounted, setMounted] = useState(false);

  // 테마 적용
  const applyTheme = useCallback((newTheme: Theme) => {
    const root = document.documentElement;
    const isDark =
      newTheme === 'dark' ||
      (newTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, []);

  // 초기화
  useEffect(() => {
    setMounted(true);
    const savedTheme = (localStorage.getItem(STORAGE_KEY) as Theme) || 'system';
    setTheme(savedTheme);
    applyTheme(savedTheme);

    // 시스템 테마 변경 감지
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [applyTheme, theme]);

  // 테마 변경
  const handleThemeChange = useCallback((newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme);
    applyTheme(newTheme);
  }, [applyTheme]);

  // 마운트 전에는 렌더링하지 않음 (hydration 에러 방지)
  if (!mounted) {
    return null;
  }

  // 컴팩트 모드 (단일 토글)
  if (compact) {
    const nextTheme: Theme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    const Icon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor;

    return (
      <button
        onClick={() => handleThemeChange(nextTheme)}
        className={`p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${className || ''}`}
        title={`현재: ${theme === 'light' ? '라이트' : theme === 'dark' ? '다크' : '시스템'} 모드`}
      >
        <Icon className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className={`${TOGGLE_CONTAINER_STYLES} ${className || ''}`}>
      <button
        onClick={() => handleThemeChange('light')}
        className={`${TOGGLE_BUTTON_STYLES} ${
          theme === 'light' ? TOGGLE_BUTTON_ACTIVE_STYLES : TOGGLE_BUTTON_INACTIVE_STYLES
        }`}
        title="라이트 모드"
      >
        <Sun className="w-4 h-4" />
        {showLabels && <span className="ml-1 text-xs">라이트</span>}
      </button>

      <button
        onClick={() => handleThemeChange('dark')}
        className={`${TOGGLE_BUTTON_STYLES} ${
          theme === 'dark' ? TOGGLE_BUTTON_ACTIVE_STYLES : TOGGLE_BUTTON_INACTIVE_STYLES
        }`}
        title="다크 모드"
      >
        <Moon className="w-4 h-4" />
        {showLabels && <span className="ml-1 text-xs">다크</span>}
      </button>

      <button
        onClick={() => handleThemeChange('system')}
        className={`${TOGGLE_BUTTON_STYLES} ${
          theme === 'system' ? TOGGLE_BUTTON_ACTIVE_STYLES : TOGGLE_BUTTON_INACTIVE_STYLES
        }`}
        title="시스템 설정 따르기"
      >
        <Monitor className="w-4 h-4" />
        {showLabels && <span className="ml-1 text-xs">시스템</span>}
      </button>
    </div>
  );
}

export default ThemeToggle;
