/**
 * 공통 유효성 검사 유틸리티
 */

// 이메일 유효성 검사 정규식
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 비밀번호 최소 길이
export const PASSWORD_MIN_LENGTH = 8;

/**
 * 이메일 유효성 검사
 */
export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

/**
 * 비밀번호 유효성 검사
 */
export function isValidPassword(password: string): boolean {
  return password.length >= PASSWORD_MIN_LENGTH;
}

/**
 * 비밀번호 요구사항 체크
 */
export const PASSWORD_REQUIREMENTS = [
  { id: 'length', label: '8자 이상', test: (pw: string) => pw.length >= 8 },
  { id: 'uppercase', label: '대문자 포함', test: (pw: string) => /[A-Z]/.test(pw) },
  { id: 'lowercase', label: '소문자 포함', test: (pw: string) => /[a-z]/.test(pw) },
  { id: 'number', label: '숫자 포함', test: (pw: string) => /[0-9]/.test(pw) },
] as const;

/**
 * 모든 비밀번호 요구사항 충족 여부
 */
export function meetsAllPasswordRequirements(password: string): boolean {
  return PASSWORD_REQUIREMENTS.every(req => req.test(password));
}
