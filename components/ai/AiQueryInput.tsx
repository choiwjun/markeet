'use client';

/**
 * AI 질의 입력 컴포넌트
 * TASK-901: 대시보드 AI 질문 입력창
 */

import { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles } from 'lucide-react';

// 스타일 상수
const INPUT_CONTAINER_STYLES = [
  'relative',
  'flex items-center gap-2',
  'bg-white dark:bg-slate-800',
  'border border-slate-200 dark:border-slate-700',
  'rounded-xl',
  'px-4 py-3',
  'shadow-sm',
  'focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent',
  'transition-all duration-200',
].join(' ');

const ICON_STYLES = [
  'flex-shrink-0',
  'text-primary-500',
].join(' ');

const INPUT_STYLES = [
  'flex-1',
  'bg-transparent',
  'text-slate-900 dark:text-white',
  'placeholder:text-slate-400 dark:placeholder:text-slate-500',
  'focus:outline-none',
  'text-sm',
].join(' ');

const BUTTON_STYLES = [
  'flex-shrink-0',
  'p-2',
  'rounded-lg',
  'bg-primary-500 hover:bg-primary-600',
  'text-white',
  'disabled:opacity-50 disabled:cursor-not-allowed',
  'transition-colors duration-200',
].join(' ');

const REMAINING_STYLES = [
  'absolute -bottom-6 right-0',
  'text-xs',
  'text-slate-400 dark:text-slate-500',
].join(' ');

interface AiQueryInputProps {
  onSubmit: (question: string) => void;
  isLoading?: boolean;
  remaining?: number;
  placeholder?: string;
  autoFocus?: boolean;
}

export function AiQueryInput({
  onSubmit,
  isLoading = false,
  remaining,
  placeholder = '광고 성과에 대해 무엇이든 물어보세요...',
  autoFocus = false,
}: AiQueryInputProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = () => {
    const trimmedValue = value.trim();
    if (trimmedValue && !isLoading) {
      onSubmit(trimmedValue);
      setValue('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative">
      <div className={INPUT_CONTAINER_STYLES}>
        <Sparkles className={`${ICON_STYLES} w-5 h-5`} />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          className={INPUT_STYLES}
          maxLength={500}
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!value.trim() || isLoading}
          className={BUTTON_STYLES}
          aria-label="질문하기"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
      {remaining !== undefined && (
        <div className={REMAINING_STYLES}>
          오늘 {remaining}회 남음
        </div>
      )}
    </div>
  );
}
