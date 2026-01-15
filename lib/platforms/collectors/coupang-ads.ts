/**
 * 쿠팡 광고 데이터 수집기
 *
 * 쿠팡 광고 API (COUPANG WING)를 사용하여 광고 데이터를 수집합니다.
 * API 문서: https://wing.coupang.com/api/docs
 */

import crypto from 'crypto';
import type { AdDataInsert } from '@/types/database';
import type {
  CoupangAdsCredentials,
  CollectionResult,
  ConnectionTestResult,
  CollectorOptions,
  PlatformCollector,
} from './types';

const COUPANG_API_BASE = 'https://api-gateway.coupang.com';

/**
 * HMAC 서명 생성
 */
function generateCoupangSignature(
  method: string,
  path: string,
  datetime: string,
  secretKey: string
): string {
  const message = `${datetime}${method}${path}`;
  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(message);
  return hmac.digest('hex');
}

/**
 * 쿠팡 API 요청
 */
async function coupangApiRequest<T>(
  credentials: CoupangAdsCredentials,
  method: string,
  path: string,
  body?: Record<string, unknown>
): Promise<T> {
  const datetime = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';
  const signature = generateCoupangSignature(
    method,
    path,
    datetime,
    credentials.secretKey
  );

  const authorization = `CEA algorithm=HmacSHA256, access-key=${credentials.accessKey}, signed-date=${datetime}, signature=${signature}`;

  const response = await fetch(`${COUPANG_API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
      'Authorization': authorization,
      'X-EXTENDED-TIMEOUT': '90000',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Coupang API error: ${response.status} - ${errorText}`);
  }

  return response.json() as Promise<T>;
}

// 쿠팡 API 응답 타입
interface CoupangCampaign {
  campaignId: string;
  campaignName: string;
  status: string;
  campaignType: string;
  dailyBudget: number;
}

interface CoupangReport {
  campaignId: string;
  campaignName: string;
  date: string;
  impressions: number;
  clicks: number;
  cost: number;
  orders: number;
  salesAmount: number;
  ctr: number;
  cvr: number;
  roas: number;
}

interface CoupangCampaignsResponse {
  data: CoupangCampaign[];
  totalCount: number;
}

interface CoupangReportResponse {
  data: CoupangReport[];
  totalCount: number;
}

/**
 * 쿠팡 광고 데이터 수집
 */
export async function collectCoupangAdsData(
  credentials: CoupangAdsCredentials,
  options: CollectorOptions
): Promise<CollectionResult> {
  const { userId, connectionId, startDate, endDate } = options;

  if (!credentials.accessKey || !credentials.secretKey || !credentials.vendorId) {
    return {
      success: false,
      message: '쿠팡 광고 자격 증명이 올바르지 않습니다.',
      recordCount: 0,
      data: [],
      error: 'Missing credentials',
    };
  }

  try {
    // 광고 리포트 조회
    const reportPath = `/v2/providers/wing_api/apis/ads/${credentials.vendorId}/reports/daily`;
    const reportResponse = await coupangApiRequest<CoupangReportResponse>(
      credentials,
      'POST',
      reportPath,
      {
        startDate: startDate.replace(/-/g, ''),
        endDate: endDate.replace(/-/g, ''),
        reportType: 'CAMPAIGN',
      }
    );

    const adDataRecords: AdDataInsert[] = [];

    if (reportResponse.data) {
      for (const report of reportResponse.data) {
        const spend = report.cost || 0;
        const revenue = report.salesAmount || 0;
        const impressions = report.impressions || 0;
        const clicks = report.clicks || 0;
        const conversions = report.orders || 0;

        const ctr = report.ctr || (impressions > 0 ? (clicks / impressions) * 100 : 0);
        const cvr = report.cvr || (clicks > 0 ? (conversions / clicks) * 100 : 0);
        const roas = report.roas || (spend > 0 ? (revenue / spend) * 100 : null);

        // 날짜 형식 변환 (YYYYMMDD -> YYYY-MM-DD)
        const rawDate = report.date || '';
        const formattedDate = rawDate.length === 8
          ? `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`
          : rawDate;

        const adData: AdDataInsert = {
          user_id: userId,
          platform_connection_id: connectionId,
          date: formattedDate,
          campaign_id: report.campaignId,
          campaign_name: report.campaignName,
          spend,
          revenue,
          impressions,
          clicks,
          conversions,
          ctr,
          cvr,
          roas,
          raw_data: {
            orders: report.orders,
            salesAmount: report.salesAmount,
          },
        };

        adDataRecords.push(adData);
      }
    }

    return {
      success: true,
      message: `쿠팡 광고 데이터 수집 완료: ${adDataRecords.length}개 레코드`,
      recordCount: adDataRecords.length,
      data: adDataRecords,
    };
  } catch (error) {
    console.error('[Coupang Ads Collector] Error:', error);
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';

    if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
      return {
        success: false,
        message: '인증에 실패했습니다. API 키를 확인해주세요.',
        recordCount: 0,
        data: [],
        error: 'UNAUTHORIZED',
      };
    }

    if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
      return {
        success: false,
        message: '접근 권한이 없습니다. 벤더 ID와 권한을 확인해주세요.',
        recordCount: 0,
        data: [],
        error: 'FORBIDDEN',
      };
    }

    return {
      success: false,
      message: `쿠팡 광고 데이터 수집 실패: ${errorMessage}`,
      recordCount: 0,
      data: [],
      error: errorMessage,
    };
  }
}

/**
 * 쿠팡 광고 연결 테스트
 */
export async function testCoupangAdsConnection(
  credentials: CoupangAdsCredentials
): Promise<ConnectionTestResult> {
  if (!credentials.accessKey || !credentials.secretKey || !credentials.vendorId) {
    return {
      success: false,
      message: 'Access Key, Secret Key, Vendor ID가 모두 필요합니다.',
    };
  }

  try {
    // 광고 계정 정보 조회
    const path = `/v2/providers/wing_api/apis/ads/${credentials.vendorId}/account`;
    await coupangApiRequest(credentials, 'GET', path);

    return {
      success: true,
      message: '쿠팡 광고 연결에 성공했습니다.',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';

    if (errorMessage.includes('401')) {
      return {
        success: false,
        message: '인증에 실패했습니다. API 키를 확인해주세요.',
      };
    }

    return {
      success: false,
      message: `쿠팡 광고 연결 실패: ${errorMessage}`,
    };
  }
}

/**
 * 쿠팡 광고 수집기
 */
export const coupangAdsCollector: PlatformCollector<CoupangAdsCredentials> = {
  platform: 'coupang',
  collect: (credentials, options) => collectCoupangAdsData(credentials, options),
  testConnection: testCoupangAdsConnection,
};
