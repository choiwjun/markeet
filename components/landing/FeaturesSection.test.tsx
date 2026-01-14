import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FeaturesSection } from './FeaturesSection';

// Next.js router 모킹
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('FeaturesSection', () => {
  describe('렌더링', () => {
    it('섹션 라벨이 렌더링되어야 함', () => {
      render(<FeaturesSection />);
      expect(screen.getByText('주요 기능')).toBeInTheDocument();
    });

    it('섹션 타이틀이 렌더링되어야 함', () => {
      render(<FeaturesSection />);
      expect(screen.getByText('광고 관리의 모든 것')).toBeInTheDocument();
    });

    it('섹션 설명이 렌더링되어야 함', () => {
      render(<FeaturesSection />);
      expect(screen.getByText(/복잡한 광고 데이터를 쉽고 빠르게 분석/)).toBeInTheDocument();
    });
  });

  describe('기능 카드', () => {
    it('통합 대시보드 기능이 표시되어야 함', () => {
      render(<FeaturesSection />);
      expect(screen.getByText('통합 대시보드')).toBeInTheDocument();
      expect(screen.getByText(/네이버, 카카오, 구글, 메타 광고 데이터를 한 화면에서/)).toBeInTheDocument();
    });

    it('AI 성과 분석 기능이 표시되어야 함', () => {
      render(<FeaturesSection />);
      expect(screen.getByText('AI 성과 분석')).toBeInTheDocument();
      expect(screen.getByText(/ROAS, CPC, CTR 등 핵심 지표를 AI가 자동으로 분석/)).toBeInTheDocument();
    });

    it('실시간 알림 기능이 표시되어야 함', () => {
      render(<FeaturesSection />);
      expect(screen.getByText('실시간 알림')).toBeInTheDocument();
      expect(screen.getByText(/성과 변동, 예산 소진, 이상 징후를 실시간으로/)).toBeInTheDocument();
    });

    it('액션 제안 기능이 표시되어야 함', () => {
      render(<FeaturesSection />);
      expect(screen.getByText('액션 제안')).toBeInTheDocument();
      expect(screen.getByText(/데이터 기반의 다음 액션을 AI가 추천/)).toBeInTheDocument();
    });

    it('플랫폼별 비교 기능이 표시되어야 함', () => {
      render(<FeaturesSection />);
      expect(screen.getByText('플랫폼별 비교')).toBeInTheDocument();
      expect(screen.getByText(/각 광고 플랫폼의 성과를 한눈에 비교/)).toBeInTheDocument();
    });

    it('추세 분석 기능이 표시되어야 함', () => {
      render(<FeaturesSection />);
      expect(screen.getByText('추세 분석')).toBeInTheDocument();
      expect(screen.getByText(/일별, 주별, 월별 성과 추이를 시각화/)).toBeInTheDocument();
    });

    it('5분 연동 기능이 표시되어야 함', () => {
      render(<FeaturesSection />);
      expect(screen.getByText('5분 연동')).toBeInTheDocument();
      expect(screen.getByText(/API 키만 입력하면 5분 안에/)).toBeInTheDocument();
    });

    it('보안 최우선 기능이 표시되어야 함', () => {
      render(<FeaturesSection />);
      expect(screen.getByText('보안 최우선')).toBeInTheDocument();
      expect(screen.getByText(/API 키 암호화, SSL 적용 등 엔터프라이즈급 보안/)).toBeInTheDocument();
    });

    it('8개의 기능 카드가 렌더링되어야 함', () => {
      render(<FeaturesSection />);
      const articles = screen.getAllByRole('article');
      expect(articles).toHaveLength(8);
    });
  });

  describe('접근성', () => {
    it('섹션에 id="features"가 설정되어야 함', () => {
      render(<FeaturesSection />);
      const section = document.getElementById('features');
      expect(section).toBeInTheDocument();
    });

    it('섹션에 aria-labelledby가 설정되어야 함', () => {
      render(<FeaturesSection />);
      const section = document.querySelector('[aria-labelledby="features-title"]');
      expect(section).toBeInTheDocument();
    });

    it('타이틀에 id가 설정되어야 함', () => {
      render(<FeaturesSection />);
      const title = screen.getByRole('heading', { level: 2 });
      expect(title).toHaveAttribute('id', 'features-title');
    });

    it('아이콘에 aria-hidden이 설정되어야 함', () => {
      render(<FeaturesSection />);
      const icons = document.querySelectorAll('[aria-hidden="true"]');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe('스타일', () => {
    it('className prop이 적용되어야 함', () => {
      render(<FeaturesSection className="custom-class" />);
      const section = document.querySelector('.custom-class');
      expect(section).toBeInTheDocument();
    });

    it('기능 카드에 호버 효과 클래스가 있어야 함', () => {
      render(<FeaturesSection />);
      const articles = screen.getAllByRole('article');
      expect(articles[0]).toHaveClass('hover:-translate-y-1');
    });
  });
});
