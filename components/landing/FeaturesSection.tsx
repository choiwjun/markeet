'use client';

import {
  BarChart3,
  LineChart,
  Zap,
  Shield,
  Clock,
  TrendingUp,
  Layers,
  Bell,
  MessageCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// 기능 데이터
interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  highlight?: boolean;
}

const FEATURES: Feature[] = [
  {
    icon: Layers,
    title: '올인원 데이터 통합',
    description: '네이버, 쿠팡, 자사몰 데이터를 클릭 한 번으로 연결하세요. 흩어진 매출과 광고 데이터를 한곳에서 관리합니다.',
  },
  {
    icon: MessageCircle,
    title: '자연어 분석 엔진',
    description: '"마진율 높은 상품은?", "어제 대비 매출은?" 전문 지식 없이도 채팅하듯 질문하면 AI가 즉시 답변합니다.',
    highlight: true,
  },
  {
    icon: TrendingUp,
    title: '자동 인사이트 리포트',
    description: '매일 아침, 전날의 성과 요약과 개선 제안을 받아보세요. 놓치고 있던 성장 기회를 AI가 찾아냅니다.',
  },
  {
    icon: Bell,
    title: '실시간 알림',
    description: '성과 변동, 예산 소진, 이상 징후를 실시간으로 알려드립니다.',
  },
  {
    icon: BarChart3,
    title: '플랫폼별 비교',
    description: '각 광고 플랫폼의 성과를 한눈에 비교하고 최적의 예산 배분을 결정하세요.',
  },
  {
    icon: LineChart,
    title: '추세 분석',
    description: '일별, 주별, 월별 성과 추이를 시각화하여 트렌드를 파악하세요.',
  },
  {
    icon: Clock,
    title: '5분 연동',
    description: 'API 키만 입력하면 5분 안에 모든 플랫폼 연동이 완료됩니다.',
  },
  {
    icon: Shield,
    title: '보안 최우선',
    description: 'API 키 암호화, SSL 적용 등 엔터프라이즈급 보안을 제공합니다.',
  },
];

interface FeaturesSectionProps {
  className?: string;
}

/**
 * 랜딩페이지 기능 소개 섹션 - design.html 스타일 적용
 */
export function FeaturesSection({ className }: FeaturesSectionProps) {
  return (
    <section
      id="features"
      className={`py-28 bg-neutral-gray/30 relative ${className || ''}`}
      aria-labelledby="features-title"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* 섹션 헤더 */}
        <div className="text-center mb-20 max-w-2xl mx-auto">
          <h2 id="features-title" className="text-3xl font-extrabold text-text-main sm:text-4xl mb-6 tracking-tight">
            데이터 분석, 이제 대화하듯 쉽게
          </h2>
          <p className="text-lg text-text-sub font-medium leading-relaxed">
            복잡한 툴 사용법을 배울 필요 없습니다. 궁금한 점을 채팅창에 입력하기만 하세요.
          </p>
        </div>

        {/* AI 채팅 데모와 기능 카드 */}
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* AI 채팅 인터페이스 */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            <div className="bg-white rounded-3xl shadow-deep border border-gray-100 overflow-hidden relative transform hover:-translate-y-1 transition-transform duration-500">
              {/* 채팅 헤더 */}
              <div className="bg-slate-50 border-b border-gray-100 p-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                  <div className="p-1 bg-white rounded-md shadow-sm border border-gray-100">
                    <Zap className="w-4 h-4 text-primary" />
                  </div>
                  마케트 AI Analyst
                </div>
                <div className="w-8" />
              </div>

              {/* 채팅 내용 */}
              <div className="p-8 bg-[#f8fafc] h-[580px] flex flex-col gap-8 overflow-y-auto">
                {/* AI 메시지 */}
                <div className="flex gap-5">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shrink-0 shadow-md">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-white p-5 rounded-3xl rounded-tl-none shadow-sm border border-gray-100 text-sm font-medium text-gray-700 max-w-[90%] leading-relaxed">
                    <p>대표님, 안녕하세요! 👋<br />어제(10월 24일) 스토어 데이터 분석이 완료되었습니다. 주요 지표를 요약해드릴까요?</p>
                  </div>
                </div>

                {/* 사용자 메시지 */}
                <div className="flex gap-5 justify-end">
                  <div className="bg-primary p-5 rounded-3xl rounded-tr-none shadow-md text-sm font-medium text-white max-w-[90%] leading-relaxed">
                    응, 요약해주고 특히 <span className="font-bold underline decoration-blue-300 underline-offset-4">광고 효율(ROAS)</span>이 떨어진 상품이 있는지 알려줘.
                  </div>
                </div>

                {/* AI 분석 응답 */}
                <div className="flex gap-5">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shrink-0 shadow-md">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div className="space-y-4 max-w-[90%]">
                    <div className="bg-white p-5 rounded-3xl rounded-tl-none shadow-sm border border-gray-100 text-sm font-medium text-gray-700 leading-relaxed">
                      <p className="mb-2">확인했습니다. 어제 전체 ROAS는 320%로 전일 대비 <span className="text-red-500 font-bold bg-red-50 px-1 rounded">5% 하락</span>했습니다.</p>
                      <p>주의가 필요한 상품 2가지를 발견했습니다:</p>
                    </div>

                    {/* ROAS 하락 상품 카드 */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                      <div className="text-xs font-bold text-gray-500 mb-4 flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5 rotate-180" /> ROAS 하락 상품 (전일 대비)
                      </div>
                      <div className="space-y-5">
                        <div>
                          <div className="flex justify-between text-xs mb-2 font-medium">
                            <span className="text-gray-800">데일리 린넨 셔츠</span>
                            <span className="text-red-500 font-bold">180% (▼ 40%)</span>
                          </div>
                          <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                            <div className="bg-red-400 w-[45%] h-full rounded-full" />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-2 font-medium">
                            <span className="text-gray-800">와이드 슬랙스 블랙</span>
                            <span className="text-red-500 font-bold">210% (▼ 15%)</span>
                          </div>
                          <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                            <div className="bg-red-400 w-[55%] h-full rounded-full" />
                          </div>
                        </div>
                      </div>
                      <button className="w-full mt-6 py-3 bg-blue-50 text-primary text-xs font-bold rounded-xl hover:bg-blue-100 transition-colors flex items-center justify-center gap-1 group">
                        상세 분석 리포트 보기
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 입력창 */}
              <div className="p-5 bg-white border-t border-gray-100">
                <div className="relative">
                  <input
                    className="w-full pl-5 pr-14 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent text-sm font-medium shadow-sm transition-all bg-gray-50/50"
                    placeholder="궁금한 내용을 입력하세요..."
                    readOnly
                    type="text"
                    defaultValue="어떤 키워드로 유입이 늘었어?"
                  />
                  <button className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 기능 카드 */}
          <div className="lg:col-span-5 order-1 lg:order-2 flex flex-col justify-center h-full space-y-8">
            {FEATURES.slice(0, 3).map((feature) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={feature.title}
                  className={`group p-8 rounded-3xl transition-all duration-300 cursor-default ${
                    feature.highlight
                      ? 'bg-white shadow-soft-lg border border-blue-100 ring-1 ring-primary/10'
                      : 'bg-white shadow-sm hover:shadow-soft-lg border border-transparent hover:border-blue-50'
                  }`}
                >
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 ${
                      feature.highlight
                        ? 'bg-gradient-to-br from-primary to-blue-600 text-white shadow-lg shadow-primary/30'
                        : feature.icon === TrendingUp
                          ? 'bg-green-50 text-green-600'
                          : 'bg-blue-50 text-primary'
                    }`}
                  >
                    <IconComponent className="w-7 h-7" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-bold text-text-main mb-3">{feature.title}</h3>
                  <p className="text-text-sub text-sm font-medium leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 추가 기능 그리드 */}
        <div className="mt-20 grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {FEATURES.slice(3).map((feature) => {
            const IconComponent = feature.icon;
            return (
              <article
                key={feature.title}
                className="group relative p-6 lg:p-8 bg-white rounded-2xl transition-all duration-300 hover:shadow-soft-lg hover:-translate-y-1 border border-gray-100"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-primary mb-5 group-hover:scale-110 transition-transform duration-300">
                  <IconComponent className="w-6 h-6" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-semibold text-text-main mb-3">{feature.title}</h3>
                <p className="text-sm text-text-sub leading-relaxed">{feature.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;
