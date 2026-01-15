/**
 * 리포트 PDF 생성
 * TASK-1006: 리포트를 PDF 파일로 변환
 *
 * 참고: 실제 PDF 생성은 서버 사이드에서 puppeteer나 jsPDF를 사용합니다.
 * 여기서는 HTML 기반 PDF 생성을 위한 템플릿을 제공합니다.
 */

import type { Report } from '@/types/database';

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

// 숫자 포맷
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('ko-KR').format(Math.round(value));
}

function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * HTML 기반 PDF 템플릿 생성
 */
export function generatePdfHtml(report: Report): string {
  const summary = report.data_summary as DataSummary | null;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${report.title}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
          line-height: 1.6;
          color: #1e293b;
          padding: 40px;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e2e8f0;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #667eea;
          margin-bottom: 8px;
        }
        .title {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 8px;
        }
        .period {
          color: #64748b;
          font-size: 14px;
        }
        .badge {
          display: inline-block;
          padding: 4px 12px;
          background: #eff6ff;
          color: #3b82f6;
          border-radius: 16px;
          font-size: 12px;
          margin-right: 8px;
        }
        .section {
          margin-bottom: 32px;
        }
        .section-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 16px;
          color: #334155;
        }
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }
        .metric-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px;
          text-align: center;
        }
        .metric-label {
          font-size: 12px;
          color: #64748b;
          margin-bottom: 4px;
        }
        .metric-value {
          font-size: 20px;
          font-weight: bold;
          color: #1e293b;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 16px;
        }
        th, td {
          padding: 12px 16px;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
        }
        th {
          background: #f8fafc;
          font-weight: 600;
          color: #64748b;
          font-size: 12px;
        }
        td {
          font-size: 14px;
        }
        .text-right {
          text-align: right;
        }
        .insights {
          background: #eff6ff;
          border-radius: 12px;
          padding: 20px;
        }
        .insights p {
          margin-bottom: 12px;
          color: #334155;
        }
        .insights p:last-child {
          margin-bottom: 0;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          text-align: center;
          color: #94a3b8;
          font-size: 12px;
        }
        .positive {
          color: #10b981;
        }
        .negative {
          color: #ef4444;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">마케트 (Markeet)</div>
        <h1 class="title">${report.title}</h1>
        <div class="period">
          <span class="badge">${report.type === 'weekly' ? '주간' : report.type === 'monthly' ? '월간' : '사용자 지정'} 리포트</span>
          ${formatDate(report.period_start)} ~ ${formatDate(report.period_end)}
        </div>
      </div>

      ${summary ? `
        <div class="section">
          <h2 class="section-title">핵심 성과 지표</h2>
          <div class="metrics-grid">
            <div class="metric-card">
              <div class="metric-label">총 광고비</div>
              <div class="metric-value">${formatCurrency(summary.totalSpend)}</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">총 매출</div>
              <div class="metric-value">${formatCurrency(summary.totalRevenue)}</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">ROAS</div>
              <div class="metric-value ${summary.avgRoas >= 1 ? 'positive' : 'negative'}">${summary.avgRoas.toFixed(2)}x</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">전환수</div>
              <div class="metric-value">${formatNumber(summary.totalConversions)}</div>
            </div>
          </div>
          <div class="metrics-grid" style="grid-template-columns: repeat(3, 1fr);">
            <div class="metric-card">
              <div class="metric-label">노출수</div>
              <div class="metric-value">${formatNumber(summary.totalImpressions)}</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">클릭수</div>
              <div class="metric-value">${formatNumber(summary.totalClicks)}</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">CTR</div>
              <div class="metric-value">${formatPercent(summary.avgCtr)}</div>
            </div>
          </div>
        </div>

        ${summary.platformBreakdown && summary.platformBreakdown.length > 0 ? `
          <div class="section">
            <h2 class="section-title">플랫폼별 성과</h2>
            <table>
              <thead>
                <tr>
                  <th>플랫폼</th>
                  <th class="text-right">광고비</th>
                  <th class="text-right">매출</th>
                  <th class="text-right">ROAS</th>
                </tr>
              </thead>
              <tbody>
                ${summary.platformBreakdown.map(item => `
                  <tr>
                    <td>${item.platform}</td>
                    <td class="text-right">${formatCurrency(item.spend)}</td>
                    <td class="text-right">${formatCurrency(item.revenue)}</td>
                    <td class="text-right ${item.roas >= 1 ? 'positive' : 'negative'}">${item.roas.toFixed(2)}x</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : ''}
      ` : ''}

      ${report.ai_insights ? `
        <div class="section">
          <h2 class="section-title">AI 인사이트</h2>
          <div class="insights">
            ${report.ai_insights.split('\n\n').map(p => `<p>${p}</p>`).join('')}
          </div>
        </div>
      ` : ''}

      <div class="footer">
        <p>이 리포트는 마케트(Markeet)에서 자동으로 생성되었습니다.</p>
        <p>생성일: ${formatDate(report.created_at)}</p>
      </div>
    </body>
    </html>
  `;
}

/**
 * PDF 버퍼 생성 (서버 사이드)
 * 실제 구현에서는 puppeteer나 다른 PDF 라이브러리 사용
 */
export async function generatePdfBuffer(report: Report): Promise<Buffer> {
  const html = generatePdfHtml(report);

  // 간단한 HTML을 텍스트로 변환하여 반환
  // 실제 구현에서는 puppeteer, playwright, jsPDF 등 사용
  // 예:
  // const browser = await puppeteer.launch();
  // const page = await browser.newPage();
  // await page.setContent(html);
  // const pdf = await page.pdf({ format: 'A4' });
  // await browser.close();
  // return pdf;

  // 임시로 HTML을 버퍼로 반환 (실제 서비스에서는 PDF 라이브러리 필요)
  return Buffer.from(html, 'utf-8');
}
