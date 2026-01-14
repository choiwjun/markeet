import { describe, it, expect, vi, beforeEach } from 'vitest';
import { testPlatformConnection, type PlatformCredentials } from './connectionTest';
import type { PlatformCode } from '@/types/database';

describe('connectionTest', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'test');
  });

  describe('testPlatformConnection', () => {
    it('빈 자격 증명에 대해 실패를 반환해야 함', async () => {
      const result = await testPlatformConnection('naver', {});
      expect(result.success).toBe(false);
      expect(result.message).toContain('자격 증명이 제공되지 않았습니다');
    });

    it('지원하지 않는 플랫폼에 대해 실패를 반환해야 함', async () => {
      const result = await testPlatformConnection(
        'unsupported' as PlatformCode,
        { key: 'value' }
      );
      expect(result.success).toBe(false);
      expect(result.message).toContain('지원하지 않는 플랫폼');
    });
  });

  describe('네이버 광고 테스트', () => {
    it('유효한 자격 증명으로 성공해야 함', async () => {
      const credentials: PlatformCredentials = {
        customerId: '123456',
        accessKey: 'valid-access-key',
        secretKey: 'valid-secret-key',
      };

      const result = await testPlatformConnection('naver', credentials);

      expect(result.success).toBe(true);
      expect(result.message).toContain('네이버 광고 API 연결에 성공');
      expect(result.details?.customerId).toBe('123456');
    });

    it('필수 필드 누락 시 실패해야 함', async () => {
      const credentials: PlatformCredentials = {
        customerId: '123456',
        accessKey: 'valid-access-key',
        // secretKey 누락
      };

      const result = await testPlatformConnection('naver', credentials);

      expect(result.success).toBe(false);
      expect(result.message).toContain('모두 필요합니다');
    });

    it('유효하지 않은 키로 실패해야 함', async () => {
      const credentials: PlatformCredentials = {
        customerId: '123456',
        accessKey: 'invalid',
        secretKey: 'valid-secret-key',
      };

      const result = await testPlatformConnection('naver', credentials);

      expect(result.success).toBe(false);
      expect(result.message).toContain('유효하지 않습니다');
    });
  });

  describe('Google Ads 테스트', () => {
    it('유효한 자격 증명으로 성공해야 함', async () => {
      const credentials: PlatformCredentials = {
        customerId: '1234567890',
        developerToken: 'valid-token',
        refreshToken: 'valid-refresh-token',
      };

      const result = await testPlatformConnection('google', credentials);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Google Ads API 연결에 성공');
    });
  });

  describe('Meta 광고 테스트', () => {
    it('유효한 자격 증명으로 성공해야 함', async () => {
      const credentials: PlatformCredentials = {
        adAccountId: 'act_123456',
        accessToken: 'valid-token',
      };

      const result = await testPlatformConnection('meta', credentials);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Meta 광고 API 연결에 성공');
    });
  });

  describe('카카오모먼트 테스트', () => {
    it('유효한 자격 증명으로 성공해야 함', async () => {
      const credentials: PlatformCredentials = {
        adAccountId: '123456',
        accessToken: 'valid-token',
      };

      const result = await testPlatformConnection('kakao', credentials);

      expect(result.success).toBe(true);
      expect(result.message).toContain('카카오모먼트 API 연결에 성공');
    });
  });

  describe('쿠팡 테스트', () => {
    it('유효한 자격 증명으로 성공해야 함', async () => {
      const credentials: PlatformCredentials = {
        vendorId: 'A00123456',
        accessKey: 'valid-access-key',
        secretKey: 'valid-secret-key',
      };

      const result = await testPlatformConnection('coupang', credentials);

      expect(result.success).toBe(true);
      expect(result.message).toContain('쿠팡 API 연결에 성공');
    });
  });

  describe('G마켓/옥션 테스트', () => {
    it('유효한 자격 증명으로 성공해야 함', async () => {
      const credentials: PlatformCredentials = {
        sellerId: 'seller123',
        apiKey: 'valid-api-key',
      };

      const result = await testPlatformConnection('gmarket', credentials);

      expect(result.success).toBe(true);
      expect(result.message).toContain('G마켓/옥션 API 연결에 성공');
    });
  });

  describe('11번가 테스트', () => {
    it('유효한 자격 증명으로 성공해야 함', async () => {
      const credentials: PlatformCredentials = {
        sellerId: 'seller123',
        apiKey: 'valid-api-key',
      };

      const result = await testPlatformConnection('eleventh', credentials);

      expect(result.success).toBe(true);
      expect(result.message).toContain('11번가 API 연결에 성공');
    });
  });

  describe('네이버 스마트스토어 테스트', () => {
    it('유효한 자격 증명으로 성공해야 함', async () => {
      const credentials: PlatformCredentials = {
        applicationId: 'app123',
        applicationSecret: 'valid-secret',
      };

      const result = await testPlatformConnection('naver_store', credentials);

      expect(result.success).toBe(true);
      expect(result.message).toContain('네이버 스마트스토어 API 연결에 성공');
    });
  });

  describe('GA4 테스트', () => {
    it('유효한 자격 증명으로 성공해야 함', async () => {
      const credentials: PlatformCredentials = {
        propertyId: '123456789',
        serviceAccountJson: JSON.stringify({
          type: 'service_account',
          project_id: 'test-project',
        }),
      };

      const result = await testPlatformConnection('ga4', credentials);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Google Analytics 4 API 연결에 성공');
    });

    it('잘못된 JSON 형식으로 실패해야 함', async () => {
      const credentials: PlatformCredentials = {
        propertyId: '123456789',
        serviceAccountJson: 'not-a-json',
      };

      const result = await testPlatformConnection('ga4', credentials);

      expect(result.success).toBe(false);
      expect(result.message).toContain('JSON 형식이 올바르지 않습니다');
    });
  });

  describe('네이버 애널리틱스 테스트', () => {
    it('유효한 자격 증명으로 성공해야 함', async () => {
      const credentials: PlatformCredentials = {
        siteId: 'site123',
        apiKey: 'valid-api-key',
      };

      const result = await testPlatformConnection('naver_analytics', credentials);

      expect(result.success).toBe(true);
      expect(result.message).toContain('네이버 애널리틱스 API 연결에 성공');
    });
  });
});
