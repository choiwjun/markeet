import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from './Footer';

// Next.js router 모킹
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('Footer', () => {
  describe('렌더링', () => {
    it('로고가 렌더링되어야 함', () => {
      render(<Footer />);
      expect(screen.getByLabelText('마케트 홈')).toBeInTheDocument();
    });

    it('MARKEET 브랜드명이 표시되어야 함', () => {
      render(<Footer />);
      expect(screen.getByText('MARKEET')).toBeInTheDocument();
    });

    it('저작권 정보가 표시되어야 함', () => {
      render(<Footer />);
      const currentYear = new Date().getFullYear();
      expect(screen.getByText(new RegExp(`© ${currentYear} MARKEET`))).toBeInTheDocument();
    });
  });

  describe('푸터 링크', () => {
    it('회사 소개 링크가 표시되어야 함', () => {
      render(<Footer />);
      expect(screen.getByText('회사 소개')).toBeInTheDocument();
    });

    it('블로그 링크가 표시되어야 함', () => {
      render(<Footer />);
      expect(screen.getByText('블로그')).toBeInTheDocument();
    });

    it('채용 링크가 표시되어야 함', () => {
      render(<Footer />);
      expect(screen.getByText('채용')).toBeInTheDocument();
    });

    it('보도자료 링크가 표시되어야 함', () => {
      render(<Footer />);
      expect(screen.getByText('보도자료')).toBeInTheDocument();
    });

    it('개인정보처리방침 링크가 표시되어야 함', () => {
      render(<Footer />);
      expect(screen.getByText('개인정보처리방침')).toBeInTheDocument();
    });

    it('이용약관 링크가 표시되어야 함', () => {
      render(<Footer />);
      expect(screen.getByText('이용약관')).toBeInTheDocument();
    });
  });

  describe('접근성', () => {
    it('footer role="contentinfo"가 설정되어야 함', () => {
      render(<Footer />);
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });

    it('네비게이션에 aria-label이 설정되어야 함', () => {
      render(<Footer />);
      expect(screen.getByLabelText('Footer')).toBeInTheDocument();
    });

    it('로고 링크에 aria-label이 설정되어야 함', () => {
      render(<Footer />);
      const logo = screen.getByLabelText('마케트 홈');
      expect(logo).toHaveAttribute('href', '/');
    });
  });

  describe('스타일', () => {
    it('className prop이 적용되어야 함', () => {
      render(<Footer className="custom-class" />);
      const footer = screen.getByRole('contentinfo');
      expect(footer).toHaveClass('custom-class');
    });

    it('흰색 배경 스타일이 적용되어야 함', () => {
      render(<Footer />);
      const footer = screen.getByRole('contentinfo');
      expect(footer).toHaveClass('bg-white');
    });
  });

  describe('링크 경로', () => {
    it('이용약관 링크가 /terms로 연결되어야 함', () => {
      render(<Footer />);
      const link = screen.getByText('이용약관').closest('a');
      expect(link).toHaveAttribute('href', '/terms');
    });

    it('개인정보처리방침 링크가 /privacy로 연결되어야 함', () => {
      render(<Footer />);
      const link = screen.getByText('개인정보처리방침').closest('a');
      expect(link).toHaveAttribute('href', '/privacy');
    });
  });
});
