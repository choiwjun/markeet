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

    it('마케트 브랜드명이 표시되어야 함', () => {
      render(<Footer />);
      expect(screen.getByText('마케트')).toBeInTheDocument();
    });

    it('브랜드 설명이 표시되어야 함', () => {
      render(<Footer />);
      expect(screen.getByText(/데이터를 보여주는 대시보드를 넘어/)).toBeInTheDocument();
    });

    it('저작권 정보가 표시되어야 함', () => {
      render(<Footer />);
      const currentYear = new Date().getFullYear();
      expect(screen.getByText(new RegExp(`© ${currentYear} 마케트`))).toBeInTheDocument();
    });
  });

  describe('제품 링크', () => {
    it('제품 섹션 제목이 표시되어야 함', () => {
      render(<Footer />);
      expect(screen.getByText('제품')).toBeInTheDocument();
    });

    it('주요 기능 링크가 표시되어야 함', () => {
      render(<Footer />);
      expect(screen.getByText('주요 기능')).toBeInTheDocument();
    });

    it('요금제 링크가 표시되어야 함', () => {
      render(<Footer />);
      expect(screen.getByText('요금제')).toBeInTheDocument();
    });

    it('데모 보기 링크가 표시되어야 함', () => {
      render(<Footer />);
      expect(screen.getByText('데모 보기')).toBeInTheDocument();
    });

    it('업데이트 링크가 표시되어야 함', () => {
      render(<Footer />);
      expect(screen.getByText('업데이트')).toBeInTheDocument();
    });
  });

  describe('지원 링크', () => {
    it('지원 섹션 제목이 표시되어야 함', () => {
      render(<Footer />);
      expect(screen.getByText('지원')).toBeInTheDocument();
    });

    it('도움말 센터 링크가 표시되어야 함', () => {
      render(<Footer />);
      expect(screen.getByText('도움말 센터')).toBeInTheDocument();
    });

    it('문의하기 링크가 표시되어야 함', () => {
      render(<Footer />);
      expect(screen.getByText('문의하기')).toBeInTheDocument();
    });

    it('API 문서 링크가 표시되어야 함', () => {
      render(<Footer />);
      expect(screen.getByText('API 문서')).toBeInTheDocument();
    });

    it('상태 페이지 링크가 표시되어야 함', () => {
      render(<Footer />);
      expect(screen.getByText('상태 페이지')).toBeInTheDocument();
    });
  });

  describe('법적 링크', () => {
    it('법적 고지 섹션 제목이 표시되어야 함', () => {
      render(<Footer />);
      expect(screen.getByText('법적 고지')).toBeInTheDocument();
    });

    it('이용약관 링크가 표시되어야 함', () => {
      render(<Footer />);
      expect(screen.getByText('이용약관')).toBeInTheDocument();
    });

    it('개인정보처리방침 링크가 표시되어야 함', () => {
      render(<Footer />);
      expect(screen.getByText('개인정보처리방침')).toBeInTheDocument();
    });

    it('쿠키 정책 링크가 표시되어야 함', () => {
      render(<Footer />);
      expect(screen.getByText('쿠키 정책')).toBeInTheDocument();
    });
  });

  describe('소셜 링크', () => {
    it('트위터 링크가 표시되어야 함', () => {
      render(<Footer />);
      expect(screen.getByLabelText('트위터')).toBeInTheDocument();
    });

    it('깃허브 링크가 표시되어야 함', () => {
      render(<Footer />);
      expect(screen.getByLabelText('깃허브')).toBeInTheDocument();
    });

    it('링크드인 링크가 표시되어야 함', () => {
      render(<Footer />);
      expect(screen.getByLabelText('링크드인')).toBeInTheDocument();
    });

    it('소셜 링크가 새 탭에서 열려야 함', () => {
      render(<Footer />);
      const twitterLink = screen.getByLabelText('트위터');
      expect(twitterLink).toHaveAttribute('target', '_blank');
      expect(twitterLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('접근성', () => {
    it('footer role="contentinfo"가 설정되어야 함', () => {
      render(<Footer />);
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });

    it('네비게이션 섹션에 aria-label이 설정되어야 함', () => {
      render(<Footer />);
      expect(screen.getByLabelText('제품')).toBeInTheDocument();
      expect(screen.getByLabelText('지원')).toBeInTheDocument();
      expect(screen.getByLabelText('법적 고지')).toBeInTheDocument();
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

    it('다크 배경 스타일이 적용되어야 함', () => {
      render(<Footer />);
      const footer = screen.getByRole('contentinfo');
      expect(footer).toHaveClass('bg-slate-900');
    });
  });

  describe('링크 경로', () => {
    it('주요 기능 링크가 #features로 연결되어야 함', () => {
      render(<Footer />);
      const link = screen.getByText('주요 기능').closest('a');
      expect(link).toHaveAttribute('href', '#features');
    });

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
