'use client';

/**
 * 리포트 상세 보기 페이지
 * TASK-1005: 생성된 리포트 상세 내용 표시
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  FileText,
  Calendar,
  Download,
  Share2,
  Mail,
  Loader2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  MousePointer,
  Eye,
  Target,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import type { Report, ReportType } from '@/types/database';
import Link from 'next/link';

// 스타일 상수
const PAGE_HEADER_STYLES = 'flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6';
const BACK_BUTTON_STYLES = [
  'flex items-center gap-2',
  'text-sm text-slate-600 dark:text-slate-400',
  'hover:text-primary transition-colors',
  'mb-4',
].join(' ');

const TITLE_STYLES = 'text-2xl font-bold text-slate-900 dark:text-white';
const SUBTITLE_STYLES = 'text-sm text-slate-500 dark:text-slate-400 mt-1';

const METRIC_CARD_STYLES = [
  'bg-white dark:bg-slate-800',
  'rounded-xl',
  'border border-slate-200 dark:border-slate-700',
  'p-5',
].join(' ');

const SECTION_STYLES = [
  'bg-white dark:bg-slate-800',
  'rounded-xl',
  'border border-slate-200 dark:border-slate-700',
  'p-6 mb-6',
].join(' ');

const SECTION_TITLE_STYLES = 'text-lg font-semibold text-slate-900 dark:text-white mb-4';

const BADGE_STYLES = {
  weekly: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400',
  monthly: 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400',
  custom: 'bg-slate-100 dark:bg-slate-600/50 text-slate-600 dark:text-slate-300',
};

const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  weekly: '주간 리포트',
  monthly: '월간 리포트',
  custom: '사용자 지정',
};

// 숫자 포맷
function formatNumber(value: number): string {
  return new Intl.NumberFormat('ko-KR').format(Math.round(value));
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

// 날짜 포맷
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatPeriod(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const startStr = startDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  const endStr = endDate.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
  return `${startStr} ~ ${endStr}`;
}

// 데이터 요약 타입
interface DataSummary {
  totalSpend: number;
  totalRevenue: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  avgRoas: number;
  avgCtr: number;
  avgCvr: number;
  platformBreakdown: {
    platform: string;
    spend: number;
    revenue: number;
    roas: number;
  }[];
}

// 지표 카드 컴포넌트
function MetricCard({
  label,
  value,
  icon: Icon,
  colorClass,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  colorClass: string;
}) {
  return (
    <div className={METRIC_CARD_STYLES}>
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${colorClass}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
      </div>
      <div className="text-2xl font-bold text-slate-900 dark:text-white">
        {value}
      </div>
    </div>
  );
}

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.id as string;

  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 리포트 조회
  const fetchReport = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/reports/${reportId}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('리포트를 찾을 수 없습니다.');
        }
        throw new Error('리포트 조회 실패');
      }
      const data = await response.json();
      setReport(data.report);
    } catch (err) {
      console.error('Failed to fetch report:', err);
      setError(err instanceof Error ? err.message : '리포트를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // PDF 다운로드
  const handleDownloadPdf = async () => {
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
  const handleShare = async () => {
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
    } catch (err) {
      console.error('Failed to create share link:', err);
      alert('공유 링크 생성에 실패했습니다.');
    }
  };

  // 이메일 발송
  const handleSendEmail = async () => {
    try {
      const response = await fetch(`/api/reports/${reportId}/send`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('이메일 발송 실패');
      }

      alert('리포트가 이메일로 발송되었습니다.');
    } catch (err) {
      console.error('Failed to send email:', err);
      alert('이메일 발송에 실패했습니다.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <Card>
        <ErrorState
          variant="server"
          title="리포트 로드 실패"
          description={error || '리포트를 불러오는데 실패했습니다.'}
          onRetry={fetchReport}
        />
      </Card>
    );
  }

  const summary = report.data_summary as DataSummary | null;

  return (
    <div className="max-w-[1280px] mx-auto">
      {/* 뒤로가기 */}
      <Link href="/reports" className={BACK_BUTTON_STYLES}>
        <ArrowLeft className="w-4 h-4" />
        리포트 목록으로 돌아가기
      </Link>

      {/* 헤더 */}
      <div className={PAGE_HEADER_STYLES}>
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className={TITLE_STYLES}>{report.title}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded-full ${BADGE_STYLES[report.type]}`}>
                  {REPORT_TYPE_LABELS[report.type]}
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {formatPeriod(report.period_start, report.period_end)}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleDownloadPdf}>
            <Download className="w-4 h-4 mr-2" />
            PDF 다운로드
          </Button>
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" />
            공유
          </Button>
          <Button onClick={handleSendEmail}>
            <Mail className="w-4 h-4 mr-2" />
            이메일 발송
          </Button>
        </div>
      </div>

      {/* 주요 지표 */}
      {summary && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <MetricCard
              label="총 광고비"
              value={formatCurrency(summary.totalSpend)}
              icon={DollarSign}
              colorClass="bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400"
            />
            <MetricCard
              label="총 매출"
              value={formatCurrency(summary.totalRevenue)}
              icon={ShoppingCart}
              colorClass="bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400"
            />
            <MetricCard
              label="ROAS"
              value={`${summary.avgRoas.toFixed(2)}x`}
              icon={TrendingUp}
              colorClass="bg-success-100 dark:bg-success-500/20 text-success-600 dark:text-success-400"
            />
            <MetricCard
              label="전환수"
              value={formatNumber(summary.totalConversions)}
              icon={Target}
              colorClass="bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <MetricCard
              label="노출수"
              value={formatNumber(summary.totalImpressions)}
              icon={Eye}
              colorClass="bg-slate-100 dark:bg-slate-600/50 text-slate-600 dark:text-slate-400"
            />
            <MetricCard
              label="클릭수"
              value={formatNumber(summary.totalClicks)}
              icon={MousePointer}
              colorClass="bg-slate-100 dark:bg-slate-600/50 text-slate-600 dark:text-slate-400"
            />
            <MetricCard
              label="CTR"
              value={formatPercent(summary.avgCtr)}
              icon={BarChart3}
              colorClass="bg-slate-100 dark:bg-slate-600/50 text-slate-600 dark:text-slate-400"
            />
          </div>

          {/* 플랫폼별 성과 */}
          {summary.platformBreakdown && summary.platformBreakdown.length > 0 && (
            <section className={SECTION_STYLES}>
              <h2 className={SECTION_TITLE_STYLES}>플랫폼별 성과</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left py-3 px-4 font-medium text-slate-600 dark:text-slate-400">플랫폼</th>
                      <th className="text-right py-3 px-4 font-medium text-slate-600 dark:text-slate-400">광고비</th>
                      <th className="text-right py-3 px-4 font-medium text-slate-600 dark:text-slate-400">매출</th>
                      <th className="text-right py-3 px-4 font-medium text-slate-600 dark:text-slate-400">ROAS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.platformBreakdown.map((item, index) => (
                      <tr
                        key={item.platform}
                        className={index !== summary.platformBreakdown.length - 1 ? 'border-b border-slate-100 dark:border-slate-700/50' : ''}
                      >
                        <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                          {item.platform}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-300">
                          {formatCurrency(item.spend)}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-300">
                          {formatCurrency(item.revenue)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={item.roas >= 1 ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'}>
                            {item.roas.toFixed(2)}x
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}

      {/* AI 인사이트 */}
      {report.ai_insights && (
        <section className={SECTION_STYLES}>
          <h2 className={SECTION_TITLE_STYLES}>AI 인사이트</h2>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {report.ai_insights.split('\n\n').map((paragraph, index) => (
              <p key={index} className="text-slate-600 dark:text-slate-300 mb-3 last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>
        </section>
      )}

      {/* 메타 정보 */}
      <div className="text-sm text-slate-500 dark:text-slate-400 text-center">
        생성일: {formatDate(report.created_at)}
        {report.email_sent_at && ` | 이메일 발송: ${formatDate(report.email_sent_at)}`}
      </div>
    </div>
  );
}
