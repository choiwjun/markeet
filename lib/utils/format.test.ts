import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatPercent,
  formatCompactNumber,
  formatNumberWithCommas,
} from './format';

describe('format utilities', () => {
  describe('formatCurrency', () => {
    it('should format currency with KRW symbol', () => {
      expect(formatCurrency(1234567)).toContain('₩');
      expect(formatCurrency(1234567)).toContain('1,234,567');
      expect(formatCurrency(0)).toBe('₩0');
      expect(formatCurrency(1000000000)).toContain('1,000,000,000');
    });

    it('should handle zero', () => {
      expect(formatCurrency(0)).toBe('₩0');
    });
  });

  describe('formatCompactNumber', () => {
    it('should format large numbers as compact', () => {
      const result = formatCompactNumber(1234567);
      expect(result).toMatch(/\d+\.\d+|\d+만|\d+M|\d+억|\d+B/); // 한국어 단위 포함
    });

    it('should format millions', () => {
      const result = formatCompactNumber(1000000);
      expect(result).toMatch(/\d+만|M/); // 100만
    });

    it('should format billions', () => {
      const result = formatCompactNumber(1000000000);
      expect(result).toMatch(/\d+억|\d+B/); // 10억 (한국어) or 1B (영어)
    });
  });

  describe('formatNumberWithCommas', () => {
    it('should format numbers with commas', () => {
      expect(formatNumberWithCommas(1234567)).toBe('1,234,567');
      expect(formatNumberWithCommas(1000000000)).toBe('1,000,000,000');
    });
  });
});
