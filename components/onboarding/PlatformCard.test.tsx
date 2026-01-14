import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PlatformCard } from './PlatformCard';
import type { PlatformInfo } from '@/lib/constants/platforms';

// 테스트용 플랫폼 데이터
const mockPlatform: PlatformInfo = {
  code: 'naver',
  name: '네이버 광고',
  description: '네이버 검색광고 성과 데이터',
  category: 'ad',
  iconName: 'naver',
  color: '#03C75A',
  apiKeyFields: [],
  docsUrl: 'https://example.com',
};

describe('PlatformCard', () => {
  it('플랫폼 정보가 올바르게 렌더링되어야 함', () => {
    render(<PlatformCard platform={mockPlatform} />);

    expect(screen.getByText('네이버 광고')).toBeInTheDocument();
    expect(screen.getByText('네이버 검색광고 성과 데이터')).toBeInTheDocument();
  });

  it('클릭 핸들러가 호출되어야 함', () => {
    const handleClick = vi.fn();
    render(<PlatformCard platform={mockPlatform} onClick={handleClick} />);

    fireEvent.click(screen.getByTestId('platform-card-naver'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disabled 상태에서 클릭이 무시되어야 함', () => {
    const handleClick = vi.fn();
    render(
      <PlatformCard
        platform={mockPlatform}
        onClick={handleClick}
        disabled
      />
    );

    fireEvent.click(screen.getByTestId('platform-card-naver'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('선택된 상태가 표시되어야 함', () => {
    render(<PlatformCard platform={mockPlatform} isSelected />);

    const card = screen.getByTestId('platform-card-naver');
    expect(card).toHaveAttribute('aria-pressed', 'true');
  });

  it('키보드 Enter 키로 선택할 수 있어야 함', () => {
    const handleClick = vi.fn();
    render(<PlatformCard platform={mockPlatform} onClick={handleClick} />);

    const card = screen.getByTestId('platform-card-naver');
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('키보드 Space 키로 선택할 수 있어야 함', () => {
    const handleClick = vi.fn();
    render(<PlatformCard platform={mockPlatform} onClick={handleClick} />);

    const card = screen.getByTestId('platform-card-naver');
    fireEvent.keyDown(card, { key: ' ' });
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  describe('연동 상태 뱃지 표시 (TASK-411)', () => {
    it('active 상태일 때 "연동됨" 뱃지가 표시되어야 함', () => {
      render(<PlatformCard platform={mockPlatform} status="active" />);

      expect(screen.getByText('연동됨')).toBeInTheDocument();
    });

    it('expired 상태일 때 "만료됨" 뱃지가 표시되어야 함', () => {
      render(<PlatformCard platform={mockPlatform} status="expired" />);

      expect(screen.getByText('만료됨')).toBeInTheDocument();
    });

    it('error 상태일 때 "오류" 뱃지가 표시되어야 함', () => {
      render(<PlatformCard platform={mockPlatform} status="error" />);

      expect(screen.getByText('오류')).toBeInTheDocument();
    });

    it('status가 없을 때 뱃지가 표시되지 않아야 함', () => {
      render(<PlatformCard platform={mockPlatform} />);

      expect(screen.queryByText('연동됨')).not.toBeInTheDocument();
      expect(screen.queryByText('만료됨')).not.toBeInTheDocument();
      expect(screen.queryByText('오류')).not.toBeInTheDocument();
    });
  });

  describe('접근성', () => {
    it('button role이 있어야 함', () => {
      render(<PlatformCard platform={mockPlatform} />);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('disabled 상태가 aria-disabled로 표시되어야 함', () => {
      render(<PlatformCard platform={mockPlatform} disabled />);

      const card = screen.getByTestId('platform-card-naver');
      expect(card).toHaveAttribute('aria-disabled', 'true');
    });

    it('disabled 상태에서 tabIndex가 -1이어야 함', () => {
      render(<PlatformCard platform={mockPlatform} disabled />);

      const card = screen.getByTestId('platform-card-naver');
      expect(card).toHaveAttribute('tabIndex', '-1');
    });
  });
});
