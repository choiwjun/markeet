'use client';

import { useState, useCallback, FormEvent } from 'react';
import { AlertCircle, ExternalLink, Loader2, CheckCircle, RefreshCw } from 'lucide-react';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PlatformIcon } from './PlatformIcon';
import type { PlatformInfo } from '@/lib/constants/platforms';
import type { PlatformCode } from '@/types/database';

export interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform: PlatformInfo;
  onSuccess: (platformCode: PlatformCode) => void;
  existingConnection?: boolean;
}

// 폼 상태 타입
interface FormState {
  values: Record<string, string>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

// 연동 상태 타입
type ConnectionStage = 'idle' | 'testing' | 'saving' | 'success' | 'error';

// 스타일 상수
const HEADER_WRAPPER_STYLES = [
  'flex items-center gap-4',
  'mb-6',
].join(' ');

const PLATFORM_INFO_STYLES = 'flex-1';

const PLATFORM_NAME_STYLES = [
  'text-lg font-semibold',
  'text-slate-900 dark:text-white',
].join(' ');

const PLATFORM_DESC_STYLES = [
  'text-sm text-slate-500 dark:text-slate-400',
].join(' ');

const FORM_STYLES = 'space-y-4';

const FIELD_HELP_STYLES = [
  'mt-1 text-xs',
  'text-slate-500 dark:text-slate-400',
].join(' ');

const DOCS_LINK_STYLES = [
  'inline-flex items-center gap-1',
  'text-sm text-primary-600 dark:text-primary-400',
  'hover:text-primary-700 dark:hover:text-primary-300',
  'transition-colors',
].join(' ');

const ERROR_ALERT_STYLES = [
  'mt-4 p-4',
  'bg-danger-50 dark:bg-danger-500/10',
  'border border-danger-200 dark:border-danger-500/20',
  'rounded-lg',
  'text-sm text-danger-700 dark:text-danger-400',
  'flex items-start gap-3',
].join(' ');

const SUCCESS_ALERT_STYLES = [
  'mt-4 p-4',
  'bg-success-50 dark:bg-success-500/10',
  'border border-success-200 dark:border-success-500/20',
  'rounded-lg',
  'text-sm text-success-700 dark:text-success-400',
  'flex items-center gap-3',
].join(' ');

export function ApiKeyModal({
  isOpen,
  onClose,
  platform,
  onSuccess,
  existingConnection = false,
}: ApiKeyModalProps) {
  // 폼 상태 초기화
  const initialFormState: FormState = {
    values: platform.apiKeyFields.reduce(
      (acc, field) => ({ ...acc, [field.name]: '' }),
      {}
    ),
    errors: {},
    touched: {},
  };

  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [stage, setStage] = useState<ConnectionStage>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // 개별 필드 유효성 검사 (TASK-406)
  const validateField = (fieldName: string, value: string): string => {
    const field = platform.apiKeyFields.find(f => f.name === fieldName);
    if (!field) return '';

    if (field.required && !value.trim()) {
      return `${field.label}을(를) 입력해주세요.`;
    }

    return '';
  };

  // 전체 폼 유효성 검사 (TASK-406)
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const newTouched: Record<string, boolean> = {};

    platform.apiKeyFields.forEach(field => {
      newTouched[field.name] = true;
      const error = validateField(field.name, formState.values[field.name]);
      if (error) {
        newErrors[field.name] = error;
      }
    });

    setFormState(prev => ({
      ...prev,
      errors: newErrors,
      touched: newTouched,
    }));

    return Object.keys(newErrors).length === 0;
  };

  // 필드 값 변경 핸들러
  const handleChange = useCallback(
    (fieldName: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFormState(prev => {
        const field = platform.apiKeyFields.find(f => f.name === fieldName);
        let fieldError = '';
        if (prev.touched[fieldName] && field) {
          if (field.required && !value.trim()) {
            fieldError = `${field.label}을(를) 입력해주세요.`;
          }
        }
        return {
          ...prev,
          values: { ...prev.values, [fieldName]: value },
          errors: prev.touched[fieldName]
            ? { ...prev.errors, [fieldName]: fieldError }
            : prev.errors,
        };
      });
    },
    [platform.apiKeyFields]
  );

  // 필드 블러 핸들러
  const handleBlur = useCallback(
    (fieldName: string) => () => {
      setFormState(prev => {
        const field = platform.apiKeyFields.find(f => f.name === fieldName);
        let fieldError = '';
        if (field && field.required && !prev.values[fieldName].trim()) {
          fieldError = `${field.label}을(를) 입력해주세요.`;
        }
        return {
          ...prev,
          touched: { ...prev.touched, [fieldName]: true },
          errors: {
            ...prev.errors,
            [fieldName]: fieldError,
          },
        };
      });
    },
    [platform.apiKeyFields]
  );

  // 안전한 JSON 파싱
  const safeJsonParse = async (response: Response): Promise<{ error?: string }> => {
    try {
      return await response.json();
    } catch {
      return { error: `서버 오류 (${response.status})` };
    }
  };

  // 연동 테스트 및 저장
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setErrorMessage('');

    try {
      // 연결 테스트
      setStage('testing');
      let testResponse: Response;

      try {
        testResponse = await fetch('/api/connections/test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            platform: platform.code,
            credentials: formState.values,
          }),
        });
      } catch (fetchError) {
        // 네트워크 에러 (오프라인, DNS 실패 등)
        throw new Error(
          fetchError instanceof TypeError
            ? '네트워크 연결을 확인해주세요.'
            : 'API 연결 테스트에 실패했습니다.'
        );
      }

      if (!testResponse.ok) {
        const testError = await safeJsonParse(testResponse);
        throw new Error(testError.error || 'API 연결 테스트에 실패했습니다.');
      }

      // 저장
      setStage('saving');
      let saveResponse: Response;

      try {
        saveResponse = await fetch('/api/connections', {
          method: existingConnection ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            platform: platform.code,
            credentials: formState.values,
          }),
        });
      } catch (fetchError) {
        throw new Error(
          fetchError instanceof TypeError
            ? '네트워크 연결을 확인해주세요.'
            : '연동 정보 저장에 실패했습니다.'
        );
      }

      if (!saveResponse.ok) {
        const saveError = await safeJsonParse(saveResponse);
        throw new Error(saveError.error || '연동 정보 저장에 실패했습니다.');
      }

      // 성공
      setStage('success');

      // 1초 후 성공 콜백 호출
      setTimeout(() => {
        onSuccess(platform.code);
      }, 1000);
    } catch (err) {
      setStage('error');
      setErrorMessage(err instanceof Error ? err.message : '연동 중 오류가 발생했습니다.');
    }
  };

  // 폼 상태 초기화 함수
  const resetFormState = useCallback(() => {
    setFormState({
      values: platform.apiKeyFields.reduce(
        (acc, field) => ({ ...acc, [field.name]: '' }),
        {}
      ),
      errors: {},
      touched: {},
    });
  }, [platform.apiKeyFields]);

  // 모달 닫기 시 상태 초기화
  const handleClose = useCallback(() => {
    if (stage === 'testing' || stage === 'saving') {
      return; // 진행 중에는 닫기 방지
    }
    resetFormState();
    setStage('idle');
    setErrorMessage('');
    onClose();
  }, [stage, resetFormState, onClose]);

  // 버튼 텍스트
  const getButtonText = () => {
    switch (stage) {
      case 'testing':
        return '연결 테스트 중...';
      case 'saving':
        return '저장 중...';
      case 'success':
        return '연동 완료!';
      default:
        return existingConnection ? 'API 키 갱신' : '연동하기';
    }
  };

  // 버튼 아이콘
  const getButtonIcon = () => {
    switch (stage) {
      case 'testing':
      case 'saving':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return existingConnection ? <RefreshCw className="w-4 h-4" /> : null;
    }
  };

  const isProcessing = stage === 'testing' || stage === 'saving';

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="lg"
      closeOnOverlayClick={!isProcessing}
      closeOnEscape={!isProcessing}
    >
      {/* 헤더 */}
      <div className={HEADER_WRAPPER_STYLES}>
        <PlatformIcon
          iconName={platform.iconName}
          color={platform.color}
          size="lg"
        />
        <div className={PLATFORM_INFO_STYLES}>
          <h3 className={PLATFORM_NAME_STYLES}>
            {platform.name} {existingConnection ? 'API 키 갱신' : '연동'}
          </h3>
          <p className={PLATFORM_DESC_STYLES}>
            {platform.description}
          </p>
        </div>
      </div>

      {/* 폼 */}
      <form onSubmit={handleSubmit} className={FORM_STYLES}>
        {platform.apiKeyFields.map(field => (
          <div key={field.name}>
            <Input
              type={field.type}
              label={field.label}
              placeholder={field.placeholder}
              value={formState.values[field.name]}
              onChange={handleChange(field.name)}
              onBlur={handleBlur(field.name)}
              error={formState.touched[field.name] ? formState.errors[field.name] : undefined}
              disabled={isProcessing || stage === 'success'}
              required={field.required}
              autoComplete="off"
            />
            {field.helpText && (
              <p className={FIELD_HELP_STYLES}>{field.helpText}</p>
            )}
          </div>
        ))}

        {/* 문서 링크 */}
        <div className="mt-4">
          <a
            href={platform.docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={DOCS_LINK_STYLES}
          >
            API 키 발급 방법 안내
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* 에러 메시지 */}
        {stage === 'error' && errorMessage && (
          <div className={ERROR_ALERT_STYLES} role="alert">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 성공 메시지 */}
        {stage === 'success' && (
          <div className={SUCCESS_ALERT_STYLES} role="status">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>연동이 완료되었습니다!</span>
          </div>
        )}
      </form>

      {/* 푸터 */}
      <ModalFooter>
        <Button
          variant="secondary"
          onClick={handleClose}
          disabled={isProcessing}
        >
          취소
        </Button>
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={isProcessing || stage === 'success'}
          loading={isProcessing}
          leftIcon={getButtonIcon()}
        >
          {getButtonText()}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
