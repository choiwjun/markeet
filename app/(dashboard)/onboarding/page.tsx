'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PlatformCard } from '@/components/onboarding/PlatformCard';
import { ApiKeyModal } from '@/components/onboarding/ApiKeyModal';
import {
  PLATFORMS,
  PLATFORMS_BY_CATEGORY,
  PLATFORM_CATEGORIES,
  type PlatformCategory,
  type PlatformInfo,
} from '@/lib/constants/platforms';
import type { PlatformCode, PlatformStatus } from '@/types/database';

// 연동 상태 타입
interface ConnectionState {
  platform: PlatformCode;
  status: PlatformStatus;
}

// 스타일 상수
const HEADER_WRAPPER_STYLES = 'text-center mb-6';

const TITLE_STYLES = [
  'text-2xl sm:text-3xl font-bold',
  'text-slate-900 dark:text-white',
  'mb-3',
].join(' ');

const SUBTITLE_STYLES = [
  'text-slate-500 dark:text-slate-400',
  'max-w-xl mx-auto',
].join(' ');

const CATEGORY_WRAPPER_STYLES = 'mb-10';

const CATEGORY_HEADER_STYLES = [
  'flex items-center gap-2',
  'mb-4',
].join(' ');

const CATEGORY_TITLE_STYLES = [
  'text-lg font-semibold',
  'text-slate-800 dark:text-slate-200',
].join(' ');

const CATEGORY_DESC_STYLES = [
  'text-sm text-slate-500 dark:text-slate-400',
].join(' ');

const GRID_STYLES = [
  'grid',
  'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  'gap-4',
].join(' ');

const FOOTER_STYLES = [
  'fixed bottom-0 left-0 right-0',
  'bg-white/80 dark:bg-slate-900/80',
  'backdrop-blur-md',
  'border-t border-slate-200 dark:border-slate-700',
  'py-4 px-4',
].join(' ');

const FOOTER_CONTENT_STYLES = [
  'max-w-4xl mx-auto',
  'flex items-center justify-between',
].join(' ');

const CONNECTION_COUNT_STYLES = [
  'text-sm',
  'text-slate-600 dark:text-slate-400',
].join(' ');

const HINT_WRAPPER_STYLES = [
  'flex items-center gap-2',
  'text-sm text-slate-500 dark:text-slate-400',
  'mb-8',
].join(' ');

export default function OnboardingPage() {
  const router = useRouter();
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformInfo | null>(null);
  const [connections, setConnections] = useState<ConnectionState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 기존 연동 목록 조회
  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const response = await fetch('/api/connections');
        if (response.ok) {
          const data = await response.json();
          setConnections(
            data.connections?.map((c: { platform: PlatformCode; status: PlatformStatus }) => ({
              platform: c.platform,
              status: c.status,
            })) || []
          );
        }
      } catch {
        // 에러 시 빈 배열 유지
      } finally {
        setIsLoading(false);
      }
    };

    fetchConnections();
  }, []);

  // 플랫폼 연동 상태 조회
  const getConnectionStatus = useCallback(
    (platformCode: PlatformCode): PlatformStatus | null => {
      const connection = connections.find(c => c.platform === platformCode);
      return connection?.status || null;
    },
    [connections]
  );

  // 플랫폼 카드 클릭 핸들러
  const handlePlatformClick = useCallback((platform: PlatformInfo) => {
    setSelectedPlatform(platform);
    setIsModalOpen(true);
  }, []);

  // 모달 닫기
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setSelectedPlatform(null);
  }, []);

  // 연동 성공 핸들러
  const handleConnectionSuccess = useCallback((platformCode: PlatformCode) => {
    setConnections(prev => {
      const existing = prev.find(c => c.platform === platformCode);
      if (existing) {
        return prev.map(c =>
          c.platform === platformCode ? { ...c, status: 'active' as PlatformStatus } : c
        );
      }
      return [...prev, { platform: platformCode, status: 'active' as PlatformStatus }];
    });
    handleModalClose();
  }, [handleModalClose]);

  // 온보딩 완료 (TASK-415)
  const handleComplete = useCallback(() => {
    router.push('/dashboard');
  }, [router]);

  // 연동된 플랫폼 수
  const activeConnectionCount = connections.filter(c => c.status === 'active').length;
  const canComplete = activeConnectionCount >= 1;

  // 카테고리 순서
  const categoryOrder: PlatformCategory[] = ['ad', 'commerce', 'analytics'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* 헤더 */}
      <div className={HEADER_WRAPPER_STYLES}>
        <h1 className={TITLE_STYLES}>
          플랫폼을 연동하세요
        </h1>
        <p className={SUBTITLE_STYLES}>
          광고 및 판매 데이터를 통합 관리하기 위해 사용하는 플랫폼을 연동해주세요.
          최소 1개 이상의 플랫폼 연동이 필요합니다.
        </p>
      </div>

      {/* 힌트 */}
      <div className={HINT_WRAPPER_STYLES}>
        <Sparkles className="w-4 h-4 text-primary-500" />
        <span>플랫폼 카드를 클릭하여 API 키를 입력하세요</span>
      </div>

      {/* 카테고리별 플랫폼 목록 */}
      {categoryOrder.map(category => (
        <div key={category} className={CATEGORY_WRAPPER_STYLES}>
          <div className={CATEGORY_HEADER_STYLES}>
            <h2 className={CATEGORY_TITLE_STYLES}>
              {PLATFORM_CATEGORIES[category].label}
            </h2>
            <span className={CATEGORY_DESC_STYLES}>
              {PLATFORM_CATEGORIES[category].description}
            </span>
          </div>

          <div className={GRID_STYLES}>
            {PLATFORMS_BY_CATEGORY[category].map(platform => (
              <PlatformCard
                key={platform.code}
                platform={platform}
                status={getConnectionStatus(platform.code)}
                onClick={() => handlePlatformClick(platform)}
              />
            ))}
          </div>
        </div>
      ))}

      {/* 하단 고정 버튼 */}
      <div className={FOOTER_STYLES}>
        <div className={FOOTER_CONTENT_STYLES}>
          <div className={CONNECTION_COUNT_STYLES}>
            {activeConnectionCount > 0 ? (
              <span>
                <strong className="text-primary-600 dark:text-primary-400">
                  {activeConnectionCount}개
                </strong>
                의 플랫폼이 연동되었습니다
              </span>
            ) : (
              <span>아직 연동된 플랫폼이 없습니다</span>
            )}
          </div>

          <Button
            onClick={handleComplete}
            disabled={!canComplete}
            rightIcon={<ChevronRight className="w-4 h-4" />}
          >
            {canComplete ? '대시보드로 이동' : '최소 1개 플랫폼 연동 필요'}
          </Button>
        </div>
      </div>

      {/* API 키 입력 모달 */}
      {selectedPlatform && (
        <ApiKeyModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          platform={selectedPlatform}
          onSuccess={handleConnectionSuccess}
          existingConnection={getConnectionStatus(selectedPlatform.code) !== null}
        />
      )}
    </div>
  );
}
