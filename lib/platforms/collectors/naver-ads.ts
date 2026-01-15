/**
 * 네이버 검색광고 데이터 수집기
 *
 * 네이버 검색광고 API를 사용하여 광고 데이터를 수집합니다.
 * API 문서: https://naver.github.io/searchad-apidoc/
 */

import crypto from 'crypto';
import type { AdDataInsert } from '@/types/database';
import type {
  NaverAdsCredentials,
  CollectionResult,
  ConnectionTestResult,
  CollectorOptions,
  PlatformCollector,
} from './types';

const NAVER_ADS_API_BASE = 'https://api.naver.com';

/**
 * 네이버 검색광고 API 서명 생성
 */
function generateSignature(
  timestamp: string,
  method: string,
  path: string,
  secretKey: string
): string {
  const message = `${timestamp}.${method}.${path}`;
  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(message);
  return hmac.digest('base64');
}

/**
 * 네이버 검색광고 API 요청
 */
async function naverAdsRequest<T>(
  credentials: NaverAdsCredentials,
  method: string,
  path: string,
  body?: Record<string, unknown>
): Promise<T> {
  const timestamp = String(Date.now());
  const signature = generateSignature(
    timestamp,
    method,
    path,
    credentials.secretKey
  );

  const headers: HeadersInit = {
    'Content-Type': 'application/json; charset=UTF-8',
    'X-Timestamp': timestamp,
    'X-API-KEY': credentials.accessLicense,
    'X-Customer': credentials.customerId,
    'X-Signature': signature,
  };

  const response = await fetch(`${NAVER_ADS_API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Naver Ads API error: ${response.status} - ${errorText}`);
  }

  return response.json() as Promise<T>;
}

// 캠페인 리스트 응답 타입
interface NaverCampaign {
  nccCampaignId: string;
  name: string;
  campaignTp: string;
  deliveryMethod: string;
  status: string;
}

// 통계 응답 타입
interface NaverStat {
  id: string;
  date?: string;
  impCnt: number;       // 노출수
  clkCnt: number;       // 클릭수
  salesAmt: number;     // 광고비
  convCnt?: number;     // 전환수
  convAmt?: number;     // 전환매출
  ctr?: number;         // CTR
  cpc?: number;         // CPC
}

/**
 * 네이버 검색광고 데이터 수집
 */
export async function collectNaverAdsData(
  credentials: NaverAdsCredentials,
  options: CollectorOptions
): Promise<CollectionResult> {
  const { userId, connectionId, startDate, endDate } = options;

  if (!credentials.customerId || !credentials.accessLicense || !credentials.secretKey) {
    return {
      success: false,
      message: '네이버 검색광고 자격 증명이 올바르지 않습니다.',
      recordCount: 0,
      data: [],
      error: 'Missing credentials',
    };
  }

  try {
    // 1. 캠페인 목록 조회
    const campaigns = await naverAdsRequest<NaverCampaign[]>(
      credentials,
      'GET',
      '/ncc/campaigns'
    );

    if (!campaigns || campaigns.length === 0) {
      return {
        success: true,
        message: '수집할 캠페인이 없습니다.',
        recordCount: 0,
        data: [],
      };
    }

    const campaignIds = campaigns.map(c => c.nccCampaignId);

    // 2. 캠페인별 통계 조회
    const statsResponse = await naverAdsRequest<{ data: NaverStat[] }>(
      credentials,
      'POST',
      '/stats',
      {
        id: credentials.customerId,
        fields: ['impCnt', 'clkCnt', 'salesAmt', 'convCnt', 'convAmt', 'ctr', 'cpc'],
        timeRange: {
          since: startDate,
          until: endDate,
        },
        breakdown: 'campaign',
        datePreset: 'CUSTOM',
      }
    );

    const adDataRecords: AdDataInsert[] = [];

    // 일별 통계 조회
    const dailyStatsResponse = await naverAdsRequest<{ data: NaverStat[] }>(
      credentials,
      'POST',
      '/stats',
      {
        id: credentials.customerId,
        fields: ['impCnt', 'clkCnt', 'salesAmt', 'convCnt', 'convAmt'],
        timeRange: {
          since: startDate,
          until: endDate,
        },
        breakdown: 'time',
        timeIncrement: 'day',
      }
    );

    // 캠페인 정보 매핑
    const campaignMap = new Map(campaigns.map(c => [c.nccCampaignId, c]));

    // 캠페인별 일별 데이터 수집
    for (const campaignId of campaignIds) {
      const campaign = campaignMap.get(campaignId);
      if (!campaign) continue;

      // 캠페인별 일별 통계
      const campaignDailyStats = await naverAdsRequest<{ data: NaverStat[] }>(
        credentials,
        'POST',
        '/stats',
        {
          id: campaignId,
          fields: ['impCnt', 'clkCnt', 'salesAmt', 'convCnt', 'convAmt'],
          timeRange: {
            since: startDate,
            until: endDate,
          },
          breakdown: 'time',
          timeIncrement: 'day',
        }
      );

      if (campaignDailyStats.data) {
        for (const stat of campaignDailyStats.data) {
          const spend = stat.salesAmt || 0;
          const revenue = stat.convAmt || 0;
          const impressions = stat.impCnt || 0;
          const clicks = stat.clkCnt || 0;
          const conversions = stat.convCnt || 0;

          const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
          const cvr = clicks > 0 ? (conversions / clicks) * 100 : 0;
          const roas = spend > 0 ? (revenue / spend) * 100 : null;

          const adData: AdDataInsert = {
            user_id: userId,
            platform_connection_id: connectionId,
            date: stat.date || startDate,
            campaign_id: campaignId,
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
              campaignType: campaign.campaignTp,
              status: campaign.status,
              ...stat,
            },
          };

          adDataRecords.push(adData);
        }
      }
    }

    return {
      success: true,
      message: `네이버 검색광고 데이터 수집 완료: ${adDataRecords.length}개 레코드`,
      recordCount: adDataRecords.length,
      data: adDataRecords,
    };
  } catch (error) {
    console.error('[Naver Ads Collector] Error:', error);
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
        message: '접근 권한이 없습니다. 광고주 ID와 권한을 확인해주세요.',
        recordCount: 0,
        data: [],
        error: 'FORBIDDEN',
      };
    }

    return {
      success: false,
      message: `네이버 검색광고 데이터 수집 실패: ${errorMessage}`,
      recordCount: 0,
      data: [],
      error: errorMessage,
    };
  }
}

/**
 * 네이버 검색광고 연결 테스트
 */
export async function testNaverAdsConnection(
  credentials: NaverAdsCredentials
): Promise<ConnectionTestResult> {
  if (!credentials.customerId || !credentials.accessLicense || !credentials.secretKey) {
    return {
      success: false,
      message: '광고주 ID, API 라이선스, 비밀 키가 모두 필요합니다.',
    };
  }

  try {
    // 캠페인 목록으로 연결 테스트
    await naverAdsRequest<NaverCampaign[]>(credentials, 'GET', '/ncc/campaigns');

    return {
      success: true,
      message: '네이버 검색광고 연결에 성공했습니다.',
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
      message: `네이버 검색광고 연결 실패: ${errorMessage}`,
    };
  }
}

/**
 * 네이버 검색광고 수집기
 */
export const naverAdsCollector: PlatformCollector<NaverAdsCredentials> = {
  platform: 'naver',
  collect: (credentials, options) => collectNaverAdsData(credentials, options),
  testConnection: testNaverAdsConnection,
};
