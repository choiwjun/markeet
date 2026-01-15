'use client';

import { useState } from 'react';
import { Download, FileJson, FileSpreadsheet, Loader2, Check, Database, BarChart3, FileText, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// 스타일 상수
const PAGE_HEADER_STYLES = 'mb-8';

const TITLE_STYLES = [
  'text-2xl font-bold',
  'text-slate-900 dark:text-white',
].join(' ');

const SUBTITLE_STYLES = [
  'mt-2 text-sm',
  'text-slate-500 dark:text-slate-400',
].join(' ');

const SECTION_STYLES = [
  'bg-white dark:bg-slate-800',
  'rounded-xl',
  'border border-slate-200 dark:border-slate-700',
  'p-6 mb-6',
].join(' ');

const SECTION_HEADER_STYLES = [
  'flex items-center gap-3',
  'mb-6 pb-4',
  'border-b border-slate-200 dark:border-slate-700',
].join(' ');

const SECTION_ICON_STYLES = [
  'w-10 h-10',
  'rounded-lg',
  'flex items-center justify-center',
].join(' ');

const SECTION_TITLE_STYLES = [
  'text-lg font-semibold',
  'text-slate-800 dark:text-slate-200',
].join(' ');

const SECTION_SUBTITLE_STYLES = [
  'text-sm',
  'text-slate-500 dark:text-slate-400',
].join(' ');

const FORMAT_CARD_STYLES = [
  'p-4 rounded-lg border-2 cursor-pointer transition-all',
].join(' ');

const FORMAT_CARD_ACTIVE_STYLES = [
  'border-primary-500 bg-primary-50 dark:bg-primary-500/10',
].join(' ');

const FORMAT_CARD_INACTIVE_STYLES = [
  'border-slate-200 dark:border-slate-700',
  'hover:border-slate-300 dark:hover:border-slate-600',
].join(' ');

const DATA_TYPE_GRID_STYLES = 'grid grid-cols-1 md:grid-cols-2 gap-4 mt-6';

const DATA_TYPE_CARD_STYLES = [
  'p-4 rounded-lg border cursor-pointer transition-all',
  'flex items-center gap-4',
].join(' ');

const DATA_TYPE_CARD_ACTIVE_STYLES = [
  'border-primary-500 bg-primary-50 dark:bg-primary-500/10',
].join(' ');

const DATA_TYPE_CARD_INACTIVE_STYLES = [
  'border-slate-200 dark:border-slate-700',
  'hover:border-slate-300 dark:hover:border-slate-600',
].join(' ');

const SUCCESS_MESSAGE_STYLES = [
  'fixed bottom-4 right-4',
  'flex items-center gap-2',
  'px-4 py-3',
  'bg-success-500 text-white',
  'rounded-lg shadow-lg',
  'animate-fade-in',
].join(' ');

const ERROR_MESSAGE_STYLES = [
  'mb-6 p-4',
  'bg-danger-50 dark:bg-danger-500/10',
  'border border-danger-200 dark:border-danger-500/20',
  'rounded-lg',
  'text-danger-700 dark:text-danger-400',
].join(' ');

// 데이터 타입 옵션
const DATA_TYPES = [
  {
    id: 'all',
    label: '전체 데이터',
    description: '모든 데이터를 한 번에 내보냅니다',
    icon: Database,
  },
  {
    id: 'performance',
    label: '광고 성과 데이터',
    description: '광고 캠페인 성과 데이터',
    icon: BarChart3,
  },
  {
    id: 'reports',
    label: '리포트',
    description: '생성된 리포트 목록',
    icon: FileText,
  },
  {
    id: 'chat',
    label: 'AI 대화 기록',
    description: '자연어 질의 히스토리',
    icon: MessageSquare,
  },
];

export default function ExportDataPage() {
  const [format, setFormat] = useState<'json' | 'csv'>('json');
  const [dataType, setDataType] = useState('all');
  const [isExporting, setIsExporting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 데이터 내보내기
  const handleExport = async () => {
    setIsExporting(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/user/export?format=${format}&type=${dataType}`
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '내보내기에 실패했습니다.');
      }

      // 파일 다운로드
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      // Content-Disposition에서 파일명 추출
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `markeet-export.${format}`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) {
          filename = match[1];
        }
      }

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // 성공 메시지 표시
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to export:', err);
      setError(err instanceof Error ? err.message : '내보내기에 실패했습니다.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div>
      {/* 헤더 */}
      <div className={PAGE_HEADER_STYLES}>
        <h1 className={TITLE_STYLES}>데이터 내보내기</h1>
        <p className={SUBTITLE_STYLES}>
          계정 데이터를 CSV 또는 JSON 형식으로 내보냅니다.
        </p>
      </div>

      {/* 에러 메시지 */}
      {error && <div className={ERROR_MESSAGE_STYLES}>{error}</div>}

      {/* 형식 선택 섹션 */}
      <section className={SECTION_STYLES}>
        <div className={SECTION_HEADER_STYLES}>
          <div className={`${SECTION_ICON_STYLES} bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400`}>
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h2 className={SECTION_TITLE_STYLES}>내보내기 형식</h2>
            <p className={SECTION_SUBTITLE_STYLES}>원하는 파일 형식을 선택하세요.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* JSON 형식 */}
          <div
            className={`${FORMAT_CARD_STYLES} ${
              format === 'json' ? FORMAT_CARD_ACTIVE_STYLES : FORMAT_CARD_INACTIVE_STYLES
            }`}
            onClick={() => setFormat('json')}
          >
            <div className="flex items-center gap-3">
              <FileJson className={`w-8 h-8 ${format === 'json' ? 'text-primary-500' : 'text-slate-400'}`} />
              <div>
                <p className="font-medium text-slate-900 dark:text-white">JSON</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  전체 데이터 구조 포함
                </p>
              </div>
            </div>
          </div>

          {/* CSV 형식 */}
          <div
            className={`${FORMAT_CARD_STYLES} ${
              format === 'csv' ? FORMAT_CARD_ACTIVE_STYLES : FORMAT_CARD_INACTIVE_STYLES
            }`}
            onClick={() => setFormat('csv')}
          >
            <div className="flex items-center gap-3">
              <FileSpreadsheet className={`w-8 h-8 ${format === 'csv' ? 'text-primary-500' : 'text-slate-400'}`} />
              <div>
                <p className="font-medium text-slate-900 dark:text-white">CSV</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  스프레드시트 호환
                </p>
              </div>
            </div>
          </div>
        </div>

        {format === 'csv' && (
          <p className="mt-4 text-sm text-amber-600 dark:text-amber-400">
            CSV 형식은 광고 성과 데이터만 내보낼 수 있습니다.
          </p>
        )}

        {/* 데이터 타입 선택 (JSON만) */}
        {format === 'json' && (
          <div className={DATA_TYPE_GRID_STYLES}>
            {DATA_TYPES.map((type) => {
              const Icon = type.icon;
              const isActive = dataType === type.id;

              return (
                <div
                  key={type.id}
                  className={`${DATA_TYPE_CARD_STYLES} ${
                    isActive ? DATA_TYPE_CARD_ACTIVE_STYLES : DATA_TYPE_CARD_INACTIVE_STYLES
                  }`}
                  onClick={() => setDataType(type.id)}
                >
                  <Icon className={`w-6 h-6 ${isActive ? 'text-primary-500' : 'text-slate-400'}`} />
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {type.label}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {type.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 내보내기 버튼 */}
        <div className="flex justify-end mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
          <Button
            onClick={handleExport}
            loading={isExporting}
          >
            <Download className="w-4 h-4 mr-2" />
            데이터 내보내기
          </Button>
        </div>
      </section>

      {/* 성공 메시지 */}
      {showSuccess && (
        <div className={SUCCESS_MESSAGE_STYLES}>
          <Check className="w-5 h-5" />
          <span>데이터가 성공적으로 내보내졌습니다.</span>
        </div>
      )}
    </div>
  );
}
