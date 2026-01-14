import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  encryptApiKey,
  decryptApiKey,
  encryptCredentials,
  decryptCredentials,
  isEncrypted,
} from './vault';

// 테스트용 환경 변수 설정
const TEST_ENCRYPTION_KEY = 'test-encryption-key-for-vault-testing-32-bytes';

describe('vault', () => {
  beforeEach(() => {
    vi.stubEnv('ENCRYPTION_KEY', TEST_ENCRYPTION_KEY);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('encryptApiKey / decryptApiKey', () => {
    it('문자열을 암호화하고 복호화해야 함', async () => {
      const plaintext = 'my-secret-api-key-12345';

      const encrypted = await encryptApiKey(plaintext);
      expect(encrypted).not.toBe(plaintext);
      expect(typeof encrypted).toBe('string');

      const decrypted = await decryptApiKey(encrypted);
      expect(decrypted).toBe(plaintext);
    });

    it('같은 평문도 매번 다른 암호문을 생성해야 함 (랜덤 IV)', async () => {
      const plaintext = 'same-secret-key';

      const encrypted1 = await encryptApiKey(plaintext);
      const encrypted2 = await encryptApiKey(plaintext);

      expect(encrypted1).not.toBe(encrypted2);

      // 둘 다 복호화하면 같은 평문
      expect(await decryptApiKey(encrypted1)).toBe(plaintext);
      expect(await decryptApiKey(encrypted2)).toBe(plaintext);
    });

    it('빈 문자열에 대해 에러를 발생시켜야 함', async () => {
      await expect(encryptApiKey('')).rejects.toThrow('암호화할 데이터가 비어있습니다.');
      await expect(decryptApiKey('')).rejects.toThrow('복호화할 데이터가 비어있습니다.');
    });

    it('유니코드 문자열을 처리해야 함', async () => {
      const plaintext = '한글-API-키-테스트-🔑';

      const encrypted = await encryptApiKey(plaintext);
      const decrypted = await decryptApiKey(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('긴 문자열을 처리해야 함', async () => {
      const plaintext = 'x'.repeat(10000);

      const encrypted = await encryptApiKey(plaintext);
      const decrypted = await decryptApiKey(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('손상된 암호문에 대해 에러를 발생시켜야 함', async () => {
      const validEncrypted = await encryptApiKey('test');
      const corruptedEncrypted = validEncrypted.slice(0, -10) + 'corrupted!';

      await expect(decryptApiKey(corruptedEncrypted)).rejects.toThrow();
    });
  });

  describe('encryptCredentials / decryptCredentials', () => {
    it('자격 증명 객체를 암호화하고 복호화해야 함', async () => {
      const credentials = {
        customerId: '123456',
        accessKey: 'my-access-key',
        secretKey: 'my-secret-key',
      };

      const encrypted = await encryptCredentials(credentials);
      expect(typeof encrypted).toBe('string');

      const decrypted = await decryptCredentials(encrypted);
      expect(decrypted).toEqual(credentials);
    });

    it('빈 객체도 처리해야 함', async () => {
      const credentials = {};

      const encrypted = await encryptCredentials(credentials);
      const decrypted = await decryptCredentials(encrypted);

      expect(decrypted).toEqual(credentials);
    });

    it('특수 문자가 포함된 자격 증명을 처리해야 함', async () => {
      const credentials = {
        apiKey: 'key-with-special-chars-!@#$%^&*()',
        secret: '비밀키-with-unicode-🔐',
      };

      const encrypted = await encryptCredentials(credentials);
      const decrypted = await decryptCredentials(encrypted);

      expect(decrypted).toEqual(credentials);
    });
  });

  describe('isEncrypted', () => {
    it('암호화된 문자열에 대해 true를 반환해야 함', async () => {
      const encrypted = await encryptApiKey('test-key');
      expect(isEncrypted(encrypted)).toBe(true);
    });

    it('일반 문자열에 대해 false를 반환해야 함', () => {
      expect(isEncrypted('plain-text')).toBe(false);
      expect(isEncrypted('short')).toBe(false);
    });

    it('빈 문자열에 대해 false를 반환해야 함', () => {
      expect(isEncrypted('')).toBe(false);
    });

    it('null/undefined에 대해 false를 반환해야 함', () => {
      expect(isEncrypted(null as unknown as string)).toBe(false);
      expect(isEncrypted(undefined as unknown as string)).toBe(false);
    });
  });

  describe('환경 변수 처리', () => {
    it('ENCRYPTION_KEY가 없으면 에러를 발생시켜야 함', async () => {
      vi.unstubAllEnvs();
      delete process.env.ENCRYPTION_KEY;

      // encryptApiKey는 내부 에러를 일반화된 에러로 변환
      await expect(encryptApiKey('test')).rejects.toThrow();
    });

    it('ENCRYPTION_KEY가 너무 짧으면 에러를 발생시켜야 함', async () => {
      vi.unstubAllEnvs();
      vi.stubEnv('ENCRYPTION_KEY', 'short-key'); // 32자 미만

      // encryptApiKey는 내부 에러를 일반화된 에러로 변환
      await expect(encryptApiKey('test')).rejects.toThrow();
    });

    it('충분히 긴 ENCRYPTION_KEY는 정상 동작해야 함', async () => {
      vi.unstubAllEnvs();
      vi.stubEnv('ENCRYPTION_KEY', 'this-is-a-valid-encryption-key-32+');

      const encrypted = await encryptApiKey('test');
      const decrypted = await decryptApiKey(encrypted);

      expect(decrypted).toBe('test');
    });
  });
});
