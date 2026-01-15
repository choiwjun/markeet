'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal, ModalFooter } from '@/components/ui/Modal';

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

const WARNING_SECTION_STYLES = [
  'bg-danger-50 dark:bg-danger-500/10',
  'rounded-xl',
  'border border-danger-200 dark:border-danger-500/20',
  'p-6 mb-6',
].join(' ');

const WARNING_HEADER_STYLES = [
  'flex items-center gap-3',
  'mb-4',
].join(' ');

const WARNING_ICON_STYLES = [
  'w-12 h-12',
  'rounded-full',
  'bg-danger-100 dark:bg-danger-500/20',
  'flex items-center justify-center',
  'text-danger-600 dark:text-danger-400',
].join(' ');

const WARNING_TITLE_STYLES = [
  'text-lg font-semibold',
  'text-danger-800 dark:text-danger-300',
].join(' ');

const WARNING_LIST_STYLES = [
  'mt-4 space-y-2',
  'text-sm',
  'text-danger-700 dark:text-danger-300',
].join(' ');

const WARNING_LIST_ITEM_STYLES = 'flex items-start gap-2';

const INFO_SECTION_STYLES = [
  'bg-white dark:bg-slate-800',
  'rounded-xl',
  'border border-slate-200 dark:border-slate-700',
  'p-6',
].join(' ');

const CONFIRMATION_LABEL_STYLES = [
  'block text-sm font-medium mb-2',
  'text-slate-700 dark:text-slate-300',
].join(' ');

const CONFIRMATION_INPUT_STYLES = [
  'w-full px-4 py-2.5',
  'bg-white dark:bg-slate-900',
  'border border-slate-300 dark:border-slate-600',
  'rounded-lg',
  'text-slate-900 dark:text-white',
  'placeholder-slate-400 dark:placeholder-slate-500',
  'focus:outline-none focus:ring-2 focus:ring-danger-500 focus:border-transparent',
].join(' ');

const CONFIRMATION_HELPER_STYLES = [
  'mt-2 text-xs',
  'text-slate-500 dark:text-slate-400',
].join(' ');

const DELETE_BUTTON_STYLES = [
  'mt-6',
  'flex justify-end',
].join(' ');

const MODAL_CONTENT_STYLES = 'text-center py-4';

const MODAL_ICON_STYLES = [
  'w-16 h-16 mx-auto mb-4',
  'rounded-full',
  'bg-danger-100 dark:bg-danger-500/20',
  'flex items-center justify-center',
  'text-danger-600 dark:text-danger-400',
].join(' ');

const ERROR_MESSAGE_STYLES = [
  'mb-6 p-4',
  'bg-danger-50 dark:bg-danger-500/10',
  'border border-danger-200 dark:border-danger-500/20',
  'rounded-lg',
  'text-danger-700 dark:text-danger-400',
].join(' ');

const CONFIRMATION_TEXT = 'DELETE MY ACCOUNT';

export default function DeleteAccountPage() {
  const router = useRouter();
  const [confirmation, setConfirmation] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConfirmationValid = confirmation === CONFIRMATION_TEXT;

  // 삭제 버튼 클릭
  const handleDeleteClick = () => {
    if (!isConfirmationValid) return;
    setShowModal(true);
  };

  // 삭제 확인
  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation: CONFIRMATION_TEXT }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '계정 삭제에 실패했습니다.');
      }

      // 성공 시 로그아웃 후 홈으로 이동
      router.push('/');
    } catch (err) {
      console.error('Failed to delete account:', err);
      setError(err instanceof Error ? err.message : '계정 삭제에 실패했습니다.');
      setShowModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      {/* 헤더 */}
      <div className={PAGE_HEADER_STYLES}>
        <h1 className={TITLE_STYLES}>계정 삭제</h1>
        <p className={SUBTITLE_STYLES}>
          계정을 영구적으로 삭제하고 모든 데이터를 제거합니다.
        </p>
      </div>

      {/* 에러 메시지 */}
      {error && <div className={ERROR_MESSAGE_STYLES}>{error}</div>}

      {/* 경고 섹션 */}
      <div className={WARNING_SECTION_STYLES}>
        <div className={WARNING_HEADER_STYLES}>
          <div className={WARNING_ICON_STYLES}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h2 className={WARNING_TITLE_STYLES}>주의: 이 작업은 되돌릴 수 없습니다</h2>
          </div>
        </div>

        <p className="text-danger-700 dark:text-danger-300">
          계정을 삭제하면 다음 데이터가 영구적으로 삭제됩니다:
        </p>

        <ul className={WARNING_LIST_STYLES}>
          <li className={WARNING_LIST_ITEM_STYLES}>
            <span className="text-danger-500">•</span>
            <span>모든 프로필 정보 및 설정</span>
          </li>
          <li className={WARNING_LIST_ITEM_STYLES}>
            <span className="text-danger-500">•</span>
            <span>연동된 모든 광고/커머스 플랫폼 연결</span>
          </li>
          <li className={WARNING_LIST_ITEM_STYLES}>
            <span className="text-danger-500">•</span>
            <span>수집된 모든 광고 성과 데이터</span>
          </li>
          <li className={WARNING_LIST_ITEM_STYLES}>
            <span className="text-danger-500">•</span>
            <span>생성된 모든 리포트</span>
          </li>
          <li className={WARNING_LIST_ITEM_STYLES}>
            <span className="text-danger-500">•</span>
            <span>AI 질의 히스토리</span>
          </li>
          <li className={WARNING_LIST_ITEM_STYLES}>
            <span className="text-danger-500">•</span>
            <span>알림 및 알림 설정</span>
          </li>
        </ul>
      </div>

      {/* 확인 섹션 */}
      <div className={INFO_SECTION_STYLES}>
        <label className={CONFIRMATION_LABEL_STYLES}>
          계정 삭제를 확인하려면 아래에 <strong>&quot;{CONFIRMATION_TEXT}&quot;</strong>를 입력하세요:
        </label>
        <input
          type="text"
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          className={CONFIRMATION_INPUT_STYLES}
          placeholder={CONFIRMATION_TEXT}
        />
        <p className={CONFIRMATION_HELPER_STYLES}>
          대문자로 정확히 입력해야 합니다.
        </p>

        <div className={DELETE_BUTTON_STYLES}>
          <Button
            variant="danger"
            onClick={handleDeleteClick}
            disabled={!isConfirmationValid}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            계정 영구 삭제
          </Button>
        </div>
      </div>

      {/* 최종 확인 모달 */}
      <Modal
        isOpen={showModal}
        onClose={() => !isDeleting && setShowModal(false)}
        title="정말 삭제하시겠습니까?"
        size="sm"
      >
        <div className={MODAL_CONTENT_STYLES}>
          <div className={MODAL_ICON_STYLES}>
            <AlertTriangle className="w-8 h-8" />
          </div>
          <p className="text-slate-600 dark:text-slate-300 mb-2">
            이 작업은 <strong>되돌릴 수 없습니다.</strong>
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            계정과 모든 데이터가 영구적으로 삭제됩니다.
          </p>
        </div>

        <ModalFooter>
          <Button
            variant="secondary"
            onClick={() => setShowModal(false)}
            disabled={isDeleting}
          >
            취소
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirmDelete}
            loading={isDeleting}
          >
            삭제 확인
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
