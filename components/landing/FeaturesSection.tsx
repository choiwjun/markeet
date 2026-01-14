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
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// 스타일 상수
const SECTION_STYLES = [
  'py-20 lg:py-28',
  'bg-white dark:bg-slate-800',
].join(' ');

const CONTAINER_STYLES = [
  'max-w-7xl mx-auto',
  'px-4 sm:px-6 lg:px-8',
].join(' ');

const HEADER_STYLES = [
  'text-center',
  'max-w-3xl mx-auto',
  'mb-16',
].join(' ');

const SECTION_LABEL_STYLES = [
  'text-sm font-semibold',
  'text-primary-600 dark:text-primary-400',
  'uppercase tracking-wider',
  'mb-4',
].join(' ');

const SECTION_TITLE_STYLES = [
  'text-3xl sm:text-4xl lg:text-5xl',
  'font-bold',
  'text-slate-900 dark:text-white',
  'mb-6',
].join(' ');

const SECTION_DESCRIPTION_STYLES = [
  'text-lg',
  'text-slate-600 dark:text-slate-300',
  'leading-relaxed',
].join(' ');

const FEATURES_GRID_STYLES = [
  'grid gap-8',
  'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
].join(' ');

const FEATURE_CARD_STYLES = [
  'group',
  'relative',
  'p-6 lg:p-8',
  'bg-slate-50 dark:bg-slate-700/50',
  'rounded-2xl',
  'transition-all duration-300',
  'hover:bg-white dark:hover:bg-slate-700',
  'hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50',
  'hover:-translate-y-1',
].join(' ');

const FEATURE_ICON_WRAPPER_STYLES = [
  'inline-flex items-center justify-center',
  'w-12 h-12',
  'rounded-xl',
  'bg-primary-100 dark:bg-primary-900/30',
  'text-primary-600 dark:text-primary-400',
  'mb-5',
  'group-hover:scale-110',
  'transition-transform duration-300',
].join(' ');

const FEATURE_TITLE_STYLES = [
  'text-lg font-semibold',
  'text-slate-900 dark:text-white',
  'mb-3',
].join(' ');

const FEATURE_DESCRIPTION_STYLES = [
  'text-sm',
  'text-slate-600 dark:text-slate-300',
  'leading-relaxed',
].join(' ');

// 기능 데이터
interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: Layers,
    title: '통합 대시보드',
    description: '네이버, 카카오, 구글, 메타 광고 데이터를 한 화면에서 확인하세요.',
  },
  {
    icon: TrendingUp,
    title: 'AI 성과 분석',
    description: 'ROAS, CPC, CTR 등 핵심 지표를 AI가 자동으로 분석해 인사이트를 제공합니다.',
  },
  {
    icon: Bell,
    title: '실시간 알림',
    description: '성과 변동, 예산 소진, 이상 징후를 실시간으로 알려드립니다.',
  },
  {
    icon: Zap,
    title: '액션 제안',
    description: '데이터 기반의 다음 액션을 AI가 추천해 광고 효율을 극대화하세요.',
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
 * 랜딩페이지 기능 소개 섹션
 * TASK-603: 주요 기능들을 카드 형태로 소개
 */
export function FeaturesSection({ className }: FeaturesSectionProps) {
  return (
    <section
      id="features"
      className={`${SECTION_STYLES} ${className || ''}`}
      aria-labelledby="features-title"
    >
      <div className={CONTAINER_STYLES}>
        {/* 섹션 헤더 */}
        <header className={HEADER_STYLES}>
          <p className={SECTION_LABEL_STYLES}>주요 기능</p>
          <h2 id="features-title" className={SECTION_TITLE_STYLES}>
            광고 관리의 모든 것
          </h2>
          <p className={SECTION_DESCRIPTION_STYLES}>
            복잡한 광고 데이터를 쉽고 빠르게 분석하고,
            <br className="hidden sm:block" />
            AI 기반의 인사이트로 더 나은 의사결정을 내리세요.
          </p>
        </header>

        {/* 기능 카드 그리드 */}
        <div className={FEATURES_GRID_STYLES}>
          {FEATURES.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <article key={feature.title} className={FEATURE_CARD_STYLES}>
                <div className={FEATURE_ICON_WRAPPER_STYLES}>
                  <IconComponent className="w-6 h-6" aria-hidden="true" />
                </div>
                <h3 className={FEATURE_TITLE_STYLES}>{feature.title}</h3>
                <p className={FEATURE_DESCRIPTION_STYLES}>{feature.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;
