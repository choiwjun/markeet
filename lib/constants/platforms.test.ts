import { describe, it, expect } from 'vitest';
import {
  PLATFORMS,
  PLATFORM_CODES,
  PLATFORMS_BY_CATEGORY,
  PLATFORM_CATEGORIES,
  getPlatformByCode,
  PLATFORM_STATUS_BADGE_VARIANT,
  PLATFORM_STATUS_LABELS,
  type PlatformInfo,
} from './platforms';
import type { PlatformCode } from '@/types/database';

describe('platforms constants', () => {
  describe('PLATFORMS', () => {
    it('12개의 플랫폼이 정의되어 있어야 함', () => {
      expect(Object.keys(PLATFORMS)).toHaveLength(10);
    });

    it('모든 플랫폼이 필수 필드를 가져야 함', () => {
      Object.values(PLATFORMS).forEach((platform: PlatformInfo) => {
        expect(platform).toHaveProperty('code');
        expect(platform).toHaveProperty('name');
        expect(platform).toHaveProperty('description');
        expect(platform).toHaveProperty('category');
        expect(platform).toHaveProperty('iconName');
        expect(platform).toHaveProperty('color');
        expect(platform).toHaveProperty('apiKeyFields');
        expect(platform).toHaveProperty('docsUrl');
      });
    });

    it('모든 플랫폼의 apiKeyFields가 배열이어야 함', () => {
      Object.values(PLATFORMS).forEach((platform: PlatformInfo) => {
        expect(Array.isArray(platform.apiKeyFields)).toBe(true);
        expect(platform.apiKeyFields.length).toBeGreaterThan(0);
      });
    });

    it('네이버 광고 플랫폼이 올바르게 정의되어 있어야 함', () => {
      const naver = PLATFORMS.naver;
      expect(naver.name).toBe('네이버 광고');
      expect(naver.category).toBe('ad');
      expect(naver.apiKeyFields).toHaveLength(3);
    });

    it('쿠팡 플랫폼이 커머스 카테고리여야 함', () => {
      const coupang = PLATFORMS.coupang;
      expect(coupang.category).toBe('commerce');
    });

    it('GA4 플랫폼이 분석 카테고리여야 함', () => {
      const ga4 = PLATFORMS.ga4;
      expect(ga4.category).toBe('analytics');
    });
  });

  describe('PLATFORM_CODES', () => {
    it('모든 플랫폼 코드가 포함되어야 함', () => {
      const expectedCodes: PlatformCode[] = [
        'naver',
        'google',
        'meta',
        'coupang',
        'gmarket',
        'eleventh',
        'kakao',
        'naver_store',
        'ga4',
        'naver_analytics',
      ];

      expectedCodes.forEach(code => {
        expect(PLATFORM_CODES).toContain(code);
      });
    });
  });

  describe('PLATFORMS_BY_CATEGORY', () => {
    it('광고 플랫폼이 4개여야 함', () => {
      expect(PLATFORMS_BY_CATEGORY.ad).toHaveLength(4);
    });

    it('커머스 플랫폼이 4개여야 함', () => {
      expect(PLATFORMS_BY_CATEGORY.commerce).toHaveLength(4);
    });

    it('분석 플랫폼이 2개여야 함', () => {
      expect(PLATFORMS_BY_CATEGORY.analytics).toHaveLength(2);
    });
  });

  describe('PLATFORM_CATEGORIES', () => {
    it('모든 카테고리가 정의되어 있어야 함', () => {
      expect(PLATFORM_CATEGORIES).toHaveProperty('ad');
      expect(PLATFORM_CATEGORIES).toHaveProperty('commerce');
      expect(PLATFORM_CATEGORIES).toHaveProperty('analytics');
    });

    it('각 카테고리가 라벨과 설명을 가져야 함', () => {
      Object.values(PLATFORM_CATEGORIES).forEach(category => {
        expect(category).toHaveProperty('label');
        expect(category).toHaveProperty('description');
      });
    });
  });

  describe('getPlatformByCode', () => {
    it('유효한 코드로 플랫폼 정보를 반환해야 함', () => {
      const naver = getPlatformByCode('naver');
      expect(naver).toBeDefined();
      expect(naver?.name).toBe('네이버 광고');
    });

    it('잘못된 코드에 대해 undefined를 반환해야 함', () => {
      const invalid = getPlatformByCode('invalid' as PlatformCode);
      expect(invalid).toBeUndefined();
    });
  });

  describe('PLATFORM_STATUS_BADGE_VARIANT', () => {
    it('active 상태는 success variant여야 함', () => {
      expect(PLATFORM_STATUS_BADGE_VARIANT.active).toBe('success');
    });

    it('expired 상태는 warning variant여야 함', () => {
      expect(PLATFORM_STATUS_BADGE_VARIANT.expired).toBe('warning');
    });

    it('error 상태는 danger variant여야 함', () => {
      expect(PLATFORM_STATUS_BADGE_VARIANT.error).toBe('danger');
    });
  });

  describe('PLATFORM_STATUS_LABELS', () => {
    it('모든 상태에 대한 한글 라벨이 정의되어 있어야 함', () => {
      expect(PLATFORM_STATUS_LABELS.active).toBe('연동됨');
      expect(PLATFORM_STATUS_LABELS.expired).toBe('만료됨');
      expect(PLATFORM_STATUS_LABELS.error).toBe('오류');
    });
  });

  describe('API Key Fields', () => {
    it('모든 필드에 필수 속성이 있어야 함', () => {
      Object.values(PLATFORMS).forEach((platform: PlatformInfo) => {
        platform.apiKeyFields.forEach(field => {
          expect(field).toHaveProperty('name');
          expect(field).toHaveProperty('label');
          expect(field).toHaveProperty('placeholder');
          expect(field).toHaveProperty('type');
          expect(field).toHaveProperty('required');
          expect(['text', 'password']).toContain(field.type);
        });
      });
    });

    it('민감한 필드는 password 타입이어야 함', () => {
      // Secret Key, Access Token 등은 password 타입이어야 함
      const sensitiveKeywords = ['secret', 'token', 'key'];

      Object.values(PLATFORMS).forEach((platform: PlatformInfo) => {
        platform.apiKeyFields.forEach(field => {
          const isLikelySensitive = sensitiveKeywords.some(
            keyword => field.name.toLowerCase().includes(keyword)
          );
          if (isLikelySensitive && field.name !== 'accessKey' && field.name !== 'apiKey') {
            // accessKey, apiKey는 일부 플랫폼에서 노출해도 되는 경우가 있어 예외
            expect(field.type).toBe('password');
          }
        });
      });
    });
  });
});
