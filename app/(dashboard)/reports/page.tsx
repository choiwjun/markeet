'use client';

/**
 * 리포트 목록 페이지
 * TASK-1002: 생성된 리포트 목록 표시 및 관리 UI
 */

import { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Plus,
  Calendar,
  Download,
  Share2,
  Mail,
  Trash2,
  MoreVertical,
  Loader2,
  Search,
  Filter,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import type { Report, ReportType } from '@/types/database';
import { CreateReportModal } from '@/components/reports/CreateReportModal';
import Link from 'next/link';

// 스타일 상수
const PAGE_HEADER_STYLES = 'flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6';
const TITLE_STYLES = 'text-2xl font-bold text-slate-900 dark:text-white';
const SUBTITLE_STYLES = 'text-sm text-slate-500 dark:text-slate-400 mt-1';

const FILTERS_CONTAINER_STYLES = 'flex flex-wrap items-center gap-3 mb-6';
const SEARCH_INPUT_STYLES = [
  'pl-10 pr-4 py-2',
  'bg-white dark:bg-slate-800',
  'border border-slate-200 dark:border-slate-700',
  'rounded-lg text-sm',
  'placeholder:text-slate-400',
  'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
  'transition-all',
].join(' ');

const FILTER_BUTTON_STYLES = [
  'flex items-center gap-2',
  'px-3 py-2',
  'bg-white dark:bg-slate-800',
  'border border-slate-200 dark:border-slate-700',
  'rounded-lg text-sm',
  'text-slate-600 dark:text-slate-300',
  'hover:bg-slate-50 dark:hover:bg-slate-700',
  'transition-colors',
].join(' ');

const REPORT_CARD_STYLES = [
  'bg-white dark:bg-slate-800',
  'border border-slate-200 dark:border-slate-700',
  'rounded-xl',
  'p-5',
  'hover:shadow-md hover:border-primary/30',
  'transition-all',
  'cursor-pointer',
].join(' ');

const BADGE_STYLES = {
  weekly: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400',
  monthly: 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400',
  custom: 'bg-slate-100 dark:bg-slate-600/50 text-slate-600 dark:text-slate-300',
};

const STATUS_BADGE_STYLES = {
  completed: 'bg-success-100 dark:bg-success-500/20 text-success-700 dark:text-success-400',
  generating: 'bg-warning-100 dark:bg-warning-500/20 text-warning-700 dark:text-warning-400',
  draft: 'bg-slate-100 dark:bg-slate-600/50 text-slate-600 dark:text-slate-300',
  failed: 'bg-danger-100 dark:bg-danger-500/20 text-danger-700 dark:text-danger-400',
};

// 리포트 타입 라벨
const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  weekly: '주간',
  monthly: '월간',
  custom: '사용자 지정',
};

// 상태 라벨
const STATUS_LABELS: Record<string, string> = {
  completed: '완료',
  generating: '생성 중',
  draft: '초안',
  failed: '실패',
};

// 날짜 포맷
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// 기간 포맷
function formatPeriod(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const startStr = startDate.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  const endStr = endDate.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  return `${startStr} ~ ${endStr}`;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<ReportType | 'all'>('all');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // 리포트 목록 조회
  const fetchReports = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/reports');
      if (!response.ok) {
        throw new Error('리포트 목록 조회 실패');
      }
      const data = await response.json();
      setReports(data.reports || []);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
      setError('리포트 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // 리포트 삭제
  const handleDelete = async (reportId: string) => {
    if (!confirm('정말 이 리포트를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('삭제 실패');
      }

      setReports(reports.filter(r => r.id !== reportId));
      setActiveDropdown(null);
    } catch (err) {
      console.error('Failed to delete report:', err);
      alert('리포트 삭제에 실패했습니다.');
    }
  };

  // PDF 다운로드
  const handleDownloadPdf = async (reportId: string) => {
    try {
      const response = await fetch(`/api/reports/${reportId}/pdf`);
      if (!response.ok) {
        throw new Error('PDF 생성 실패');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${reportId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to download PDF:', err);
      alert('PDF 다운로드에 실패했습니다.');
    }
  };

  // 공유 링크 생성
  const handleShare = async (reportId: string) => {
    try {
      const response = await fetch(`/api/reports/${reportId}/share`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('공유 링크 생성 실패');
      }

      const data = await response.json();
      await navigator.clipboard.writeText(data.shareUrl);
      alert('공유 링크가 클립보드에 복사되었습니다.');
      setActiveDropdown(null);
    } catch (err) {
      console.error('Failed to create share link:', err);
      alert('공유 링크 생성에 실패했습니다.');
    }
  };

  // 이메일 발송
  const handleSendEmail = async (reportId: string) => {
    try {
      const response = await fetch(`/api/reports/${reportId}/send`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('이메일 발송 실패');
      }

      alert('리포트가 이메일로 발송되었습니다.');
      setActiveDropdown(null);
    } catch (err) {
      console.error('Failed to send email:', err);
      alert('이메일 발송에 실패했습니다.');
    }
  };

  // 필터링된 리포트
  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         formatPeriod(report.period_start, report.period_end).includes(searchQuery);
    const matchesType = typeFilter === 'all' || report.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // 리포트 생성 완료 핸들러
  const handleReportCreated = () => {
    setShowCreateModal(false);
    fetchReports();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <ErrorState
          variant="server"
          title="리포트 로드 실패"
          description={error}
          onRetry={fetchReports}
        />
      </Card>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto">
      {/* 헤더 */}
      <div className={PAGE_HEADER_STYLES}>
        <div>
          <h1 className={TITLE_STYLES}>리포트</h1>
          <p className={SUBTITLE_STYLES}>
            광고 성과 리포트를 생성하고 관리합니다.
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          새 리포트 생성
        </Button>
      </div>

      {/* 필터 */}
      <div className={FILTERS_CONTAINER_STYLES}>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="리포트 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={SEARCH_INPUT_STYLES}
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setActiveDropdown(activeDropdown === 'filter' ? null : 'filter')}
            className={FILTER_BUTTON_STYLES}
          >
            <Filter className="w-4 h-4" />
            {typeFilter === 'all' ? '모든 유형' : REPORT_TYPE_LABELS[typeFilter]}
            <ChevronDown className="w-4 h-4" />
          </button>

          {activeDropdown === 'filter' && (
            <div className="absolute top-full left-0 mt-1 w-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-10">
              {(['all', 'weekly', 'monthly', 'custom'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => {
                    setTypeFilter(type);
                    setActiveDropdown(null);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 first:rounded-t-lg last:rounded-b-lg"
                >
                  {type === 'all' ? '모든 유형' : REPORT_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 리포트 목록 */}
      {filteredReports.length === 0 ? (
        <Card>
          <EmptyState
            title="리포트가 없습니다"
            description={searchQuery || typeFilter !== 'all'
              ? "검색 조건에 맞는 리포트가 없습니다."
              : "첫 번째 리포트를 생성해보세요."}
            action={{
              label: "새 리포트 생성",
              onClick: () => setShowCreateModal(true),
            }}
          />
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredReports.map(report => (
            <div key={report.id} className={REPORT_CARD_STYLES}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <Link
                      href={`/reports/${report.id}`}
                      className="font-medium text-slate-900 dark:text-white hover:text-primary transition-colors"
                    >
                      {report.title || '리포트'}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${BADGE_STYLES[report.type]}`}>
                        {REPORT_TYPE_LABELS[report.type]}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_BADGE_STYLES[report.status]}`}>
                        {STATUS_LABELS[report.status]}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDropdown(activeDropdown === report.id ? null : report.id);
                    }}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                  >
                    <MoreVertical className="w-5 h-5 text-slate-400" />
                  </button>

                  {activeDropdown === report.id && (
                    <div className="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-10">
                      <button
                        onClick={() => handleDownloadPdf(report.id)}
                        className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 first:rounded-t-lg"
                      >
                        <Download className="w-4 h-4" />
                        PDF 다운로드
                      </button>
                      <button
                        onClick={() => handleShare(report.id)}
                        className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        <Share2 className="w-4 h-4" />
                        공유 링크 생성
                      </button>
                      <button
                        onClick={() => handleSendEmail(report.id)}
                        className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        <Mail className="w-4 h-4" />
                        이메일 발송
                      </button>
                      <button
                        onClick={() => handleDelete(report.id)}
                        className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-500/10 last:rounded-b-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                        삭제
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <Link href={`/reports/${report.id}`} className="block">
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-2">
                  <Calendar className="w-4 h-4" />
                  {formatPeriod(report.period_start, report.period_end)}
                </div>

                {report.platforms && report.platforms.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {report.platforms.map(platform => (
                      <span
                        key={platform}
                        className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded"
                      >
                        {platform}
                      </span>
                    ))}
                  </div>
                )}

                <div className="text-xs text-slate-400 dark:text-slate-500">
                  생성일: {formatDate(report.created_at)}
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* 리포트 생성 모달 */}
      {showCreateModal && (
        <CreateReportModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleReportCreated}
        />
      )}
    </div>
  );
}
