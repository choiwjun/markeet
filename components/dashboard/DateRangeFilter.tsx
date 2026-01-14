'use client';

import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, Check } from 'lucide-react';

// 기간 옵션 타입
export type DateRangeOption = '7d' | '30d' | '90d' | 'custom';

// 기간 범위 인터페이스
export interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface DateRangeFilterProps {
  /** 현재 선택된 기간 옵션 */
  value: DateRangeOption;
  /** 기간 옵션 변경 핸들러 */
  onChange: (option: DateRangeOption, range?: DateRange) => void;
  /** 커스텀 기간 선택 시 기간 범위 */
  customRange?: DateRange;
  /** 비활성화 상태 */
  disabled?: boolean;
}

// 기간 옵션 정의
const DATE_RANGE_OPTIONS: Array<{ value: DateRangeOption; label: string }> = [
  { value: '7d', label: '최근 7일' },
  { value: '30d', label: '최근 30일' },
  { value: '90d', label: '최근 90일' },
  { value: 'custom', label: '직접 선택' },
];

// 스타일 상수
const BUTTON_STYLES = [
  'inline-flex items-center gap-2',
  'px-4 py-2.5',
  'bg-white dark:bg-slate-800',
  'border border-slate-200 dark:border-slate-700',
  'rounded-lg',
  'text-sm font-medium',
  'text-slate-700 dark:text-slate-300',
  'hover:bg-slate-50 dark:hover:bg-slate-700',
  'hover:border-slate-300 dark:hover:border-slate-600',
  'focus:outline-none focus:ring-2 focus:ring-primary-500/20',
  'transition-all duration-200',
  'disabled:opacity-50 disabled:cursor-not-allowed',
].join(' ');

const DROPDOWN_STYLES = [
  'absolute right-0 top-full mt-2',
  'w-48',
  'bg-white dark:bg-slate-800',
  'border border-slate-200 dark:border-slate-700',
  'rounded-xl',
  'shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50',
  'py-1',
  'z-50',
].join(' ');

const OPTION_STYLES = [
  'flex items-center justify-between',
  'w-full px-4 py-2.5',
  'text-sm',
  'text-slate-600 dark:text-slate-400',
  'hover:bg-slate-100 dark:hover:bg-slate-700',
  'hover:text-slate-900 dark:hover:text-slate-200',
  'transition-colors duration-200',
].join(' ');

const OPTION_SELECTED_STYLES = [
  'bg-primary-50 dark:bg-primary-900/20',
  'text-primary-600 dark:text-primary-400',
].join(' ');

/**
 * 기간 선택 필터 컴포넌트
 * TASK-508: 7일/30일/커스텀 기간 선택 드롭다운
 */
export function DateRangeFilter({
  value,
  onChange,
  customRange,
  disabled = false,
}: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 현재 선택된 옵션의 라벨 가져오기
  const selectedLabel = DATE_RANGE_OPTIONS.find((opt) => opt.value === value)?.label || '기간 선택';

  // 드롭다운 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // ESC 키로 드롭다운 닫기
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleOptionClick = (option: DateRangeOption) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 트리거 버튼 */}
      <button
        type="button"
        onClick={toggleDropdown}
        className={BUTTON_STYLES}
        disabled={disabled}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="기간 선택"
      >
        <Calendar className="w-4 h-4 text-slate-400" />
        <span>{selectedLabel}</span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* 드롭다운 메뉴 */}
      {isOpen && (
        <div className={DROPDOWN_STYLES} role="listbox" aria-label="기간 옵션">
          {DATE_RANGE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleOptionClick(option.value)}
              className={`${OPTION_STYLES} ${
                value === option.value ? OPTION_SELECTED_STYLES : ''
              }`}
              role="option"
              aria-selected={value === option.value}
            >
              <span>{option.label}</span>
              {value === option.value && (
                <Check className="w-4 h-4" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default DateRangeFilter;
