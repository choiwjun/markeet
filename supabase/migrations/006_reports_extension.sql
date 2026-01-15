-- M10: 리포트 생성
-- TASK-1001: 리포트 데이터베이스 테이블 확장

-- 리포트 상태 enum 추가
DO $$ BEGIN
  CREATE TYPE report_status AS ENUM ('draft', 'generating', 'completed', 'failed');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- reports 테이블에 새 컬럼 추가
ALTER TABLE reports
  ADD COLUMN IF NOT EXISTS title TEXT DEFAULT '리포트',
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'completed',
  ADD COLUMN IF NOT EXISTS platforms TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS share_token UUID DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS share_expires_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS template TEXT DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS ai_insights TEXT DEFAULT NULL;

-- 공유 토큰 인덱스 (공유 링크 조회용)
CREATE INDEX IF NOT EXISTS idx_reports_share_token ON reports(share_token) WHERE share_token IS NOT NULL;

-- 사용자별 리포트 목록 조회 인덱스
CREATE INDEX IF NOT EXISTS idx_reports_user_created ON reports(user_id, created_at DESC);

-- 리포트 공유 링크로 조회하는 함수
CREATE OR REPLACE FUNCTION get_report_by_share_token(token UUID)
RETURNS SETOF reports AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM reports
  WHERE share_token = token
    AND is_public = TRUE
    AND (share_expires_at IS NULL OR share_expires_at > NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 리포트 공유 RLS 정책 추가 (공유 토큰으로 접근 허용)
DROP POLICY IF EXISTS "Public can view shared reports" ON reports;
CREATE POLICY "Public can view shared reports" ON reports
  FOR SELECT
  USING (
    is_public = TRUE
    AND share_token IS NOT NULL
    AND (share_expires_at IS NULL OR share_expires_at > NOW())
  );

-- 자동 리포트 생성 히스토리 테이블
CREATE TABLE IF NOT EXISTS report_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  schedule_type TEXT NOT NULL DEFAULT 'weekly', -- 'weekly', 'monthly'
  platforms TEXT[] DEFAULT ARRAY[]::TEXT[],
  send_email BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  last_run_at TIMESTAMPTZ DEFAULT NULL,
  next_run_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE report_schedules ENABLE ROW LEVEL SECURITY;

-- report_schedules RLS 정책
CREATE POLICY "Users can view own schedules" ON report_schedules
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own schedules" ON report_schedules
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own schedules" ON report_schedules
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own schedules" ON report_schedules
  FOR DELETE USING (auth.uid() = user_id);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_report_schedules_user ON report_schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_report_schedules_next_run ON report_schedules(next_run_at) WHERE is_active = TRUE;

-- 주석
COMMENT ON TABLE report_schedules IS '자동 리포트 생성 스케줄 관리';
COMMENT ON COLUMN reports.share_token IS '외부 공유용 고유 토큰';
COMMENT ON COLUMN reports.is_public IS '공개 여부 (true면 share_token으로 접근 가능)';
COMMENT ON COLUMN reports.template IS '리포트 템플릿 (standard, detailed, summary)';
COMMENT ON COLUMN reports.ai_insights IS 'AI가 생성한 인사이트 텍스트';
