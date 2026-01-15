-- 005_notifications.sql
-- M8: 알림 시스템 테이블 생성

-- 알림 타입 enum
CREATE TYPE notification_type AS ENUM (
  'api_key_expired',      -- API 키 만료
  'api_key_expiring',     -- API 키 만료 임박
  'sync_error',           -- 동기화 오류
  'anomaly_spend',        -- 광고비 이상 감지
  'anomaly_roas',         -- ROAS 이상 감지
  'daily_summary',        -- 일일 요약
  'weekly_report',        -- 주간 리포트
  'system'                -- 시스템 공지
);

-- notifications 테이블 생성
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT NULL,                    -- 추가 데이터 (플랫폼, 링크 등)
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_type ON notifications(type);

-- RLS 활성화
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 사용자는 자신의 알림만 조회 가능
CREATE POLICY "Users can view own notifications"
  ON notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS 정책: 사용자는 자신의 알림만 수정 가능 (읽음 처리)
CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS 정책: 시스템만 알림 생성 가능 (service_role)
CREATE POLICY "Service role can insert notifications"
  ON notifications
  FOR INSERT
  WITH CHECK (true);

-- RLS 정책: 사용자는 자신의 알림 삭제 가능
CREATE POLICY "Users can delete own notifications"
  ON notifications
  FOR DELETE
  USING (auth.uid() = user_id);

-- 알림 설정 테이블
CREATE TABLE notification_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email_enabled BOOLEAN DEFAULT TRUE,         -- 이메일 알림 활성화
  email_daily_summary BOOLEAN DEFAULT TRUE,   -- 일일 요약 이메일
  email_weekly_report BOOLEAN DEFAULT TRUE,   -- 주간 리포트 이메일
  push_enabled BOOLEAN DEFAULT TRUE,          -- 푸시 알림 활성화
  anomaly_alerts BOOLEAN DEFAULT TRUE,        -- 이상 징후 알림
  api_key_alerts BOOLEAN DEFAULT TRUE,        -- API 키 관련 알림
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- RLS 정책
CREATE POLICY "Users can view own notification settings"
  ON notification_settings
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notification settings"
  ON notification_settings
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification settings"
  ON notification_settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 오래된 알림 정리 함수 (30일 이상 된 읽은 알림 삭제)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM notifications
  WHERE is_read = TRUE
    AND created_at < NOW() - INTERVAL '30 days';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- 사용자 생성 시 기본 알림 설정 생성 트리거
CREATE OR REPLACE FUNCTION create_default_notification_settings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO notification_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_user_created_notification_settings
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_notification_settings();
