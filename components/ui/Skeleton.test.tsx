import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonCard,
  SkeletonTableRow,
  SkeletonMetricCard,
} from './Skeleton';

describe('Skeleton', () => {
  // TASK-210: 기본 렌더링 테스트
  describe('렌더링', () => {
    it('기본 스켈레톤을 렌더링한다', () => {
      const { container } = render(<Skeleton />);
      const skeleton = container.firstChild;
      expect(skeleton).toBeInTheDocument();
    });

    it('기본값으로 text variant와 pulse animation을 사용한다', () => {
      const { container } = render(<Skeleton />);
      const skeleton = container.firstChild;
      expect(skeleton).toHaveClass('rounded');
      expect(skeleton).toHaveClass('animate-pulse');
    });

    it('aria-hidden="true" 속성을 가진다', () => {
      const { container } = render(<Skeleton />);
      const skeleton = container.firstChild;
      expect(skeleton).toHaveAttribute('aria-hidden', 'true');
    });
  });

  // Variant 테스트
  describe('Variant', () => {
    it('text variant 스타일을 적용한다', () => {
      const { container } = render(<Skeleton variant="text" />);
      const skeleton = container.firstChild;
      expect(skeleton).toHaveClass('rounded');
    });

    it('circular variant 스타일을 적용한다', () => {
      const { container } = render(<Skeleton variant="circular" />);
      const skeleton = container.firstChild;
      expect(skeleton).toHaveClass('rounded-full');
    });

    it('rectangular variant 스타일을 적용한다', () => {
      const { container } = render(<Skeleton variant="rectangular" />);
      const skeleton = container.firstChild;
      expect(skeleton).toHaveClass('rounded-none');
    });

    it('rounded variant 스타일을 적용한다', () => {
      const { container } = render(<Skeleton variant="rounded" />);
      const skeleton = container.firstChild;
      expect(skeleton).toHaveClass('rounded-lg');
    });
  });

  // Size 테스트
  describe('Size', () => {
    it('숫자로 width를 설정할 수 있다', () => {
      const { container } = render(<Skeleton width={100} />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton.style.width).toBe('100px');
    });

    it('문자열로 width를 설정할 수 있다', () => {
      const { container } = render(<Skeleton width="50%" />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton.style.width).toBe('50%');
    });

    it('숫자로 height를 설정할 수 있다', () => {
      const { container } = render(<Skeleton height={20} />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton.style.height).toBe('20px');
    });

    it('문자열로 height를 설정할 수 있다', () => {
      const { container } = render(<Skeleton height="2rem" />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton.style.height).toBe('2rem');
    });
  });

  // Animation 테스트
  describe('Animation', () => {
    it('pulse animation 스타일을 적용한다', () => {
      const { container } = render(<Skeleton animation="pulse" />);
      const skeleton = container.firstChild;
      expect(skeleton).toHaveClass('animate-pulse');
    });

    it('wave animation 스타일을 적용한다', () => {
      const { container } = render(<Skeleton animation="wave" />);
      const skeleton = container.firstChild;
      expect(skeleton).toHaveClass('animate-shimmer');
    });

    it('none animation 스타일을 적용한다', () => {
      const { container } = render(<Skeleton animation="none" />);
      const skeleton = container.firstChild;
      expect(skeleton).not.toHaveClass('animate-pulse');
      expect(skeleton).not.toHaveClass('animate-shimmer');
    });
  });

  // className 테스트
  describe('className', () => {
    it('추가 className을 병합한다', () => {
      const { container } = render(<Skeleton className="custom-class" />);
      const skeleton = container.firstChild;
      expect(skeleton).toHaveClass('custom-class');
      expect(skeleton).toHaveClass('bg-slate-200'); // 기본 스타일도 유지
    });
  });

  // ref 테스트
  describe('ref', () => {
    it('ref를 올바르게 전달한다', () => {
      const ref = vi.fn();
      render(<Skeleton ref={ref} />);
      expect(ref).toHaveBeenCalled();
    });
  });
});

describe('SkeletonText', () => {
  it('기본적으로 3줄을 렌더링한다', () => {
    const { container } = render(<SkeletonText />);
    const skeletons = container.querySelectorAll('[aria-hidden="true"] > div');
    expect(skeletons).toHaveLength(3);
  });

  it('지정된 줄 수만큼 렌더링한다', () => {
    const { container } = render(<SkeletonText lines={5} />);
    const wrapper = container.querySelector('[aria-hidden="true"]');
    const skeletons = wrapper?.querySelectorAll('div');
    expect(skeletons).toHaveLength(5);
  });

  it('마지막 줄에 lastLineWidth를 적용한다', () => {
    const { container } = render(<SkeletonText lines={2} lastLineWidth="40%" />);
    const wrapper = container.querySelector('[aria-hidden="true"]');
    const skeletons = wrapper?.querySelectorAll('div');
    const lastSkeleton = skeletons?.[skeletons.length - 1] as HTMLElement;
    expect(lastSkeleton.style.width).toBe('40%');
  });
});

describe('SkeletonAvatar', () => {
  it('circular variant를 사용한다', () => {
    const { container } = render(<SkeletonAvatar />);
    const skeleton = container.querySelector('[aria-hidden="true"]');
    expect(skeleton).toHaveClass('rounded-full');
  });

  it('sm size를 적용한다', () => {
    const { container } = render(<SkeletonAvatar size="sm" />);
    const skeleton = container.querySelector('[aria-hidden="true"]') as HTMLElement;
    expect(skeleton.style.width).toBe('32px');
    expect(skeleton.style.height).toBe('32px');
  });

  it('md size를 적용한다', () => {
    const { container } = render(<SkeletonAvatar size="md" />);
    const skeleton = container.querySelector('[aria-hidden="true"]') as HTMLElement;
    expect(skeleton.style.width).toBe('40px');
    expect(skeleton.style.height).toBe('40px');
  });

  it('lg size를 적용한다', () => {
    const { container } = render(<SkeletonAvatar size="lg" />);
    const skeleton = container.querySelector('[aria-hidden="true"]') as HTMLElement;
    expect(skeleton.style.width).toBe('48px');
    expect(skeleton.style.height).toBe('48px');
  });

  it('xl size를 적용한다', () => {
    const { container } = render(<SkeletonAvatar size="xl" />);
    const skeleton = container.querySelector('[aria-hidden="true"]') as HTMLElement;
    expect(skeleton.style.width).toBe('64px');
    expect(skeleton.style.height).toBe('64px');
  });
});

describe('SkeletonCard', () => {
  it('카드 레이아웃을 렌더링한다', () => {
    const { container } = render(<SkeletonCard />);
    const card = container.firstChild;
    expect(card).toHaveClass('rounded-2xl');
    expect(card).toHaveClass('bg-white');
  });

  it('아바타와 텍스트 스켈레톤을 포함한다', () => {
    const { container } = render(<SkeletonCard />);
    // circular 아바타 확인
    const avatar = container.querySelector('.rounded-full');
    expect(avatar).toBeInTheDocument();
  });

  it('aria-hidden="true" 속성을 가진다', () => {
    const { container } = render(<SkeletonCard />);
    const card = container.firstChild;
    expect(card).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('SkeletonTableRow', () => {
  it('기본적으로 4개의 컬럼을 렌더링한다', () => {
    const { container } = render(<SkeletonTableRow />);
    const columns = container.querySelectorAll('[aria-hidden="true"] > div');
    expect(columns).toHaveLength(4);
  });

  it('지정된 컬럼 수만큼 렌더링한다', () => {
    const { container } = render(<SkeletonTableRow columns={6} />);
    const row = container.querySelector('[aria-hidden="true"]');
    const columns = row?.querySelectorAll(':scope > div');
    expect(columns).toHaveLength(6);
  });

  it('flex 레이아웃을 가진다', () => {
    const { container } = render(<SkeletonTableRow />);
    const row = container.firstChild;
    expect(row).toHaveClass('flex');
  });
});

describe('SkeletonMetricCard', () => {
  it('메트릭 카드 레이아웃을 렌더링한다', () => {
    const { container } = render(<SkeletonMetricCard />);
    const card = container.firstChild;
    expect(card).toHaveClass('rounded-2xl');
    expect(card).toHaveClass('bg-white');
  });

  it('aria-hidden="true" 속성을 가진다', () => {
    const { container } = render(<SkeletonMetricCard />);
    const card = container.firstChild;
    expect(card).toHaveAttribute('aria-hidden', 'true');
  });
});
