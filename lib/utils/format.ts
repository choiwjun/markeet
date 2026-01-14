/**
 * 포맷팅 유틸리티 함수들
 * DesignSystem - font-mono 숫자 표시용
 */

/**
 * 통화 포맷팅 (예: ₩1,234,567)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * 퍼센트 포맷팅 (예: 3.2%)
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
}

/**
 * 큰 숫자 포맷팅 (예: 1.2M)
 */
export function formatCompactNumber(value: number): string {
  const compactFormatter = new Intl.NumberFormat('ko-KR', {
    notation: 'compact',
    compactDisplay: 'short',
  });

  return compactFormatter.format(value);
}

/**
 * 숫자 천 단위 구분기 추가 (예: 1,234)
 */
export function formatNumberWithCommas(value: number): string {
  return new Intl.NumberFormat('ko-KR').format(value);
}

/**
 * 일반 숫자 포맷팅 (천 단위 구분)
 * formatNumberWithCommas와 동일하지만 더 직관적인 이름
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('ko-KR').format(value);
}

/**
 * ROAS 포맷팅 (예: 3.20)
 */
export function formatRoas(value: number, decimals: number = 2): string {
  return value.toFixed(decimals);
}
