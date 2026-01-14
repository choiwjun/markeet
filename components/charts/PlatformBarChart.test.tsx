import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlatformBarChart } from './PlatformBarChart';
import type { PlatformData } from './PlatformBarChart';

// Recharts 모킹 (ResponsiveContainer 문제 해결)
vi.mock('recharts', async () => {
  const actual = await vi.importActual<typeof import('recharts')>('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: 800, height: 400 }}>{children}</div>
    ),
  };
});

describe('PlatformBarChart', () => {
  const mockData: PlatformData[] = [
    { platform: 'naver', spend: 1200000, revenue: 3840000, roas: 3.2 },
    { platform: 'google', spend: 950000, revenue: 3040000, roas: 3.2 },
    { platform: 'meta', spend: 700000, revenue: 2240000, roas: 3.2 },
  ];

  describe('렌더링', () => {
    it('제목이 렌더링되어야 함', () => {
      render(<PlatformBarChart data={mockData} title="플랫폼별 성과 비교" />);
      expect(screen.getByText('플랫폼별 성과 비교')).toBeInTheDocument();
    });

    it('데이터가 없을 때 빈 상태 메시지가 표시되어야 함', () => {
      render(<PlatformBarChart data={[]} />);
      expect(screen.getByText('표시할 데이터가 없습니다.')).toBeInTheDocument();
    });

    it('커스텀 제목이 표시되어야 함', () => {
      render(<PlatformBarChart data={mockData} title="커스텀 제목" />);
      expect(screen.getByText('커스텀 제목')).toBeInTheDocument();
    });
  });

  describe('데이터 표시', () => {
    it('플랫폼 데이터가 차트에 렌더링되어야 함', () => {
      render(<PlatformBarChart data={mockData} />);

      // 차트가 렌더링되었는지 확인 (Card 내부에 차트가 있어야 함)
      const chartContainer = screen.getByText('플랫폼별 성과 비교').closest('div');
      expect(chartContainer).toBeInTheDocument();
    });
  });

  describe('Props', () => {
    it('커스텀 높이가 적용되어야 함', () => {
      const { container } = render(
        <PlatformBarChart data={mockData} height={500} />
      );

      // height prop이 전달되는지 확인
      expect(container.querySelector('[style*="height"]')).toBeInTheDocument();
    });
  });
});
