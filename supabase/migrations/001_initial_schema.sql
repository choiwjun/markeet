-- ============================================
-- Markeet (마케트) Initial Database Schema
-- Migration: 001_initial_schema.sql
-- Version: 1.0
-- Created: 2026-01-14
-- ============================================

-- UUID 확장 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. users 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    encrypted_password TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    subscription_plan VARCHAR(50) DEFAULT 'free' CHECK (subscription_plan IN ('free', 'starter', 'pro', 'enterprise')),
    subscription_expires_at TIMESTAMP WITH TIME ZONE
);

-- users 인덱스
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_subscription ON users(subscription_plan);

COMMENT ON TABLE users IS '사용자 계정 테이블';
COMMENT ON COLUMN users.id IS '사용자 고유 ID (UUID)';
COMMENT ON COLUMN users.email IS '이메일 (로그인 ID)';
COMMENT ON COLUMN users.encrypted_password IS '암호화된 비밀번호 (Supabase Auth 처리)';
COMMENT ON COLUMN users.created_at IS '가입일시';
COMMENT ON COLUMN users.last_login IS '마지막 로그인 시간';
COMMENT ON COLUMN users.subscription_plan IS '구독 플랜 (free/starter/pro/enterprise)';
COMMENT ON COLUMN users.subscription_expires_at IS '구독 만료일';

-- ============================================
-- 2. platform_connections 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS platform_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL CHECK (platform IN (
        'naver', 'google', 'meta', 'coupang', 'gmarket',
        'eleventh', 'kakao', 'naver_store', 'ga4', 'naver_analytics'
    )),
    api_key_encrypted TEXT,
    api_config JSONB,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'error')),
    last_sync_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, platform)
);

-- platform_connections 인덱스
CREATE INDEX IF NOT EXISTS idx_platform_connections_user ON platform_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_platform_connections_user_platform ON platform_connections(user_id, platform);
CREATE INDEX IF NOT EXISTS idx_platform_connections_user_status ON platform_connections(user_id, status);

COMMENT ON TABLE platform_connections IS '플랫폼 연동 정보 테이블';
COMMENT ON COLUMN platform_connections.id IS '연동 고유 ID';
COMMENT ON COLUMN platform_connections.user_id IS '소유자 ID (FK → users)';
COMMENT ON COLUMN platform_connections.platform IS '플랫폼 코드';
COMMENT ON COLUMN platform_connections.api_key_encrypted IS '암호화된 API 키 (Supabase Vault)';
COMMENT ON COLUMN platform_connections.api_config IS '플랫폼별 추가 설정 (JSON)';
COMMENT ON COLUMN platform_connections.status IS '연동 상태 (active/expired/error)';
COMMENT ON COLUMN platform_connections.last_sync_at IS '마지막 동기화 시간';
COMMENT ON COLUMN platform_connections.created_at IS '연동 생성일';

-- ============================================
-- 3. ad_data 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS ad_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    platform_connection_id UUID NOT NULL REFERENCES platform_connections(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    campaign_id VARCHAR(255),
    campaign_name VARCHAR(500),
    spend DECIMAL(12,2) DEFAULT 0,
    revenue DECIMAL(12,2) DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    ctr DECIMAL(5,2),
    cvr DECIMAL(5,2),
    roas DECIMAL(8,2),
    raw_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ad_data 인덱스
CREATE INDEX IF NOT EXISTS idx_ad_data_user_date ON ad_data(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_ad_data_platform_date ON ad_data(platform_connection_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_ad_data_user_campaign ON ad_data(user_id, campaign_id);
CREATE INDEX IF NOT EXISTS idx_ad_data_date ON ad_data(date DESC);

COMMENT ON TABLE ad_data IS '광고 데이터 테이블 (일별 집계)';
COMMENT ON COLUMN ad_data.id IS '데이터 레코드 ID';
COMMENT ON COLUMN ad_data.user_id IS '소유자 ID (FK → users)';
COMMENT ON COLUMN ad_data.platform_connection_id IS '데이터 출처 (FK → platform_connections)';
COMMENT ON COLUMN ad_data.date IS '데이터 날짜 (일별 집계)';
COMMENT ON COLUMN ad_data.campaign_id IS '캠페인 ID (플랫폼 제공)';
COMMENT ON COLUMN ad_data.campaign_name IS '캠페인명';
COMMENT ON COLUMN ad_data.spend IS '광고비 (원화)';
COMMENT ON COLUMN ad_data.revenue IS '매출 (원화)';
COMMENT ON COLUMN ad_data.impressions IS '노출수';
COMMENT ON COLUMN ad_data.clicks IS '클릭수';
COMMENT ON COLUMN ad_data.conversions IS '전환수';
COMMENT ON COLUMN ad_data.ctr IS '클릭률 (%)';
COMMENT ON COLUMN ad_data.cvr IS '전환율 (%)';
COMMENT ON COLUMN ad_data.roas IS 'ROAS (매출/광고비)';
COMMENT ON COLUMN ad_data.raw_data IS '원본 API 응답 (디버깅용)';
COMMENT ON COLUMN ad_data.created_at IS '수집 시각';

-- ============================================
-- 4. reports 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('weekly', 'monthly', 'custom')),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    data_summary JSONB,
    insights JSONB,
    pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- reports 인덱스
CREATE INDEX IF NOT EXISTS idx_reports_user ON reports(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_user_type ON reports(user_id, type);

COMMENT ON TABLE reports IS '생성된 리포트 테이블';
COMMENT ON COLUMN reports.id IS '리포트 ID';
COMMENT ON COLUMN reports.user_id IS '소유자 ID (FK → users)';
COMMENT ON COLUMN reports.type IS '리포트 유형 (weekly/monthly/custom)';
COMMENT ON COLUMN reports.period_start IS '리포트 시작 날짜';
COMMENT ON COLUMN reports.period_end IS '리포트 종료 날짜';
COMMENT ON COLUMN reports.data_summary IS '집계된 데이터 (JSON)';
COMMENT ON COLUMN reports.insights IS 'AI 생성 인사이트 (JSON)';
COMMENT ON COLUMN reports.pdf_url IS 'Supabase Storage 경로';
COMMENT ON COLUMN reports.created_at IS '생성 시각';

-- ============================================
-- 5. chat_history 테이블 (Phase 2)
-- ============================================
CREATE TABLE IF NOT EXISTS chat_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    sql_query TEXT,
    chart_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- chat_history 인덱스
CREATE INDEX IF NOT EXISTS idx_chat_history_user ON chat_history(user_id, created_at DESC);

COMMENT ON TABLE chat_history IS '자연어 질의 기록 테이블';
COMMENT ON COLUMN chat_history.id IS '대화 ID';
COMMENT ON COLUMN chat_history.user_id IS '질문자 ID (FK → users)';
COMMENT ON COLUMN chat_history.question IS '사용자 질문';
COMMENT ON COLUMN chat_history.answer IS 'AI 답변';
COMMENT ON COLUMN chat_history.sql_query IS '실행된 SQL (디버깅용)';
COMMENT ON COLUMN chat_history.chart_data IS '생성된 차트 데이터 (JSON)';
COMMENT ON COLUMN chat_history.created_at IS '질문 시각';

-- ============================================
-- 마이그레이션 완료 메시지
-- ============================================
DO $$
BEGIN
    RAISE NOTICE 'Migration 001_initial_schema.sql completed successfully';
END $$;
