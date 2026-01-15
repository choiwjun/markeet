/**
 * API 키 암호화/복호화 유틸리티
 *
 * 보안을 위해 AES-256-GCM 알고리즘을 사용하여 암호화합니다.
 * 환경 변수 ENCRYPTION_KEY를 필수로 사용합니다.
 *
 * TRD 근거: Supabase Vault (AES-256) - 민감 정보 암호화
 *
 * 주의: ENCRYPTION_KEY는 최소 32자 이상의 강력한 랜덤 문자열이어야 합니다.
 * 예: openssl rand -hex 32
 */

import crypto from 'crypto';

// 암호화 알고리즘 설정
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // GCM 권장 IV 길이
const AUTH_TAG_LENGTH = 16; // GCM 인증 태그 길이 (bytes)
const MIN_KEY_LENGTH = 32; // 최소 키 길이

/**
 * 환경에서 암호화 키를 가져옵니다.
 * 보안상 ENCRYPTION_KEY 환경 변수만 사용합니다.
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;

  if (!key) {
    throw new Error(
      '암호화 키가 설정되지 않았습니다. ENCRYPTION_KEY 환경 변수를 설정해주세요. ' +
      '(최소 32자 이상의 강력한 랜덤 문자열 필요)'
    );
  }

  if (key.length < MIN_KEY_LENGTH) {
    throw new Error(
      `암호화 키가 너무 짧습니다. 최소 ${MIN_KEY_LENGTH}자 이상이어야 합니다. ` +
      '(현재: ' + key.length + '자)'
    );
  }

  // 키를 32바이트 (256비트)로 맞춤
  return crypto.createHash('sha256').update(key).digest();
}

/**
 * API 키를 암호화합니다.
 *
 * @param plaintext - 암호화할 평문
 * @returns 암호화된 문자열 (Base64 인코딩: IV + 암호문 + AuthTag)
 */
export async function encryptApiKey(plaintext: string): Promise<string> {
  if (!plaintext) {
    throw new Error('암호화할 데이터가 비어있습니다.');
  }

  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final()
    ]);

    const authTag = cipher.getAuthTag();

    // IV + 암호문 + AuthTag를 합쳐서 Base64로 인코딩
    const combined = Buffer.concat([iv, encrypted, authTag]);

    return combined.toString('base64');
  } catch (error) {
    console.error('[Vault] 암호화 실패:', error);
    throw new Error('API 키 암호화에 실패했습니다.');
  }
}

/**
 * 암호화된 API 키를 복호화합니다.
 *
 * @param ciphertext - 암호화된 문자열 (Base64 인코딩)
 * @returns 복호화된 평문
 */
export async function decryptApiKey(ciphertext: string): Promise<string> {
  if (!ciphertext) {
    throw new Error('복호화할 데이터가 비어있습니다.');
  }

  try {
    const key = getEncryptionKey();
    const combined = Buffer.from(ciphertext, 'base64');

    // IV, 암호문, AuthTag 분리
    const iv = combined.subarray(0, IV_LENGTH);
    const authTag = combined.subarray(combined.length - AUTH_TAG_LENGTH);
    const encrypted = combined.subarray(IV_LENGTH, combined.length - AUTH_TAG_LENGTH);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ]);

    return decrypted.toString('utf8');
  } catch (error) {
    console.error('[Vault] 복호화 실패:', error);
    throw new Error('API 키 복호화에 실패했습니다.');
  }
}

/**
 * API 자격 증명 객체를 암호화합니다.
 *
 * @param credentials - 암호화할 자격 증명 객체
 * @returns 암호화된 문자열
 */
export async function encryptCredentials(
  credentials: Record<string, string>
): Promise<string> {
  const plaintext = JSON.stringify(credentials);
  return encryptApiKey(plaintext);
}

/**
 * 암호화된 자격 증명을 복호화합니다.
 *
 * @param encryptedCredentials - 암호화된 자격 증명 문자열
 * @returns 복호화된 자격 증명 객체
 */
export async function decryptCredentials(
  encryptedCredentials: string
): Promise<Record<string, string>> {
  const plaintext = await decryptApiKey(encryptedCredentials);
  return JSON.parse(plaintext);
}

/**
 * 암호화된 문자열인지 확인합니다.
 * (기본적으로 Base64 형식 + 최소 길이 체크)
 */
export function isEncrypted(value: string): boolean {
  if (!value || value.length < IV_LENGTH + AUTH_TAG_LENGTH + 16) {
    return false;
  }

  // Base64 패턴 체크
  const base64Pattern = /^[A-Za-z0-9+/]+=*$/;
  return base64Pattern.test(value);
}
