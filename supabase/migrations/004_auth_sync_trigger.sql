-- ============================================
-- auth.users → public.users 동기화 트리거
-- Migration: 004_auth_sync_trigger.sql
-- Version: 1.0
-- Created: 2026-01-14
-- ============================================

-- ============================================
-- 1. 신규 사용자 생성 시 public.users 동기화
-- ============================================

-- 트리거 함수: auth.users INSERT 시 public.users에 레코드 생성
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, encrypted_password, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    '', -- Supabase Auth가 비밀번호 관리하므로 빈 문자열
    NEW.created_at
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 생성
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 2. 사용자 이메일 변경 시 동기화
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_user_updated()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users
  SET email = NEW.email
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_updated();

-- ============================================
-- 3. 사용자 삭제 시 동기화 (CASCADE로 처리되지만 명시적으로)
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_user_deleted()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.users WHERE id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_deleted();

-- ============================================
-- 4. 기존 auth.users → public.users 백필 (1회성)
-- ============================================

-- 기존 auth.users가 있으면 public.users에 동기화
INSERT INTO public.users (id, email, encrypted_password, created_at)
SELECT
  id,
  email,
  '',
  created_at
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email;

-- ============================================
-- 마이그레이션 완료 메시지
-- ============================================
DO $$
BEGIN
    RAISE NOTICE 'Migration 004_auth_sync_trigger.sql completed successfully';
    RAISE NOTICE 'Triggers created: on_auth_user_created, on_auth_user_updated, on_auth_user_deleted';
END $$;
