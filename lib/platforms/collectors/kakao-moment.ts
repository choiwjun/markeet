/**
 * 카카오모먼트 데이터 수집기
 *
 * 카카오모먼트 API를 사용하여 광고 데이터를 수집합니다.
 * API 문서: https://developers.kakao.com/docs/latest/ko/moment-api/overview
 */

import type { AdDataInsert } from '@/types/database';
import type {
  KakaoMomentCredentials,
  CollectionResult,
  ConnectionTestResult,
  CollectorOptions,
  PlatformCollector,
} from './types';

const KAKAO_API_BASE = 'https://kapi.kakao.com';
const KAKAO_AUTH_BASE = 'https://kauth.kakao.com';

/**
 * 카카오 액세스 토큰 갱신
 */
async function refreshKakaoToken(
  credentials: KakaoMomentCredentials
): Promise<{ accessToken: string; refreshToken: string }> {
  if (!credentials.clientId || !credentials.refreshToken) {
    throw new Error('Client ID와 Refresh Token이 필요합니다.');
  }

  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: credentials.clientId,
    refresh_token: credentials.refreshToken,
  });

  if (credentials.clientSecret) {
    params.set('client_secret', credentials.clientSecret);
  }

  const response = await fetch(`${KAKAO_AUTH_BASE}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
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
 * 카카오모먼트 API 요청
 */
async function kakaoMomentRequest<T>(
  endpoint: string,
  accessToken: string,
  params?: Record<string, string | number>
): Promise<T> {
  const url = new URL(`${KAKAO_API_BASE}${endpoint}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, String(value));
    });
  }

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json() as { msg?: string; code?: number };
    throw new Error(
      `Kakao Moment API error: ${errorData.msg || response.statusText} (code: ${errorData.code})`
    );
  }

  return response.json() as Promise<T>;
}

// 카카오모먼트 API 응답 타입
interface KakaoCampaign {
  id: number;
  name: string;
  status: string;
  config: {
    dailyBudget: number;
    bidStrategy: string;
  };
}

interface KakaoReport {
  dimensions: {
    campaignId: number;
    campaignName: string;
    date: string;
  };
  metrics: {
    impression: number;
    click: number;
    cost: number;
    conversion: number;
    conversionValue: number;
  };
}

interface KakaoCampaignsResponse {
  content: KakaoCampaign[];
  totalElements: number;
}

interface KakaoReportResponse {
  content: KakaoReport[];
  totalElements: number;
}

/**
 * 카카오모먼트 데이터 수집
 */
export async function collectKakaoMomentData(
  credentials: KakaoMomentCredentials,
  options: CollectorOptions
): Promise<CollectionResult> {
  const { userId, connectionId, startDate, endDate } = options;

  if (!credentials.accessToken || !credentials.adAccountId) {
    return {
      success: false,
      message: '카카오모먼트 자격 증명이 올바르지 않습니다.',
      recordCount: 0,
      data: [],
      error: 'Missing credentials',
    };
  }

  try {
    let accessToken = credentials.accessToken;

    // 토큰 갱신 시도 (refreshToken이 있는 경우)
    if (credentials.refreshToken && credentials.clientId) {
      try {
        const tokens = await refreshKakaoToken(credentials);
        accessToken = tokens.accessToken;
      } catch {
        // 갱신 실패해도 기존 토큰으로 시도
        console.warn('[Kakao Moment] Token refresh failed, using existing token');
      }
    }

    // 캠페인 리포트 조회
    const reportResponse = await kakaoMomentRequest<KakaoReportResponse>(
      '/v1/moment/reports/campaigns',
      accessToken,
      {
        adAccountId: credentials.adAccountId,
        dimension: 'CAMPAIGN,DATE',
        metrics: 'impression,click,cost,conversion,conversionValue',
        startDate: startDate.replace(/-/g, ''),
        endDate: endDate.replace(/-/g, ''),
        page: 0,
        size: 500,
      }
    );

    const adDataRecords: AdDataInsert[] = [];

    for (const report of reportResponse.content) {
      const { dimensions, metrics } = report;

      const spend = metrics.cost || 0;
      const revenue = metrics.conversionValue || 0;
      const impressions = metrics.impression || 0;
      const clicks = metrics.click || 0;
      const conversions = metrics.conversion || 0;

      const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
      const cvr = clicks > 0 ? (conversions / clicks) * 100 : 0;
      const roas = spend > 0 ? (revenue / spend) * 100 : null;

      // 날짜 형식 변환 (YYYYMMDD -> YYYY-MM-DD)
      const rawDate = dimensions.date || '';
      const formattedDate = rawDate.length === 8
        ? `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`
        : rawDate;

      const adData: AdDataInsert = {
        user_id: userId,
        platform_connection_id: connectionId,
        date: formattedDate,
        campaign_id: String(dimensions.campaignId),
        campaign_name: dimensions.campaignName,
        spend,
        revenue,
        impressions,
        clicks,
        conversions,
        ctr,
        cvr,
        roas,
        raw_data: {
          ...metrics,
        },
      };

      adDataRecords.push(adData);
    }

    return {
      success: true,
      message: `카카오모먼트 데이터 수집 완료: ${adDataRecords.length}개 레코드`,
      recordCount: adDataRecords.length,
      data: adDataRecords,
    };
  } catch (error) {
    console.error('[Kakao Moment Collector] Error:', error);
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';

    if (errorMessage.includes('-401') || errorMessage.includes('UNAUTHORIZED')) {
      return {
        success: false,
        message: '인증이 만료되었습니다. 다시 로그인해주세요.',
        recordCount: 0,
        data: [],
        error: 'UNAUTHORIZED',
      };
    }

    if (errorMessage.includes('-403') || errorMessage.includes('FORBIDDEN')) {
      return {
        success: false,
        message: '접근 권한이 없습니다. 광고 계정 권한을 확인해주세요.',
        recordCount: 0,
        data: [],
        error: 'FORBIDDEN',
      };
    }

    return {
      success: false,
      message: `카카오모먼트 데이터 수집 실패: ${errorMessage}`,
      recordCount: 0,
      data: [],
      error: errorMessage,
    };
  }
}

/**
 * 카카오모먼트 연결 테스트
 */
export async function testKakaoMomentConnection(
  credentials: KakaoMomentCredentials
): Promise<ConnectionTestResult> {
  if (!credentials.accessToken || !credentials.adAccountId) {
    return {
      success: false,
      message: '액세스 토큰과 광고 계정 ID가 필요합니다.',
    };
  }

  try {
    // 광고 계정 정보 조회
    await kakaoMomentRequest<{ id: string }>(
      '/v1/moment/adaccounts',
      credentials.accessToken,
      { adAccountId: credentials.adAccountId }
    );

    return {
      success: true,
      message: '카카오모먼트 연결에 성공했습니다.',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';

    if (errorMessage.includes('-401')) {
      return {
        success: false,
        message: '액세스 토큰이 만료되었습니다.',
      };
    }

    return {
      success: false,
      message: `카카오모먼트 연결 실패: ${errorMessage}`,
    };
  }
}

/**
 * 카카오모먼트 수집기
 */
export const kakaoMomentCollector: PlatformCollector<KakaoMomentCredentials> = {
  platform: 'kakao',
  collect: (credentials, options) => collectKakaoMomentData(credentials, options),
  testConnection: testKakaoMomentConnection,
};
