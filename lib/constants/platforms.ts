/**
 * 플랫폼 상수 정의
 * DatabaseDesign.md의 플랫폼 코드 표 기반
 */

import type { PlatformCode } from '@/types/database';

// 플랫폼 카테고리 타입
export type PlatformCategory = 'ad' | 'commerce' | 'analytics';

// 플랫폼 정보 인터페이스
export interface PlatformInfo {
  code: PlatformCode;
  name: string;
  description: string;
  category: PlatformCategory;
  iconName: string;
  color: string;
  apiKeyFields: ApiKeyField[];
  docsUrl: string;
}

// API 키 필드 정의
export interface ApiKeyField {
  name: string;
  label: string;
  placeholder: string;
  type: 'text' | 'password';
  required: boolean;
  helpText?: string;
}

// 플랫폼 카테고리 정보
export const PLATFORM_CATEGORIES: Record<PlatformCategory, { label: string; description: string }> = {
  ad: {
    label: '광고 플랫폼',
    description: '광고 성과 데이터를 수집합니다.',
  },
  commerce: {
    label: '커머스 플랫폼',
    description: '판매 및 매출 데이터를 수집합니다.',
  },
  analytics: {
    label: '분석 플랫폼',
    description: '웹/앱 분석 데이터를 수집합니다.',
  },
};

// 플랫폼 목록 (12개)
export const PLATFORMS: Record<PlatformCode, PlatformInfo> = {
  naver: {
    code: 'naver',
    name: '네이버 광고',
    description: '네이버 검색광고 성과 데이터',
    category: 'ad',
    iconName: 'naver',
    color: '#03C75A',
    apiKeyFields: [
      {
        name: 'customerId',
        label: '고객 ID',
        placeholder: '네이버 광고 고객 ID',
        type: 'text',
        required: true,
        helpText: '네이버 광고 관리 시스템에서 확인 가능',
      },
      {
        name: 'accessKey',
        label: 'Access Key',
        placeholder: 'API Access Key',
        type: 'password',
        required: true,
      },
      {
        name: 'secretKey',
        label: 'Secret Key',
        placeholder: 'API Secret Key',
        type: 'password',
        required: true,
      },
    ],
    docsUrl: 'https://naver.github.io/searchad-apidoc/',
  },
  google: {
    code: 'google',
    name: 'Google Ads',
    description: 'Google 광고 성과 데이터',
    category: 'ad',
    iconName: 'google',
    color: '#4285F4',
    apiKeyFields: [
      {
        name: 'customerId',
        label: '고객 ID',
        placeholder: 'Google Ads 고객 ID (xxx-xxx-xxxx)',
        type: 'text',
        required: true,
        helpText: '대시 없이 입력 (예: 1234567890)',
      },
      {
        name: 'developerToken',
        label: '개발자 토큰',
        placeholder: 'Developer Token',
        type: 'password',
        required: true,
      },
      {
        name: 'refreshToken',
        label: 'Refresh Token',
        placeholder: 'OAuth Refresh Token',
        type: 'password',
        required: true,
      },
    ],
    docsUrl: 'https://developers.google.com/google-ads/api/docs/start',
  },
  meta: {
    code: 'meta',
    name: 'Meta 광고',
    description: 'Facebook/Instagram 광고 성과 데이터',
    category: 'ad',
    iconName: 'meta',
    color: '#0081FB',
    apiKeyFields: [
      {
        name: 'adAccountId',
        label: '광고 계정 ID',
        placeholder: 'act_xxxxxxxxxx',
        type: 'text',
        required: true,
        helpText: 'act_로 시작하는 광고 계정 ID',
      },
      {
        name: 'accessToken',
        label: 'Access Token',
        placeholder: 'Meta 광고 Access Token',
        type: 'password',
        required: true,
        helpText: '60일 유효한 장기 토큰 권장',
      },
    ],
    docsUrl: 'https://developers.facebook.com/docs/marketing-apis',
  },
  kakao: {
    code: 'kakao',
    name: '카카오모먼트',
    description: '카카오 광고 성과 데이터',
    category: 'ad',
    iconName: 'kakao',
    color: '#FEE500',
    apiKeyFields: [
      {
        name: 'adAccountId',
        label: '광고 계정 ID',
        placeholder: '광고 계정 ID',
        type: 'text',
        required: true,
      },
      {
        name: 'accessToken',
        label: 'Access Token',
        placeholder: 'REST API Access Token',
        type: 'password',
        required: true,
      },
    ],
    docsUrl: 'https://developers.kakao.com/docs/latest/ko/moment/common',
  },
  coupang: {
    code: 'coupang',
    name: '쿠팡 로켓그로스',
    description: '쿠팡 판매 및 광고 데이터',
    category: 'commerce',
    iconName: 'coupang',
    color: '#B4272D',
    apiKeyFields: [
      {
        name: 'vendorId',
        label: '판매자 ID',
        placeholder: 'Vendor ID',
        type: 'text',
        required: true,
      },
      {
        name: 'accessKey',
        label: 'Access Key',
        placeholder: 'API Access Key',
        type: 'password',
        required: true,
      },
      {
        name: 'secretKey',
        label: 'Secret Key',
        placeholder: 'API Secret Key',
        type: 'password',
        required: true,
      },
    ],
    docsUrl: 'https://developers.coupangcorp.com/',
  },
  gmarket: {
    code: 'gmarket',
    name: 'G마켓/옥션',
    description: 'G마켓/옥션 판매 데이터',
    category: 'commerce',
    iconName: 'gmarket',
    color: '#00B050',
    apiKeyFields: [
      {
        name: 'sellerId',
        label: '판매자 ID',
        placeholder: '판매자 ID',
        type: 'text',
        required: true,
      },
      {
        name: 'apiKey',
        label: 'API Key',
        placeholder: 'ESM Plus API Key',
        type: 'password',
        required: true,
      },
    ],
    docsUrl: 'https://esmplus.gmarket.co.kr/',
  },
  eleventh: {
    code: 'eleventh',
    name: '11번가',
    description: '11번가 판매 데이터',
    category: 'commerce',
    iconName: 'eleventh',
    color: '#FF0000',
    apiKeyFields: [
      {
        name: 'sellerId',
        label: '판매자 ID',
        placeholder: '판매자 ID',
        type: 'text',
        required: true,
      },
      {
        name: 'apiKey',
        label: 'API Key',
        placeholder: 'Open API Key',
        type: 'password',
        required: true,
      },
    ],
    docsUrl: 'https://openapi.11st.co.kr/',
  },
  naver_store: {
    code: 'naver_store',
    name: '네이버 스마트스토어',
    description: '네이버 스마트스토어 판매 데이터',
    category: 'commerce',
    iconName: 'naver',
    color: '#03C75A',
    apiKeyFields: [
      {
        name: 'applicationId',
        label: '애플리케이션 ID',
        placeholder: 'Application ID',
        type: 'text',
        required: true,
      },
      {
        name: 'applicationSecret',
        label: 'Application Secret',
        placeholder: 'Application Secret',
        type: 'password',
        required: true,
      },
    ],
    docsUrl: 'https://apicenter.commerce.naver.com/',
  },
  ga4: {
    code: 'ga4',
    name: 'Google Analytics 4',
    description: '웹/앱 분석 데이터',
    category: 'analytics',
    iconName: 'google',
    color: '#E37400',
    apiKeyFields: [
      {
        name: 'propertyId',
        label: '속성 ID',
        placeholder: 'GA4 Property ID',
        type: 'text',
        required: true,
        helpText: '예: 123456789',
      },
      {
        name: 'serviceAccountJson',
        label: '서비스 계정 JSON',
        placeholder: '서비스 계정 JSON 키 파일 내용',
        type: 'password',
        required: true,
        helpText: 'Google Cloud Console에서 생성',
      },
    ],
    docsUrl: 'https://developers.google.com/analytics/devguides/reporting/data/v1',
  },
  naver_analytics: {
    code: 'naver_analytics',
    name: '네이버 애널리틱스',
    description: '네이버 사이트 분석 데이터',
    category: 'analytics',
    iconName: 'naver',
    color: '#03C75A',
    apiKeyFields: [
      {
        name: 'siteId',
        label: '사이트 ID',
        placeholder: '사이트 ID',
        type: 'text',
        required: true,
      },
      {
        name: 'apiKey',
        label: 'API Key',
        placeholder: 'API Key',
        type: 'password',
        required: true,
      },
    ],
    docsUrl: 'https://analytics.naver.com/',
  },
};

// 플랫폼 코드 목록
export const PLATFORM_CODES = Object.keys(PLATFORMS) as PlatformCode[];

// 카테고리별 플랫폼 그룹화
export const PLATFORMS_BY_CATEGORY: Record<PlatformCategory, PlatformInfo[]> = {
  ad: PLATFORM_CODES.filter(code => PLATFORMS[code].category === 'ad').map(code => PLATFORMS[code]),
  commerce: PLATFORM_CODES.filter(code => PLATFORMS[code].category === 'commerce').map(code => PLATFORMS[code]),
  analytics: PLATFORM_CODES.filter(code => PLATFORMS[code].category === 'analytics').map(code => PLATFORMS[code]),
};

// 플랫폼 이름으로 조회
export function getPlatformByCode(code: PlatformCode): PlatformInfo | undefined {
  return PLATFORMS[code];
}

// 플랫폼 상태에 따른 Badge variant 매핑
export const PLATFORM_STATUS_BADGE_VARIANT = {
  active: 'success',
  expired: 'warning',
  error: 'danger',
} as const;

// 플랫폼 상태에 따른 라벨
export const PLATFORM_STATUS_LABELS = {
  active: '연동됨',
  expired: '만료됨',
  error: '오류',
} as const;
