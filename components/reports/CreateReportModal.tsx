'use client';

/**
 * 리포트 생성 모달
 * TASK-1003: 기간/플랫폼 선택하여 리포트 생성
 */

import { useState } from 'react';
import { X, FileText, Calendar, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { ReportType, ReportTemplate, PlatformCode } from '@/types/database';

// 스타일 상수
const MODAL_OVERLAY_STYLES = [
  'fixed inset-0 z-50',
  'flex items-center justify-center',
  'p-4 bg-black/50 backdrop-blur-sm',
].join(' ');

const MODAL_CONTENT_STYLES = [
  'relative w-full max-w-lg',
  'bg-white dark:bg-slate-800',
  'rounded-2xl shadow-xl',
  'max-h-[90vh] overflow-y-auto',
].join(' ');

const MODAL_HEADER_STYLES = [
  'flex items-center justify-between',
  'p-6 border-b border-slate-200 dark:border-slate-700',
].join(' ');

const MODAL_BODY_STYLES = 'p-6 space-y-6';

const MODAL_FOOTER_STYLES = [
  'flex items-center justify-end gap-3',
  'p-6 border-t border-slate-200 dark:border-slate-700',
].join(' ');

const LABEL_STYLES = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2';

const INPUT_STYLES = [
  'w-full px-4 py-2.5',
  'bg-white dark:bg-slate-900',
  'border border-slate-200 dark:border-slate-700',
  'rounded-lg text-sm',
  'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
  'transition-all',
].join(' ');

const SELECT_STYLES = [
  'w-full px-4 py-2.5',
  'bg-white dark:bg-slate-900',
  'border border-slate-200 dark:border-slate-700',
  'rounded-lg text-sm',
  'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
  'transition-all appearance-none',
].join(' ');

const CHIP_STYLES = [
  'px-3 py-1.5',
  'rounded-lg text-sm',
  'border',
  'transition-colors cursor-pointer',
].join(' ');

const CHIP_ACTIVE_STYLES = 'bg-primary/10 border-primary text-primary';
const CHIP_INACTIVE_STYLES = 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-primary/50';

// 플랫폼 목록
const PLATFORMS: { code: PlatformCode; name: string }[] = [
  { code: 'naver', name: '네이버 광고' },
  { code: 'google', name: 'Google Ads' },
  { code: 'meta', name: 'Meta 광고' },
  { code: 'kakao', name: '카카오 광고' },
  { code: 'coupang', name: '쿠팡 광고' },
];

// 리포트 타입 옵션
const REPORT_TYPES: { value: ReportType; label: string; description: string }[] = [
  { value: 'weekly', label: '주간 리포트', description: '최근 7일 성과 요약' },
  { value: 'monthly', label: '월간 리포트', description: '최근 30일 성과 요약' },
  { value: 'custom', label: '사용자 지정', description: '기간을 직접 선택' },
];

// 템플릿 옵션
const TEMPLATES: { value: ReportTemplate; label: string; description: string }[] = [
  { value: 'standard', label: '표준', description: '기본 성과 지표 포함' },
  { value: 'detailed', label: '상세', description: '캠페인별 상세 분석 포함' },
  { value: 'summary', label: '요약', description: '핵심 지표만 간략하게' },
];

interface CreateReportModalProps {
  onClose: () => void;
  onCreated: () => void;
}

export function CreateReportModal({ onClose, onCreated }: CreateReportModalProps) {
  const [title, setTitle] = useState('');
  const [reportType, setReportType] = useState<ReportType>('weekly');
  const [template, setTemplate] = useState<ReportTemplate>('standard');
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformCode[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 플랫폼 토글
  const togglePlatform = (platform: PlatformCode) => {
    if (selectedPlatforms.includes(platform)) {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform));
    } else {
      setSelectedPlatforms([...selectedPlatforms, platform]);
    }
  };

  // 기간 계산
  const calculateDates = (type: ReportType) => {
    const end = new Date();
    const start = new Date();

    if (type === 'weekly') {
      start.setDate(end.getDate() - 7);
    } else if (type === 'monthly') {
      start.setDate(end.getDate() - 30);
    }

    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    };
  };

  // 리포트 생성
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 유효성 검사
    if (!title.trim()) {
      setError('리포트 제목을 입력해주세요.');
      return;
    }

    if (selectedPlatforms.length === 0) {
      setError('최소 하나의 플랫폼을 선택해주세요.');
      return;
    }

    let periodStart: string;
    let periodEnd: string;

    if (reportType === 'custom') {
      if (!startDate || !endDate) {
        setError('기간을 선택해주세요.');
        return;
      }
      periodStart = startDate;
      periodEnd = endDate;
    } else {
      const dates = calculateDates(reportType);
      periodStart = dates.start;
      periodEnd = dates.end;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          type: reportType,
          template,
          platforms: selectedPlatforms,
          period_start: periodStart,
          period_end: periodEnd,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '리포트 생성 실패');
      }

      onCreated();
    } catch (err) {
      console.error('Failed to create report:', err);
      setError(err instanceof Error ? err.message : '리포트 생성에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={MODAL_OVERLAY_STYLES} onClick={onClose}>
      <div className={MODAL_CONTENT_STYLES} onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div className={MODAL_HEADER_STYLES}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                새 리포트 생성
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                기간과 플랫폼을 선택하여 리포트를 생성합니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* 본문 */}
        <form onSubmit={handleSubmit}>
          <div className={MODAL_BODY_STYLES}>
            {/* 에러 메시지 */}
            {error && (
              <div className="p-3 bg-danger-50 dark:bg-danger-500/10 border border-danger-200 dark:border-danger-500/20 rounded-lg text-sm text-danger-700 dark:text-danger-400">
                {error}
              </div>
            )}

            {/* 제목 */}
            <div>
              <label className={LABEL_STYLES}>리포트 제목</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 2024년 1월 주간 성과 리포트"
                className={INPUT_STYLES}
              />
            </div>

            {/* 리포트 타입 */}
            <div>
              <label className={LABEL_STYLES}>리포트 유형</label>
              <div className="grid grid-cols-3 gap-2">
                {REPORT_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setReportType(type.value)}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      reportType === type.value
                        ? 'bg-primary/10 border-primary'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {reportType === type.value && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                      <span className={`text-sm font-medium ${
                        reportType === type.value ? 'text-primary' : 'text-slate-700 dark:text-slate-300'
                      }`}>
                        {type.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {type.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* 사용자 지정 기간 */}
            {reportType === 'custom' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL_STYLES}>시작일</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className={`${INPUT_STYLES} pl-10`}
                    />
                  </div>
                </div>
                <div>
                  <label className={LABEL_STYLES}>종료일</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className={`${INPUT_STYLES} pl-10`}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 플랫폼 선택 */}
            <div>
              <label className={LABEL_STYLES}>플랫폼 선택</label>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((platform) => (
                  <button
                    key={platform.code}
                    type="button"
                    onClick={() => togglePlatform(platform.code)}
                    className={`${CHIP_STYLES} ${
                      selectedPlatforms.includes(platform.code)
                        ? CHIP_ACTIVE_STYLES
                        : CHIP_INACTIVE_STYLES
                    }`}
                  >
                    {selectedPlatforms.includes(platform.code) && (
                      <Check className="w-3 h-3 inline mr-1" />
                    )}
                    {platform.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 템플릿 선택 */}
            <div>
              <label className={LABEL_STYLES}>템플릿</label>
              <select
                value={template}
                onChange={(e) => setTemplate(e.target.value as ReportTemplate)}
                className={SELECT_STYLES}
              >
                {TEMPLATES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label} - {t.description}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 푸터 */}
          <div className={MODAL_FOOTER_STYLES}>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  생성 중...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  리포트 생성
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
