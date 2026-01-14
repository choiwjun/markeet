import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CTASection } from './CTASection';

// Next.js router 모킹
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('CTASection', () => {
  describe('렌더링', () => {
    it('타이틀이 렌더링되어야 함', () => {
      render(<CTASection />);
      expect(screen.getByText(/성장을 자동화할 준비가 되셨나요/)).toBeInTheDocument();
    });

    it('설명이 렌더링되어야 함', () => {
      render(<CTASection />);
      expect(screen.getByText(/1,000명 이상의 셀러들과 함께/)).toBeInTheDocument();
    });
  });

  describe('CTA 버튼', () => {
    it('지금 시작하기 버튼이 렌더링되어야 함', () => {
      render(<CTASection />);
      expect(screen.getByText('지금 시작하기')).toBeInTheDocument();
    });

    it('더 알아보기 버튼이 렌더링되어야 함', () => {
      render(<CTASection />);
      expect(screen.getByText('더 알아보기')).toBeInTheDocument();
    });

    it('지금 시작하기 버튼이 /signup으로 연결되어야 함', () => {
      render(<CTASection />);
      const ctaLink = screen.getByText('지금 시작하기').closest('a');
      expect(ctaLink).toHaveAttribute('href', '/signup');
    });

    it('더 알아보기 버튼이 #features로 연결되어야 함', () => {
      render(<CTASection />);
      const contactLink = screen.getByText('더 알아보기').closest('a');
      expect(contactLink).toHaveAttribute('href', '#features');
    });
  });

  describe('접근성', () => {
    it('섹션에 aria-labelledby가 설정되어야 함', () => {
      render(<CTASection />);
      const section = document.querySelector('[aria-labelledby="cta-title"]');
      expect(section).toBeInTheDocument();
    });

    it('타이틀에 id가 설정되어야 함', () => {
      render(<CTASection />);
      const title = screen.getByRole('heading', { level: 2 });
      expect(title).toHaveAttribute('id', 'cta-title');
    });

    it('아이콘에 aria-hidden이 설정되어야 함', () => {
      render(<CTASection />);
      const icons = document.querySelectorAll('[aria-hidden="true"]');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe('스타일', () => {
    it('className prop이 적용되어야 함', () => {
      render(<CTASection className="custom-class" />);
      const section = document.querySelector('.custom-class');
      expect(section).toBeInTheDocument();
    });
  });
});
