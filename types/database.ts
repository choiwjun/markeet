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

// Reports 테이블 타입
export interface Report {
  id: string;
  user_id: string;
  type: ReportType;
  period_start: string;
  period_end: string;
  data_summary: Json | null;
  insights: Json | null;
  pdf_url: string | null;
  created_at: string;
}

export type ReportInsert = Omit<Report, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

export type ReportUpdate = Partial<Omit<Report, 'id' | 'created_at'>>;

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

export type SyncJobInsert = Omit<SyncJob, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

export type SyncJobUpdate = Partial<Omit<SyncJob, 'id' | 'created_at' | 'user_id' | 'platform'>>;

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
    };
    Views: Record<string, never>;
    Functions: {
      cleanup_old_sync_jobs: {
        Args: Record<string, never>;
        Returns: number;
      };
    };
    Enums: {
      subscription_plan: SubscriptionPlan;
      platform_status: PlatformStatus;
      report_type: ReportType;
      sync_job_status: SyncJobStatus;
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
