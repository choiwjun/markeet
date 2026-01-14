'use client';

import Link from 'next/link';
import { ArrowRight, BarChart3, TrendingUp, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// 스타일 상수
const HERO_STYLES = [
  'relative',
  'overflow-hidden',
  'bg-gradient-to-b from-slate-50 to-white',
  'dark:from-slate-900 dark:to-slate-800',
].join(' ');

const CONTAINER_STYLES = [
  'max-w-7xl mx-auto',
  'px-4 sm:px-6 lg:px-8',
  'pt-20 pb-16 sm:pt-24 sm:pb-20 lg:pt-32 lg:pb-28',
].join(' ');

const CONTENT_WRAPPER_STYLES = [
  'text-center',
  'max-w-4xl mx-auto',
].join(' ');

const BADGE_STYLES = [
  'inline-flex items-center gap-2',
  'px-4 py-2',
  'bg-primary-50 dark:bg-primary-900/30',
  'text-primary-700 dark:text-primary-300',
  'rounded-full',
  'text-sm font-medium',
  'mb-6',
].join(' ');

const TITLE_STYLES = [
  'text-4xl sm:text-5xl lg:text-6xl',
  'font-bold',
  'text-slate-900 dark:text-white',
  'tracking-tight',
  'mb-6',
].join(' ');

const TITLE_HIGHLIGHT_STYLES = [
  'text-transparent bg-clip-text',
  'bg-gradient-to-r from-primary-600 to-primary-500',
].join(' ');

const DESCRIPTION_STYLES = [
  'text-lg sm:text-xl',
  'text-slate-600 dark:text-slate-300',
  'max-w-2xl mx-auto',
  'mb-10',
  'leading-relaxed',
].join(' ');

const CTA_WRAPPER_STYLES = [
  'flex flex-col sm:flex-row',
  'items-center justify-center',
  'gap-4',
  'mb-16',
].join(' ');

const STATS_WRAPPER_STYLES = [
  'grid grid-cols-1 sm:grid-cols-3',
  'gap-8',
  'pt-12',
  'border-t border-slate-200 dark:border-slate-700',
].join(' ');

const STAT_ITEM_STYLES = [
  'text-center',
].join(' ');

const STAT_VALUE_STYLES = [
  'text-3xl lg:text-4xl font-bold',
  'text-slate-900 dark:text-white',
  'mb-2',
].join(' ');

const STAT_LABEL_STYLES = [
  'text-sm',
  'text-slate-500 dark:text-slate-400',
].join(' ');

// 배경 장식 스타일
const BG_DECORATION_1_STYLES = [
  'absolute -top-40 -right-40',
  'w-80 h-80',
  'bg-primary-100 dark:bg-primary-900/20',
  'rounded-full',
  'blur-3xl',
  'opacity-50',
].join(' ');

const BG_DECORATION_2_STYLES = [
  'absolute -bottom-40 -left-40',
  'w-80 h-80',
  'bg-primary-100 dark:bg-primary-900/20',
  'rounded-full',
  'blur-3xl',
  'opacity-50',
].join(' ');

// 통계 데이터
const STATS = [
  { value: '300%', label: '평균 ROAS 향상' },
  { value: '5분', label: '설정 완료 시간' },
  { value: '10,000+', label: '분석된 캠페인' },
];

interface HeroSectionProps {
  className?: string;
}

/**
 * 랜딩페이지 히어로 섹션
 * TASK-602: 서비스 소개 헤드라인, 부제목, CTA 버튼
 */
export function HeroSection({ className }: HeroSectionProps) {
  return (
    <section className={`${HERO_STYLES} ${className || ''}`} aria-labelledby="hero-title">
      {/* 배경 장식 */}
      <div className={BG_DECORATION_1_STYLES} aria-hidden="true" />
      <div className={BG_DECORATION_2_STYLES} aria-hidden="true" />

      <div className={CONTAINER_STYLES}>
        <div className={CONTENT_WRAPPER_STYLES}>
          {/* 배지 */}
          <div className={BADGE_STYLES}>
            <Zap className="w-4 h-4" aria-hidden="true" />
            <span>AI 기반 광고 분석 플랫폼</span>
          </div>

          {/* 메인 타이틀 */}
          <h1 id="hero-title" className={TITLE_STYLES}>
            광고 데이터가
            <br />
            <span className={TITLE_HIGHLIGHT_STYLES}>성과로 연결</span>되는 순간
          </h1>

          {/* 부제목 */}
          <p className={DESCRIPTION_STYLES}>
            네이버, 카카오, 구글, 메타 광고를 한 곳에서.
            <br className="hidden sm:block" />
            AI가 분석하고, 다음 액션까지 제안해 드립니다.
          </p>

          {/* CTA 버튼 */}
          <div className={CTA_WRAPPER_STYLES}>
            <Link href="/signup" aria-label="무료로 시작하기">
              <Button
                size="lg"
                className="group"
              >
                무료로 시작하기
                <ArrowRight
                  className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
                  aria-hidden="true"
                />
              </Button>
            </Link>
            <Link href="#features" aria-label="기능 살펴보기">
              <Button
                variant="outline"
                size="lg"
              >
                기능 살펴보기
              </Button>
            </Link>
          </div>

          {/* 통계 */}
          <div className={STATS_WRAPPER_STYLES}>
            {STATS.map((stat) => (
              <div key={stat.label} className={STAT_ITEM_STYLES}>
                <div className={STAT_VALUE_STYLES}>{stat.value}</div>
                <div className={STAT_LABEL_STYLES}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
