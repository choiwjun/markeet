/**
 * 네이버 애널리틱스 데이터 수집기
 *
 * 네이버 애널리틱스 API를 사용하여 웹사이트 분석 데이터를 수집합니다.
 * API 문서: https://analytics.naver.com/api
 */

import type { AdDataInsert } from '@/types/database';
import type {
  NaverAnalyticsCredentials,
  CollectionResult,
  ConnectionTestResult,
  CollectorOptions,
  PlatformCollector,
} from './types';

const NAVER_ANALYTICS_API_BASE = 'https://analytics.naver.com';
const NAVER_AUTH_BASE = 'https://nid.naver.com';

/**
 * OAuth2 토큰 갱신
 */
async function refreshNaverAnalyticsToken(
  credentials: NaverAnalyticsCredentials
): Promise<{ accessToken: string; refreshToken: string }> {
  if (!credentials.clientId || !credentials.clientSecret || !credentials.refreshToken) {
    throw new Error('Client ID, Client Secret, Refresh Token이 필요합니다.');
  }

  const response = await fetch(`${NAVER_AUTH_BASE}/oauth2.0/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: credentials.clientId,
      client_secret: credentials.clientSecret,
      refresh_token: credentials.refreshToken,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Token refresh failed: ${errorText}`);
  }

  const data = await response.json() as {
    access_token: string;
    refresh_token?: string;
  };

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || credentials.refreshToken,
  };
}

/**
 * 네이버 애널리틱스 API 요청
 */
async function naverAnalyticsRequest<T>(
  accessToken: string,
  method: string,
  path: string,
  params?: Record<string, string>
): Promise<T> {
  const url = new URL(`${NAVER_ANALYTICS_API_BASE}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  const response = await fetch(url.toString(), {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Naver Analytics API error: ${response.status} - ${errorText}`);
  }

  return response.json() as Promise<T>;
}

// 네이버 애널리틱스 API 응답 타입
interface NaverAnalyticsReport {
  date: string;
  visitors: number;           // 방문자 수
  pageViews: number;          // 페이지뷰
  newVisitors: number;        // 신규 방문자
  returningVisitors: number;  // 재방문자
  bounceRate: number;         // 이탈률
  avgSessionDuration: number; // 평균 체류시간 (초)
}

interface NaverAnalyticsTrafficSource {
  date: string;
  source: string;             // 유입 소스
  medium: string;             // 유입 매체
  visitors: number;
  pageViews: number;
  bounceRate: number;
  conversions: number;
  conversionRate: number;
}

interface NaverAnalyticsReportResponse {
  data: NaverAnalyticsReport[];
  totalElements: number;
}

interface NaverAnalyticsTrafficResponse {
  data: NaverAnalyticsTrafficSource[];
  totalElements: number;
}

/**
 * 네이버 애널리틱스 데이터 수집
 */
export async function collectNaverAnalyticsData(
  credentials: NaverAnalyticsCredentials,
  options: CollectorOptions
): Promise<CollectionResult> {
  const { userId, connectionId, startDate, endDate } = options;

  if (!credentials.clientId || !credentials.clientSecret || !credentials.siteId) {
    return {
      success: false,
      message: '네이버 애널리틱스 자격 증명이 올바르지 않습니다.',
      recordCount: 0,
      data: [],
      error: 'Missing credentials',
    };
  }

  try {
    let accessToken = credentials.accessToken;

    // 토큰 갱신
    if (credentials.refreshToken) {
      try {
        const tokens = await refreshNaverAnalyticsToken(credentials);
        accessToken = tokens.accessToken;
      } catch {
        console.warn('[Naver Analytics] Token refresh failed, using existing token');
      }
    }

    if (!accessToken) {
      return {
        success: false,
        message: '액세스 토큰이 없습니다.',
        recordCount: 0,
        data: [],
        error: 'NO_ACCESS_TOKEN',
      };
    }

    // 트래픽 소스별 데이터 조회
    const trafficResponse = await naverAnalyticsRequest<NaverAnalyticsTrafficResponse>(
      accessToken,
      'GET',
      `/api/v1/sites/${credentials.siteId}/traffic-sources`,
      {
        startDate: startDate.replace(/-/g, ''),
        endDate: endDate.replace(/-/g, ''),
        breakdown: 'date',
      }
    );

    const adDataRecords: AdDataInsert[] = [];

    // 트래픽 소스별 데이터 변환
    if (trafficResponse.data) {
      for (const traffic of trafficResponse.data) {
        const rawDate = traffic.date || '';
        const formattedDate = rawDate.length === 8
          ? `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`
          : rawDate;

        const source = traffic.source || '(direct)';
        const medium = traffic.medium || '(none)';

        const impressions = traffic.visitors || 0;
        const clicks = traffic.pageViews || 0;
        const conversions = traffic.conversions || 0;

        // 네이버 애널리틱스는 광고비 데이터가 없음
        const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
        const cvr = traffic.conversionRate || 0;

        const adData: AdDataInsert = {
          user_id: userId,
          platform_connection_id: connectionId,
          date: formattedDate,
          campaign_id: `${source}/${medium}`,
          campaign_name: `${source} / ${medium}`,
          spend: 0, // 네이버 애널리틱스는 광고비 데이터 없음
          revenue: 0,
          impressions,
          clicks,
          conversions,
          ctr,
          cvr,
          roas: null,
          raw_data: {
            source,
            medium,
            visitors: traffic.visitors,
            pageViews: traffic.pageViews,
            bounceRate: traffic.bounceRate,
          },
        };

        adDataRecords.push(adData);
      }
    }

    // 전체 사이트 일별 데이터 조회
    const dailyResponse = await naverAnalyticsRequest<NaverAnalyticsReportResponse>(
      accessToken,
      'GET',
      `/api/v1/sites/${credentials.siteId}/daily-report`,
      {
        startDate: startDate.replace(/-/g, ''),
        endDate: endDate.replace(/-/g, ''),
      }
    );

    if (dailyResponse.data) {
      for (const daily of dailyResponse.data) {
        const rawDate = daily.date || '';
        const formattedDate = rawDate.length === 8
          ? `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`
          : rawDate;

        const adData: AdDataInsert = {
          user_id: userId,
          platform_connection_id: connectionId,
          date: formattedDate,
          campaign_id: 'naver_analytics_total',
          campaign_name: '네이버 애널리틱스 전체',
          spend: 0,
          revenue: 0,
          impressions: daily.visitors || 0,
          clicks: daily.pageViews || 0,
          conversions: 0,
          ctr: daily.visitors > 0 ? (daily.pageViews / daily.visitors) * 100 : 0,
          cvr: null,
          roas: null,
          raw_data: {
            visitors: daily.visitors,
            pageViews: daily.pageViews,
            newVisitors: daily.newVisitors,
            returningVisitors: daily.returningVisitors,
            bounceRate: daily.bounceRate,
            avgSessionDuration: daily.avgSessionDuration,
          },
        };

        adDataRecords.push(adData);
      }
    }

    return {
      success: true,
      message: `네이버 애널리틱스 데이터 수집 완료: ${adDataRecords.length}개 레코드`,
      recordCount: adDataRecords.length,
      data: adDataRecords,
    };
  } catch (error) {
    console.error('[Naver Analytics Collector] Error:', error);
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';

    if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
      return {
        success: false,
        message: '인증이 만료되었습니다. 다시 연동해주세요.',
        recordCount: 0,
        data: [],
        error: 'UNAUTHORIZED',
      };
    }

    return {
      success: false,
      message: `네이버 애널리틱스 데이터 수집 실패: ${errorMessage}`,
      recordCount: 0,
      data: [],
      error: errorMessage,
    };
  }
}

/**
 * 네이버 애널리틱스 연결 테스트
 */
export async function testNaverAnalyticsConnection(
  credentials: NaverAnalyticsCredentials
): Promise<ConnectionTestResult> {
  if (!credentials.clientId || !credentials.clientSecret || !credentials.siteId) {
    return {
      success: false,
      message: 'Client ID, Client Secret, Site ID가 필요합니다.',
    };
  }

  if (!credentials.accessToken && !credentials.refreshToken) {
    return {
      success: false,
      message: 'Access Token 또는 Refresh Token이 필요합니다.',
    };
  }

  try {
    let accessToken = credentials.accessToken;

    if (credentials.refreshToken) {
      const tokens = await refreshNaverAnalyticsToken(credentials);
      accessToken = tokens.accessToken;
    }

    if (!accessToken) {
      return {
        success: false,
        message: '유효한 액세스 토큰을 얻을 수 없습니다.',
      };
    }

    // 사이트 정보 조회
    await naverAnalyticsRequest(
      accessToken,
      'GET',
      `/api/v1/sites/${credentials.siteId}`,
      {}
    );

    return {
      success: true,
      message: '네이버 애널리틱스 연결에 성공했습니다.',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';

    if (errorMessage.includes('401')) {
      return {
        success: false,
        message: '인증이 만료되었습니다. 다시 연동해주세요.',
      };
    }

    return {
      success: false,
      message: `네이버 애널리틱스 연결 실패: ${errorMessage}`,
    };
  }
}

/**
 * 네이버 애널리틱스 수집기
 */
export const naverAnalyticsCollector: PlatformCollector<NaverAnalyticsCredentials> = {
  platform: 'naver_analytics',
  collect: (credentials, options) => collectNaverAnalyticsData(credentials, options),
  testConnection: testNaverAnalyticsConnection,
};
