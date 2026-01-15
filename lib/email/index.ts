/**
 * 이메일 발송 유틸리티
 * TASK-807: 일일 이메일 알림 발송
 */

import { Resend } from 'resend';

// Resend 인스턴스 (API 키가 없으면 null)
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// 발신자 이메일
const FROM_EMAIL = process.env.EMAIL_FROM || 'Markeet <noreply@markeet.com>';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * 이메일 발송
 */
export async function sendEmail(options: EmailOptions): Promise<{ id: string } | null> {
  if (!resend) {
    console.warn('[Email] RESEND_API_KEY not configured, skipping email send');
    return null;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    if (error) {
      console.error('[Email] Send error:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('[Email] Unexpected error:', err);
    return null;
  }
}

/**
 * 일일 요약 이메일 발송
 */
export async function sendDailySummaryEmail(
  to: string,
  summary: {
    date: string;
    totalSpend: number;
    totalRevenue: number;
    roas: number;
    platformBreakdown: Array<{
      platform: string;
      spend: number;
      revenue: number;
    }>;
  }
): Promise<{ id: string } | null> {
  const formattedSpend = summary.totalSpend.toLocaleString('ko-KR');
  const formattedRevenue = summary.totalRevenue.toLocaleString('ko-KR');
  const formattedRoas = (summary.roas * 100).toFixed(0);

  const platformRows = summary.platformBreakdown
    .map(
      (p) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${p.platform}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right;">${p.spend.toLocaleString('ko-KR')}원</td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right;">${p.revenue.toLocaleString('ko-KR')}원</td>
      </tr>
    `
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">📊 일일 광고 성과 요약</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">${summary.date}</p>
      </div>

      <div style="background: white; padding: 30px; border: 1px solid #e2e8f0; border-top: none;">
        <div style="display: grid; gap: 20px; margin-bottom: 30px;">
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px;">
            <p style="margin: 0; color: #64748b; font-size: 14px;">총 광고비</p>
            <p style="margin: 5px 0 0 0; font-size: 28px; font-weight: 700; color: #1e293b;">${formattedSpend}원</p>
          </div>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px;">
            <p style="margin: 0; color: #64748b; font-size: 14px;">총 매출</p>
            <p style="margin: 5px 0 0 0; font-size: 28px; font-weight: 700; color: #059669;">${formattedRevenue}원</p>
          </div>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px;">
            <p style="margin: 0; color: #64748b; font-size: 14px;">ROAS</p>
            <p style="margin: 5px 0 0 0; font-size: 28px; font-weight: 700; color: #7c3aed;">${formattedRoas}%</p>
          </div>
        </div>

        ${
          summary.platformBreakdown.length > 0
            ? `
        <h2 style="font-size: 18px; margin: 0 0 15px 0; color: #1e293b;">플랫폼별 성과</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f8fafc;">
              <th style="padding: 12px; text-align: left; font-weight: 600;">플랫폼</th>
              <th style="padding: 12px; text-align: right; font-weight: 600;">광고비</th>
              <th style="padding: 12px; text-align: right; font-weight: 600;">매출</th>
            </tr>
          </thead>
          <tbody>
            ${platformRows}
          </tbody>
        </table>
        `
            : ''
        }

        <div style="margin-top: 30px; text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://markeet.com'}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">대시보드에서 자세히 보기</a>
        </div>
      </div>

      <div style="text-align: center; padding: 20px; color: #94a3b8; font-size: 12px;">
        <p style="margin: 0;">이 이메일은 Markeet에서 발송되었습니다.</p>
        <p style="margin: 5px 0 0 0;">알림 설정을 변경하려면 <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://markeet.com'}/settings/notifications" style="color: #667eea;">여기</a>를 클릭하세요.</p>
      </div>
    </body>
    </html>
  `;

  const text = `
일일 광고 성과 요약 - ${summary.date}

총 광고비: ${formattedSpend}원
총 매출: ${formattedRevenue}원
ROAS: ${formattedRoas}%

${summary.platformBreakdown.map((p) => `${p.platform}: 광고비 ${p.spend.toLocaleString('ko-KR')}원, 매출 ${p.revenue.toLocaleString('ko-KR')}원`).join('\n')}

자세한 내용은 대시보드에서 확인하세요: ${process.env.NEXT_PUBLIC_APP_URL || 'https://markeet.com'}/dashboard
  `;

  return sendEmail({
    to,
    subject: `[Markeet] ${summary.date} 광고 성과 요약`,
    html,
    text,
  });
}

/**
 * API 키 만료 경고 이메일 발송
 */
export async function sendApiKeyExpiringEmail(
  to: string,
  platform: string,
  daysLeft: number
): Promise<{ id: string } | null> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #fef3c7; padding: 30px; border-radius: 12px 12px 0 0; border-left: 4px solid #f59e0b;">
        <h1 style="color: #92400e; margin: 0; font-size: 24px;">⚠️ API 키 만료 임박</h1>
      </div>

      <div style="background: white; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="margin: 0 0 20px 0; font-size: 16px;">
          <strong>${platform}</strong> 연동의 API 키가 <strong style="color: #f59e0b;">${daysLeft}일 후</strong> 만료됩니다.
        </p>
        <p style="margin: 0 0 30px 0; color: #64748b;">
          API 키가 만료되면 해당 플랫폼의 데이터를 가져올 수 없게 됩니다.
          연속적인 데이터 수집을 위해 미리 API 키를 갱신해 주세요.
        </p>

        <div style="text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://markeet.com'}/settings/connections" style="display: inline-block; background: #f59e0b; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">API 키 갱신하기</a>
        </div>
      </div>

      <div style="text-align: center; padding: 20px; color: #94a3b8; font-size: 12px;">
        <p style="margin: 0;">이 이메일은 Markeet에서 발송되었습니다.</p>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: `[Markeet] ${platform} API 키가 ${daysLeft}일 후 만료됩니다`,
    html,
  });
}

/**
 * 이상 징후 알림 이메일 발송
 */
export async function sendAnomalyAlertEmail(
  to: string,
  alert: {
    type: 'spend' | 'roas';
    platform: string;
    changePercent: number;
    currentValue: number;
    previousValue: number;
  }
): Promise<{ id: string } | null> {
  const isIncrease = alert.changePercent > 0;
  const changeDirection = isIncrease ? '증가' : '감소';
  const alertColor = alert.type === 'spend'
    ? (isIncrease ? '#ef4444' : '#059669')
    : (isIncrease ? '#059669' : '#ef4444');

  const metricName = alert.type === 'spend' ? '광고비' : 'ROAS';
  const formatValue = (value: number) =>
    alert.type === 'spend'
      ? `${value.toLocaleString('ko-KR')}원`
      : `${(value * 100).toFixed(0)}%`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: ${alertColor}; padding: 30px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">🚨 ${metricName} 이상 징후 감지</h1>
      </div>

      <div style="background: white; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="margin: 0 0 20px 0; font-size: 16px;">
          <strong>${alert.platform}</strong>의 ${metricName}가 전일 대비
          <strong style="color: ${alertColor};">${Math.abs(alert.changePercent).toFixed(1)}% ${changeDirection}</strong>했습니다.
        </p>

        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span style="color: #64748b;">어제</span>
            <span style="font-weight: 600;">${formatValue(alert.previousValue)}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #64748b;">오늘</span>
            <span style="font-weight: 700; color: ${alertColor};">${formatValue(alert.currentValue)}</span>
          </div>
        </div>

        <div style="text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://markeet.com'}/dashboard" style="display: inline-block; background: ${alertColor}; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">대시보드에서 확인하기</a>
        </div>
      </div>

      <div style="text-align: center; padding: 20px; color: #94a3b8; font-size: 12px;">
        <p style="margin: 0;">이 이메일은 Markeet에서 발송되었습니다.</p>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: `[Markeet] ${alert.platform} ${metricName} ${Math.abs(alert.changePercent).toFixed(0)}% ${changeDirection}`,
    html,
  });
}

/**
 * 리포트 이메일 발송
 * TASK-1007: 리포트를 이메일로 발송
 */
export async function sendReportEmail(
  to: string,
  report: {
    id: string;
    title: string;
    type: string;
    period_start: string;
    period_end: string;
    data_summary: {
      totalSpend?: number;
      totalRevenue?: number;
      avgRoas?: number;
      totalConversions?: number;
    } | null;
    ai_insights?: string | null;
  }
): Promise<{ id: string } | null> {
  const summary = report.data_summary || {};
  const formatCurrency = (value: number) => value.toLocaleString('ko-KR');
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const typeLabel = report.type === 'weekly' ? '주간' : report.type === 'monthly' ? '월간' : '사용자 지정';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">📄 ${report.title}</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">
          ${typeLabel} 리포트 | ${formatDate(report.period_start)} ~ ${formatDate(report.period_end)}
        </p>
      </div>

      <div style="background: white; padding: 30px; border: 1px solid #e2e8f0; border-top: none;">
        <h2 style="font-size: 18px; margin: 0 0 20px 0; color: #1e293b;">핵심 성과 요약</h2>

        <div style="display: grid; gap: 16px; margin-bottom: 30px;">
          <div style="background: #f8fafc; padding: 16px; border-radius: 8px; display: flex; justify-content: space-between;">
            <span style="color: #64748b;">총 광고비</span>
            <span style="font-weight: 700;">${summary.totalSpend ? formatCurrency(summary.totalSpend) + '원' : '-'}</span>
          </div>
          <div style="background: #f8fafc; padding: 16px; border-radius: 8px; display: flex; justify-content: space-between;">
            <span style="color: #64748b;">총 매출</span>
            <span style="font-weight: 700; color: #059669;">${summary.totalRevenue ? formatCurrency(summary.totalRevenue) + '원' : '-'}</span>
          </div>
          <div style="background: #f8fafc; padding: 16px; border-radius: 8px; display: flex; justify-content: space-between;">
            <span style="color: #64748b;">ROAS</span>
            <span style="font-weight: 700; color: #7c3aed;">${summary.avgRoas ? summary.avgRoas.toFixed(2) + 'x' : '-'}</span>
          </div>
          <div style="background: #f8fafc; padding: 16px; border-radius: 8px; display: flex; justify-content: space-between;">
            <span style="color: #64748b;">전환수</span>
            <span style="font-weight: 700;">${summary.totalConversions ? formatCurrency(summary.totalConversions) : '-'}</span>
          </div>
        </div>

        ${report.ai_insights ? `
        <h2 style="font-size: 18px; margin: 0 0 15px 0; color: #1e293b;">AI 인사이트</h2>
        <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          ${report.ai_insights.split('\n\n').map(p => `<p style="margin: 0 0 10px 0; color: #334155;">${p}</p>`).join('')}
        </div>
        ` : ''}

        <div style="text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://markeet.com'}/reports/${report.id}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">리포트 전체 보기</a>
        </div>
      </div>

      <div style="text-align: center; padding: 20px; color: #94a3b8; font-size: 12px;">
        <p style="margin: 0;">이 이메일은 Markeet에서 발송되었습니다.</p>
      </div>
    </body>
    </html>
  `;

  const text = `
${report.title}
${typeLabel} 리포트 | ${formatDate(report.period_start)} ~ ${formatDate(report.period_end)}

핵심 성과 요약:
- 총 광고비: ${summary.totalSpend ? formatCurrency(summary.totalSpend) + '원' : '-'}
- 총 매출: ${summary.totalRevenue ? formatCurrency(summary.totalRevenue) + '원' : '-'}
- ROAS: ${summary.avgRoas ? summary.avgRoas.toFixed(2) + 'x' : '-'}
- 전환수: ${summary.totalConversions || '-'}

${report.ai_insights ? `AI 인사이트:\n${report.ai_insights}` : ''}

리포트 전체 보기: ${process.env.NEXT_PUBLIC_APP_URL || 'https://markeet.com'}/reports/${report.id}
  `;

  return sendEmail({
    to,
    subject: `[Markeet] ${report.title}`,
    html,
    text,
  });
}
