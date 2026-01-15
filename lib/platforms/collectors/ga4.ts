/**
 * Google Analytics 4 (GA4) 데이터 수집기
 *
 * Google Analytics Data API를 사용하여 GA4 데이터를 수집합니다.
 * 서비스 계정 JSON 키를 사용한 인증을 지원합니다.
 */

import { BetaAnalyticsDataClient } from '@google-analytics/data';
import type { AdDataInsert } from '@/types/database';

// GA4 자격 증명 타입
export interface GA4Credentials {
  propertyId: string;
  serviceAccountJson: string;
}

// GA4 수집 결과 타입
export interface GA4CollectionResult {
  success: boolean;
  message: string;
  recordCount: number;
  data: AdDataInsert[];
  error?: string;
}

// GA4 리포트 응답 행 타입
interface GA4ReportRow {
  dimensionValues?: Array<{ value?: string | null }>;
  metricValues?: Array<{ value?: string | null }>;
}

/**
 * GA4 데이터를 수집합니다.
 *
 * @param credentials - GA4 자격 증명 (propertyId, serviceAccountJson)
 * @param userId - 사용자 ID
 * @param connectionId - 플랫폼 연결 ID
 * @param startDate - 시작 날짜 (YYYY-MM-DD)
 * @param endDate - 종료 날짜 (YYYY-MM-DD)
 * @returns 수집 결과
 */
export async function collectGA4Data(
  credentials: GA4Credentials,
  userId: string,
  connectionId: string,
  startDate: string,
  endDate: string
): Promise<GA4CollectionResult> {
  const { propertyId, serviceAccountJson } = credentials;

  if (!propertyId || !serviceAccountJson) {
    return {
      success: false,
      message: 'Property ID와 서비스 계정 JSON이 필요합니다.',
      recordCount: 0,
      data: [],
      error: 'Missing credentials',
    };
  }

  try {
    // 서비스 계정 JSON 파싱
    let serviceAccountKey: { client_email?: string; private_key?: string };
    try {
      serviceAccountKey = JSON.parse(serviceAccountJson);
    } catch {
      return {
        success: false,
        message: '서비스 계정 JSON 형식이 올바르지 않습니다.',
        recordCount: 0,
        data: [],
        error: 'Invalid JSON format',
      };
    }

    // GA4 클라이언트 생성
    const analyticsDataClient = new BetaAnalyticsDataClient({
      credentials: {
        client_email: serviceAccountKey.client_email,
        private_key: serviceAccountKey.private_key,
      },
    });

    // GA4 리포트 요청
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate,
          endDate,
        },
      ],
      dimensions: [
        { name: 'date' },
        { name: 'sessionSource' },
        { name: 'sessionMedium' },
      ],
      metrics: [
        { name: 'sessions' },           // 세션수 (impressions 대용)
        { name: 'totalUsers' },         // 사용자수
        { name: 'screenPageViews' },    // 페이지뷰 (clicks 대용)
        { name: 'conversions' },        // 전환수
        { name: 'totalRevenue' },       // 총 수익
      ],
    });

    // 응답 데이터 변환
    const adDataRecords: AdDataInsert[] = [];

    if (response.rows && response.rows.length > 0) {
      for (const row of response.rows as GA4ReportRow[]) {
        const dimensions = row.dimensionValues || [];
        const metrics = row.metricValues || [];

        // 날짜 형식 변환 (YYYYMMDD -> YYYY-MM-DD)
        const rawDate = dimensions[0]?.value || '';
        const formattedDate = rawDate.length === 8
          ? `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`
          : rawDate;

        const source = dimensions[1]?.value || '(direct)';
        const medium = dimensions[2]?.value || '(none)';

        const sessions = parseInt(metrics[0]?.value || '0', 10);
        const users = parseInt(metrics[1]?.value || '0', 10);
        const pageViews = parseInt(metrics[2]?.value || '0', 10);
        const conversions = parseInt(metrics[3]?.value || '0', 10);
        const revenue = parseFloat(metrics[4]?.value || '0');

        // CTR, CVR, ROAS 계산 (GA4는 광고비 데이터가 없으므로 0으로 설정)
        const ctr = sessions > 0 ? (pageViews / sessions) * 100 : 0;
        const cvr = pageViews > 0 ? (conversions / pageViews) * 100 : 0;
        // GA4는 광고비 데이터가 없으므로 ROAS는 null

        const adData: AdDataInsert = {
          user_id: userId,
          platform_connection_id: connectionId,
          date: formattedDate,
          campaign_id: `${source}/${medium}`,
          campaign_name: `${source} / ${medium}`,
          spend: 0, // GA4는 광고비 데이터가 없음
          revenue,
          impressions: sessions,
          clicks: pageViews,
          conversions,
          ctr,
          cvr,
          roas: null, // 광고비가 없으므로 ROAS 계산 불가
          raw_data: {
            source,
            medium,
            sessions,
            users,
            pageViews,
            conversions,
            revenue,
          },
        };

        adDataRecords.push(adData);
      }
    }

    return {
      success: true,
      message: `GA4 데이터 수집 완료: ${adDataRecords.length}개 레코드`,
      recordCount: adDataRecords.length,
      data: adDataRecords,
    };
  } catch (error) {
    console.error('[GA4 Collector] Error:', error);

    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';

    // 구체적인 에러 메시지 반환
    if (errorMessage.includes('PERMISSION_DENIED')) {
      return {
        success: false,
        message: 'GA4 접근 권한이 없습니다. 서비스 계정에 GA4 속성 접근 권한을 부여해주세요.',
        recordCount: 0,
        data: [],
        error: 'PERMISSION_DENIED',
      };
    }

    if (errorMessage.includes('NOT_FOUND')) {
      return {
        success: false,
        message: 'GA4 속성을 찾을 수 없습니다. Property ID를 확인해주세요.',
        recordCount: 0,
        data: [],
        error: 'NOT_FOUND',
      };
    }

    if (errorMessage.includes('INVALID_ARGUMENT')) {
      return {
        success: false,
        message: '잘못된 요청입니다. Property ID 형식을 확인해주세요.',
        recordCount: 0,
        data: [],
        error: 'INVALID_ARGUMENT',
      };
    }

    return {
      success: false,
      message: `GA4 데이터 수집 실패: ${errorMessage}`,
      recordCount: 0,
      data: [],
      error: errorMessage,
    };
  }
}

/**
 * GA4 연결을 테스트합니다.
 */
export async function testGA4Connection(
  credentials: GA4Credentials
): Promise<{ success: boolean; message: string }> {
  const { propertyId, serviceAccountJson } = credentials;

  if (!propertyId || !serviceAccountJson) {
    return {
      success: false,
      message: 'Property ID와 서비스 계정 JSON이 필요합니다.',
    };
  }

  try {
    let serviceAccountKey: { client_email?: string; private_key?: string };
    try {
      serviceAccountKey = JSON.parse(serviceAccountJson);
    } catch {
      return {
        success: false,
        message: '서비스 계정 JSON 형식이 올바르지 않습니다.',
      };
    }

    const analyticsDataClient = new BetaAnalyticsDataClient({
      credentials: {
        client_email: serviceAccountKey.client_email,
        private_key: serviceAccountKey.private_key,
      },
    });

    // 간단한 테스트 쿼리 실행
    await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
      metrics: [{ name: 'sessions' }],
      limit: 1,
    });

    return {
      success: true,
      message: 'GA4 연결에 성공했습니다.',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';

    if (errorMessage.includes('PERMISSION_DENIED')) {
      return {
        success: false,
        message: 'GA4 접근 권한이 없습니다. 서비스 계정에 GA4 속성 접근 권한을 부여해주세요.',
      };
    }

    if (errorMessage.includes('NOT_FOUND')) {
      return {
        success: false,
        message: 'GA4 속성을 찾을 수 없습니다. Property ID를 확인해주세요.',
      };
    }

    return {
      success: false,
      message: `GA4 연결 실패: ${errorMessage}`,
    };
  }
}
