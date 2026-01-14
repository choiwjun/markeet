import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import OnboardingLayout from './layout';

// Next.js router mock
const mockPush = vi.fn();
const mockBack = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
}));

describe('OnboardingLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('레이아웃이 올바르게 렌더링되어야 함', () => {
    render(
      <OnboardingLayout>
        <div data-testid="child-content">Test Content</div>
      </OnboardingLayout>
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('로고가 표시되어야 함', () => {
    render(
      <OnboardingLayout>
        <div>Content</div>
      </OnboardingLayout>
    );

    expect(screen.getByText('마케트')).toBeInTheDocument();
  });

  it('뒤로 가기 버튼이 동작해야 함', () => {
    render(
      <OnboardingLayout>
        <div>Content</div>
      </OnboardingLayout>
    );

    const backButton = screen.getByRole('button', { name: '뒤로 가기' });
    fireEvent.click(backButton);

    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('나중에 하기 버튼 클릭 시 대시보드로 이동해야 함', () => {
    render(
      <OnboardingLayout>
        <div>Content</div>
      </OnboardingLayout>
    );

    const skipButton = screen.getByText('나중에 하기');
    fireEvent.click(skipButton);

    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('children이 메인 영역에 렌더링되어야 함', () => {
    render(
      <OnboardingLayout>
        <div data-testid="onboarding-content">온보딩 컨텐츠</div>
      </OnboardingLayout>
    );

    const content = screen.getByTestId('onboarding-content');
    expect(content).toBeInTheDocument();
    expect(content).toHaveTextContent('온보딩 컨텐츠');
  });
});
