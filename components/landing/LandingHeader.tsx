'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// 스타일 상수
const HEADER_BASE_STYLES = [
  'fixed top-0 left-0 right-0',
  'z-50',
  'transition-all duration-300',
].join(' ');

const HEADER_TRANSPARENT_STYLES = 'bg-transparent';

const HEADER_SCROLLED_STYLES = [
  'bg-white/90 dark:bg-slate-900/90',
  'backdrop-blur-md',
  'shadow-sm',
].join(' ');

const CONTAINER_STYLES = [
  'max-w-7xl mx-auto',
  'px-4 sm:px-6 lg:px-8',
].join(' ');

const NAV_WRAPPER_STYLES = [
  'flex items-center justify-between',
  'h-16 lg:h-20',
].join(' ');

const LOGO_STYLES = [
  'flex items-center gap-2',
  'text-xl font-bold',
  'text-slate-900 dark:text-white',
].join(' ');

const LOGO_ICON_STYLES = [
  'w-8 h-8',
  'bg-gradient-to-r from-primary-600 to-primary-500',
  'rounded-lg',
  'flex items-center justify-center',
  'text-white',
].join(' ');

const DESKTOP_NAV_STYLES = [
  'hidden lg:flex',
  'items-center',
  'gap-8',
].join(' ');

const NAV_LINK_STYLES = [
  'text-sm font-medium',
  'text-slate-600 dark:text-slate-300',
  'hover:text-primary-600 dark:hover:text-primary-400',
  'transition-colors duration-200',
].join(' ');

const DESKTOP_ACTIONS_STYLES = [
  'hidden lg:flex',
  'items-center',
  'gap-4',
].join(' ');

const MOBILE_MENU_BUTTON_STYLES = [
  'lg:hidden',
  'p-2',
  'text-slate-600 dark:text-slate-300',
  'hover:text-slate-900 dark:hover:text-white',
  'transition-colors',
].join(' ');

const MOBILE_MENU_STYLES = [
  'lg:hidden',
  'absolute top-full left-0 right-0',
  'bg-white dark:bg-slate-900',
  'border-b border-slate-200 dark:border-slate-700',
  'shadow-lg',
].join(' ');

const MOBILE_NAV_STYLES = [
  'flex flex-col',
  'py-4',
  'px-4 sm:px-6',
].join(' ');

const MOBILE_NAV_LINK_STYLES = [
  'py-3',
  'text-base font-medium',
  'text-slate-600 dark:text-slate-300',
  'hover:text-primary-600 dark:hover:text-primary-400',
  'border-b border-slate-100 dark:border-slate-800',
  'transition-colors',
].join(' ');

const MOBILE_ACTIONS_STYLES = [
  'flex flex-col',
  'gap-3',
  'pt-4',
].join(' ');

// 네비게이션 링크
const NAV_LINKS = [
  { label: '기능', href: '#features' },
  { label: '요금제', href: '#pricing' },
  { label: '고객 사례', href: '#testimonials' },
  { label: '문의', href: '#contact' },
];

interface LandingHeaderProps {
  className?: string;
}

/**
 * 랜딩페이지 헤더/네비게이션
 * TASK-601, TASK-605: 반응형 헤더 with 모바일 메뉴
 */
export function LandingHeader({ className }: LandingHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 스크롤 감지
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 모바일 메뉴 토글
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const headerStyles = `${HEADER_BASE_STYLES} ${
    isScrolled ? HEADER_SCROLLED_STYLES : HEADER_TRANSPARENT_STYLES
  } ${className || ''}`;

  return (
    <header className={headerStyles} role="banner">
      <div className={CONTAINER_STYLES}>
        <nav className={NAV_WRAPPER_STYLES} role="navigation" aria-label="메인 네비게이션">
          {/* 로고 */}
          <Link href="/" className={LOGO_STYLES} aria-label="마케트 홈">
            <div className={LOGO_ICON_STYLES}>
              <Zap className="w-5 h-5" aria-hidden="true" />
            </div>
            <span>마케트</span>
          </Link>

          {/* 데스크톱 네비게이션 */}
          <div className={DESKTOP_NAV_STYLES}>
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={NAV_LINK_STYLES}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* 데스크톱 액션 버튼 */}
          <div className={DESKTOP_ACTIONS_STYLES}>
            <Link href="/login">
              <Button variant="ghost" size="sm">
                로그인
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">무료로 시작하기</Button>
            </Link>
          </div>

          {/* 모바일 메뉴 버튼 */}
          <button
            type="button"
            className={MOBILE_MENU_BUTTON_STYLES}
            onClick={toggleMobileMenu}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMobileMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" aria-hidden="true" />
            ) : (
              <Menu className="w-6 h-6" aria-hidden="true" />
            )}
          </button>
        </nav>

        {/* 모바일 메뉴 */}
        {isMobileMenuOpen && (
          <div id="mobile-menu" className={MOBILE_MENU_STYLES}>
            <nav className={MOBILE_NAV_STYLES} aria-label="모바일 네비게이션">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={MOBILE_NAV_LINK_STYLES}
                  onClick={closeMobileMenu}
                >
                  {link.label}
                </Link>
              ))}

              <div className={MOBILE_ACTIONS_STYLES}>
                <Link href="/login" onClick={closeMobileMenu}>
                  <Button variant="outline" className="w-full">
                    로그인
                  </Button>
                </Link>
                <Link href="/signup" onClick={closeMobileMenu}>
                  <Button className="w-full">무료로 시작하기</Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

export default LandingHeader;
