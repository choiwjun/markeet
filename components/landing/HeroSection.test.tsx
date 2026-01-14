import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HeroSection } from './HeroSection';

// Next.js router 모킹
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('HeroSection', () => {
  describe('렌더링', () => {
    it('배지가 렌더링되어야 함', () => {
      render(<HeroSection />);
      expect(screen.getByText('AI 기반 광고 분석 플랫폼')).toBeInTheDocument();
    });

    it('메인 타이틀이 렌더링되어야 함', () => {
      render(<HeroSection />);
      const title = screen.getByRole('heading', { level: 1 });
      expect(title).toHaveTextContent('광고 데이터가');
      expect(title).toHaveTextContent('성과로 연결');
    });

    it('부제목이 렌더링되어야 함', () => {
      render(<HeroSection />);
      expect(screen.getByText(/네이버, 카카오, 구글, 메타 광고를 한 곳에서/)).toBeInTheDocument();
    });

    it('무료로 시작하기 CTA 버튼이 렌더링되어야 함', () => {
      render(<HeroSection />);
      expect(screen.getByLabelText('무료로 시작하기')).toBeInTheDocument();
    });

    it('기능 살펴보기 버튼이 렌더링되어야 함', () => {
      render(<HeroSection />);
      expect(screen.getByLabelText('기능 살펴보기')).toBeInTheDocument();
    });
  });

  describe('통계', () => {
    it('ROAS 향상 통계가 표시되어야 함', () => {
      render(<HeroSection />);
      expect(screen.getByText('300%')).toBeInTheDocument();
      expect(screen.getByText('평균 ROAS 향상')).toBeInTheDocument();
    });

    it('설정 완료 시간 통계가 표시되어야 함', () => {
      render(<HeroSection />);
      expect(screen.getByText('5분')).toBeInTheDocument();
      expect(screen.getByText('설정 완료 시간')).toBeInTheDocument();
    });

    it('분석된 캠페인 통계가 표시되어야 함', () => {
      render(<HeroSection />);
      expect(screen.getByText('10,000+')).toBeInTheDocument();
      expect(screen.getByText('분석된 캠페인')).toBeInTheDocument();
    });
  });

  describe('링크', () => {
    it('무료로 시작하기 버튼이 /signup으로 연결되어야 함', () => {
      render(<HeroSection />);
      const ctaLink = screen.getByLabelText('무료로 시작하기');
      expect(ctaLink).toHaveAttribute('href', '/signup');
    });

    it('기능 살펴보기 버튼이 #features로 연결되어야 함', () => {
      render(<HeroSection />);
      const featuresLink = screen.getByLabelText('기능 살펴보기');
      expect(featuresLink).toHaveAttribute('href', '#features');
    });
  });

  describe('접근성', () => {
    it('섹션에 aria-labelledby가 설정되어야 함', () => {
      render(<HeroSection />);
      const section = screen.getByRole('region', { hidden: true }) ||
                      document.querySelector('[aria-labelledby="hero-title"]');
      expect(section).toBeInTheDocument();
    });

    it('타이틀에 id가 설정되어야 함', () => {
      render(<HeroSection />);
      const title = screen.getByRole('heading', { level: 1 });
      expect(title).toHaveAttribute('id', 'hero-title');
    });

    it('장식 요소에 aria-hidden이 설정되어야 함', () => {
      render(<HeroSection />);
      const decorations = document.querySelectorAll('[aria-hidden="true"]');
      expect(decorations.length).toBeGreaterThan(0);
    });
  });

  describe('스타일', () => {
    it('className prop이 적용되어야 함', () => {
      render(<HeroSection className="custom-class" />);
      const section = document.querySelector('.custom-class');
      expect(section).toBeInTheDocument();
    });

    it('그라데이션 배경이 적용되어야 함', () => {
      render(<HeroSection />);
      const section = document.querySelector('[aria-labelledby="hero-title"]');
      expect(section).toHaveClass('bg-gradient-to-b');
    });
  });
});
