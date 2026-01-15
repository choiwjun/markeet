import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DashboardPage from './page';

// Next.js 모킹
vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

// Recharts 모킹
vi.mock('recharts', async () => {
  const actual = await vi.importActual<typeof import('recharts')>('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: 800, height: 400 }}>{children}</div>
    ),
  };
});

// fetch 모킹
const mockDashboardResponse = {
  metrics: {
    totalSpend: 2850000,
    totalRevenue: 9120000,
    avgRoas: 3.2,
    totalClicks: 75000,
    totalConversions: 2400,
    totalImpressions: 1500000,
  },
  changes: {
    spendChange: 5.2,
    revenueChange: 8.3,
    roasChange: 2.1,
    clicksChange: -1.5,
    conversionsChange: 12.0,
  },
  period: {
    startDate: '2026-01-08',
    endDate: '2026-01-14',
  },
};

const mockPlatformResponse = {
  data: [
    { platform: 'naver', spend: 1200000, revenue: 3840000, roas: 3.2, clicks: 30000, conversions: 960 },
    { platform: 'google', spend: 950000, revenue: 3040000, roas: 3.2, clicks: 25000, conversions: 800 },
  ],
  period: { startDate: '2026-01-08', endDate: '2026-01-14' },
};

const mockTrendResponse = {
  data: [
    { date: '2026-01-08', spend: 400000, revenue: 1280000, roas: 3.2, clicks: 10000, conversions: 320 },
    { date: '2026-01-09', spend: 410000, revenue: 1312000, roas: 3.2, clicks: 10250, conversions: 328 },
  ],
  period: { startDate: '2026-01-08', endDate: '2026-01-14' },
};

// QueryClient wrapper
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

const renderWithQueryClient = (ui: React.ReactNode) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
};

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // fetch 모킹
    global.fetch = vi.fn((url: string | URL | Request) => {
      const urlString = url.toString();

      if (urlString.includes('/api/dashboard/platforms')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockPlatformResponse),
        } as Response);
      }

      if (urlString.includes('/api/dashboard/trends')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockTrendResponse),
        } as Response);
      }

      if (urlString.includes('/api/dashboard')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockDashboardResponse),
        } as Response);
      }

      return Promise.reject(new Error('Not found'));
    }) as unknown as typeof fetch;
  });

  describe('렌더링', () => {
    it('페이지 제목이 렌더링되어야 함', async () => {
      renderWithQueryClient(<DashboardPage />);

      expect(screen.getByText('대시보드 개요')).toBeInTheDocument();
    });

    it('AI 인사이트 패널이 렌더링되어야 함', async () => {
      renderWithQueryClient(<DashboardPage />);

      expect(screen.getByText('AI 인사이트')).toBeInTheDocument();
    });

    it('기간 선택 필터가 렌더링되어야 함', async () => {
      renderWithQueryClient(<DashboardPage />);

      expect(screen.getByLabelText('기간 선택')).toBeInTheDocument();
    });
  });

  describe('데이터 로딩', () => {
    it('로딩 중 스켈레톤이 표시되어야 함', async () => {
      // fetch가 지연되도록 설정
      global.fetch = vi.fn(() => new Promise(() => {})) as unknown as typeof fetch;

      const { container } = renderWithQueryClient(<DashboardPage />);

      // 스켈레톤 카드가 표시되는지 확인
      const skeletons = container.querySelectorAll('[aria-hidden="true"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('데이터 표시', () => {
    it('지표 카드가 올바른 데이터와 함께 렌더링되어야 함', async () => {
      renderWithQueryClient(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('총 광고비')).toBeInTheDocument();
      });

      // 변경된 라벨명 확인
      expect(screen.getByText('총 매출액')).toBeInTheDocument();
      expect(screen.getByText('ROAS (광고 수익률)')).toBeInTheDocument();
    });

    it('플랫폼별 차트가 렌더링되어야 함', async () => {
      renderWithQueryClient(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('플랫폼별 성과 비교')).toBeInTheDocument();
      });
    });

    it('일자별 추이 차트가 렌더링되어야 함', async () => {
      renderWithQueryClient(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('일자별 추이')).toBeInTheDocument();
      });
    });
  });

  describe('에러 처리', () => {
    it('API 에러 시 에러 상태가 표시되어야 함', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: '서버 오류' }),
        } as Response)
      ) as unknown as typeof fetch;

      renderWithQueryClient(<DashboardPage />);

      await waitFor(
        () => {
          // 에러 상태 메시지가 표시되는지 확인
          expect(screen.getByText('데이터 로드 실패')).toBeInTheDocument();
        },
        { timeout: 10000 }
      );
    });
  });
});
