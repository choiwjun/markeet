'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface CTASectionProps {
  className?: string;
}

/**
 * 랜딩페이지 CTA 섹션 - design.html 스타일 적용
 */
export function CTASection({ className }: CTASectionProps) {
  return (
    <section
      className={`py-24 ${className || ''}`}
      aria-labelledby="cta-title"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-primary px-8 py-20 shadow-2xl sm:px-16 md:pt-24 lg:flex lg:gap-x-20 lg:px-24 lg:pt-0">
          {/* 배경 그라데이션 */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-blue-700 to-indigo-900 z-0" />

          {/* 배경 장식 */}
          <svg
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 -z-0 h-[64rem] w-[64rem] -translate-y-1/2 [mask-image:radial-gradient(closest-side,white,transparent)] sm:left-full sm:-ml-80 lg:left-1/2 lg:ml-0 lg:-translate-x-1/2 lg:translate-y-0 opacity-40"
            viewBox="0 0 1024 1024"
          >
            <circle cx="512" cy="512" fill="url(#cta-gradient)" fillOpacity="0.7" r="512" />
            <defs>
              <radialGradient id="cta-gradient">
                <stop stopColor="#7775D6" />
                <stop offset="1" stopColor="#E935C1" />
              </radialGradient>
            </defs>
          </svg>

          {/* 콘텐츠 */}
          <div className="relative z-10 mx-auto max-w-md text-center lg:mx-0 lg:flex-auto lg:py-32 lg:text-left">
            <h2 id="cta-title" className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl leading-snug">
              성장을 자동화할 준비가 되셨나요?
              <br />
              지금 바로 무료로 시작해보세요.
            </h2>
            <p className="mt-6 text-lg leading-8 text-blue-100 font-medium">
              1,000명 이상의 셀러들과 함께 더 똑똑한 의사결정을 시작하세요. 마케트가 여러분의 성장을 돕겠습니다.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6 lg:justify-start">
              <Link
                href="/signup"
                className="rounded-xl bg-white px-8 py-4 text-base font-bold text-primary shadow-lg hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-all hover:scale-105"
              >
                지금 시작하기
              </Link>
              <Link
                href="#features"
                className="text-sm font-bold leading-6 text-white hover:text-blue-100 transition-colors flex items-center gap-1"
              >
                더 알아보기 <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CTASection;
