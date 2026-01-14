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
    it('섹션 타이틀이 렌더링되어야 함', () => {
      render(<FeaturesSection />);
      expect(screen.getByText('데이터 분석, 이제 대화하듯 쉽게')).toBeInTheDocument();
    });

    it('섹션 설명이 렌더링되어야 함', () => {
      render(<FeaturesSection />);
      expect(screen.getByText(/복잡한 툴 사용법을 배울 필요 없습니다/)).toBeInTheDocument();
    });
  });

  describe('기능 카드', () => {
    it('올인원 데이터 통합 기능이 표시되어야 함', () => {
      render(<FeaturesSection />);
      expect(screen.getByText('올인원 데이터 통합')).toBeInTheDocument();
      expect(screen.getByText(/네이버, 쿠팡, 자사몰 데이터를 클릭 한 번으로/)).toBeInTheDocument();
    });

    it('자연어 분석 엔진 기능이 표시되어야 함', () => {
      render(<FeaturesSection />);
      expect(screen.getByText('자연어 분석 엔진')).toBeInTheDocument();
      expect(screen.getByText(/마진율 높은 상품은/)).toBeInTheDocument();
    });

    it('실시간 알림 기능이 표시되어야 함', () => {
      render(<FeaturesSection />);
      expect(screen.getByText('실시간 알림')).toBeInTheDocument();
      expect(screen.getByText(/성과 변동, 예산 소진, 이상 징후를 실시간으로/)).toBeInTheDocument();
    });

    it('자동 인사이트 리포트 기능이 표시되어야 함', () => {
      render(<FeaturesSection />);
      expect(screen.getByText('자동 인사이트 리포트')).toBeInTheDocument();
      expect(screen.getByText(/매일 아침, 전날의 성과 요약과 개선 제안/)).toBeInTheDocument();
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
  });

  describe('AI 채팅 인터페이스', () => {
    it('마케트 AI Analyst 타이틀이 표시되어야 함', () => {
      render(<FeaturesSection />);
      expect(screen.getByText('마케트 AI Analyst')).toBeInTheDocument();
    });

    it('AI 메시지가 표시되어야 함', () => {
      render(<FeaturesSection />);
      expect(screen.getByText(/어제\(10월 24일\) 스토어 데이터 분석이 완료되었습니다/)).toBeInTheDocument();
    });

    it('ROAS 하락 상품 정보가 표시되어야 함', () => {
      render(<FeaturesSection />);
      expect(screen.getByText('데일리 린넨 셔츠')).toBeInTheDocument();
      expect(screen.getByText('와이드 슬랙스 블랙')).toBeInTheDocument();
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
  });
});
