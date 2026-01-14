import Link from 'next/link';
import { Zap } from 'lucide-react';

// 스타일 상수
const FOOTER_STYLES = [
  'bg-slate-900 dark:bg-slate-950',
  'text-slate-400',
  'py-12 lg:py-16',
].join(' ');

const CONTAINER_STYLES = [
  'max-w-7xl mx-auto',
  'px-4 sm:px-6 lg:px-8',
].join(' ');

const GRID_STYLES = [
  'grid gap-8',
  'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  'mb-12',
].join(' ');

const BRAND_SECTION_STYLES = 'lg:col-span-1';

const LOGO_STYLES = [
  'flex items-center gap-2',
  'text-xl font-bold',
  'text-white',
  'mb-4',
].join(' ');

const LOGO_ICON_STYLES = [
  'w-8 h-8',
  'bg-gradient-to-r from-primary-600 to-primary-500',
  'rounded-lg',
  'flex items-center justify-center',
  'text-white',
].join(' ');

const BRAND_DESCRIPTION_STYLES = [
  'text-sm',
  'text-slate-400',
  'leading-relaxed',
  'max-w-xs',
].join(' ');

const NAV_SECTION_STYLES = 'space-y-4';

const NAV_TITLE_STYLES = [
  'text-sm font-semibold',
  'text-white',
  'uppercase tracking-wider',
].join(' ');

const NAV_LIST_STYLES = 'space-y-2';

const NAV_LINK_STYLES = [
  'text-sm',
  'text-slate-400',
  'hover:text-white',
  'transition-colors duration-200',
].join(' ');

const DIVIDER_STYLES = [
  'border-t border-slate-800',
  'pt-8',
].join(' ');

const BOTTOM_SECTION_STYLES = [
  'flex flex-col sm:flex-row',
  'items-center justify-between',
  'gap-4',
].join(' ');

const COPYRIGHT_STYLES = [
  'text-sm',
  'text-slate-500',
].join(' ');

const SOCIAL_LINKS_STYLES = [
  'flex items-center',
  'gap-4',
].join(' ');

const SOCIAL_LINK_STYLES = [
  'text-slate-400',
  'hover:text-white',
  'transition-colors duration-200',
].join(' ');

// 푸터 링크 데이터
const PRODUCT_LINKS = [
  { label: '주요 기능', href: '#features' },
  { label: '요금제', href: '#pricing' },
  { label: '데모 보기', href: '/demo' },
  { label: '업데이트', href: '/updates' },
];

const SUPPORT_LINKS = [
  { label: '도움말 센터', href: '/help' },
  { label: '문의하기', href: '#contact' },
  { label: 'API 문서', href: '/docs' },
  { label: '상태 페이지', href: '/status' },
];

const LEGAL_LINKS = [
  { label: '이용약관', href: '/terms' },
  { label: '개인정보처리방침', href: '/privacy' },
  { label: '쿠키 정책', href: '/cookies' },
];

interface FooterProps {
  className?: string;
}

/**
 * 랜딩페이지 푸터 컴포넌트
 * TASK-606: 링크, 저작권 정보가 포함된 푸터
 */
export function Footer({ className }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`${FOOTER_STYLES} ${className || ''}`} role="contentinfo">
      <div className={CONTAINER_STYLES}>
        {/* 상단 그리드 */}
        <div className={GRID_STYLES}>
          {/* 브랜드 섹션 */}
          <div className={BRAND_SECTION_STYLES}>
            <Link href="/" className={LOGO_STYLES} aria-label="마케트 홈">
              <div className={LOGO_ICON_STYLES}>
                <Zap className="w-5 h-5" />
              </div>
              <span>마케트</span>
            </Link>
            <p className={BRAND_DESCRIPTION_STYLES}>
              데이터를 보여주는 대시보드를 넘어, 다음 행동까지 알려주는 AI 마케팅 파트너
            </p>
          </div>

          {/* 제품 링크 */}
          <nav className={NAV_SECTION_STYLES} aria-label="제품">
            <h3 className={NAV_TITLE_STYLES}>제품</h3>
            <ul className={NAV_LIST_STYLES}>
              {PRODUCT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={NAV_LINK_STYLES}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* 지원 링크 */}
          <nav className={NAV_SECTION_STYLES} aria-label="지원">
            <h3 className={NAV_TITLE_STYLES}>지원</h3>
            <ul className={NAV_LIST_STYLES}>
              {SUPPORT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={NAV_LINK_STYLES}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* 법적 링크 */}
          <nav className={NAV_SECTION_STYLES} aria-label="법적 고지">
            <h3 className={NAV_TITLE_STYLES}>법적 고지</h3>
            <ul className={NAV_LIST_STYLES}>
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={NAV_LINK_STYLES}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* 하단 섹션 */}
        <div className={DIVIDER_STYLES}>
          <div className={BOTTOM_SECTION_STYLES}>
            <p className={COPYRIGHT_STYLES}>
              © {currentYear} 마케트(Markeet). All rights reserved.
            </p>

            {/* 소셜 링크 */}
            <div className={SOCIAL_LINKS_STYLES}>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className={SOCIAL_LINK_STYLES}
                aria-label="트위터"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className={SOCIAL_LINK_STYLES}
                aria-label="깃허브"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className={SOCIAL_LINK_STYLES}
                aria-label="링크드인"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
