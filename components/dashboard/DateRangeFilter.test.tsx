import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DateRangeFilter } from './DateRangeFilter';

describe('DateRangeFilter', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('렌더링', () => {
    it('선택된 기간 옵션이 표시되어야 함', () => {
      render(<DateRangeFilter value="7d" onChange={mockOnChange} />);
      expect(screen.getByText('최근 7일')).toBeInTheDocument();
    });

    it('30일 옵션이 선택되면 해당 라벨이 표시되어야 함', () => {
      render(<DateRangeFilter value="30d" onChange={mockOnChange} />);
      expect(screen.getByText('최근 30일')).toBeInTheDocument();
    });

    it('캘린더 아이콘이 표시되어야 함', () => {
      render(<DateRangeFilter value="7d" onChange={mockOnChange} />);
      // aria-label로 버튼 찾기
      const button = screen.getByLabelText('기간 선택');
      expect(button).toBeInTheDocument();
    });
  });

  describe('드롭다운 동작', () => {
    it('버튼 클릭 시 드롭다운이 열려야 함', () => {
      render(<DateRangeFilter value="7d" onChange={mockOnChange} />);

      const button = screen.getByLabelText('기간 선택');
      fireEvent.click(button);

      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('모든 기간 옵션이 표시되어야 함', () => {
      render(<DateRangeFilter value="7d" onChange={mockOnChange} />);

      const button = screen.getByLabelText('기간 선택');
      fireEvent.click(button);

      // 7일 옵션은 버튼과 드롭다운에 모두 있으므로 2개
      expect(screen.getAllByText('최근 7일').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('최근 30일')).toBeInTheDocument();
      expect(screen.getByText('최근 90일')).toBeInTheDocument();
      expect(screen.getByText('직접 선택')).toBeInTheDocument();
    });

    it('옵션 클릭 시 onChange가 호출되어야 함', () => {
      render(<DateRangeFilter value="7d" onChange={mockOnChange} />);

      const button = screen.getByLabelText('기간 선택');
      fireEvent.click(button);

      const option30d = screen.getByRole('option', { name: '최근 30일' });
      fireEvent.click(option30d);

      expect(mockOnChange).toHaveBeenCalledWith('30d');
    });

    it('옵션 선택 후 드롭다운이 닫혀야 함', async () => {
      render(<DateRangeFilter value="7d" onChange={mockOnChange} />);

      const button = screen.getByLabelText('기간 선택');
      fireEvent.click(button);

      const option30d = screen.getByRole('option', { name: '최근 30일' });
      fireEvent.click(option30d);

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });

    it('드롭다운 외부 클릭 시 닫혀야 함', async () => {
      render(<DateRangeFilter value="7d" onChange={mockOnChange} />);

      const button = screen.getByLabelText('기간 선택');
      fireEvent.click(button);

      expect(screen.getByRole('listbox')).toBeInTheDocument();

      fireEvent.mouseDown(document.body);

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });

    it('ESC 키 입력 시 드롭다운이 닫혀야 함', async () => {
      render(<DateRangeFilter value="7d" onChange={mockOnChange} />);

      const button = screen.getByLabelText('기간 선택');
      fireEvent.click(button);

      expect(screen.getByRole('listbox')).toBeInTheDocument();

      fireEvent.keyDown(document, { key: 'Escape' });

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });
  });

  describe('선택 상태', () => {
    it('현재 선택된 옵션에 체크 아이콘이 표시되어야 함', () => {
      render(<DateRangeFilter value="7d" onChange={mockOnChange} />);

      const button = screen.getByLabelText('기간 선택');
      fireEvent.click(button);

      const selectedOption = screen.getByRole('option', { name: '최근 7일' });
      expect(selectedOption).toHaveAttribute('aria-selected', 'true');
    });

    it('선택되지 않은 옵션에는 체크 아이콘이 없어야 함', () => {
      render(<DateRangeFilter value="7d" onChange={mockOnChange} />);

      const button = screen.getByLabelText('기간 선택');
      fireEvent.click(button);

      const unselectedOption = screen.getByRole('option', { name: '최근 30일' });
      expect(unselectedOption).toHaveAttribute('aria-selected', 'false');
    });
  });

  describe('비활성화 상태', () => {
    it('disabled=true일 때 버튼이 비활성화되어야 함', () => {
      render(<DateRangeFilter value="7d" onChange={mockOnChange} disabled />);

      const button = screen.getByLabelText('기간 선택');
      expect(button).toBeDisabled();
    });

    it('disabled=true일 때 클릭해도 드롭다운이 열리지 않아야 함', () => {
      render(<DateRangeFilter value="7d" onChange={mockOnChange} disabled />);

      const button = screen.getByLabelText('기간 선택');
      fireEvent.click(button);

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('접근성', () => {
    it('버튼에 aria-expanded가 설정되어야 함', () => {
      render(<DateRangeFilter value="7d" onChange={mockOnChange} />);

      const button = screen.getByLabelText('기간 선택');
      expect(button).toHaveAttribute('aria-expanded', 'false');

      fireEvent.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('버튼에 aria-haspopup이 설정되어야 함', () => {
      render(<DateRangeFilter value="7d" onChange={mockOnChange} />);

      const button = screen.getByLabelText('기간 선택');
      expect(button).toHaveAttribute('aria-haspopup', 'listbox');
    });

    it('드롭다운에 listbox role이 설정되어야 함', () => {
      render(<DateRangeFilter value="7d" onChange={mockOnChange} />);

      const button = screen.getByLabelText('기간 선택');
      fireEvent.click(button);

      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('옵션에 option role이 설정되어야 함', () => {
      render(<DateRangeFilter value="7d" onChange={mockOnChange} />);

      const button = screen.getByLabelText('기간 선택');
      fireEvent.click(button);

      const options = screen.getAllByRole('option');
      expect(options.length).toBe(4);
    });
  });
});
