/**
 * 플랫폼 데이터 수집기 인덱스
 *
 * 모든 플랫폼별 데이터 수집 함수를 내보냅니다.
 */

// 공통 타입
export * from './types';

// GA4 (Google Analytics 4)
export * from './ga4';

// 네이버 검색광고
export {
  collectNaverAdsData,
  testNaverAdsConnection,
  naverAdsCollector,
} from './naver-ads';

// Google Ads
export {
  collectGoogleAdsData,
  testGoogleAdsConnection,
  googleAdsCollector,
} from './google-ads';

// Meta (Facebook/Instagram) Ads
export {
  collectMetaAdsData,
  testMetaAdsConnection,
  metaAdsCollector,
} from './meta-ads';

// 카카오모먼트
export {
  collectKakaoMomentData,
  testKakaoMomentConnection,
  kakaoMomentCollector,
} from './kakao-moment';

// 쿠팡 광고
export {
  collectCoupangAdsData,
  testCoupangAdsConnection,
  coupangAdsCollector,
} from './coupang-ads';

// G마켓/옥션
export {
  collectGmarketData,
  testGmarketConnection,
  gmarketCollector,
} from './gmarket';

// 11번가
export {
  collectEleventhStreetData,
  testEleventhStreetConnection,
  eleventhStreetCollector,
} from './eleventh-street';

// 네이버 스마트스토어
export {
  collectNaverStoreData,
  testNaverStoreConnection,
  naverStoreCollector,
} from './naver-store';

// 네이버 애널리틱스
export {
  collectNaverAnalyticsData,
  testNaverAnalyticsConnection,
  naverAnalyticsCollector,
} from './naver-analytics';

// 플랫폼별 수집기 맵
import type { PlatformCode } from '@/types/database';
import type {
  CollectorOptions,
  CollectionResult,
  ConnectionTestResult,
  NaverAdsCredentials,
  GoogleAdsCredentials,
  MetaAdsCredentials,
  KakaoMomentCredentials,
  CoupangAdsCredentials,
  GmarketCredentials,
  EleventhStreetCredentials,
  NaverStoreCredentials,
  NaverAnalyticsCredentials,
} from './types';

import { naverAdsCollector } from './naver-ads';
import { googleAdsCollector } from './google-ads';
import { metaAdsCollector } from './meta-ads';
import { kakaoMomentCollector } from './kakao-moment';
import { coupangAdsCollector } from './coupang-ads';
import { gmarketCollector } from './gmarket';
import { eleventhStreetCollector } from './eleventh-street';
import { naverStoreCollector } from './naver-store';
import { naverAnalyticsCollector } from './naver-analytics';
import { collectGA4Data, testGA4Connection, type GA4Credentials } from './ga4';

/**
 * 플랫폼별 자격 증명 타입 유니온
 */
export type AnyCredentials =
  | NaverAdsCredentials
  | GoogleAdsCredentials
  | MetaAdsCredentials
  | KakaoMomentCredentials
  | CoupangAdsCredentials
  | GmarketCredentials
  | EleventhStreetCredentials
  | NaverStoreCredentials
  | NaverAnalyticsCredentials
  | GA4Credentials;

/**
 * 플랫폼 코드로 데이터 수집
 */
export async function collectPlatformDataByCode(
  platform: PlatformCode,
  credentials: AnyCredentials,
  options: CollectorOptions
): Promise<CollectionResult> {
  switch (platform) {
    case 'naver':
      return naverAdsCollector.collect(credentials as NaverAdsCredentials, options);
    case 'google':
      return googleAdsCollector.collect(credentials as GoogleAdsCredentials, options);
    case 'meta':
      return metaAdsCollector.collect(credentials as MetaAdsCredentials, options);
    case 'kakao':
      return kakaoMomentCollector.collect(credentials as KakaoMomentCredentials, options);
    case 'coupang':
      return coupangAdsCollector.collect(credentials as CoupangAdsCredentials, options);
    case 'gmarket':
      return gmarketCollector.collect(credentials as GmarketCredentials, options);
    case 'eleventh':
      return eleventhStreetCollector.collect(credentials as EleventhStreetCredentials, options);
    case 'naver_store':
      return naverStoreCollector.collect(credentials as NaverStoreCredentials, options);
    case 'naver_analytics':
      return naverAnalyticsCollector.collect(credentials as NaverAnalyticsCredentials, options);
    case 'ga4':
      const ga4Creds = credentials as GA4Credentials;
      return collectGA4Data(
        ga4Creds,
        options.userId,
        options.connectionId,
        options.startDate,
        options.endDate
      );
    default:
      return {
        success: false,
        message: `지원하지 않는 플랫폼입니다: ${platform}`,
        recordCount: 0,
        data: [],
        error: 'UNSUPPORTED_PLATFORM',
      };
  }
}

/**
 * 플랫폼 코드로 연결 테스트
 */
export async function testPlatformConnectionByCode(
  platform: PlatformCode,
  credentials: AnyCredentials
): Promise<ConnectionTestResult> {
  switch (platform) {
    case 'naver':
      return naverAdsCollector.testConnection(credentials as NaverAdsCredentials);
    case 'google':
      return googleAdsCollector.testConnection(credentials as GoogleAdsCredentials);
    case 'meta':
      return metaAdsCollector.testConnection(credentials as MetaAdsCredentials);
    case 'kakao':
      return kakaoMomentCollector.testConnection(credentials as KakaoMomentCredentials);
    case 'coupang':
      return coupangAdsCollector.testConnection(credentials as CoupangAdsCredentials);
    case 'gmarket':
      return gmarketCollector.testConnection(credentials as GmarketCredentials);
    case 'eleventh':
      return eleventhStreetCollector.testConnection(credentials as EleventhStreetCredentials);
    case 'naver_store':
      return naverStoreCollector.testConnection(credentials as NaverStoreCredentials);
    case 'naver_analytics':
      return naverAnalyticsCollector.testConnection(credentials as NaverAnalyticsCredentials);
    case 'ga4':
      return testGA4Connection(credentials as GA4Credentials);
    default:
      return {
        success: false,
        message: `지원하지 않는 플랫폼입니다: ${platform}`,
      };
  }
}
