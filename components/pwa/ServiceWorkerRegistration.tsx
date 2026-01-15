/**
 * Service Worker 등록 컴포넌트
 * TASK-1304: PWA 설정
 */

'use client';

import { useEffect } from 'react';

/**
 * Service Worker 등록 컴포넌트
 * 클라이언트에서만 실행되며, SW를 등록합니다.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    // 프로덕션 환경에서만 서비스 워커 등록
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      // 페이지 로드 후 등록
      window.addEventListener('load', async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
          });

          console.log('[PWA] Service Worker registered:', registration.scope);

          // 업데이트 체크
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // 새 버전 있음 알림
                  console.log('[PWA] New version available');
                  // 필요시 사용자에게 업데이트 알림 표시
                }
              });
            }
          });
        } catch (error) {
          console.error('[PWA] Service Worker registration failed:', error);
        }
      });
    }
  }, []);

  return null;
}

export default ServiceWorkerRegistration;
