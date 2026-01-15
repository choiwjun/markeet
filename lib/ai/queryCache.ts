/**
 * AI 질의 캐싱
 * TASK-911: 동일 질문에 대한 캐시 응답
 */

import crypto from 'crypto';

// 캐시 타입 정의
interface CacheEntry {
  response: string;
  sql: string;
  chartType: string | null;
  chartData: Record<string, unknown>[] | null;
  createdAt: number;
}

// 메모리 캐시 (프로덕션에서는 Redis 사용 권장)
const cache = new Map<string, CacheEntry>();

// 캐시 TTL (초)
const CACHE_TTL = 60 * 60; // 1시간

// 최대 캐시 항목 수
const MAX_CACHE_SIZE = 1000;

/**
 * 캐시 키 생성
 */
export function generateCacheKey(userId: string, question: string): string {
  const normalizedQuestion = question.toLowerCase().trim();
  const hash = crypto.createHash('md5').update(`${userId}:${normalizedQuestion}`).digest('hex');
  return hash;
}

/**
 * 캐시 조회
 */
export function getFromCache(cacheKey: string): CacheEntry | null {
  const entry = cache.get(cacheKey);

  if (!entry) {
    return null;
  }

  // TTL 체크
  const now = Date.now();
  if (now - entry.createdAt > CACHE_TTL * 1000) {
    cache.delete(cacheKey);
    return null;
  }

  return entry;
}

/**
 * 캐시 저장
 */
export function saveToCache(
  cacheKey: string,
  data: {
    response: string;
    sql: string;
    chartType: string | null;
    chartData: Record<string, unknown>[] | null;
  }
): void {
  // 캐시 크기 제한
  if (cache.size >= MAX_CACHE_SIZE) {
    // 가장 오래된 항목 삭제 (LRU 간소화 버전)
    const oldestKey = cache.keys().next().value;
    if (oldestKey) {
      cache.delete(oldestKey);
    }
  }

  cache.set(cacheKey, {
    ...data,
    createdAt: Date.now(),
  });
}

/**
 * 캐시 삭제 (특정 사용자)
 */
export function invalidateCacheForUser(_userId: string): void {
  // 해시 기반이라 userId별 구분이 어려우므로 전체 삭제
  cache.clear();
}

/**
 * 전체 캐시 초기화
 */
export function clearCache(): void {
  cache.clear();
}

/**
 * 캐시 통계
 */
export function getCacheStats(): { size: number; maxSize: number } {
  return {
    size: cache.size,
    maxSize: MAX_CACHE_SIZE,
  };
}
