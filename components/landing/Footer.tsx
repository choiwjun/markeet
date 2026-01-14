import Link from 'next/link';
import { BarChart2 } from 'lucide-react';

// 푸터 링크 데이터
const FOOTER_LINKS = [
  { label: '회사 소개', href: '/about' },
  { label: '블로그', href: '/blog' },
  { label: '채용', href: '/careers' },
  { label: '보도자료', href: '/press' },
  { label: '개인정보처리방침', href: '/privacy' },
  { label: '이용약관', href: '/terms' },
];

interface FooterProps {
  className?: string;
}

/**
 * 랜딩페이지 푸터 컴포넌트 - design.html 스타일 적용
 */
export function Footer({ className }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`bg-white border-t border-gray-100 ${className || ''}`} role="contentinfo">
      <div className="mx-auto max-w-7xl overflow-hidden px-6 py-16 lg:px-8">
        {/* 로고 */}
        <div className="flex justify-center space-x-10 mb-8">
          <Link href="/" className="flex items-center gap-2" aria-label="마케트 홈">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-dark text-white">
              <BarChart2 className="h-4 w-4" aria-hidden="true" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-gray-300">MARKEET</span>
          </Link>
        </div>

        {/* 네비게이션 */}
        <nav aria-label="Footer" className="-mb-6 columns-2 sm:flex sm:justify-center sm:space-x-12">
          {FOOTER_LINKS.map((link) => (
            <div key={link.href} className="pb-6">
              <Link
                href={link.href}
                className="text-sm font-medium leading-6 text-gray-600 hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            </div>
          ))}
        </nav>

        {/* 저작권 */}
        <p className="mt-10 text-center text-xs leading-5 text-gray-400 font-medium">
          &copy; {currentYear} MARKEET Inc. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
