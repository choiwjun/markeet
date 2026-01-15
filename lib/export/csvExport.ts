/**
 * CSV 내보내기 유틸리티
 * TASK-1206: 대시보드 데이터 CSV 다운로드
 */

// CSV 행 데이터 타입
type CsvRow = Record<string, string | number | boolean | null | undefined>;

// CSV 컬럼 정의
interface CsvColumn {
  key: string;
  label: string;
  format?: (value: unknown) => string;
}

/**
 * 값을 CSV 안전 문자열로 변환
 */
function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  const str = String(value);

  // 특수문자가 포함된 경우 따옴표로 감싸기
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

/**
 * 데이터를 CSV 문자열로 변환
 */
export function convertToCsv(
  data: CsvRow[],
  columns: CsvColumn[]
): string {
  // 헤더 행
  const headerRow = columns.map((col) => escapeCsvValue(col.label)).join(',');

  // 데이터 행
  const dataRows = data.map((row) => {
    return columns
      .map((col) => {
        const value = row[col.key];
        const formattedValue = col.format ? col.format(value) : value;
        return escapeCsvValue(formattedValue);
      })
      .join(',');
  });

  return [headerRow, ...dataRows].join('\n');
}

/**
 * CSV 문자열을 파일로 다운로드
 */
export function downloadCsv(csvContent: string, filename: string): void {
  // BOM 추가 (한글 인코딩 지원)
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 대시보드 데이터 내보내기
 */
export function exportDashboardData(
  data: {
    metrics?: {
      totalSpend: number;
      totalRevenue: number;
      avgRoas: number;
    };
    platformData?: Array<{
      platform: string;
      spend: number;
      revenue: number;
      roas: number;
    }>;
    trendData?: Array<{
      date: string;
      spend: number;
      revenue: number;
    }>;
  },
  filename?: string
): void {
  const rows: CsvRow[] = [];

  // 요약 데이터
  if (data.metrics) {
    rows.push({
      section: '요약',
      metric: '총 광고비',
      value: data.metrics.totalSpend,
    });
    rows.push({
      section: '요약',
      metric: '총 매출',
      value: data.metrics.totalRevenue,
    });
    rows.push({
      section: '요약',
      metric: '평균 ROAS',
      value: data.metrics.avgRoas,
    });
    rows.push({ section: '', metric: '', value: '' }); // 빈 행
  }

  // 플랫폼별 데이터
  if (data.platformData && data.platformData.length > 0) {
    rows.push({
      section: '플랫폼별 성과',
      metric: '플랫폼',
      value: '',
      spend: '광고비',
      revenue: '매출',
      roas: 'ROAS',
    });

    for (const platform of data.platformData) {
      rows.push({
        section: '',
        metric: platform.platform,
        value: '',
        spend: platform.spend,
        revenue: platform.revenue,
        roas: platform.roas,
      });
    }
    rows.push({ section: '', metric: '', value: '' }); // 빈 행
  }

  // 일별 추이 데이터
  if (data.trendData && data.trendData.length > 0) {
    rows.push({
      section: '일별 추이',
      metric: '날짜',
      value: '',
      spend: '광고비',
      revenue: '매출',
    });

    for (const day of data.trendData) {
      rows.push({
        section: '',
        metric: day.date,
        value: '',
        spend: day.spend,
        revenue: day.revenue,
      });
    }
  }

  const columns: CsvColumn[] = [
    { key: 'section', label: '구분' },
    { key: 'metric', label: '항목' },
    { key: 'value', label: '값' },
    { key: 'spend', label: '광고비' },
    { key: 'revenue', label: '매출' },
    { key: 'roas', label: 'ROAS' },
  ];

  const csv = convertToCsv(rows, columns);
  const defaultFilename = `markeet-dashboard-${new Date().toISOString().split('T')[0]}.csv`;
  downloadCsv(csv, filename || defaultFilename);
}

/**
 * 캠페인 데이터 내보내기
 */
export function exportCampaignData(
  campaigns: Array<{
    campaign_name: string;
    spend: number;
    revenue: number;
    roas: number;
    impressions: number;
    clicks: number;
    conversions: number;
    ctr: number;
    cvr: number;
  }>,
  platformName: string,
  filename?: string
): void {
  const columns: CsvColumn[] = [
    { key: 'campaign_name', label: '캠페인명' },
    { key: 'spend', label: '광고비' },
    { key: 'revenue', label: '매출' },
    { key: 'roas', label: 'ROAS', format: (v) => typeof v === 'number' ? v.toFixed(2) : '' },
    { key: 'impressions', label: '노출' },
    { key: 'clicks', label: '클릭' },
    { key: 'ctr', label: 'CTR(%)', format: (v) => typeof v === 'number' ? v.toFixed(2) : '' },
    { key: 'conversions', label: '전환' },
    { key: 'cvr', label: 'CVR(%)', format: (v) => typeof v === 'number' ? v.toFixed(2) : '' },
  ];

  const csv = convertToCsv(campaigns, columns);
  const defaultFilename = `markeet-${platformName}-campaigns-${new Date().toISOString().split('T')[0]}.csv`;
  downloadCsv(csv, filename || defaultFilename);
}
