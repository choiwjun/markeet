'use client';

/**
 * AI 채팅 UI 컴포넌트
 * TASK-905: 질문/답변 대화 형식 UI
 * TASK-909: AI 응답 리포트 추가
 * TASK-912: AI 에러 처리
 */

import { useState, useRef, useEffect } from 'react';
import { User, Bot, AlertCircle, Copy, Check, Bookmark, RefreshCw } from 'lucide-react';
import { AiQueryInput } from './AiQueryInput';
import { SuggestedQuestions } from './SuggestedQuestions';
import { AiResponseChart } from './AiResponseChart';
import ReactMarkdown from 'react-markdown';

// 메시지 타입
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'error';
  content: string;
  sql?: string;
  chartType?: 'bar' | 'line' | 'pie' | 'table' | null;
  chartData?: Record<string, unknown>[] | null;
  timestamp: Date;
  saved?: boolean;
}

// 스타일 상수
const PANEL_STYLES = [
  'flex flex-col',
  'h-full',
  'bg-white dark:bg-slate-900',
  'rounded-xl',
  'border border-slate-200 dark:border-slate-700',
  'overflow-hidden',
].join(' ');

const HEADER_STYLES = [
  'flex items-center justify-between',
  'px-4 py-3',
  'border-b border-slate-200 dark:border-slate-700',
  'bg-slate-50 dark:bg-slate-800/50',
].join(' ');

const HEADER_TITLE_STYLES = [
  'flex items-center gap-2',
  'text-sm font-semibold',
  'text-slate-800 dark:text-white',
].join(' ');

const MESSAGES_CONTAINER_STYLES = [
  'flex-1',
  'overflow-y-auto',
  'p-4',
  'space-y-4',
].join(' ');

const MESSAGE_STYLES = [
  'flex gap-3',
  'max-w-full',
].join(' ');

const AVATAR_STYLES = [
  'flex-shrink-0',
  'w-8 h-8',
  'rounded-full',
  'flex items-center justify-center',
].join(' ');

const USER_AVATAR_STYLES = [
  'bg-primary-100 dark:bg-primary-500/20',
  'text-primary-600 dark:text-primary-400',
].join(' ');

const BOT_AVATAR_STYLES = [
  'bg-slate-100 dark:bg-slate-700',
  'text-slate-600 dark:text-slate-400',
].join(' ');

const ERROR_AVATAR_STYLES = [
  'bg-danger-100 dark:bg-danger-500/20',
  'text-danger-600 dark:text-danger-400',
].join(' ');

const BUBBLE_STYLES = [
  'flex-1',
  'rounded-xl',
  'px-4 py-3',
  'text-sm',
  'overflow-hidden',
].join(' ');

const USER_BUBBLE_STYLES = [
  'bg-primary-500',
  'text-white',
].join(' ');

const BOT_BUBBLE_STYLES = [
  'bg-slate-100 dark:bg-slate-800',
  'text-slate-800 dark:text-slate-200',
].join(' ');

const ERROR_BUBBLE_STYLES = [
  'bg-danger-50 dark:bg-danger-500/10',
  'text-danger-700 dark:text-danger-400',
  'border border-danger-200 dark:border-danger-500/20',
].join(' ');

const ACTION_BUTTON_STYLES = [
  'p-1.5',
  'rounded-md',
  'text-slate-400 hover:text-slate-600',
  'dark:text-slate-500 dark:hover:text-slate-300',
  'hover:bg-slate-200 dark:hover:bg-slate-700',
  'transition-colors',
].join(' ');

const INPUT_CONTAINER_STYLES = [
  'p-4',
  'border-t border-slate-200 dark:border-slate-700',
  'bg-slate-50 dark:bg-slate-800/50',
].join(' ');

const EMPTY_STATE_STYLES = [
  'flex flex-col items-center justify-center',
  'h-full',
  'text-center',
  'p-8',
].join(' ');

interface AiChatPanelProps {
  className?: string;
}

export function AiChatPanel({ className = '' }: AiChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [remaining, setRemaining] = useState<number | undefined>(undefined);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 스크롤 맨 아래로
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 질문 제출
  const handleSubmit = async (question: string) => {
    // 사용자 메시지 추가
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: question,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        // 에러 메시지
        const errorMessage: Message = {
          id: crypto.randomUUID(),
          role: 'error',
          content: data.error || '질문 처리 중 오류가 발생했습니다.',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } else {
        // 성공 응답
        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: data.response,
          sql: data.sql,
          chartType: data.chartType,
          chartData: data.chartData,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);

        // 히스토리 저장
        await fetch('/api/ai/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question,
            response: data.response,
            sql: data.sql,
            chart_type: data.chartType,
          }),
        });
      }

      // 남은 횟수 업데이트
      if (data.remaining !== undefined) {
        setRemaining(data.remaining);
      }
    } catch (error) {
      console.error('AI query error:', error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'error',
        content: '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // 복사
  const handleCopy = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  // 저장 (리포트 추가 - TODO: 실제 구현)
  const handleSave = (id: string) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, saved: true } : msg))
    );
    // TODO: 리포트에 실제로 저장하는 API 호출
  };

  // 재시도
  const handleRetry = (question: string) => {
    handleSubmit(question);
  };

  return (
    <div className={`${PANEL_STYLES} ${className}`}>
      {/* 헤더 */}
      <div className={HEADER_STYLES}>
        <div className={HEADER_TITLE_STYLES}>
          <Bot className="w-5 h-5 text-primary-500" />
          <span>AI 어시스턴트</span>
        </div>
        {remaining !== undefined && (
          <span className="text-xs text-slate-500">오늘 {remaining}회 남음</span>
        )}
      </div>

      {/* 메시지 영역 */}
      <div className={MESSAGES_CONTAINER_STYLES}>
        {messages.length === 0 ? (
          <div className={EMPTY_STATE_STYLES}>
            <Bot className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
              무엇이든 물어보세요
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-md">
              광고 성과, 플랫폼 비교, 트렌드 분석 등 자연어로 질문하면
              AI가 데이터를 분석해서 답변합니다.
            </p>
            <SuggestedQuestions onSelect={handleSubmit} />
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div key={message.id} className={MESSAGE_STYLES}>
                {/* 아바타 */}
                <div
                  className={`${AVATAR_STYLES} ${
                    message.role === 'user'
                      ? USER_AVATAR_STYLES
                      : message.role === 'error'
                      ? ERROR_AVATAR_STYLES
                      : BOT_AVATAR_STYLES
                  }`}
                >
                  {message.role === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : message.role === 'error' ? (
                    <AlertCircle className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>

                {/* 버블 */}
                <div className="flex-1 min-w-0">
                  <div
                    className={`${BUBBLE_STYLES} ${
                      message.role === 'user'
                        ? USER_BUBBLE_STYLES
                        : message.role === 'error'
                        ? ERROR_BUBBLE_STYLES
                        : BOT_BUBBLE_STYLES
                    }`}
                  >
                    {message.role === 'assistant' ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <span>{message.content}</span>
                    )}
                  </div>

                  {/* 차트 */}
                  {message.chartType && message.chartData && (
                    <AiResponseChart chartType={message.chartType} data={message.chartData} />
                  )}

                  {/* 액션 버튼 */}
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-1 mt-2">
                      <button
                        type="button"
                        onClick={() => handleCopy(message.content, message.id)}
                        className={ACTION_BUTTON_STYLES}
                        title="복사"
                      >
                        {copiedId === message.id ? (
                          <Check className="w-4 h-4 text-success-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSave(message.id)}
                        className={ACTION_BUTTON_STYLES}
                        title="리포트에 저장"
                        disabled={message.saved}
                      >
                        <Bookmark
                          className={`w-4 h-4 ${message.saved ? 'fill-primary-500 text-primary-500' : ''}`}
                        />
                      </button>
                    </div>
                  )}

                  {/* 에러 시 재시도 버튼 */}
                  {message.role === 'error' && messages[messages.indexOf(message) - 1]?.role === 'user' && (
                    <button
                      type="button"
                      onClick={() => handleRetry(messages[messages.indexOf(message) - 1].content)}
                      className="flex items-center gap-1 mt-2 text-xs text-danger-600 hover:text-danger-700"
                    >
                      <RefreshCw className="w-3 h-3" />
                      다시 시도
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* 입력 영역 */}
      <div className={INPUT_CONTAINER_STYLES}>
        {messages.length > 0 && (
          <div className="mb-3">
            <SuggestedQuestions onSelect={handleSubmit} compact />
          </div>
        )}
        <AiQueryInput onSubmit={handleSubmit} isLoading={isLoading} remaining={remaining} />
      </div>
    </div>
  );
}
