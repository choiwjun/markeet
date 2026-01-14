import { Metadata } from 'next';
import { HeroSection, FeaturesSection, CTASection } from '@/components/landing';

export const metadata: Metadata = {
  title: '마케트 - AI 기반 광고 성과 분석 플랫폼',
  description: '네이버, 카카오, 구글, 메타 광고를 한 곳에서. AI가 분석하고, 다음 액션까지 제안해 드립니다.',
  keywords: ['광고 분석', 'ROAS', 'AI 마케팅', '광고 대시보드', '네이버 광고', '카카오 광고', '구글 광고', '메타 광고'],
  openGraph: {
    title: '마케트 - AI 기반 광고 성과 분석 플랫폼',
    description: '네이버, 카카오, 구글, 메타 광고를 한 곳에서. AI가 분석하고, 다음 액션까지 제안해 드립니다.',
    type: 'website',
    locale: 'ko_KR',
  },
};

/**
 * 랜딩페이지 메인
 * TASK-601 ~ TASK-606: 히어로, 기능소개, CTA 섹션 포함
 */
export default function LandingPage() {
  return (
    <>
      {/* 히어로 섹션 */}
      <HeroSection />

      {/* 기능 소개 섹션 */}
      <FeaturesSection />

      {/* CTA 섹션 */}
      <CTASection />
    </>
  );
}
