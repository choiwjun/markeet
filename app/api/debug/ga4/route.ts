/**
 * GA4 데이터 진단 API
 * GA4 연동 및 데이터 수집 상태를 확인합니다.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// 개발 환경에서만 접근 허용
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

interface ConnectionRow {
  id: string;
  platform: string;
  status: string;
  created_at: string;
  last_sync_at: string | null;
}

interface SyncJobRow {
  id: string;
  platform: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  error_message: string | null;
  result: Record<string, unknown> | null;
}

interface AdDataRow {
  id: string;
  date: string;
  campaign_name: string;
  spend: number;
  revenue: number;
  impressions: number;
  clicks: number;
  conversions: number;
  raw_data: Record<string, unknown> | null;
}

/**
 * GET /api/debug/ga4
 * GA4 연동 상태 및 데이터 진단
 */
export async function GET() {
  // 프로덕션 환경에서는 접근 차단
  if (!IS_DEVELOPMENT) {
    return NextResponse.json(
      { error: '이 API는 개발 환경에서만 사용할 수 있습니다.' },
      { status: 403 }
    );
  }

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

    // 1. GA4 플랫폼 연결 상태 확인
    const { data: connectionData, error: connectionError } = await supabase
      .from('platform_connections')
      .select('id, platform, status, created_at, last_sync_at')
      .eq('user_id', user.id)
      .eq('platform', 'ga4')
      .single();

    const connection = connectionData as ConnectionRow | null;

    if (connectionError || !connection) {
      return NextResponse.json({
        status: 'not_connected',
        message: 'GA4 플랫폼이 연동되지 않았습니다.',
        steps: [
          '1. 설정 > 플랫폼 연동 관리로 이동',
          '2. Google Analytics 4 선택',
          '3. Property ID와 서비스 계정 JSON 입력',
          '4. 연동 완료 후 동기화 실행',
        ],
      });
    }

    // 2. 최근 동기화 작업 확인
    const { data: syncJobsData } = await supabase
      .from('sync_jobs')
      .select('id, platform, status, started_at, completed_at, error_message, result')
      .eq('user_id', user.id)
      .eq('platform', 'ga4')
      .order('created_at', { ascending: false })
      .limit(5);

    const syncJobs = (syncJobsData || []) as SyncJobRow[];

    // 3. GA4 ad_data 레코드 수 확인
    const { count: totalRecords } = await supabase
      .from('ad_data')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('platform_connection_id', connection.id);

    // 4. 최근 GA4 데이터 샘플 조회
    const { data: recentDataRaw } = await supabase
      .from('ad_data')
      .select('id, date, campaign_name, spend, revenue, impressions, clicks, conversions, raw_data')
      .eq('user_id', user.id)
      .eq('platform_connection_id', connection.id)
      .order('date', { ascending: false })
      .limit(10);

    const recentData = (recentDataRaw || []) as AdDataRow[];

    // 5. 날짜별 데이터 분포
    const { data: dateDistributionRaw } = await supabase
      .from('ad_data')
      .select('date')
      .eq('user_id', user.id)
      .eq('platform_connection_id', connection.id)
      .order('date', { ascending: false });

    const dateDistribution = dateDistributionRaw as { date: string }[] | null;
    const uniqueDates = Array.from(new Set((dateDistribution || []).map(d => d.date)));

    // 진단 결과 생성
    const diagnosis = {
      connectionStatus: connection.status,
      connectionCreatedAt: connection.created_at,
      lastSyncAt: connection.last_sync_at,
      totalRecords: totalRecords || 0,
      dateRange: uniqueDates.length > 0 ? {
        oldest: uniqueDates[uniqueDates.length - 1],
        newest: uniqueDates[0],
        totalDays: uniqueDates.length,
      } : null,
    };

    // 문제 진단
    const issues: string[] = [];
    const recommendations: string[] = [];

    if (connection.status !== 'active') {
      issues.push(`연결 상태가 '${connection.status}'입니다. 'active'여야 합니다.`);
      recommendations.push('플랫폼 연동을 다시 설정해주세요.');
    }

    if (!connection.last_sync_at) {
      issues.push('동기화가 한 번도 실행되지 않았습니다.');
      recommendations.push('설정에서 수동 동기화를 실행해주세요.');
    }

    if (totalRecords === 0) {
      issues.push('수집된 데이터가 없습니다.');

      // 동기화 작업 결과 확인
      const lastJob = syncJobs[0];
      if (lastJob) {
        if (lastJob.status === 'failed') {
          issues.push(`마지막 동기화 실패: ${lastJob.error_message || '알 수 없는 오류'}`);
        } else if (lastJob.status === 'completed') {
          const result = lastJob.result;
          if (result && typeof result === 'object' && 'recordCount' in result) {
            issues.push(`마지막 동기화 결과: ${result.recordCount}개 레코드 수집됨`);
            if ((result.recordCount as number) === 0) {
              recommendations.push('GA4에 최근 7일간 데이터가 없을 수 있습니다.');
              recommendations.push('GA4 콘솔에서 직접 데이터가 있는지 확인해주세요.');
            }
          }
        }
      }

      recommendations.push('서비스 계정에 GA4 속성 조회 권한이 있는지 확인하세요.');
      recommendations.push('Property ID가 올바른지 확인하세요 (숫자만 입력).');
    }

    return NextResponse.json({
      status: issues.length === 0 ? 'healthy' : 'issues_found',
      userId: user.id,
      connection: {
        id: connection.id,
        status: connection.status,
        createdAt: connection.created_at,
        lastSyncAt: connection.last_sync_at,
      },
      data: {
        totalRecords: totalRecords || 0,
        dateRange: diagnosis.dateRange,
        recentSamples: recentData.map(d => ({
          date: d.date,
          campaignName: d.campaign_name,
          sessions: d.impressions, // GA4에서 impressions = sessions
          pageViews: d.clicks,     // GA4에서 clicks = pageViews
          conversions: d.conversions,
          revenue: d.revenue,
          rawData: d.raw_data,
        })),
      },
      syncHistory: syncJobs.map(job => ({
        id: job.id,
        status: job.status,
        startedAt: job.started_at,
        completedAt: job.completed_at,
        error: job.error_message,
        result: job.result,
      })),
      issues,
      recommendations,
    });
  } catch (error) {
    console.error('[Debug GA4 API] Error:', error);
    return NextResponse.json(
      { error: '진단 중 오류가 발생했습니다.', details: error instanceof Error ? error.message : '알 수 없는 오류' },
      { status: 500 }
    );
  }
}
