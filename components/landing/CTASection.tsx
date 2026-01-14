'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// 스타일 상수
const SECTION_STYLES = [
  'py-20 lg:py-28',
  'bg-gradient-to-br from-primary-600 to-primary-700',
  'dark:from-primary-700 dark:to-primary-800',
].join(' ');

const CONTAINER_STYLES = [
  'max-w-7xl mx-auto',
  'px-4 sm:px-6 lg:px-8',
].join(' ');

const CONTENT_WRAPPER_STYLES = [
  'max-w-3xl mx-auto',
  'text-center',
].join(' ');

const TITLE_STYLES = [
  'text-3xl sm:text-4xl lg:text-5xl',
  'font-bold',
  'text-white',
  'mb-6',
].join(' ');

const DESCRIPTION_STYLES = [
  'text-lg',
  'text-primary-100',
  'mb-10',
  'leading-relaxed',
].join(' ');

const BENEFITS_LIST_STYLES = [
  'flex flex-col sm:flex-row',
  'items-center justify-center',
  'gap-4 sm:gap-8',
  'mb-10',
].join(' ');

const BENEFIT_ITEM_STYLES = [
  'flex items-center gap-2',
  'text-white',
  'text-sm sm:text-base',
].join(' ');

const CTA_WRAPPER_STYLES = [
  'flex flex-col sm:flex-row',
  'items-center justify-center',
  'gap-4',
].join(' ');

const PRIMARY_CTA_STYLES = [
  'bg-white',
  'text-primary-600',
  'hover:bg-primary-50',
  'shadow-lg shadow-primary-900/30',
].join(' ');

const SECONDARY_CTA_STYLES = [
  'border-2 border-white/30',
  'text-white',
  'hover:bg-white/10',
  'backdrop-blur-sm',
].join(' ');

// 혜택 목록
const BENEFITS = [
  '신용카드 불필요',
  '14일 무료 체험',
  '언제든 취소 가능',
];

interface CTASectionProps {
  className?: string;
}

/**
 * 랜딩페이지 CTA 섹션
 * TASK-604: 액션 유도 버튼 및 혜택 설명
 */
export function CTASection({ className }: CTASectionProps) {
  return (
    <section
      className={`${SECTION_STYLES} ${className || ''}`}
      aria-labelledby="cta-title"
    >
      <div className={CONTAINER_STYLES}>
        <div className={CONTENT_WRAPPER_STYLES}>
          {/* 타이틀 */}
          <h2 id="cta-title" className={TITLE_STYLES}>
            지금 바로 시작하세요
          </h2>

          {/* 설명 */}
          <p className={DESCRIPTION_STYLES}>
            복잡한 설정 없이 5분 만에 모든 광고 플랫폼을 연동하고,
            <br className="hidden sm:block" />
            AI 기반의 인사이트를 받아보세요.
          </p>

          {/* 혜택 목록 */}
          <ul className={BENEFITS_LIST_STYLES}>
            {BENEFITS.map((benefit) => (
              <li key={benefit} className={BENEFIT_ITEM_STYLES}>
                <CheckCircle className="w-5 h-5 text-primary-200" aria-hidden="true" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>

          {/* CTA 버튼 */}
          <div className={CTA_WRAPPER_STYLES}>
            <Link href="/signup" aria-label="무료 체험 시작하기">
              <Button size="lg" className={`group ${PRIMARY_CTA_STYLES}`}>
                무료 체험 시작하기
                <ArrowRight
                  className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
                  aria-hidden="true"
                />
              </Button>
            </Link>
            <Link href="#contact" aria-label="문의하기">
              <Button size="lg" variant="ghost" className={SECONDARY_CTA_STYLES}>
                문의하기
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CTASection;
