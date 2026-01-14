import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DollarSign, Users, TrendingUp } from 'lucide-react';
import { MetricCard } from './MetricCard';

describe('MetricCard', () => {
  describe('기본 렌더링', () => {
    it('라벨이 렌더링되어야 함', () => {
      render(<MetricCard label="총 광고비" value={1000000} />);
      expect(screen.getByText('총 광고비')).toBeInTheDocument();
    });

    it('값이 올바르게 포맷팅되어 렌더링되어야 함', () => {
      render(<MetricCard label="총 클릭수" value={12345} format="number" />);
      expect(screen.getByTestId('metric-value')).toHaveTextContent('12,345');
    });

    it('아이콘이 렌더링되어야 함', () => {
      render(
        <MetricCard
          label="총 광고비"
          value={1000000}
          icon={<DollarSign data-testid="icon" />}
        />
      );
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });
  });

  describe('값 포맷팅', () => {
    it('currency 포맷이 올바르게 적용되어야 함', () => {
      render(<MetricCard label="총 광고비" value={1234567} format="currency" />);
      expect(screen.getByTestId('metric-value')).toHaveTextContent('₩1,234,567');
    });

    it('percent 포맷이 올바르게 적용되어야 함', () => {
      render(<MetricCard label="클릭률" value={3.5} format="percent" />);
      expect(screen.getByTestId('metric-value')).toHaveTextContent('3.5%');
    });

    it('roas 포맷이 올바르게 적용되어야 함', () => {
      render(<MetricCard label="ROAS" value={3.24} format="roas" />);
      expect(screen.getByTestId('metric-value')).toHaveTextContent('3.24');
    });

    it('number 포맷(기본값)이 올바르게 적용되어야 함', () => {
      render(<MetricCard label="전환수" value={2500} />);
      expect(screen.getByTestId('metric-value')).toHaveTextContent('2,500');
    });
  });

  describe('증감 표시 (TASK-506)', () => {
    it('양수 증감률에 녹색 상승 아이콘이 표시되어야 함', () => {
      render(
        <MetricCard
          label="총 매출"
          value={5000000}
          changePercent={12.5}
        />
      );

      const badge = screen.getByTestId('change-badge');
      expect(badge).toHaveTextContent('+12.5%');
      // success 색상 클래스 확인
      expect(badge.className).toContain('success');
    });

    it('음수 증감률에 빨간 하락 아이콘이 표시되어야 함', () => {
      render(
        <MetricCard
          label="총 매출"
          value={5000000}
          changePercent={-8.3}
        />
      );

      const badge = screen.getByTestId('change-badge');
      expect(badge).toHaveTextContent('-8.3%');
      // danger 색상 클래스 확인
      expect(badge.className).toContain('danger');
    });

    it('증감률이 0일 때 중립 스타일이 적용되어야 함', () => {
      render(
        <MetricCard
          label="총 매출"
          value={5000000}
          changePercent={0}
        />
      );

      const badge = screen.getByTestId('change-badge');
      expect(badge).toHaveTextContent('0.0%');
      // neutral 스타일 (slate 색상) 확인
      expect(badge.className).toContain('slate');
    });

    it('비교 기간 텍스트가 표시되어야 함', () => {
      render(
        <MetricCard
          label="총 매출"
          value={5000000}
          changePercent={5.2}
          changePeriod="전주 대비"
        />
      );

      expect(screen.getByText('전주 대비')).toBeInTheDocument();
    });

    it('기본 비교 기간이 "전일 대비"여야 함', () => {
      render(
        <MetricCard
          label="총 매출"
          value={5000000}
          changePercent={5.2}
        />
      );

      expect(screen.getByText('전일 대비')).toBeInTheDocument();
    });

    it('changePercent가 undefined일 때 증감 표시가 없어야 함', () => {
      render(
        <MetricCard
          label="총 매출"
          value={5000000}
        />
      );

      expect(screen.queryByTestId('change-badge')).not.toBeInTheDocument();
    });
  });

  describe('스타일 및 클래스', () => {
    it('className prop이 적용되어야 함', () => {
      const { container } = render(
        <MetricCard
          label="테스트"
          value={100}
          className="custom-class"
        />
      );

      // Card 컴포넌트의 클래스에 custom-class가 포함되어야 함
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('실제 사용 시나리오', () => {
    it('광고비 지표 카드가 올바르게 렌더링되어야 함', () => {
      render(
        <MetricCard
          label="총 광고비"
          value={2850000}
          format="currency"
          changePercent={5.2}
          changePeriod="전주 대비"
          icon={<DollarSign />}
        />
      );

      expect(screen.getByText('총 광고비')).toBeInTheDocument();
      expect(screen.getByTestId('metric-value')).toHaveTextContent('₩2,850,000');
      expect(screen.getByTestId('change-badge')).toHaveTextContent('+5.2%');
      expect(screen.getByText('전주 대비')).toBeInTheDocument();
    });

    it('ROAS 지표 카드가 올바르게 렌더링되어야 함', () => {
      render(
        <MetricCard
          label="평균 ROAS"
          value={3.2}
          format="roas"
          changePercent={-2.1}
          changePeriod="전일 대비"
          icon={<TrendingUp />}
        />
      );

      expect(screen.getByText('평균 ROAS')).toBeInTheDocument();
      expect(screen.getByTestId('metric-value')).toHaveTextContent('3.20');
      expect(screen.getByTestId('change-badge')).toHaveTextContent('-2.1%');
    });

    it('전환수 지표 카드가 올바르게 렌더링되어야 함', () => {
      render(
        <MetricCard
          label="총 전환수"
          value={2400}
          format="number"
          changePercent={15.3}
          changePeriod="전월 대비"
          icon={<Users />}
        />
      );

      expect(screen.getByText('총 전환수')).toBeInTheDocument();
      expect(screen.getByTestId('metric-value')).toHaveTextContent('2,400');
      expect(screen.getByTestId('change-badge')).toHaveTextContent('+15.3%');
      expect(screen.getByText('전월 대비')).toBeInTheDocument();
    });
  });
});
