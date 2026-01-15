'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// 가이드 스텝 정의
interface GuideStep {
  id: string;
  title: string;
  description: string;
  targetSelector?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const GUIDE_STEPS: GuideStep[] = [
  {
    id: 'welcome',
    title: '마케트에 오신 것을 환영합니다! 👋',
    description: '광고 데이터를 한눈에 분석하고 AI 인사이트를 받아보세요.',
  },
  {
    id: 'metrics',
    title: '주요 지표 카드',
    description: '광고비, 매출, ROAS 등 핵심 지표를 한눈에 확인하세요. 카드를 클릭하면 상세 분석 페이지로 이동합니다.',
    targetSelector: '[data-tour="metrics"]',
    position: 'bottom',
  },
  {
    id: 'ai-query',
    title: 'AI 자연어 질의',
    description: '"이번 주 광고비 총액은?" 같은 자연어로 데이터를 질문해보세요. AI가 분석 결과와 차트를 제공합니다.',
    targetSelector: '[data-tour="ai-query"]',
    position: 'bottom',
  },
  {
    id: 'date-filter',
    title: '기간 필터',
    description: '7일, 30일, 90일 등 원하는 기간을 선택하여 데이터를 조회할 수 있습니다.',
    targetSelector: '[data-tour="date-filter"]',
    position: 'left',
  },
  {
    id: 'charts',
    title: '차트 영역',
    description: '일별 추이와 플랫폼별 성과를 시각적으로 확인하세요.',
    targetSelector: '[data-tour="charts"]',
    position: 'top',
  },
  {
    id: 'complete',
    title: '가이드 완료! 🎉',
    description: '이제 마케트를 자유롭게 사용해보세요. 도움이 필요하면 AI에게 질문하거나 설정에서 가이드를 다시 볼 수 있습니다.',
  },
];

// 로컬 스토리지 키
const STORAGE_KEY = 'markeet_guide_completed';

interface GuideTourProps {
  forceShow?: boolean;
  onComplete?: () => void;
}

// 스타일 상수
const OVERLAY_STYLES = [
  'fixed inset-0 z-50',
  'bg-black/60 backdrop-blur-sm',
].join(' ');

const TOOLTIP_STYLES = [
  'fixed z-50',
  'bg-white dark:bg-slate-800',
  'rounded-2xl shadow-2xl',
  'border border-slate-200 dark:border-slate-700',
  'p-6 max-w-md',
].join(' ');

const TOOLTIP_CENTER_STYLES = 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';

const TITLE_STYLES = 'text-lg font-bold text-slate-900 dark:text-white mb-2';

const DESCRIPTION_STYLES = 'text-sm text-slate-600 dark:text-slate-300 mb-6';

const PROGRESS_STYLES = 'flex items-center justify-between';

const DOTS_STYLES = 'flex gap-1.5';

const DOT_STYLES = 'w-2 h-2 rounded-full transition-colors';

const DOT_ACTIVE_STYLES = 'bg-primary-500';

const DOT_INACTIVE_STYLES = 'bg-slate-300 dark:bg-slate-600';

const BUTTONS_STYLES = 'flex gap-2';

const CLOSE_BUTTON_STYLES = [
  'absolute top-3 right-3',
  'p-1 rounded-lg',
  'text-slate-400 hover:text-slate-600',
  'dark:hover:text-slate-200',
  'hover:bg-slate-100 dark:hover:bg-slate-700',
  'transition-colors',
].join(' ');

/**
 * 온보딩 가이드 툴팁 컴포넌트
 * TASK-1204: 첫 방문 시 주요 기능 설명 툴팁
 */
export function GuideTour({ forceShow = false, onComplete }: GuideTourProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // 초기화: 가이드 완료 여부 확인
  useEffect(() => {
    if (forceShow) {
      setIsVisible(true);
      return;
    }

    const completed = localStorage.getItem(STORAGE_KEY);
    if (!completed) {
      // 약간의 딜레이 후 표시 (페이지 로드 후)
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [forceShow]);

  // 가이드 완료 처리
  const handleComplete = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsVisible(false);
    onComplete?.();
  }, [onComplete]);

  // 스킵
  const handleSkip = useCallback(() => {
    handleComplete();
  }, [handleComplete]);

  // 다음 스텝
  const handleNext = useCallback(() => {
    if (currentStep < GUIDE_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  }, [currentStep, handleComplete]);

  // 이전 스텝
  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  // 표시하지 않음
  if (!isVisible) return null;

  const step = GUIDE_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === GUIDE_STEPS.length - 1;

  return (
    <>
      {/* 오버레이 */}
      <div className={OVERLAY_STYLES} onClick={handleSkip} />

      {/* 툴팁 */}
      <div className={`${TOOLTIP_STYLES} ${TOOLTIP_CENTER_STYLES}`}>
        {/* 닫기 버튼 */}
        <button className={CLOSE_BUTTON_STYLES} onClick={handleSkip}>
          <X className="w-5 h-5" />
        </button>

        {/* 컨텐츠 */}
        <h3 className={TITLE_STYLES}>{step.title}</h3>
        <p className={DESCRIPTION_STYLES}>{step.description}</p>

        {/* 프로그레스 & 버튼 */}
        <div className={PROGRESS_STYLES}>
          {/* 도트 인디케이터 */}
          <div className={DOTS_STYLES}>
            {GUIDE_STEPS.map((_, index) => (
              <div
                key={index}
                className={`${DOT_STYLES} ${
                  index === currentStep ? DOT_ACTIVE_STYLES : DOT_INACTIVE_STYLES
                }`}
              />
            ))}
          </div>

          {/* 버튼 */}
          <div className={BUTTONS_STYLES}>
            {!isFirstStep && (
              <Button variant="outline" size="sm" onClick={handlePrev}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                이전
              </Button>
            )}
            <Button size="sm" onClick={handleNext}>
              {isLastStep ? (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  완료
                </>
              ) : (
                <>
                  다음
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default GuideTour;
