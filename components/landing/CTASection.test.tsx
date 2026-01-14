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
      expect(screen.getByText('지금 바로 시작하세요')).toBeInTheDocument();
    });

    it('설명이 렌더링되어야 함', () => {
      render(<CTASection />);
      expect(screen.getByText(/복잡한 설정 없이 5분 만에/)).toBeInTheDocument();
    });
  });

  describe('혜택 목록', () => {
    it('신용카드 불필요 혜택이 표시되어야 함', () => {
      render(<CTASection />);
      expect(screen.getByText('신용카드 불필요')).toBeInTheDocument();
    });

    it('14일 무료 체험 혜택이 표시되어야 함', () => {
      render(<CTASection />);
      expect(screen.getByText('14일 무료 체험')).toBeInTheDocument();
    });

    it('언제든 취소 가능 혜택이 표시되어야 함', () => {
      render(<CTASection />);
      expect(screen.getByText('언제든 취소 가능')).toBeInTheDocument();
    });

    it('혜택 항목에 체크 아이콘이 있어야 함', () => {
      render(<CTASection />);
      const benefitItems = screen.getByText('신용카드 불필요').parentElement;
      const icon = benefitItems?.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('CTA 버튼', () => {
    it('무료 체험 시작하기 버튼이 렌더링되어야 함', () => {
      render(<CTASection />);
      expect(screen.getByLabelText('무료 체험 시작하기')).toBeInTheDocument();
    });

    it('문의하기 버튼이 렌더링되어야 함', () => {
      render(<CTASection />);
      expect(screen.getByLabelText('문의하기')).toBeInTheDocument();
    });

    it('무료 체험 시작하기 버튼이 /signup으로 연결되어야 함', () => {
      render(<CTASection />);
      const ctaLink = screen.getByLabelText('무료 체험 시작하기');
      expect(ctaLink).toHaveAttribute('href', '/signup');
    });

    it('문의하기 버튼이 #contact로 연결되어야 함', () => {
      render(<CTASection />);
      const contactLink = screen.getByLabelText('문의하기');
      expect(contactLink).toHaveAttribute('href', '#contact');
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

    it('그라데이션 배경이 적용되어야 함', () => {
      render(<CTASection />);
      const section = document.querySelector('[aria-labelledby="cta-title"]');
      expect(section).toHaveClass('bg-gradient-to-br');
    });
  });
});
