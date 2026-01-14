import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Next.js Link 모킹
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

import AuthLayout from './layout';

describe('AuthLayout', () => {
  // 기본 렌더링 테스트
  describe('렌더링', () => {
    it('자식 요소를 렌더링한다', () => {
      render(
        <AuthLayout>
          <div data-testid="child-content">테스트 컨텐츠</div>
        </AuthLayout>
      );
      expect(screen.getByTestId('child-content')).toBeInTheDocument();
      expect(screen.getByText('테스트 컨텐츠')).toBeInTheDocument();
    });

    it('로고를 렌더링한다', () => {
      render(
        <AuthLayout>
          <div>컨텐츠</div>
        </AuthLayout>
      );
      expect(screen.getByText('마케트')).toBeInTheDocument();
    });

    it('로고가 홈으로 연결된 링크이다', () => {
      render(
        <AuthLayout>
          <div>컨텐츠</div>
        </AuthLayout>
      );
      const logoLink = screen.getByText('마케트').closest('a');
      expect(logoLink).toHaveAttribute('href', '/');
    });

    it('푸터를 렌더링한다', () => {
      render(
        <AuthLayout>
          <div>컨텐츠</div>
        </AuthLayout>
      );
      expect(screen.getByText(/© 2026 마케트/)).toBeInTheDocument();
    });
  });

  // 스타일 테스트
  describe('스타일', () => {
    it('중앙 정렬 레이아웃을 가진다', () => {
      const { container } = render(
        <AuthLayout>
          <div>컨텐츠</div>
        </AuthLayout>
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('flex');
      expect(wrapper).toHaveClass('items-center');
      expect(wrapper).toHaveClass('justify-center');
    });

    it('최소 높이가 화면 전체이다', () => {
      const { container } = render(
        <AuthLayout>
          <div>컨텐츠</div>
        </AuthLayout>
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('min-h-screen');
    });

    it('그라데이션 배경을 가진다', () => {
      const { container } = render(
        <AuthLayout>
          <div>컨텐츠</div>
        </AuthLayout>
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('bg-gradient-to-br');
    });
  });

  // 카드 컨테이너 테스트
  describe('카드 컨테이너', () => {
    it('카드 스타일을 가진다', () => {
      render(
        <AuthLayout>
          <div data-testid="child-content">컨텐츠</div>
        </AuthLayout>
      );
      const childContent = screen.getByTestId('child-content');
      const cardContainer = childContent.parentElement;
      expect(cardContainer).toHaveClass('bg-white');
      expect(cardContainer).toHaveClass('rounded-2xl');
      expect(cardContainer).toHaveClass('shadow-xl');
    });

    it('최대 너비가 제한된다', () => {
      render(
        <AuthLayout>
          <div data-testid="child-content">컨텐츠</div>
        </AuthLayout>
      );
      const childContent = screen.getByTestId('child-content');
      const cardContainer = childContent.parentElement;
      expect(cardContainer).toHaveClass('max-w-md');
    });
  });
});
