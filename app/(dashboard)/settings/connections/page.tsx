'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Loader2, Trash2, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { PlatformCard } from '@/components/onboarding/PlatformCard';
import { ApiKeyModal } from '@/components/onboarding/ApiKeyModal';
import {
  PLATFORMS,
  PLATFORM_CODES,
  type PlatformInfo,
} from '@/lib/constants/platforms';
import type { PlatformCode, PlatformStatus } from '@/types/database';

// 연동 상태 타입
interface Connection {
  id: string;
  platform: PlatformCode;
  status: PlatformStatus;
  created_at: string;
  last_sync_at: string | null;
}

// 스타일 상수
const PAGE_HEADER_STYLES = 'mb-8';

const TITLE_STYLES = [
  'text-2xl font-bold',
  'text-slate-900 dark:text-white',
].join(' ');

const SUBTITLE_STYLES = [
  'mt-2 text-sm',
  'text-slate-500 dark:text-slate-400',
].join(' ');

const SECTION_STYLES = 'mb-10';

const SECTION_HEADER_STYLES = [
  'flex items-center justify-between',
  'mb-4',
].join(' ');

const SECTION_TITLE_STYLES = [
  'text-lg font-semibold',
  'text-slate-800 dark:text-slate-200',
].join(' ');

const GRID_STYLES = [
  'grid',
  'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  'gap-4',
].join(' ');

const EMPTY_STATE_STYLES = [
  'text-center py-12',
  'text-slate-500 dark:text-slate-400',
].join(' ');

const DELETE_MODAL_CONTENT_STYLES = 'flex items-start gap-4';

const DELETE_MODAL_ICON_STYLES = [
  'flex-shrink-0',
  'w-12 h-12',
  'rounded-full',
  'bg-danger-100 dark:bg-danger-500/20',
  'flex items-center justify-center',
  'text-danger-600 dark:text-danger-400',
].join(' ');

const DELETE_MODAL_TEXT_STYLES = [
  'text-slate-600 dark:text-slate-300',
  'mt-2',
].join(' ');

export default function SettingsConnectionsPage() {
  const router = useRouter();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformInfo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Connection | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 연동 목록 조회
  const fetchConnections = useCallback(async () => {
    try {
      const response = await fetch('/api/connections');
      if (response.ok) {
        const data = await response.json();
        setConnections(data.connections || []);
      }
    } catch {
      // 에러 시 빈 배열 유지
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  // 연동된 플랫폼 코드 목록
  const connectedPlatformCodes = connections.map(c => c.platform);

  // 연동되지 않은 플랫폼 목록
  const availablePlatforms = PLATFORM_CODES.filter(
    code => !connectedPlatformCodes.includes(code)
  ).map(code => PLATFORMS[code]);

  // 플랫폼 카드 클릭 (새 연동)
  const handleAddConnection = useCallback((platform: PlatformInfo) => {
    setSelectedPlatform(platform);
    setIsModalOpen(true);
  }, []);

  // 기존 연동 클릭 (갱신)
  const handleUpdateConnection = useCallback((connection: Connection) => {
    const platform = PLATFORMS[connection.platform];
    if (platform) {
      setSelectedPlatform(platform);
      setIsModalOpen(true);
    }
  }, []);

  // 모달 닫기
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setSelectedPlatform(null);
  }, []);

  // 연동 성공
  const handleConnectionSuccess = useCallback(() => {
    handleModalClose();
    fetchConnections();
  }, [handleModalClose, fetchConnections]);

  // 삭제 확인 모달 열기
  const handleDeleteClick = useCallback((connection: Connection) => {
    setDeleteTarget(connection);
  }, []);

  // 삭제 확인 모달 닫기
  const handleDeleteCancel = useCallback(() => {
    setDeleteTarget(null);
  }, []);

  // 연동 삭제 실행
  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/connections/${deleteTarget.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setConnections(prev => prev.filter(c => c.id !== deleteTarget.id));
        setDeleteTarget(null);
      }
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget]);

  // 새 연동 추가 페이지로 이동
  const handleGoToOnboarding = useCallback(() => {
    router.push('/onboarding');
  }, [router]);

  // 연동 상태 조회
  const getConnectionStatus = useCallback(
    (platformCode: PlatformCode): PlatformStatus | null => {
      const connection = connections.find(c => c.platform === platformCode);
      return connection?.status || null;
    },
    [connections]
  );

  // 연동 ID 조회
  const getConnection = useCallback(
    (platformCode: PlatformCode): Connection | undefined => {
      return connections.find(c => c.platform === platformCode);
    },
    [connections]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div>
      {/* 페이지 헤더 */}
      <div className={PAGE_HEADER_STYLES}>
        <h1 className={TITLE_STYLES}>플랫폼 연동 관리</h1>
        <p className={SUBTITLE_STYLES}>
          연동된 광고/커머스 플랫폼을 관리하고 새로운 플랫폼을 연동하세요.
        </p>
      </div>

      {/* 연동된 플랫폼 */}
      <section className={SECTION_STYLES}>
        <div className={SECTION_HEADER_STYLES}>
          <h2 className={SECTION_TITLE_STYLES}>
            연동된 플랫폼 ({connections.length})
          </h2>
        </div>

        {connections.length === 0 ? (
          <div className={EMPTY_STATE_STYLES}>
            <p className="mb-4">아직 연동된 플랫폼이 없습니다.</p>
            <Button onClick={handleGoToOnboarding}>
              <Plus className="w-4 h-4 mr-2" />
              플랫폼 연동하기
            </Button>
          </div>
        ) : (
          <div className={GRID_STYLES}>
            {connections.map(connection => {
              const platform = PLATFORMS[connection.platform];
              if (!platform) return null;

              return (
                <div key={connection.id} className="relative group">
                  <PlatformCard
                    platform={platform}
                    status={connection.status}
                    onClick={() => handleUpdateConnection(connection)}
                  />

                  {/* 액션 버튼 오버레이 */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateConnection(connection);
                      }}
                      className="p-2 rounded-lg bg-white dark:bg-slate-700 shadow-md hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                      title="API 키 갱신"
                    >
                      <RefreshCw className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(connection);
                      }}
                      className="p-2 rounded-lg bg-white dark:bg-slate-700 shadow-md hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-colors"
                      title="연동 해제"
                    >
                      <Trash2 className="w-4 h-4 text-danger-500" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 추가 가능한 플랫폼 */}
      {availablePlatforms.length > 0 && (
        <section className={SECTION_STYLES}>
          <div className={SECTION_HEADER_STYLES}>
            <h2 className={SECTION_TITLE_STYLES}>
              추가 가능한 플랫폼 ({availablePlatforms.length})
            </h2>
          </div>

          <div className={GRID_STYLES}>
            {availablePlatforms.map(platform => (
              <PlatformCard
                key={platform.code}
                platform={platform}
                status={getConnectionStatus(platform.code)}
                onClick={() => handleAddConnection(platform)}
              />
            ))}
          </div>
        </section>
      )}

      {/* API 키 입력 모달 */}
      {selectedPlatform && (
        <ApiKeyModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          platform={selectedPlatform}
          onSuccess={handleConnectionSuccess}
          existingConnection={!!getConnection(selectedPlatform.code)}
        />
      )}

      {/* 삭제 확인 모달 */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={handleDeleteCancel}
        title="연동 해제 확인"
        size="sm"
      >
        <div className={DELETE_MODAL_CONTENT_STYLES}>
          <div className={DELETE_MODAL_ICON_STYLES}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-white">
              {deleteTarget && PLATFORMS[deleteTarget.platform]?.name} 연동을 해제하시겠습니까?
            </p>
            <p className={DELETE_MODAL_TEXT_STYLES}>
              연동을 해제하면 해당 플랫폼의 데이터 수집이 중단됩니다.
              저장된 API 키 정보도 삭제됩니다.
            </p>
          </div>
        </div>

        <ModalFooter>
          <Button
            variant="secondary"
            onClick={handleDeleteCancel}
            disabled={isDeleting}
          >
            취소
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteConfirm}
            loading={isDeleting}
          >
            연동 해제
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
