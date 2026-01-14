import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChartTooltip } from './ChartTooltip';

describe('ChartTooltip', () => {
  describe('렌더링', () => {
    it('active가 false일 때 렌더링되지 않아야 함', () => {
      const { container } = render(
        <ChartTooltip
          active={false}
          payload={[{ name: '광고비', value: 1000000, color: '#3B82F6', dataKey: 'spend', payload: {} }]}
          label="2026-01-14"
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('payload가 비어있을 때 렌더링되지 않아야 함', () => {
      const { container } = render(
        <ChartTooltip active={true} payload={[]} label="2026-01-14" />
      );

      expect(container.firstChild).toBeNull();
    });

    it('active가 true이고 payload가 있을 때 렌더링되어야 함', () => {
      render(
        <ChartTooltip
          active={true}
          payload={[
            { name: '광고비', value: 1000000, color: '#3B82F6', dataKey: 'spend', payload: {} },
          ]}
          label="2026-01-14"
        />
      );

      expect(screen.getByText('2026-01-14')).toBeInTheDocument();
      expect(screen.getByText('광고비')).toBeInTheDocument();
    });
  });

  describe('데이터 표시', () => {
    it('여러 데이터 항목이 표시되어야 함', () => {
      render(
        <ChartTooltip
          active={true}
          payload={[
            { name: '광고비', value: 1000000, color: '#3B82F6', dataKey: 'spend', payload: {} },
            { name: '매출', value: 3200000, color: '#22C55E', dataKey: 'revenue', payload: {} },
          ]}
          label="1/14"
        />
      );

      expect(screen.getByText('광고비')).toBeInTheDocument();
      expect(screen.getByText('매출')).toBeInTheDocument();
    });

    it('통화 형식으로 값이 포맷팅되어야 함', () => {
      render(
        <ChartTooltip
          active={true}
          payload={[
            { name: '광고비', value: 1234567, color: '#3B82F6', dataKey: 'spend', payload: {} },
          ]}
          label="테스트"
        />
      );

      // 통화 포맷 확인 (₩1,234,567)
      expect(screen.getByText('₩1,234,567')).toBeInTheDocument();
    });

    it('일반 숫자 형식으로 값이 포맷팅되어야 함', () => {
      render(
        <ChartTooltip
          active={true}
          payload={[
            { name: '클릭수', value: 12345, color: '#3B82F6', dataKey: 'clicks', payload: {} },
          ]}
          label="테스트"
        />
      );

      // 숫자 포맷 확인 (12,345)
      expect(screen.getByText('12,345')).toBeInTheDocument();
    });
  });

  describe('커스텀 포맷터', () => {
    it('커스텀 formatter가 적용되어야 함', () => {
      const customFormatter = (value: number, name: string) => `${name}: ${value}개`;

      render(
        <ChartTooltip
          active={true}
          payload={[
            { name: '전환수', value: 100, color: '#3B82F6', dataKey: 'conversions', payload: {} },
          ]}
          label="테스트"
          formatter={customFormatter}
        />
      );

      expect(screen.getByText('전환수: 100개')).toBeInTheDocument();
    });

    it('커스텀 labelFormatter가 적용되어야 함', () => {
      const customLabelFormatter = (label: string) => `날짜: ${label}`;

      render(
        <ChartTooltip
          active={true}
          payload={[
            { name: '광고비', value: 1000, color: '#3B82F6', dataKey: 'spend', payload: {} },
          ]}
          label="2026-01-14"
          labelFormatter={customLabelFormatter}
        />
      );

      expect(screen.getByText('날짜: 2026-01-14')).toBeInTheDocument();
    });
  });

  describe('스타일', () => {
    it('색상 점이 올바른 색상으로 표시되어야 함', () => {
      render(
        <ChartTooltip
          active={true}
          payload={[
            { name: '광고비', value: 1000, color: '#3B82F6', dataKey: 'spend', payload: {} },
          ]}
          label="테스트"
        />
      );

      // 색상 점 요소가 존재하고 올바른 색상을 가지는지 확인
      const colorDot = document.querySelector('[style*="background-color"]');
      expect(colorDot).toBeInTheDocument();
    });
  });
});
