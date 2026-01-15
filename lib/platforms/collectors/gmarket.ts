/**
 * G마켓/옥션 데이터 수집기
 *
 * G마켓/옥션 셀러 API를 사용하여 판매 데이터를 수집합니다.
 * API 문서: https://seller.gmarket.co.kr/api/docs
 */

import crypto from 'crypto';
import type { AdDataInsert } from '@/types/database';
import type {
  GmarketCredentials,
  CollectionResult,
  ConnectionTestResult,
  CollectorOptions,
  PlatformCollector,
} from './types';

const GMARKET_API_BASE = 'https://api.seller.gmarket.co.kr';

/**
 * G마켓 API 서명 생성
 */
function generateGmarketSignature(
  timestamp: string,
  secretKey: string
): string {
  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(timestamp);
  return hmac.digest('base64');
}

/**
 * G마켓 API 요청
 */
async function gmarketApiRequest<T>(
  credentials: GmarketCredentials,
  method: string,
  path: string,
  params?: Record<string, string>
): Promise<T> {
  const timestamp = new Date().toISOString();
  const signature = generateGmarketSignature(timestamp, credentials.secretKey);

  const url = new URL(`${GMARKET_API_BASE}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  const response = await fetch(url.toString(), {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': credentials.apiKey,
      'X-Seller-Id': credentials.sellerId,
      'X-Timestamp': timestamp,
      'X-Signature': signature,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`G마켓 API error: ${response.status} - ${errorText}`);
  }

  return response.json() as Promise<T>;
}

// G마켓 API 응답 타입
interface GmarketSalesReport {
  date: string;
  salesAmount: number;
  salesCount: number;
  refundAmount: number;
  refundCount: number;
  netSalesAmount: number;
  commission: number;
  settlementAmount: number;
}

interface GmarketProductSales {
  productId: string;
  productName: string;
  date: string;
  salesAmount: number;
  salesCount: number;
  viewCount: number;
  clickCount: number;
}

interface GmarketSalesResponse {
  data: GmarketSalesReport[];
  totalCount: number;
}

interface GmarketProductSalesResponse {
  data: GmarketProductSales[];
  totalCount: number;
}

/**
 * G마켓/옥션 데이터 수집
 */
export async function collectGmarketData(
  credentials: GmarketCredentials,
  options: CollectorOptions
): Promise<CollectionResult> {
  const { userId, connectionId, startDate, endDate } = options;

  if (!credentials.apiKey || !credentials.sellerId || !credentials.secretKey) {
    return {
      success: false,
      message: 'G마켓 자격 증명이 올바르지 않습니다.',
      recordCount: 0,
      data: [],
      error: 'Missing credentials',
    };
  }

  try {
    // 일별 판매 데이터 조회
    const salesResponse = await gmarketApiRequest<GmarketSalesResponse>(
      credentials,
      'GET',
      '/v1/sales/daily',
      {
        startDate: startDate.replace(/-/g, ''),
        endDate: endDate.replace(/-/g, ''),
      }
    );

    // 상품별 판매 데이터 조회
    const productSalesResponse = await gmarketApiRequest<GmarketProductSalesResponse>(
      credentials,
      'GET',
      '/v1/sales/products',
      {
        startDate: startDate.replace(/-/g, ''),
        endDate: endDate.replace(/-/g, ''),
      }
    );

    const adDataRecords: AdDataInsert[] = [];

    // 일별 전체 판매 데이터
    if (salesResponse.data) {
      for (const report of salesResponse.data) {
        // 날짜 형식 변환 (YYYYMMDD -> YYYY-MM-DD)
        const rawDate = report.date || '';
        const formattedDate = rawDate.length === 8
          ? `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`
          : rawDate;

        const adData: AdDataInsert = {
          user_id: userId,
          platform_connection_id: connectionId,
          date: formattedDate,
          campaign_id: 'gmarket_total',
          campaign_name: 'G마켓 전체',
          spend: report.commission || 0,
          revenue: report.netSalesAmount || 0,
          impressions: 0, // 판매 데이터에는 노출수 없음
          clicks: 0,
          conversions: report.salesCount || 0,
          ctr: null,
          cvr: null,
          roas: report.commission > 0
            ? (report.netSalesAmount / report.commission) * 100
            : null,
          raw_data: {
            salesAmount: report.salesAmount,
            salesCount: report.salesCount,
            refundAmount: report.refundAmount,
            refundCount: report.refundCount,
            commission: report.commission,
            settlementAmount: report.settlementAmount,
          },
        };

        adDataRecords.push(adData);
      }
    }

    // 상품별 판매 데이터 (노출/클릭 포함)
    if (productSalesResponse.data) {
      for (const product of productSalesResponse.data) {
        const rawDate = product.date || '';
        const formattedDate = rawDate.length === 8
          ? `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`
          : rawDate;

        const impressions = product.viewCount || 0;
        const clicks = product.clickCount || 0;
        const conversions = product.salesCount || 0;

        const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
        const cvr = clicks > 0 ? (conversions / clicks) * 100 : 0;

        const adData: AdDataInsert = {
          user_id: userId,
          platform_connection_id: connectionId,
          date: formattedDate,
          campaign_id: product.productId,
          campaign_name: product.productName,
          spend: 0, // 상품별 광고비 데이터 없음
          revenue: product.salesAmount || 0,
          impressions,
          clicks,
          conversions,
          ctr,
          cvr,
          roas: null,
          raw_data: {
            productId: product.productId,
            viewCount: product.viewCount,
            clickCount: product.clickCount,
          },
        };

        adDataRecords.push(adData);
      }
    }

    return {
      success: true,
      message: `G마켓 데이터 수집 완료: ${adDataRecords.length}개 레코드`,
      recordCount: adDataRecords.length,
      data: adDataRecords,
    };
  } catch (error) {
    console.error('[G마켓 Collector] Error:', error);
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
      message: `G마켓 데이터 수집 실패: ${errorMessage}`,
      recordCount: 0,
      data: [],
      error: errorMessage,
    };
  }
}

/**
 * G마켓 연결 테스트
 */
export async function testGmarketConnection(
  credentials: GmarketCredentials
): Promise<ConnectionTestResult> {
  if (!credentials.apiKey || !credentials.sellerId || !credentials.secretKey) {
    return {
      success: false,
      message: 'API Key, Seller ID, Secret Key가 모두 필요합니다.',
    };
  }

  try {
    // 셀러 정보 조회
    await gmarketApiRequest(credentials, 'GET', '/v1/seller/info', {});

    return {
      success: true,
      message: 'G마켓 연결에 성공했습니다.',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';

    return {
      success: false,
      message: `G마켓 연결 실패: ${errorMessage}`,
    };
  }
}

/**
 * G마켓 수집기
 */
export const gmarketCollector: PlatformCollector<GmarketCredentials> = {
  platform: 'gmarket',
  collect: (credentials, options) => collectGmarketData(credentials, options),
  testConnection: testGmarketConnection,
};
