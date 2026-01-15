// Database Types based on DatabaseDesign.md

// JSON 타입 정의
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// 구독 플랜 타입
export type SubscriptionPlan = 'free' | 'starter' | 'pro' | 'enterprise';

// 플랫폼 연동 상태 타입
export type PlatformStatus = 'active' | 'expired' | 'error';

// 리포트 타입
export type ReportType = 'weekly' | 'monthly' | 'custom';

// 플랫폼 코드 타입
export type PlatformCode =
  | 'naver'
  | 'google'
  | 'meta'
  | 'coupang'
  | 'gmarket'
  | 'eleventh'
  | 'kakao'
  | 'naver_store'
  | 'ga4'
  | 'naver_analytics';

// Users 테이블 타입
export interface User {
  id: string;
  email: string;
  encrypted_password: string;
  created_at: string;
  last_login: string | null;
  subscription_plan: SubscriptionPlan;
  subscription_expires_at: string | null;
}

export type UserInsert = Omit<User, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

export type UserUpdate = Partial<Omit<User, 'id' | 'created_at'>>;

// Platform Connections 테이블 타입
export interface PlatformConnection {
  id: string;
  user_id: string;
  platform: PlatformCode;
  api_key_encrypted: string | null;
  api_config: Json | null;
  status: PlatformStatus;
  last_sync_at: string | null;
  created_at: string;
}

export type PlatformConnectionInsert = Omit<PlatformConnection, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

export type PlatformConnectionUpdate = Partial<Omit<PlatformConnection, 'id' | 'created_at'>>;

// Ad Data 테이블 타입
export interface AdData {
  id: string;
  user_id: string;
  platform_connection_id: string;
  date: string;
  campaign_id: string | null;
  campaign_name: string | null;
  spend: number;
  revenue: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number | null;
  cvr: number | null;
  roas: number | null;
  raw_data: Json | null;
  created_at: string;
}

export type AdDataInsert = Omit<AdData, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

export type AdDataUpdate = Partial<Omit<AdData, 'id' | 'created_at'>>;

// 리포트 상태 타입
export type ReportStatus = 'draft' | 'generating' | 'completed' | 'failed';

// 리포트 템플릿 타입
export type ReportTemplate = 'standard' | 'detailed' | 'summary';

// Reports 테이블 타입
export interface Report {
  id: string;
  user_id: string;
  type: ReportType;
  title: string;
  status: ReportStatus;
  period_start: string;
  period_end: string;
  platforms: string[];
  data_summary: Json | null;
  insights: Json | null;
  ai_insights: string | null;
  pdf_url: string | null;
  share_token: string | null;
  share_expires_at: string | null;
  is_public: boolean;
  email_sent_at: string | null;
  template: ReportTemplate;
  created_at: string;
}

export type ReportInsert = Omit<Report, 'id' | 'created_at' | 'status' | 'share_token' | 'share_expires_at' | 'is_public' | 'email_sent_at'> & {
  id?: string;
  created_at?: string;
  status?: ReportStatus;
  share_token?: string | null;
  share_expires_at?: string | null;
  is_public?: boolean;
  email_sent_at?: string | null;
};

export type ReportUpdate = Partial<Omit<Report, 'id' | 'created_at' | 'user_id'>>;

// 리포트 스케줄 타입
export type ScheduleType = 'weekly' | 'monthly';

export interface ReportSchedule {
  id: string;
  user_id: string;
  schedule_type: ScheduleType;
  platforms: string[];
  send_email: boolean;
  is_active: boolean;
  last_run_at: string | null;
  next_run_at: string | null;
  created_at: string;
  updated_at: string;
}

export type ReportScheduleInsert = Omit<ReportSchedule, 'id' | 'created_at' | 'updated_at' | 'last_run_at' | 'next_run_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
  last_run_at?: string | null;
  next_run_at?: string | null;
};

export type ReportScheduleUpdate = Partial<Omit<ReportSchedule, 'id' | 'user_id' | 'created_at'>>;

// Chat History 테이블 타입 (Phase 2)
export interface ChatHistory {
  id: string;
  user_id: string;
  question: string;
  answer: string;
  sql_query: string | null;
  chart_data: Json | null;
  created_at: string;
}

export type ChatHistoryInsert = Omit<ChatHistory, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

export type ChatHistoryUpdate = Partial<Omit<ChatHistory, 'id' | 'created_at'>>;

// 알림 타입
export type NotificationType =
  | 'api_key_expired'
  | 'api_key_expiring'
  | 'sync_error'
  | 'anomaly_spend'
  | 'anomaly_roas'
  | 'daily_summary'
  | 'weekly_report'
  | 'system';

// Notification 테이블 타입
export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Json | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export type NotificationInsert = Omit<Notification, 'id' | 'created_at' | 'is_read' | 'read_at'> & {
  id?: string;
  created_at?: string;
  is_read?: boolean;
  read_at?: string | null;
};

export type NotificationUpdate = Partial<Pick<Notification, 'is_read' | 'read_at'>>;

// Notification Settings 테이블 타입
export interface NotificationSettings {
  id: string;
  user_id: string;
  email_enabled: boolean;
  email_daily_summary: boolean;
  email_weekly_report: boolean;
  push_enabled: boolean;
  anomaly_alerts: boolean;
  api_key_alerts: boolean;
  created_at: string;
  updated_at: string;
}

export type NotificationSettingsInsert = Omit<NotificationSettings, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type NotificationSettingsUpdate = Partial<Omit<NotificationSettings, 'id' | 'user_id' | 'created_at'>>;

// Sync Jobs 테이블 타입 (동기화 작업 추적)
export type SyncJobStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface SyncJob {
  id: string;
  user_id: string;
  platform: PlatformCode;
  status: SyncJobStatus;
  started_at: string;
  completed_at: string | null;
  result: Json | null;
  error_message: string | null;
  created_at: string;
}

export type SyncJobInsert = Omit<SyncJob, 'id' | 'created_at' | 'completed_at' | 'result' | 'error_message'> & {
  id?: string;
  created_at?: string;
  completed_at?: string | null;
  result?: Json | null;
  error_message?: string | null;
};

export type SyncJobUpdate = Partial<Omit<SyncJob, 'id' | 'created_at' | 'user_id' | 'platform'>>;

// Profile 테이블 타입
export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  company_name: string | null;
  phone: string | null;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export type ProfileInsert = Omit<Profile, 'created_at' | 'updated_at'> & {
  created_at?: string;
  updated_at?: string;
};

export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'created_at'>>;

// Supabase Database 타입 (supabase-js와 호환)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: UserInsert;
        Update: UserUpdate;
      };
      platform_connections: {
        Row: PlatformConnection;
        Insert: PlatformConnectionInsert;
        Update: PlatformConnectionUpdate;
      };
      ad_data: {
        Row: AdData;
        Insert: AdDataInsert;
        Update: AdDataUpdate;
      };
      reports: {
        Row: Report;
        Insert: ReportInsert;
        Update: ReportUpdate;
      };
      chat_history: {
        Row: ChatHistory;
        Insert: ChatHistoryInsert;
        Update: ChatHistoryUpdate;
      };
      sync_jobs: {
        Row: SyncJob;
        Insert: SyncJobInsert;
        Update: SyncJobUpdate;
      };
      notifications: {
        Row: Notification;
        Insert: NotificationInsert;
        Update: NotificationUpdate;
      };
      notification_settings: {
        Row: NotificationSettings;
        Insert: NotificationSettingsInsert;
        Update: NotificationSettingsUpdate;
      };
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
    };
    Views: Record<string, never>;
    Functions: {
      cleanup_old_sync_jobs: {
        Args: Record<string, never>;
        Returns: number;
      };
      cleanup_old_notifications: {
        Args: Record<string, never>;
        Returns: number;
      };
    };
    Enums: {
      subscription_plan: SubscriptionPlan;
      platform_status: PlatformStatus;
      report_type: ReportType;
      sync_job_status: SyncJobStatus;
      notification_type: NotificationType;
    };
  };
}

// 테이블 이름 타입
export type TableName = keyof Database['public']['Tables'];

// Row 타입 헬퍼
export type Tables<T extends TableName> = Database['public']['Tables'][T]['Row'];

// Insert 타입 헬퍼
export type TablesInsert<T extends TableName> = Database['public']['Tables'][T]['Insert'];

// Update 타입 헬퍼
export type TablesUpdate<T extends TableName> = Database['public']['Tables'][T]['Update'];
