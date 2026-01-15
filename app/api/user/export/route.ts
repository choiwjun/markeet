/**
 * 데이터 내보내기 API
 * TASK-1106: 데이터 내보내기 기능
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/user/export
 * 사용자 데이터 CSV/JSON 내보내기
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

    // 쿼리 파라미터
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';
    const dataType = searchParams.get('type') || 'all';

    const userId = user.id;
    const exportData: Record<string, unknown> = {};

    // 프로필 데이터
    if (dataType === 'all' || dataType === 'profile') {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      exportData.profile = profile;
    }

    // 플랫폼 연결 데이터
    if (dataType === 'all' || dataType === 'connections') {
      const { data: connections } = await supabase
        .from('platform_connections')
        .select('id, platform, status, created_at, last_sync_at')
        .eq('user_id', userId);
      exportData.connections = connections || [];
    }

    // 광고 성과 데이터
    if (dataType === 'all' || dataType === 'performance') {
      const { data: performance } = await supabase
        .from('ad_performance')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(10000);
      exportData.performance = performance || [];
    }

    // 리포트 데이터
    if (dataType === 'all' || dataType === 'reports') {
      const { data: reports } = await supabase
        .from('reports')
        .select('id, title, type, status, period_start, period_end, platforms, data_summary, ai_insights, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      exportData.reports = reports || [];
    }

    // 알림 설정
    if (dataType === 'all' || dataType === 'settings') {
      const { data: notificationSettings } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', userId)
        .single();
      exportData.notificationSettings = notificationSettings;
    }

    // AI 채팅 히스토리
    if (dataType === 'all' || dataType === 'chat') {
      const { data: chatHistory } = await supabase
        .from('chat_history')
        .select('id, question, answer, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      exportData.chatHistory = chatHistory || [];
    }

    // 메타데이터 추가
    exportData.metadata = {
      exportedAt: new Date().toISOString(),
      userId: userId,
      email: user.email,
      format: format,
      dataType: dataType,
    };

    // JSON 형식 반환
    if (format === 'json') {
      const jsonString = JSON.stringify(exportData, null, 2);
      return new NextResponse(jsonString, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="markeet-export-${new Date().toISOString().split('T')[0]}.json"`,
        },
      });
    }

    // CSV 형식 반환 (광고 성과 데이터만)
    if (format === 'csv') {
      const performanceData = (exportData.performance as Record<string, unknown>[]) || [];

      if (performanceData.length === 0) {
        return NextResponse.json(
          { error: '내보낼 데이터가 없습니다.' },
          { status: 404 }
        );
      }

      // CSV 헤더
      const headers = [
        'date',
        'platform',
        'campaign_name',
        'spend',
        'revenue',
        'impressions',
        'clicks',
        'conversions',
        'ctr',
        'cvr',
        'roas',
      ];

      // CSV 데이터 생성
      const csvRows = [headers.join(',')];

      for (const row of performanceData) {
        const values = headers.map((header) => {
          const value = row[header];
          if (value === null || value === undefined) return '';
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`;
          }
          return String(value);
        });
        csvRows.push(values.join(','));
      }

      const csvString = csvRows.join('\n');

      return new NextResponse(csvString, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="markeet-performance-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    return NextResponse.json(
      { error: '지원하지 않는 형식입니다.' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[Export API] Error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
