/**
 * Meta (Facebook/Instagram) Ads 데이터 수집기
 *
 * Meta Marketing API를 사용하여 광고 데이터를 수집합니다.
 * API 문서: https://developers.facebook.com/docs/marketing-apis
 */

import type { AdDataInsert } from '@/types/database';
import type {
  MetaAdsCredentials,
  CollectionResult,
  ConnectionTestResult,
  CollectorOptions,
  PlatformCollector,
} from './types';

const META_API_VERSION = 'v18.0';
const META_API_BASE = `https://graph.facebook.com/${META_API_VERSION}`;

/**
 * Meta API 요청
 */
async function metaApiRequest<T>(
  endpoint: string,
  accessToken: string,
  params?: Record<string, string>
): Promise<T> {
  const url = new URL(`${META_API_BASE}${endpoint}`);
  url.searchParams.set('access_token', accessToken);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    const errorData = await response.json() as { error?: { message?: string; code?: number } };
    throw new Error(
      `Meta API error: ${errorData.error?.message || response.statusText} (code: ${errorData.error?.code})`
    );
  }

  return response.json() as Promise<T>;
}

// Meta API 응답 타입
interface MetaCampaign {
  id: string;
  name: string;
  status: string;
  objective: string;
}

interface MetaInsights {
  date_start: string;
  date_stop: string;
  campaign_id: string;
  campaign_name: string;
  impressions: string;
  clicks: string;
  spend: string;
  actions?: Array<{
    action_type: string;
    value: string;
  }>;
  action_values?: Array<{
    action_type: string;
    value: string;
  }>;
  ctr: string;
  cpc: string;
}

interface MetaInsightsResponse {
  data: MetaInsights[];
  paging?: {
    cursors: { after: string };
    next?: string;
  };
}

interface MetaCampaignsResponse {
  data: MetaCampaign[];
}

/**
 * Meta Ads 데이터 수집
 */
export async function collectMetaAdsData(
  credentials: MetaAdsCredentials,
  options: CollectorOptions
): Promise<CollectionResult> {
  const { userId, connectionId, startDate, endDate } = options;

  if (!credentials.accessToken || !credentials.adAccountId) {
    return {
      success: false,
      message: 'Meta Ads 자격 증명이 올바르지 않습니다.',
      recordCount: 0,
      data: [],
      error: 'Missing credentials',
    };
  }

  // 광고 계정 ID 형식 확인 (act_ 접두사)
  const adAccountId = credentials.adAccountId.startsWith('act_')
    ? credentials.adAccountId
    : `act_${credentials.adAccountId}`;

  try {
    // 캠페인 인사이트 조회
    const insights = await metaApiRequest<MetaInsightsResponse>(
      `/${adAccountId}/insights`,
      credentials.accessToken,
      {
        level: 'campaign',
        fields: 'campaign_id,campaign_name,impressions,clicks,spend,actions,action_values,ctr,cpc',
        time_range: JSON.stringify({
          since: startDate,
          until: endDate,
        }),
        time_increment: '1', // 일별 데이터
      }
    );

    const adDataRecords: AdDataInsert[] = [];

    // 페이지네이션 처리
    let currentInsights = insights;
    while (currentInsights.data) {
      for (const insight of currentInsights.data) {
        // 전환 및 매출 추출
        let conversions = 0;
        let revenue = 0;

        if (insight.actions) {
          // purchase 또는 offsite_conversion 액션 찾기
          const purchaseAction = insight.actions.find(
            a => a.action_type === 'purchase' || a.action_type === 'offsite_conversion.fb_pixel_purchase'
          );
          if (purchaseAction) {
            conversions = parseInt(purchaseAction.value, 10);
          }
        }

        if (insight.action_values) {
          // 매출액 추출
          const purchaseValue = insight.action_values.find(
            a => a.action_type === 'purchase' || a.action_type === 'offsite_conversion.fb_pixel_purchase'
          );
          if (purchaseValue) {
            revenue = parseFloat(purchaseValue.value);
          }
        }

        const spend = parseFloat(insight.spend || '0');
        const impressions = parseInt(insight.impressions || '0', 10);
        const clicks = parseInt(insight.clicks || '0', 10);
        const ctr = parseFloat(insight.ctr || '0');
        const cvr = clicks > 0 ? (conversions / clicks) * 100 : 0;
        const roas = spend > 0 ? (revenue / spend) * 100 : null;

        const adData: AdDataInsert = {
          user_id: userId,
          platform_connection_id: connectionId,
          date: insight.date_start,
          campaign_id: insight.campaign_id,
          campaign_name: insight.campaign_name,
          spend,
          revenue,
          impressions,
          clicks,
          conversions,
          ctr,
          cvr,
          roas,
          raw_data: {
            dateStart: insight.date_start,
            dateStop: insight.date_stop,
            cpc: insight.cpc,
            actions: insight.actions,
            actionValues: insight.action_values,
          },
        };

        adDataRecords.push(adData);
      }

      // 다음 페이지 확인
      if (currentInsights.paging?.next) {
        const nextResponse = await fetch(currentInsights.paging.next);
        if (nextResponse.ok) {
          currentInsights = await nextResponse.json() as MetaInsightsResponse;
        } else {
          break;
        }
      } else {
        break;
      }
    }

    return {
      success: true,
      message: `Meta Ads 데이터 수집 완료: ${adDataRecords.length}개 레코드`,
      recordCount: adDataRecords.length,
      data: adDataRecords,
    };
  } catch (error) {
    console.error('[Meta Ads Collector] Error:', error);
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';

    if (errorMessage.includes('190') || errorMessage.includes('OAuthException')) {
      return {
        success: false,
        message: '액세스 토큰이 만료되었습니다. 토큰을 다시 발급받아주세요.',
        recordCount: 0,
        data: [],
        error: 'TOKEN_EXPIRED',
      };
    }

    if (errorMessage.includes('100') || errorMessage.includes('Invalid parameter')) {
      return {
        success: false,
        message: '광고 계정 ID가 올바르지 않습니다.',
        recordCount: 0,
        data: [],
        error: 'INVALID_AD_ACCOUNT',
      };
    }

    if (errorMessage.includes('270') || errorMessage.includes('permission')) {
      return {
        success: false,
        message: '광고 계정에 대한 접근 권한이 없습니다.',
        recordCount: 0,
        data: [],
        error: 'PERMISSION_DENIED',
      };
    }

    return {
      success: false,
      message: `Meta Ads 데이터 수집 실패: ${errorMessage}`,
      recordCount: 0,
      data: [],
      error: errorMessage,
    };
  }
}

/**
 * Meta Ads 연결 테스트
 */
export async function testMetaAdsConnection(
  credentials: MetaAdsCredentials
): Promise<ConnectionTestResult> {
  if (!credentials.accessToken || !credentials.adAccountId) {
    return {
      success: false,
      message: '액세스 토큰과 광고 계정 ID가 필요합니다.',
    };
  }

  const adAccountId = credentials.adAccountId.startsWith('act_')
    ? credentials.adAccountId
    : `act_${credentials.adAccountId}`;

  try {
    // 광고 계정 정보 조회
    await metaApiRequest<{ id: string; name: string }>(
      `/${adAccountId}`,
      credentials.accessToken,
      { fields: 'id,name,account_status' }
    );

    return {
      success: true,
      message: 'Meta Ads 연결에 성공했습니다.',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';

    if (errorMessage.includes('190')) {
      return {
        success: false,
        message: '액세스 토큰이 만료되었거나 유효하지 않습니다.',
      };
    }

    return {
      success: false,
      message: `Meta Ads 연결 실패: ${errorMessage}`,
    };
  }
}

/**
 * Meta Ads 수집기
 */
export const metaAdsCollector: PlatformCollector<MetaAdsCredentials> = {
  platform: 'meta',
  collect: (credentials, options) => collectMetaAdsData(credentials, options),
  testConnection: testMetaAdsConnection,
};
