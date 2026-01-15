/**
 * 플랫폼 데이터 수집기 공통 타입 정의
 */

import type { AdDataInsert, PlatformCode } from '@/types/database';

/**
 * 데이터 수집 결과 공통 인터페이스
 */
export interface CollectionResult {
  success: boolean;
  message: string;
  recordCount: number;
  data: AdDataInsert[];
  error?: string;
}

/**
 * 연결 테스트 결과
 */
export interface ConnectionTestResult {
  success: boolean;
  message: string;
}

/**
 * 수집기 공통 옵션
 */
export interface CollectorOptions {
  userId: string;
  connectionId: string;
  startDate: string;  // YYYY-MM-DD
  endDate: string;    // YYYY-MM-DD
}

/**
 * 플랫폼별 자격 증명 타입
 */

// 네이버 검색광고 자격 증명
export interface NaverAdsCredentials {
  customerId: string;      // 광고주 ID (7자리 숫자)
  accessLicense: string;   // API 라이선스 키
  secretKey: string;       // API 비밀 키
  managedBy?: string;      // 대행사 ID (선택)
}

// Google Ads 자격 증명
export interface GoogleAdsCredentials {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  developerToken: string;
  customerId: string;      // 광고주 계정 ID (하이픈 제외)
  loginCustomerId?: string; // MCC 계정 ID (선택)
}

// Meta (Facebook/Instagram) Ads 자격 증명
export interface MetaAdsCredentials {
  accessToken: string;     // 장기 액세스 토큰
  adAccountId: string;     // 광고 계정 ID (act_ 포함)
  appId?: string;
  appSecret?: string;
}

// 카카오모먼트 자격 증명
export interface KakaoMomentCredentials {
  accessToken: string;
  refreshToken: string;
  adAccountId: string;
  clientId?: string;
  clientSecret?: string;
}

// 쿠팡 광고 자격 증명
export interface CoupangAdsCredentials {
  accessKey: string;
  secretKey: string;
  vendorId: string;        // 벤더 ID
}

// G마켓/옥션 자격 증명
export interface GmarketCredentials {
  apiKey: string;
  sellerId: string;
  secretKey: string;
}

// 11번가 자격 증명
export interface EleventhStreetCredentials {
  apiKey: string;
  sellerId: string;
}

// 네이버 스마트스토어 자격 증명
export interface NaverStoreCredentials {
  clientId: string;
  clientSecret: string;
  accessToken?: string;
  refreshToken?: string;
}

// 네이버 애널리틱스 자격 증명
export interface NaverAnalyticsCredentials {
  clientId: string;
  clientSecret: string;
  siteId: string;
  accessToken?: string;
  refreshToken?: string;
}

/**
 * 플랫폼별 자격 증명 맵
 */
export type PlatformCredentials = {
  naver: NaverAdsCredentials;
  google: GoogleAdsCredentials;
  meta: MetaAdsCredentials;
  kakao: KakaoMomentCredentials;
  coupang: CoupangAdsCredentials;
  gmarket: GmarketCredentials;
  eleventh: EleventhStreetCredentials;
  naver_store: NaverStoreCredentials;
  naver_analytics: NaverAnalyticsCredentials;
  ga4: import('./ga4').GA4Credentials;
};

/**
 * 플랫폼별 수집기 인터페이스
 */
export interface PlatformCollector<T> {
  /**
   * 플랫폼 코드
   */
  platform: PlatformCode;

  /**
   * 데이터 수집
   */
  collect(
    credentials: T,
    options: CollectorOptions
  ): Promise<CollectionResult>;

  /**
   * 연결 테스트
   */
  testConnection(credentials: T): Promise<ConnectionTestResult>;
}

/**
 * API 응답 에러 타입
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Rate Limiting 정보
 */
export interface RateLimitInfo {
  remaining: number;
  resetAt: Date;
  limit: number;
}
