/**
 * 11번가 데이터 수집기
 *
 * 11번가 셀러 API를 사용하여 판매 데이터를 수집합니다.
 * API 문서: https://openapi.11st.co.kr/docs
 */

import type { AdDataInsert } from '@/types/database';
import type {
  EleventhStreetCredentials,
  CollectionResult,
  ConnectionTestResult,
  CollectorOptions,
  PlatformCollector,
} from './types';

const ELEVENTH_API_BASE = 'https://openapi.11st.co.kr';

/**
 * 11번가 API 요청
 */
async function eleventhApiRequest<T>(
  credentials: EleventhStreetCredentials,
  method: string,
  path: string,
  params?: Record<string, string>
): Promise<T> {
  const url = new URL(`${ELEVENTH_API_BASE}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  const response = await fetch(url.toString(), {
    method,
    headers: {
      'Content-Type': 'application/json',
      'openapikey': credentials.apiKey,
      'X-Seller-Id': credentials.sellerId,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`11번가 API error: ${response.status} - ${errorText}`);
  }

  // 11번가 API는 XML 응답도 있으므로 Content-Type 확인
  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    return response.json() as Promise<T>;
  }

  // XML 응답의 경우 텍스트로 반환 후 파싱 필요
  const text = await response.text();
  // 간단한 XML to JSON 변환 (실제로는 xml2js 등 라이브러리 사용 권장)
  return JSON.parse(text) as T;
}

// 11번가 API 응답 타입
interface EleventhSalesReport {
  date: string;
  orderCount: number;
  orderAmount: number;
  cancelCount: number;
  cancelAmount: number;
  netOrderAmount: number;
  commission: number;
}

interface EleventhProductStats {
  productNo: string;
  productName: string;
  date: string;
  viewCount: number;
  wishCount: number;
  orderCount: number;
  orderAmount: number;
}

interface EleventhSalesResponse {
  salesList: EleventhSalesReport[];
  totalCount: number;
}

interface EleventhProductStatsResponse {
  productStatsList: EleventhProductStats[];
  totalCount: number;
}

/**
 * 11번가 데이터 수집
 */
export async function collectEleventhStreetData(
  credentials: EleventhStreetCredentials,
  options: CollectorOptions
): Promise<CollectionResult> {
  const { userId, connectionId, startDate, endDate } = options;

  if (!credentials.apiKey || !credentials.sellerId) {
    return {
      success: false,
      message: '11번가 자격 증명이 올바르지 않습니다.',
      recordCount: 0,
      data: [],
      error: 'Missing credentials',
    };
  }

  try {
    // 일별 판매 데이터 조회
    const salesResponse = await eleventhApiRequest<EleventhSalesResponse>(
      credentials,
      'GET',
      '/v1/seller/sales/daily',
      {
        startDate: startDate.replace(/-/g, ''),
        endDate: endDate.replace(/-/g, ''),
      }
    );

    // 상품별 통계 조회
    const productStatsResponse = await eleventhApiRequest<EleventhProductStatsResponse>(
      credentials,
      'GET',
      '/v1/seller/products/stats',
      {
        startDate: startDate.replace(/-/g, ''),
        endDate: endDate.replace(/-/g, ''),
      }
    );

    const adDataRecords: AdDataInsert[] = [];

    // 일별 전체 판매 데이터
    if (salesResponse.salesList) {
      for (const report of salesResponse.salesList) {
        const rawDate = report.date || '';
        const formattedDate = rawDate.length === 8
          ? `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`
          : rawDate;

        const adData: AdDataInsert = {
          user_id: userId,
          platform_connection_id: connectionId,
          date: formattedDate,
          campaign_id: 'eleventh_total',
          campaign_name: '11번가 전체',
          spend: report.commission || 0,
          revenue: report.netOrderAmount || 0,
          impressions: 0,
          clicks: 0,
          conversions: report.orderCount || 0,
          ctr: null,
          cvr: null,
          roas: report.commission > 0
            ? (report.netOrderAmount / report.commission) * 100
            : null,
          raw_data: {
            orderCount: report.orderCount,
            orderAmount: report.orderAmount,
            cancelCount: report.cancelCount,
            cancelAmount: report.cancelAmount,
            commission: report.commission,
          },
        };

        adDataRecords.push(adData);
      }
    }

    // 상품별 통계 데이터
    if (productStatsResponse.productStatsList) {
      for (const product of productStatsResponse.productStatsList) {
        const rawDate = product.date || '';
        const formattedDate = rawDate.length === 8
          ? `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`
          : rawDate;

        const impressions = product.viewCount || 0;
        const clicks = product.wishCount || 0; // 찜 = 관심 클릭으로 대체
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
            wishCount: product.wishCount,
          },
        };

        adDataRecords.push(adData);
      }
    }

    return {
      success: true,
      message: `11번가 데이터 수집 완료: ${adDataRecords.length}개 레코드`,
      recordCount: adDataRecords.length,
      data: adDataRecords,
    };
  } catch (error) {
    console.error('[11번가 Collector] Error:', error);
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

    return {
      success: false,
      message: `11번가 데이터 수집 실패: ${errorMessage}`,
      recordCount: 0,
      data: [],
      error: errorMessage,
    };
  }
}

/**
 * 11번가 연결 테스트
 */
export async function testEleventhStreetConnection(
  credentials: EleventhStreetCredentials
): Promise<ConnectionTestResult> {
  if (!credentials.apiKey || !credentials.sellerId) {
    return {
      success: false,
      message: 'API Key와 Seller ID가 필요합니다.',
    };
  }

  try {
    // 셀러 정보 조회
    await eleventhApiRequest(credentials, 'GET', '/v1/seller/info', {});

    return {
      success: true,
      message: '11번가 연결에 성공했습니다.',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';

    return {
      success: false,
      message: `11번가 연결 실패: ${errorMessage}`,
    };
  }
}

/**
 * 11번가 수집기
 */
export const eleventhStreetCollector: PlatformCollector<EleventhStreetCredentials> = {
  platform: 'eleventh',
  collect: (credentials, options) => collectEleventhStreetData(credentials, options),
  testConnection: testEleventhStreetConnection,
};
