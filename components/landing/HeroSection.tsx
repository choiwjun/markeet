'use client';

import Link from 'next/link';
import { ArrowRight, Play } from 'lucide-react';
import {
  ScrollAnimation,
  StaggerContainer,
  StaggerItem,
  TypingAnimation,
  CounterAnimation,
  HoverScale,
  Floating,
  fadeInUp,
  fadeInDown,
  scaleIn
} from './animations';

// 통계 데이터
const STATS = [
  { value: 300, suffix: '%', label: '평균 ROAS 향상' },
  { value: 5, suffix: '분', label: '설정 완료 시간' },
  { value: 10000, suffix: '+', label: '분석된 캠페인' },
];

interface HeroSectionProps {
  className?: string;
}

/**
 * 랜딩페이지 히어로 섹션 - 애니메이션 적용
 */
export function HeroSection({ className }: HeroSectionProps) {
  return (
    <section className={`relative overflow-hidden ${className || ''}`} aria-labelledby="hero-title">
      {/* 배경 패턴 */}
      <div className="absolute inset-0 z-0 hero-pattern pointer-events-none h-[1200px] w-full [mask-image:linear-gradient(to_bottom,white,transparent)]" />

      {/* 배경 장식 라인 */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <svg className="absolute left-0 top-0 w-full h-full opacity-40" fill="none" preserveAspectRatio="none" viewBox="0 0 1440 1000">
          <defs>
            <linearGradient id="grad-line" x1="0%" x2="100%" y1="100%" y2="0%">
              <stop offset="0%" stopColor="#2452eb" stopOpacity="0" />
              <stop offset="50%" stopColor="#2452eb" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M-100,900 C300,800 600,600 1200,0" stroke="url(#grad-line)" strokeDasharray="8 8" strokeWidth="1.5" />
          <path d="M0,950 C400,850 700,550 1400,100" stroke="url(#grad-line)" strokeWidth="3" />
          <path d="M100,1000 C500,900 800,700 1500,200" stroke="url(#grad-line)" strokeDasharray="4 4" strokeWidth="1" />
        </svg>

        {/* 파티클 효과 - 플로팅 애니메이션 적용 */}
        <Floating duration={4} distance={8}>
          <div className="particle w-2 h-2 bg-blue-400 left-[15%] top-[30%] blur-[1px]" style={{ position: 'absolute', left: '15%', top: '30%' }} />
        </Floating>
        <Floating duration={5} distance={12}>
          <div className="particle w-1.5 h-1.5 bg-indigo-300 left-[25%] top-[20%]" style={{ position: 'absolute', left: '25%', top: '20%' }} />
        </Floating>
        <Floating duration={6} distance={10}>
          <div className="particle w-3 h-3 bg-primary/20 left-[85%] top-[15%] blur-[2px]" style={{ position: 'absolute', left: '85%', top: '15%' }} />
        </Floating>
        <Floating duration={3.5} distance={6}>
          <div className="particle w-1 h-1 bg-blue-500 left-[80%] top-[40%]" style={{ position: 'absolute', left: '80%', top: '40%' }} />
        </Floating>
        <Floating duration={4.5} distance={15}>
          <div className="particle w-2.5 h-2.5 bg-blue-200 left-[10%] top-[60%] blur-[1px]" style={{ position: 'absolute', left: '10%', top: '60%' }} />
        </Floating>

        {/* 배경 블러 효과 */}
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-100/30 blur-[100px] rounded-full -z-10" />
      </div>

      <div className="relative z-10 pt-20 pb-24 lg:pt-32 lg:pb-36">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative">
          {/* 업데이트 배지 */}
          <ScrollAnimation variants={fadeInDown} delay={0}>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-4 py-1.5 mb-10 shadow-sm backdrop-blur-md ring-1 ring-blue-50 hover:ring-blue-200 transition-all cursor-default">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
              </span>
              <span className="text-xs font-bold text-primary uppercase tracking-wide">AI 기반 광고 분석 플랫폼</span>
            </div>
          </ScrollAnimation>

          {/* 메인 타이틀 - 타이핑 애니메이션 */}
          <ScrollAnimation variants={fadeInUp} delay={0.1}>
            <h1 id="hero-title" className="mx-auto max-w-5xl text-5xl font-extrabold leading-[1.2] tracking-tight text-text-main sm:text-6xl lg:text-7xl mb-8">
              <TypingAnimation text="엑셀 지옥은 이제 끝," speed={80} delay={500} cursor={false} />
              <br className="hidden sm:block" />
              AI와 함께 <span className="text-gradient relative inline-block">
                데이터 기반 성장
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-blue-200 -z-10 opacity-60" fill="currentColor" preserveAspectRatio="none" viewBox="0 0 100 10">
                  <path d="M0 5 Q 50 10 100 5 L 100 0 Q 50 5 0 0 Z" />
                </svg>
              </span>을 시작하세요
            </h1>
          </ScrollAnimation>

          {/* 부제목 */}
          <ScrollAnimation variants={fadeInUp} delay={0.2}>
            <p className="mx-auto max-w-2xl text-lg text-text-sub mb-12 leading-relaxed font-medium">
              매주 <span className="font-bold text-text-main bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">27.5시간</span>의 단순 반복 업무를 자동화로 해결합니다. <br className="hidden sm:block" />
              복잡한 데이터 분석은 AI에게 맡기고 비즈니스 성장에만 집중하세요.
            </p>
          </ScrollAnimation>

          {/* CTA 버튼 */}
          <ScrollAnimation variants={fadeInUp} delay={0.3}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-24 relative z-20">
              <HoverScale scale={1.05}>
                <Link
                  href="/signup"
                  className="h-14 px-10 rounded-xl bg-gradient-to-r from-primary to-primary-light text-white text-base font-bold shadow-glow hover:shadow-glow-intense transition-all w-full sm:w-auto flex items-center justify-center gap-2 ring-2 ring-primary/20 ring-offset-2"
                >
                  무료 체험하기
                  <ArrowRight className="w-5 h-5" aria-hidden="true" />
                </Link>
              </HoverScale>
              <HoverScale scale={1.03}>
                <Link
                  href="#features"
                  className="h-14 px-10 rounded-xl bg-white border border-neutral-200 text-text-main text-base font-bold hover:bg-neutral-50 hover:border-neutral-300 transition-all w-full sm:w-auto flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                >
                  <Play className="w-5 h-5 text-primary" aria-hidden="true" />
                  서비스 둘러보기
                </Link>
              </HoverScale>
            </div>
          </ScrollAnimation>

          {/* 대시보드 프리뷰 */}
          <ScrollAnimation variants={scaleIn} delay={0.4}>
            <div className="relative mx-auto max-w-6xl rounded-2xl bg-white/80 p-3 sm:p-5 shadow-soft-lg ring-1 ring-gray-900/5 backdrop-blur-sm">
              {/* 배경 글로우 효과 */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-blue-500/15 via-indigo-500/10 to-transparent blur-3xl -z-10 rounded-full animate-pulse-slow pointer-events-none" />
              <div className="absolute -top-12 -left-12 -z-10 h-80 w-80 rounded-full bg-primary/10 blur-[80px] pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 -z-10 h-80 w-80 rounded-full bg-purple-500/10 blur-[80px] pointer-events-none" />

              {/* 대시보드 목업 */}
              <div className="relative overflow-hidden rounded-xl border border-gray-100 bg-white aspect-[16/9] sm:aspect-[16/10] lg:aspect-[2/1] group cursor-pointer shadow-inner">
                <div className="absolute inset-0 flex flex-col bg-slate-50/50">
                  {/* 브라우저 탑바 */}
                  <div className="h-12 border-b border-gray-100 bg-white px-5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                      <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                      <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
                    </div>
                    <div className="h-7 w-48 bg-gray-50 rounded-md border border-gray-100 flex items-center px-3">
                      <div className="h-2 w-24 bg-gray-200 rounded-full" />
                    </div>
                  </div>

                  {/* 대시보드 콘텐츠 */}
                  <div className="flex-1 p-8 grid grid-cols-12 gap-8 overflow-hidden bg-[#fafbfd]">
                    {/* 사이드바 */}
                    <div className="col-span-2 hidden md:flex flex-col gap-4 pt-2">
                      <div className="h-10 w-full bg-blue-50 rounded-xl border-l-4 border-primary shadow-sm flex items-center px-3">
                        <div className="h-2 w-12 bg-primary/30 rounded-full" />
                      </div>
                      <div className="h-10 w-3/4 bg-white rounded-xl shadow-sm border border-gray-100 opacity-60" />
                      <div className="h-10 w-4/5 bg-white rounded-xl shadow-sm border border-gray-100 opacity-60" />
                      <div className="h-10 w-full bg-white rounded-xl shadow-sm border border-gray-100 opacity-60" />
                    </div>

                    {/* 메인 콘텐츠 */}
                    <div className="col-span-12 md:col-span-10 grid grid-cols-3 gap-6">
                      {/* 통계 카드 */}
                      <div className="col-span-3 grid grid-cols-3 gap-6">
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-transform duration-300">
                          <div className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">총 매출</div>
                          <div className="text-2xl font-extrabold text-gray-800 tracking-tight">1억 2,450만원</div>
                          <div className="text-xs font-bold text-green-500 flex items-center mt-3 gap-1 bg-green-50 w-fit px-2 py-1 rounded-md">+12.5%</div>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-transform duration-300">
                          <div className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">주문 수</div>
                          <div className="text-2xl font-extrabold text-gray-800 tracking-tight">1,452건</div>
                          <div className="text-xs font-bold text-green-500 flex items-center mt-3 gap-1 bg-green-50 w-fit px-2 py-1 rounded-md">+5.2%</div>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-transform duration-300">
                          <div className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">광고비</div>
                          <div className="text-2xl font-extrabold text-gray-800 tracking-tight">1,240만원</div>
                          <div className="text-xs font-bold text-red-400 flex items-center mt-3 gap-1 bg-red-50 w-fit px-2 py-1 rounded-md">-2.1%</div>
                        </div>
                      </div>

                      {/* 차트 영역 */}
                      <div className="col-span-3 lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-soft h-72 flex flex-col relative overflow-hidden">
                        <div className="flex justify-between items-center mb-6">
                          <div className="font-bold text-gray-800 text-base">매출 추이 분석</div>
                          <div className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">최근 30일</div>
                        </div>
                        <div className="flex-1 flex items-end justify-between gap-3 px-2 pb-2">
                          <div className="w-full bg-blue-50 rounded-t-md h-[30%]" />
                          <div className="w-full bg-blue-50 rounded-t-md h-[45%]" />
                          <div className="w-full bg-blue-50 rounded-t-md h-[35%]" />
                          <div className="w-full bg-blue-100 rounded-t-md h-[60%]" />
                          <div className="w-full bg-blue-100 rounded-t-md h-[50%]" />
                          <div className="w-full bg-gradient-to-t from-primary to-blue-400 rounded-t-md h-[75%] relative group-hover:scale-y-110 transition-transform origin-bottom shadow-lg shadow-blue-200" />
                          <div className="w-full bg-blue-50 rounded-t-md h-[65%]" />
                          <div className="w-full bg-blue-50 rounded-t-md h-[80%]" />
                        </div>
                      </div>

                      {/* AI 인사이트 */}
                      <div className="col-span-3 lg:col-span-1 bg-gradient-to-br from-[#eff4ff] to-white p-5 rounded-2xl border border-blue-100 shadow-soft h-72 relative">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="bg-white p-1.5 rounded-lg shadow-sm border border-blue-50">
                            <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          </div>
                          <span className="font-bold text-primary-dark text-sm">AI 인사이트</span>
                        </div>
                        <div className="space-y-3">
                          <div className="bg-white p-4 rounded-xl text-xs font-medium text-gray-600 shadow-sm border border-blue-50/50 leading-relaxed hover:shadow-md transition-shadow">
                            &apos;여름&apos; 키워드 유입으로 쿠팡 매출이 어제 15% 급증했습니다.
                          </div>
                          <div className="bg-white p-4 rounded-xl text-xs font-medium text-gray-600 shadow-sm border border-blue-50/50 leading-relaxed hover:shadow-md transition-shadow">
                            네이버 검색광고 예산을 10% 증액하는 것을 추천합니다.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollAnimation>

          {/* 통계 - 카운터 애니메이션 */}
          <StaggerContainer className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 pt-12 border-t border-gray-200" staggerDelay={0.15}>
            {STATS.map((stat) => (
              <StaggerItem key={stat.label}>
                <div className="text-center">
                  <div className="text-3xl lg:text-4xl font-bold text-text-main mb-2">
                    <CounterAnimation end={stat.value} suffix={stat.suffix} duration={2.5} />
                  </div>
                  <div className="text-sm text-text-sub">{stat.label}</div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
