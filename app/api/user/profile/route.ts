/**
 * 프로필 API
 * TASK-1101: 프로필 설정 페이지
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Profile, ProfileUpdate } from '@/types/database';

/**
 * GET /api/user/profile
 * 현재 사용자 프로필 조회
 */
export async function GET() {
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

    // 프로필 조회
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (fetchError) {
      // 프로필이 없으면 생성
      if (fetchError.code === 'PGRST116') {
        const newProfile = {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || '',
          avatar_url: null,
          company_name: null,
          phone: null,
          timezone: 'Asia/Seoul',
        };

        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert(newProfile as never)
          .select()
          .single();

        if (createError) {
          console.error('[Profile API] Create error:', createError);
          return NextResponse.json(
            { error: '프로필 생성에 실패했습니다.' },
            { status: 500 }
          );
        }

        return NextResponse.json(createdProfile as Profile);
      }

      console.error('[Profile API] Fetch error:', fetchError);
      return NextResponse.json(
        { error: '프로필 조회에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json(profile as Profile);
  } catch (error) {
    console.error('[Profile API] GET error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/user/profile
 * 프로필 수정
 */
export async function PATCH(request: NextRequest) {
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

    // 요청 데이터 파싱
    const body = await request.json();
    const updates: ProfileUpdate = {};

    // 허용된 필드만 업데이트
    if (typeof body.full_name === 'string') {
      updates.full_name = body.full_name.trim();
    }
    if (typeof body.company_name === 'string') {
      updates.company_name = body.company_name.trim() || null;
    }
    if (typeof body.phone === 'string') {
      updates.phone = body.phone.trim() || null;
    }
    if (typeof body.timezone === 'string') {
      updates.timezone = body.timezone;
    }
    if (typeof body.avatar_url === 'string' || body.avatar_url === null) {
      updates.avatar_url = body.avatar_url;
    }

    // 업데이트할 내용이 없으면 현재 프로필 반환
    if (Object.keys(updates).length === 0) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      return NextResponse.json(profile);
    }

    // 프로필 업데이트
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update(updates as never)
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('[Profile API] Update error:', updateError);
      return NextResponse.json(
        { error: '프로필 수정에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedProfile as Profile);
  } catch (error) {
    console.error('[Profile API] PATCH error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
