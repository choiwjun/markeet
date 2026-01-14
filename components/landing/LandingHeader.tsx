'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, BarChart2, ArrowRight } from 'lucide-react';

// 네비게이션 링크
const NAV_LINKS = [
  { label: '주요 기능', href: '#features' },
  { label: '요금제', href: '#pricing' },
  { label: '고객 사례', href: '#testimonials' },
  { label: '문의', href: '#contact' },
];

interface LandingHeaderProps {
  className?: string;
}

/**
 * 랜딩페이지 헤더/네비게이션 - design.html 스타일 적용
 */
export function LandingHeader({ className }: LandingHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b transition-all ${
        isScrolled
          ? 'border-neutral-100 bg-white/90 backdrop-blur-md'
          : 'border-transparent bg-white/90 backdrop-blur-md'
      } ${className || ''}`}
      role="banner"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* 로고 */}
        <Link href="/" className="flex items-center gap-2" aria-label="마케트 홈">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-dark text-white shadow-md">
            <BarChart2 className="h-5 w-5" aria-hidden="true" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-text-main">MARKEET</span>
        </Link>

        {/* 데스크톱 네비게이션 */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-bold text-text-sub hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* 데스크톱 액션 버튼 */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-bold text-text-main hover:text-primary transition-colors"
          >
            로그인
          </Link>
          <Link
            href="/signup"
            className="group relative flex h-11 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-primary to-primary-light px-6 text-sm font-bold text-white shadow-soft transition-all hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <span className="relative z-10 flex items-center gap-2">
              무료로 시작하기
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </span>
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-600 to-blue-500 opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
        </div>

        {/* 모바일 메뉴 버튼 */}
        <button
          type="button"
          className="md:hidden p-2 text-text-sub hover:text-text-main transition-colors"
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
      </div>

      {/* 모바일 메뉴 */}
      {isMobileMenuOpen && (
        <div id="mobile-menu" className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-neutral-100 shadow-lg">
          <nav className="flex flex-col py-4 px-4 sm:px-6" aria-label="모바일 네비게이션">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="py-3 text-base font-bold text-text-sub hover:text-primary border-b border-neutral-100 transition-colors"
                onClick={closeMobileMenu}
              >
                {link.label}
              </Link>
            ))}

            <div className="flex flex-col gap-3 pt-4">
              <Link
                href="/login"
                className="w-full py-3 text-center font-bold text-text-main border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors"
                onClick={closeMobileMenu}
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="w-full py-3 text-center font-bold text-white bg-gradient-to-r from-primary to-primary-light rounded-xl shadow-soft hover:shadow-lg transition-all"
                onClick={closeMobileMenu}
              >
                무료로 시작하기
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export default LandingHeader;
