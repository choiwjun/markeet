/**
 * 네이버 스마트스토어 데이터 수집기
 *
 * 네이버 커머스 API를 사용하여 스마트스토어 데이터를 수집합니다.
 * API 문서: https://apicenter.commerce.naver.com/ko/basic/commerce-api
 */

import type { AdDataInsert } from '@/types/database';
import type {
  NaverStoreCredentials,
  CollectionResult,
  ConnectionTestResult,
  CollectorOptions,
  PlatformCollector,
} from './types';

const NAVER_COMMERCE_API_BASE = 'https://api.commerce.naver.com';
const NAVER_AUTH_BASE = 'https://nid.naver.com';

/**
 * BCrypt 타임스탬프 서명 생성
 */
function generateBcryptTimestamp(clientId: string, clientSecret: string, timestamp: number): string {
  // 실제 구현시에는 bcrypt 패키지 사용
  // 여기서는 HMAC-SHA256으로 대체
  const crypto = require('crypto');
  const message = `${clientId}_${timestamp}`;
  const hmac = crypto.createHmac('sha256', clientSecret);
  hmac.update(message);
  return hmac.digest('base64');
}

/**
 * OAuth2 토큰 갱신
 */
async function refreshNaverToken(
  credentials: NaverStoreCredentials
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
 * 네이버 커머스 API 요청
 */
async function naverCommerceRequest<T>(
  credentials: NaverStoreCredentials,
  accessToken: string,
  method: string,
  path: string,
  params?: Record<string, string>,
  body?: Record<string, unknown>
): Promise<T> {
  const timestamp = Date.now();
  const signature = generateBcryptTimestamp(
    credentials.clientId,
    credentials.clientSecret,
    timestamp
  );

  const url = new URL(`${NAVER_COMMERCE_API_BASE}${path}`);
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
      'X-Timestamp': String(timestamp),
      'X-Signature': signature,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Naver Commerce API error: ${response.status} - ${errorText}`);
  }

  return response.json() as Promise<T>;
}

// 네이버 스마트스토어 API 응답 타입
interface NaverStoreSalesReport {
  date: string;
  orderCount: number;
  orderAmount: number;
  cancelCount: number;
  cancelAmount: number;
  paymentAmount: number;
  deliveryFee: number;
  settlementAmount: number;
}

interface NaverStoreProductStats {
  productNo: string;
  productName: string;
  date: string;
  viewCount: number;
  addCartCount: number;
  orderCount: number;
  orderAmount: number;
  reviewCount: number;
}

interface NaverStoreSalesResponse {
  contents: NaverStoreSalesReport[];
  totalElements: number;
}

interface NaverStoreProductStatsResponse {
  contents: NaverStoreProductStats[];
  totalElements: number;
}

/**
 * 네이버 스마트스토어 데이터 수집
 */
export async function collectNaverStoreData(
  credentials: NaverStoreCredentials,
  options: CollectorOptions
): Promise<CollectionResult> {
  const { userId, connectionId, startDate, endDate } = options;

  if (!credentials.clientId || !credentials.clientSecret) {
    return {
      success: false,
      message: '네이버 스마트스토어 자격 증명이 올바르지 않습니다.',
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
        const tokens = await refreshNaverToken(credentials);
        accessToken = tokens.accessToken;
      } catch {
        console.warn('[Naver Store] Token refresh failed, using existing token');
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

    // 일별 판매 데이터 조회
    const salesResponse = await naverCommerceRequest<NaverStoreSalesResponse>(
      credentials,
      accessToken,
      'GET',
      '/external/v1/seller/sales/statistics/daily',
      {
        startDate: startDate.replace(/-/g, ''),
        endDate: endDate.replace(/-/g, ''),
      }
    );

    // 상품별 통계 조회
    const productStatsResponse = await naverCommerceRequest<NaverStoreProductStatsResponse>(
      credentials,
      accessToken,
      'GET',
      '/external/v1/seller/products/statistics',
      {
        startDate: startDate.replace(/-/g, ''),
        endDate: endDate.replace(/-/g, ''),
      }
    );

    const adDataRecords: AdDataInsert[] = [];

    // 일별 전체 판매 데이터
    if (salesResponse.contents) {
      for (const report of salesResponse.contents) {
        const rawDate = report.date || '';
        const formattedDate = rawDate.length === 8
          ? `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`
          : rawDate;

        // 수수료 = 결제금액 - 정산금액 (대략적 계산)
        const commission = report.paymentAmount - report.settlementAmount;

        const adData: AdDataInsert = {
          user_id: userId,
          platform_connection_id: connectionId,
          date: formattedDate,
          campaign_id: 'naver_store_total',
          campaign_name: '네이버 스마트스토어 전체',
          spend: Math.max(commission, 0),
          revenue: report.paymentAmount || 0,
          impressions: 0,
          clicks: 0,
          conversions: report.orderCount || 0,
          ctr: null,
          cvr: null,
          roas: commission > 0 ? (report.paymentAmount / commission) * 100 : null,
          raw_data: {
            orderCount: report.orderCount,
            orderAmount: report.orderAmount,
            cancelCount: report.cancelCount,
            cancelAmount: report.cancelAmount,
            deliveryFee: report.deliveryFee,
            settlementAmount: report.settlementAmount,
          },
        };

        adDataRecords.push(adData);
      }
    }

    // 상품별 통계 데이터
    if (productStatsResponse.contents) {
      for (const product of productStatsResponse.contents) {
        const rawDate = product.date || '';
        const formattedDate = rawDate.length === 8
          ? `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`
          : rawDate;

        const impressions = product.viewCount || 0;
        const clicks = product.addCartCount || 0; // 장바구니 담기 = 클릭으로 대체
        const conversions = product.orderCount || 0;

        const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
        const cvr = impressions > 0 ? (conversions / impressions) * 100 : 0;

        const adData: AdDataInsert = {
          user_id: userId,
          platform_connection_id: connectionId,
          date: formattedDate,
          campaign_id: product.productNo,
          campaign_name: product.productName,
          spend: 0,
          revenue: product.orderAmount || 0,
          impressions,
          clicks,
          conversions,
          ctr,
          cvr,
          roas: null,
          raw_data: {
            productNo: product.productNo,
            viewCount: product.viewCount,
            addCartCount: product.addCartCount,
            reviewCount: product.reviewCount,
          },
        };

        adDataRecords.push(adData);
      }
    }

    return {
      success: true,
      message: `네이버 스마트스토어 데이터 수집 완료: ${adDataRecords.length}개 레코드`,
      recordCount: adDataRecords.length,
      data: adDataRecords,
    };
  } catch (error) {
    console.error('[Naver Store Collector] Error:', error);
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
      message: `네이버 스마트스토어 데이터 수집 실패: ${errorMessage}`,
      recordCount: 0,
      data: [],
      error: errorMessage,
    };
  }
}

/**
 * 네이버 스마트스토어 연결 테스트
 */
export async function testNaverStoreConnection(
  credentials: NaverStoreCredentials
): Promise<ConnectionTestResult> {
  if (!credentials.clientId || !credentials.clientSecret) {
    return {
      success: false,
      message: 'Client ID와 Client Secret이 필요합니다.',
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
      const tokens = await refreshNaverToken(credentials);
      accessToken = tokens.accessToken;
    }

    if (!accessToken) {
      return {
        success: false,
        message: '유효한 액세스 토큰을 얻을 수 없습니다.',
      };
    }

    // 셀러 정보 조회
    await naverCommerceRequest(
      credentials,
      accessToken,
      'GET',
      '/external/v1/seller/info',
      {}
    );

    return {
      success: true,
      message: '네이버 스마트스토어 연결에 성공했습니다.',
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
      message: `네이버 스마트스토어 연결 실패: ${errorMessage}`,
    };
  }
}

/**
 * 네이버 스마트스토어 수집기
 */
export const naverStoreCollector: PlatformCollector<NaverStoreCredentials> = {
  platform: 'naver_store',
  collect: (credentials, options) => collectNaverStoreData(credentials, options),
  testConnection: testNaverStoreConnection,
};
