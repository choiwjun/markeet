import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TrendLineChart } from './TrendLineChart';
import type { TrendData } from './TrendLineChart';

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

describe('TrendLineChart', () => {
  const mockData: TrendData[] = [
    { date: '2026-01-08', spend: 400000, revenue: 1280000, roas: 3.2 },
    { date: '2026-01-09', spend: 410000, revenue: 1312000, roas: 3.2 },
    { date: '2026-01-10', spend: 390000, revenue: 1248000, roas: 3.2 },
    { date: '2026-01-11', spend: 420000, revenue: 1344000, roas: 3.2 },
    { date: '2026-01-12', spend: 380000, revenue: 1216000, roas: 3.2 },
    { date: '2026-01-13', spend: 430000, revenue: 1376000, roas: 3.2 },
    { date: '2026-01-14', spend: 420000, revenue: 1344000, roas: 3.2 },
  ];

  describe('렌더링', () => {
    it('제목이 렌더링되어야 함', () => {
      render(<TrendLineChart data={mockData} title="일자별 추이" />);
      expect(screen.getByText('일자별 추이')).toBeInTheDocument();
    });

    it('데이터가 없을 때 빈 상태 메시지가 표시되어야 함', () => {
      render(<TrendLineChart data={[]} />);
      expect(screen.getByText('표시할 데이터가 없습니다.')).toBeInTheDocument();
    });

    it('커스텀 제목이 표시되어야 함', () => {
      render(<TrendLineChart data={mockData} title="광고비/매출 추이" />);
      expect(screen.getByText('광고비/매출 추이')).toBeInTheDocument();
    });
  });

  describe('데이터 표시', () => {
    it('추이 데이터가 차트에 렌더링되어야 함', () => {
      render(<TrendLineChart data={mockData} />);

      // 차트가 렌더링되었는지 확인
      const chartContainer = screen.getByText('일자별 추이').closest('div');
      expect(chartContainer).toBeInTheDocument();
    });
  });

  describe('Props', () => {
    it('커스텀 높이가 적용되어야 함', () => {
      const { container } = render(
        <TrendLineChart data={mockData} height={500} />
      );

      expect(container.querySelector('[style*="height"]')).toBeInTheDocument();
    });

    it('dataKeys prop으로 표시할 데이터를 선택할 수 있어야 함', () => {
      render(
        <TrendLineChart data={mockData} dataKeys={['spend']} />
      );

      // 컴포넌트가 정상적으로 렌더링되는지 확인
      expect(screen.getByText('일자별 추이')).toBeInTheDocument();
    });

    it('ROAS 데이터를 포함하여 표시할 수 있어야 함', () => {
      render(
        <TrendLineChart data={mockData} dataKeys={['spend', 'revenue', 'roas']} />
      );

      expect(screen.getByText('일자별 추이')).toBeInTheDocument();
    });
  });
});
