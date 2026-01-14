'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import {
  ScrollAnimation,
  HoverScale,
  PulseGlow,
  fadeInUp,
  scaleIn
} from './animations';

interface CTASectionProps {
  className?: string;
}

/**
 * 랜딩페이지 CTA 섹션 - 애니메이션 적용
 */
export function CTASection({ className }: CTASectionProps) {
  return (
    <section
      className={`relative py-24 overflow-hidden ${className || ''}`}
      aria-labelledby="cta-title"
    >
      {/* 배경 그라데이션 */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-blue-900" />

      {/* 배경 장식 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <svg className="absolute left-0 top-0 w-full h-full opacity-10" fill="none" preserveAspectRatio="none" viewBox="0 0 1440 600">
          <defs>
            <linearGradient id="cta-grad" x1="0%" x2="100%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <circle cx="200" cy="100" r="300" fill="url(#cta-grad)" />
          <circle cx="1200" cy="500" r="400" fill="url(#cta-grad)" />
        </svg>
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        {/* 아이콘 */}
        <ScrollAnimation variants={scaleIn}>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm mb-8 border border-white/20">
            <Sparkles className="w-8 h-8 text-white" aria-hidden="true" />
          </div>
        </ScrollAnimation>

        {/* 타이틀 */}
        <ScrollAnimation variants={fadeInUp} delay={0.1}>
          <h2
            id="cta-title"
            className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl mb-6 tracking-tight"
          >
            성장을 자동화할 준비가 되셨나요?
          </h2>
        </ScrollAnimation>

        {/* 부제목 */}
        <ScrollAnimation variants={fadeInUp} delay={0.2}>
          <p className="text-lg text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            지금 바로 시작하세요. 복잡한 설정 없이 5분 만에 <br className="hidden sm:block" />
            모든 플랫폼 데이터를 연동하고 AI 분석을 경험해보세요.
          </p>
        </ScrollAnimation>

        {/* CTA 버튼 */}
        <ScrollAnimation variants={fadeInUp} delay={0.3}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <PulseGlow>
              <HoverScale scale={1.05}>
                <Link
                  href="/signup"
                  className="h-14 px-10 rounded-xl bg-white text-primary text-base font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  지금 시작하기
                  <ArrowRight className="w-5 h-5" aria-hidden="true" />
                </Link>
              </HoverScale>
            </PulseGlow>
            <HoverScale scale={1.03}>
              <Link
                href="#features"
                className="h-14 px-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/30 text-white text-base font-bold hover:bg-white/20 transition-all flex items-center justify-center"
              >
                더 알아보기
              </Link>
            </HoverScale>
          </div>
        </ScrollAnimation>

        {/* 신뢰 지표 */}
        <ScrollAnimation variants={fadeInUp} delay={0.4}>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-blue-200">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>무료 체험 가능</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>신용카드 불필요</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>언제든 취소 가능</span>
            </div>
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
}

export default CTASection;
