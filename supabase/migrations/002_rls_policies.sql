-- ============================================
-- Markeet (마케트) Row-Level Security Policies
-- Migration: 002_rls_policies.sql
-- Version: 1.0
-- Created: 2026-01-14
-- ============================================

-- ============================================
-- RLS 활성화
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 1. users 테이블 정책
-- ============================================

-- 사용자는 자신의 계정만 조회 가능
CREATE POLICY "Users can view own account"
ON users FOR SELECT
USING (auth.uid() = id);

-- 사용자는 자신의 계정 정보만 수정 가능
CREATE POLICY "Users can update own account"
ON users FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 회원가입 시 자신의 계정 생성 가능
CREATE POLICY "Users can insert own account"
ON users FOR INSERT
WITH CHECK (auth.uid() = id);

-- ============================================
-- 2. platform_connections 테이블 정책
-- ============================================

-- 사용자는 자신의 플랫폼 연동만 조회 가능
CREATE POLICY "Users can view own connections"
ON platform_connections FOR SELECT
USING (auth.uid() = user_id);

-- 사용자는 자신의 플랫폼 연동만 생성 가능
CREATE POLICY "Users can insert own connections"
ON platform_connections FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 플랫폼 연동만 수정 가능
CREATE POLICY "Users can update own connections"
ON platform_connections FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 플랫폼 연동만 삭제 가능
CREATE POLICY "Users can delete own connections"
ON platform_connections FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- 3. ad_data 테이블 정책
-- ============================================

-- 사용자는 자신의 광고 데이터만 조회 가능
CREATE POLICY "Users can view own ad data"
ON ad_data FOR SELECT
USING (auth.uid() = user_id);

-- 사용자는 자신의 광고 데이터만 생성 가능
CREATE POLICY "Users can insert own ad data"
ON ad_data FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 광고 데이터만 수정 가능
CREATE POLICY "Users can update own ad data"
ON ad_data FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 광고 데이터만 삭제 가능
CREATE POLICY "Users can delete own ad data"
ON ad_data FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- 4. reports 테이블 정책
-- ============================================

-- 사용자는 자신의 리포트만 조회 가능
CREATE POLICY "Users can view own reports"
ON reports FOR SELECT
USING (auth.uid() = user_id);

-- 사용자는 자신의 리포트만 생성 가능
CREATE POLICY "Users can insert own reports"
ON reports FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 리포트만 수정 가능
CREATE POLICY "Users can update own reports"
ON reports FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 리포트만 삭제 가능
CREATE POLICY "Users can delete own reports"
ON reports FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- 5. chat_history 테이블 정책
-- ============================================

-- 사용자는 자신의 대화 기록만 조회 가능
CREATE POLICY "Users can view own chat history"
ON chat_history FOR SELECT
USING (auth.uid() = user_id);

-- 사용자는 자신의 대화 기록만 생성 가능
CREATE POLICY "Users can insert own chat history"
ON chat_history FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 대화 기록만 수정 가능
CREATE POLICY "Users can update own chat history"
ON chat_history FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 대화 기록만 삭제 가능
CREATE POLICY "Users can delete own chat history"
ON chat_history FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- Service Role 정책 (서버 사이드 전용)
-- ============================================
-- Note: Service Role Key를 사용하면 RLS를 우회할 수 있음
-- 백그라운드 작업(데이터 수집 등)에서 사용

-- ============================================
-- 마이그레이션 완료 메시지
-- ============================================
DO $$
BEGIN
    RAISE NOTICE 'Migration 002_rls_policies.sql completed successfully';
    RAISE NOTICE 'RLS enabled on all tables: users, platform_connections, ad_data, reports, chat_history';
END $$;
