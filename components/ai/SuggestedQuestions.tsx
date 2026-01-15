'use client';

/**
 * 추천 질문 템플릿 컴포넌트
 * TASK-906: 자주 묻는 질문 템플릿 버튼 표시
 */

import { Lightbulb } from 'lucide-react';

// 추천 질문 목록
const SUGGESTED_QUESTIONS = [
  {
    category: '성과 요약',
    questions: [
      '이번 주 총 광고비는 얼마인가요?',
      '이번 달 ROAS는 어떻게 되나요?',
      '지난 7일간 전환 수는 몇 건인가요?',
    ],
  },
  {
    category: '플랫폼 비교',
    questions: [
      '플랫폼별 광고비 비교해줘',
      '어떤 플랫폼이 가장 효율이 좋아요?',
      '플랫폼별 ROAS를 알려줘',
    ],
  },
  {
    category: '트렌드 분석',
    questions: [
      '최근 일주일 광고비 추이는?',
      '이번 달 대비 지난 달 성과는?',
      '클릭률이 가장 높은 날은 언제야?',
    ],
  },
];

// 스타일 상수
const CONTAINER_STYLES = [
  'bg-slate-50 dark:bg-slate-800/50',
  'rounded-xl',
  'p-4',
].join(' ');

const HEADER_STYLES = [
  'flex items-center gap-2',
  'text-sm font-medium',
  'text-slate-700 dark:text-slate-300',
  'mb-3',
].join(' ');

const CATEGORY_STYLES = [
  'mb-3 last:mb-0',
].join(' ');

const CATEGORY_TITLE_STYLES = [
  'text-xs font-medium',
  'text-slate-500 dark:text-slate-400',
  'mb-2',
].join(' ');

const QUESTIONS_CONTAINER_STYLES = [
  'flex flex-wrap gap-2',
].join(' ');

const QUESTION_BUTTON_STYLES = [
  'px-3 py-1.5',
  'text-xs',
  'bg-white dark:bg-slate-700',
  'border border-slate-200 dark:border-slate-600',
  'rounded-full',
  'text-slate-600 dark:text-slate-300',
  'hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700',
  'dark:hover:bg-primary-500/10 dark:hover:border-primary-500/30 dark:hover:text-primary-400',
  'transition-all duration-200',
  'cursor-pointer',
].join(' ');

interface SuggestedQuestionsProps {
  onSelect: (question: string) => void;
  compact?: boolean;
}

export function SuggestedQuestions({ onSelect, compact = false }: SuggestedQuestionsProps) {
  if (compact) {
    // 컴팩트 모드: 평면화된 버튼 목록
    const allQuestions = SUGGESTED_QUESTIONS.flatMap((cat) => cat.questions).slice(0, 6);

    return (
      <div className={QUESTIONS_CONTAINER_STYLES}>
        {allQuestions.map((question, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onSelect(question)}
            className={QUESTION_BUTTON_STYLES}
          >
            {question}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={CONTAINER_STYLES}>
      <div className={HEADER_STYLES}>
        <Lightbulb className="w-4 h-4 text-amber-500" />
        <span>추천 질문</span>
      </div>

      {SUGGESTED_QUESTIONS.map((category, catIndex) => (
        <div key={catIndex} className={CATEGORY_STYLES}>
          <div className={CATEGORY_TITLE_STYLES}>{category.category}</div>
          <div className={QUESTIONS_CONTAINER_STYLES}>
            {category.questions.map((question, qIndex) => (
              <button
                key={qIndex}
                type="button"
                onClick={() => onSelect(question)}
                className={QUESTION_BUTTON_STYLES}
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
