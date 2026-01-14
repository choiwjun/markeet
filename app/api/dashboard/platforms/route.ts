/**
 * 플랫폼별 데이터 조회 API
 * TASK-515: 플랫폼별 집계 데이터 반환
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { PlatformCode } from '@/types/database';

// 플랫폼별 데이터 타입
interface PlatformMetrics {
  platform: PlatformCode;
  spend: number;
  revenue: number;
  roas: number;
  clicks: number;
  conversions: number;
}

// 응답 타입
interface PlatformResponse {
  data: PlatformMetrics[];
  period: {
    startDate: string;
    endDate: string;
  };
}

/**
 * 날짜 문자열 유효성 검사
 */
function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * GET /api/dashboard/platforms
 * 플랫폼별 집계 데이터 조회
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 현재 사용자 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 쿼리 파라미터 파싱
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    // 날짜 파라미터 검증
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'start_date와 end_date 파라미터가 필요합니다.' },
        { status: 400 }
      );
    }

    if (!isValidDate(startDate) || !isValidDate(endDate)) {
      return NextResponse.json(
        { error: '날짜 형식이 올바르지 않습니다. (YYYY-MM-DD)' },
        { status: 400 }
      );
    }

    // 플랫폼 연결 정보 가져오기
    const { data: connections, error: connectionsError } = await supabase
      .from('platform_connections')
      .select('id, platform')
      .eq('user_id', user.id)
      .eq('status', 'active');

    if (connectionsError) {
      console.error('[Platform API] Connections query error:', connectionsError);
      return NextResponse.json(
        { error: '플랫폼 연결 정보 조회에 실패했습니다.' },
        { status: 500 }
      );
    }

    if (!connections || connections.length === 0) {
      // 연결된 플랫폼이 없는 경우 빈 배열 반환
      const response: PlatformResponse = {
        data: [],
        period: { startDate, endDate },
      };
      return NextResponse.json(response);
    }

    // 연결 ID 목록
    const connectionIds = connections.map((c) => c.id);

    // 플랫폼별 광고 데이터 집계
    const { data: adData, error: adDataError } = await supabase
      .from('ad_data')
      .select('platform_connection_id, spend, revenue, roas, clicks, conversions')
      .eq('user_id', user.id)
      .in('platform_connection_id', connectionIds)
      .gte('date', startDate)
      .lte('date', endDate);

    if (adDataError) {
      console.error('[Platform API] Ad data query error:', adDataError);
      return NextResponse.json(
        { error: '광고 데이터 조회에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 플랫폼별 집계
    const platformMap = new Map<string, { connectionId: string; platform: PlatformCode }>();
    connections.forEach((c) => {
      platformMap.set(c.id, { connectionId: c.id, platform: c.platform as PlatformCode });
    });

    const aggregatedData = new Map<PlatformCode, {
      spend: number;
      revenue: number;
      roasSum: number;
      roasCount: number;
      clicks: number;
      conversions: number;
    }>();

    if (adData) {
      for (const row of adData) {
        const connectionInfo = platformMap.get(row.platform_connection_id);
        if (!connectionInfo) continue;

        const platform = connectionInfo.platform;

        if (!aggregatedData.has(platform)) {
          aggregatedData.set(platform, {
            spend: 0,
            revenue: 0,
            roasSum: 0,
            roasCount: 0,
            clicks: 0,
            conversions: 0,
          });
        }

        const agg = aggregatedData.get(platform)!;
        agg.spend += Number(row.spend) || 0;
        agg.revenue += Number(row.revenue) || 0;
        agg.clicks += Number(row.clicks) || 0;
        agg.conversions += Number(row.conversions) || 0;

        if (row.roas !== null) {
          agg.roasSum += Number(row.roas);
          agg.roasCount++;
        }
      }
    }

    // 응답 데이터 구성
    const platformMetrics: PlatformMetrics[] = [];

    for (const [platform, agg] of aggregatedData.entries()) {
      let avgRoas = 0;
      if (agg.roasCount > 0) {
        avgRoas = agg.roasSum / agg.roasCount;
      } else if (agg.spend > 0) {
        avgRoas = agg.revenue / agg.spend;
      }

      platformMetrics.push({
        platform,
        spend: agg.spend,
        revenue: agg.revenue,
        roas: avgRoas,
        clicks: agg.clicks,
        conversions: agg.conversions,
      });
    }

    // 광고비 기준 내림차순 정렬
    platformMetrics.sort((a, b) => b.spend - a.spend);

    const response: PlatformResponse = {
      data: platformMetrics,
      period: { startDate, endDate },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Platform API] Error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
