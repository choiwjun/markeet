/**
 * Google Ads 데이터 수집기
 *
 * Google Ads API를 사용하여 광고 데이터를 수집합니다.
 * API 문서: https://developers.google.com/google-ads/api/docs/start
 */

import type { AdDataInsert } from '@/types/database';
import type {
  GoogleAdsCredentials,
  CollectionResult,
  ConnectionTestResult,
  CollectorOptions,
  PlatformCollector,
} from './types';

const GOOGLE_ADS_API_VERSION = 'v15';
const GOOGLE_ADS_API_BASE = `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}`;

/**
 * OAuth2 액세스 토큰 갱신
 */
async function refreshAccessToken(
  credentials: GoogleAdsCredentials
): Promise<string> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: credentials.clientId,
      client_secret: credentials.clientSecret,
      refresh_token: credentials.refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Token refresh failed: ${errorText}`);
  }

  const data = await response.json() as { access_token: string };
  return data.access_token;
}

/**
 * Google Ads API 요청
 */
async function googleAdsRequest<T>(
  credentials: GoogleAdsCredentials,
  accessToken: string,
  query: string
): Promise<T> {
  const customerId = credentials.customerId.replace(/-/g, '');
  const loginCustomerId = credentials.loginCustomerId?.replace(/-/g, '') || customerId;

  const response = await fetch(
    `${GOOGLE_ADS_API_BASE}/customers/${customerId}/googleAds:searchStream`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'developer-token': credentials.developerToken,
        'login-customer-id': loginCustomerId,
      },
      body: JSON.stringify({ query }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Ads API error: ${response.status} - ${errorText}`);
  }

  return response.json() as Promise<T>;
}

// Google Ads API 응답 타입
interface GoogleAdsRow {
  campaign?: {
    id: string;
    name: string;
    status: string;
  };
  segments?: {
    date: string;
  };
  metrics?: {
    impressions: string;
    clicks: string;
    costMicros: string;
    conversions: string;
    conversionsValue: string;
    ctr: string;
    averageCpc: string;
  };
}

interface GoogleAdsResponse {
  results: GoogleAdsRow[];
}

/**
 * Google Ads 데이터 수집
 */
export async function collectGoogleAdsData(
  credentials: GoogleAdsCredentials,
  options: CollectorOptions
): Promise<CollectionResult> {
  const { userId, connectionId, startDate, endDate } = options;

  if (
    !credentials.clientId ||
    !credentials.clientSecret ||
    !credentials.refreshToken ||
    !credentials.developerToken ||
    !credentials.customerId
  ) {
    return {
      success: false,
      message: 'Google Ads 자격 증명이 올바르지 않습니다.',
      recordCount: 0,
      data: [],
      error: 'Missing credentials',
    };
  }

  try {
    // 액세스 토큰 갱신
    const accessToken = await refreshAccessToken(credentials);

    // GAQL 쿼리로 캠페인 성과 데이터 조회
    const query = `
      SELECT
        campaign.id,
        campaign.name,
        campaign.status,
        segments.date,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions,
        metrics.conversions_value,
        metrics.ctr,
        metrics.average_cpc
      FROM campaign
      WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
        AND campaign.status != 'REMOVED'
      ORDER BY segments.date DESC
    `;

    const response = await googleAdsRequest<GoogleAdsResponse[]>(
      credentials,
      accessToken,
      query
    );

    const adDataRecords: AdDataInsert[] = [];

    // 응답 데이터 변환
    for (const chunk of response) {
      if (!chunk.results) continue;

      for (const row of chunk.results) {
        const campaign = row.campaign;
        const segments = row.segments;
        const metrics = row.metrics;

        if (!campaign || !segments || !metrics) continue;

        // costMicros는 마이크로 단위 (1,000,000 = 1원/달러)
        const spend = parseInt(metrics.costMicros || '0', 10) / 1000000;
        const revenue = parseFloat(metrics.conversionsValue || '0');
        const impressions = parseInt(metrics.impressions || '0', 10);
        const clicks = parseInt(metrics.clicks || '0', 10);
        const conversions = parseFloat(metrics.conversions || '0');
        const ctr = parseFloat(metrics.ctr || '0') * 100;
        const cvr = clicks > 0 ? (conversions / clicks) * 100 : 0;
        const roas = spend > 0 ? (revenue / spend) * 100 : null;

        const adData: AdDataInsert = {
          user_id: userId,
          platform_connection_id: connectionId,
          date: segments.date,
          campaign_id: campaign.id,
          campaign_name: campaign.name,
          spend,
          revenue,
          impressions,
          clicks,
          conversions,
          ctr,
          cvr,
          roas,
          raw_data: {
            status: campaign.status,
            costMicros: metrics.costMicros,
            averageCpc: metrics.averageCpc,
          },
        };

        adDataRecords.push(adData);
      }
    }

    return {
      success: true,
      message: `Google Ads 데이터 수집 완료: ${adDataRecords.length}개 레코드`,
      recordCount: adDataRecords.length,
      data: adDataRecords,
    };
  } catch (error) {
    console.error('[Google Ads Collector] Error:', error);
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';

    if (errorMessage.includes('UNAUTHENTICATED') || errorMessage.includes('401')) {
      return {
        success: false,
        message: '인증에 실패했습니다. OAuth 토큰을 확인해주세요.',
        recordCount: 0,
        data: [],
        error: 'UNAUTHENTICATED',
      };
    }

    if (errorMessage.includes('PERMISSION_DENIED') || errorMessage.includes('403')) {
      return {
        success: false,
        message: '접근 권한이 없습니다. 계정 권한을 확인해주세요.',
        recordCount: 0,
        data: [],
        error: 'PERMISSION_DENIED',
      };
    }

    if (errorMessage.includes('INVALID_ARGUMENT')) {
      return {
        success: false,
        message: '잘못된 요청입니다. 고객 ID를 확인해주세요.',
        recordCount: 0,
        data: [],
        error: 'INVALID_ARGUMENT',
      };
    }

    return {
      success: false,
      message: `Google Ads 데이터 수집 실패: ${errorMessage}`,
      recordCount: 0,
      data: [],
      error: errorMessage,
    };
  }
}

/**
 * Google Ads 연결 테스트
 */
export async function testGoogleAdsConnection(
  credentials: GoogleAdsCredentials
): Promise<ConnectionTestResult> {
  if (
    !credentials.clientId ||
    !credentials.clientSecret ||
    !credentials.refreshToken ||
    !credentials.developerToken ||
    !credentials.customerId
  ) {
    return {
      success: false,
      message: 'Client ID, Client Secret, Refresh Token, Developer Token, Customer ID가 모두 필요합니다.',
    };
  }

  try {
    // 토큰 갱신 테스트
    const accessToken = await refreshAccessToken(credentials);

    // 간단한 쿼리로 연결 테스트
    const query = `
      SELECT customer.id, customer.descriptive_name
      FROM customer
      LIMIT 1
    `;

    await googleAdsRequest(credentials, accessToken, query);

    return {
      success: true,
      message: 'Google Ads 연결에 성공했습니다.',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';

    if (errorMessage.includes('Token refresh failed')) {
      return {
        success: false,
        message: 'OAuth 토큰 갱신에 실패했습니다. 토큰을 다시 발급받아주세요.',
      };
    }

    return {
      success: false,
      message: `Google Ads 연결 실패: ${errorMessage}`,
    };
  }
}

/**
 * Google Ads 수집기
 */
export const googleAdsCollector: PlatformCollector<GoogleAdsCredentials> = {
  platform: 'google',
  collect: (credentials, options) => collectGoogleAdsData(credentials, options),
  testConnection: testGoogleAdsConnection,
};
