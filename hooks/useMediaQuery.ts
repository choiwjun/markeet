/**
 * 미디어 쿼리 훅
 * TASK-1303: 모바일 차트 최적화를 위한 반응형 감지
 */

import { useState, useEffect } from 'react';

/**
 * 미디어 쿼리 결과를 반환하는 훅
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // SSR 환경에서는 기본값 false 반환
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia(query);

    // 초기 값 설정
    setMatches(mediaQuery.matches);

    // 변경 감지 핸들러
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // 이벤트 리스너 등록
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
}

/**
 * 모바일 환경 감지 (640px 미만)
 */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 639px)');
}

/**
 * 태블릿 환경 감지 (640px ~ 1023px)
 */
export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 640px) and (max-width: 1023px)');
}

/**
 * 데스크톱 환경 감지 (1024px 이상)
 */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)');
}

/**
 * 현재 뷰포트 크기 반환
 */
export function useViewport(): 'mobile' | 'tablet' | 'desktop' {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  if (isMobile) return 'mobile';
  if (isTablet) return 'tablet';
  return 'desktop';
}

export default useMediaQuery;
