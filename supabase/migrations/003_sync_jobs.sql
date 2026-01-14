-- sync_jobs 테이블 생성
-- 데이터 동기화 작업 상태 추적용 (Redis 대신 PostgreSQL 사용)

CREATE TABLE IF NOT EXISTS sync_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  result JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- 상태 값 제약
  CONSTRAINT valid_status CHECK (status IN ('pending', 'running', 'completed', 'failed'))
);

-- 인덱스: 사용자별 조회 최적화
CREATE INDEX IF NOT EXISTS idx_sync_jobs_user_id ON sync_jobs(user_id);

-- 인덱스: 상태별 조회 최적화
CREATE INDEX IF NOT EXISTS idx_sync_jobs_status ON sync_jobs(status);

-- 인덱스: 오래된 작업 정리용 (completed_at 기준)
CREATE INDEX IF NOT EXISTS idx_sync_jobs_completed_at ON sync_jobs(completed_at)
  WHERE completed_at IS NOT NULL;

-- 인덱스: 좀비 작업 정리용 (started_at 기준, pending/running 상태)
CREATE INDEX IF NOT EXISTS idx_sync_jobs_started_at ON sync_jobs(started_at)
  WHERE status IN ('pending', 'running');

-- RLS 활성화
ALTER TABLE sync_jobs ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 사용자는 자신의 작업만 조회 가능
CREATE POLICY "Users can view own sync jobs" ON sync_jobs
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS 정책: 서비스 역할만 작업 생성/수정 가능 (서버사이드)
-- Service Role Key 사용 시 RLS 우회됨

-- 오래된 작업 자동 삭제 함수
CREATE OR REPLACE FUNCTION cleanup_old_sync_jobs()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- 24시간 이상 된 완료/실패 작업 삭제
  DELETE FROM sync_jobs
  WHERE (status IN ('completed', 'failed') AND completed_at < NOW() - INTERVAL '24 hours')
     OR (status IN ('pending', 'running') AND started_at < NOW() - INTERVAL '24 hours');

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 정리 함수 실행 권한 (서비스 역할에만)
REVOKE ALL ON FUNCTION cleanup_old_sync_jobs() FROM PUBLIC;

COMMENT ON TABLE sync_jobs IS '데이터 동기화 작업 상태 추적 테이블';
COMMENT ON COLUMN sync_jobs.status IS 'pending: 대기, running: 실행중, completed: 완료, failed: 실패';
COMMENT ON COLUMN sync_jobs.result IS '동기화 결과 (success, message, recordCount 등)';
