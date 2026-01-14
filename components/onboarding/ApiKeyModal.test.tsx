import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup, act } from '@testing-library/react';
import { ApiKeyModal } from './ApiKeyModal';
import type { PlatformInfo } from '@/lib/constants/platforms';

// 테스트용 플랫폼 데이터
const mockPlatform: PlatformInfo = {
  code: 'naver',
  name: '네이버 광고',
  description: '네이버 검색광고 성과 데이터',
  category: 'ad',
  iconName: 'naver',
  color: '#03C75A',
  apiKeyFields: [
    {
      name: 'customerId',
      label: '고객 ID',
      placeholder: '네이버 광고 고객 ID',
      type: 'text',
      required: true,
      helpText: '네이버 광고 관리 시스템에서 확인 가능',
    },
    {
      name: 'accessKey',
      label: 'Access Key',
      placeholder: 'API Access Key',
      type: 'password',
      required: true,
    },
    {
      name: 'secretKey',
      label: 'Secret Key',
      placeholder: 'API Secret Key',
      type: 'password',
      required: true,
    },
  ],
  docsUrl: 'https://example.com/docs',
};

// fetch mock
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('ApiKeyModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it('모달이 올바르게 렌더링되어야 함', () => {
    render(
      <ApiKeyModal
        isOpen={true}
        onClose={mockOnClose}
        platform={mockPlatform}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText('네이버 광고 연동')).toBeInTheDocument();
    expect(screen.getByText('네이버 검색광고 성과 데이터')).toBeInTheDocument();
  });

  it('모든 API 키 필드가 렌더링되어야 함', () => {
    render(
      <ApiKeyModal
        isOpen={true}
        onClose={mockOnClose}
        platform={mockPlatform}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByLabelText(/고객 ID/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Access Key/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Secret Key/)).toBeInTheDocument();
  });

  it('도움말 텍스트가 표시되어야 함', () => {
    render(
      <ApiKeyModal
        isOpen={true}
        onClose={mockOnClose}
        platform={mockPlatform}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText('네이버 광고 관리 시스템에서 확인 가능')).toBeInTheDocument();
  });

  it('문서 링크가 표시되어야 함', () => {
    render(
      <ApiKeyModal
        isOpen={true}
        onClose={mockOnClose}
        platform={mockPlatform}
        onSuccess={mockOnSuccess}
      />
    );

    const docsLink = screen.getByText('API 키 발급 방법 안내');
    expect(docsLink).toBeInTheDocument();
    expect(docsLink.closest('a')).toHaveAttribute('href', 'https://example.com/docs');
  });

  describe('유효성 검사 (TASK-406)', () => {
    it('빈 필드 제출 시 에러 메시지가 표시되어야 함', async () => {
      render(
        <ApiKeyModal
          isOpen={true}
          onClose={mockOnClose}
          platform={mockPlatform}
          onSuccess={mockOnSuccess}
        />
      );

      const submitButton = screen.getByRole('button', { name: /연동하기/ });

      await act(async () => {
        fireEvent.click(submitButton);
      });

      expect(screen.getByText('고객 ID을(를) 입력해주세요.')).toBeInTheDocument();
      expect(screen.getByText('Access Key을(를) 입력해주세요.')).toBeInTheDocument();
      expect(screen.getByText('Secret Key을(를) 입력해주세요.')).toBeInTheDocument();
    });

    it('필드 블러 시 유효성 검사가 실행되어야 함', async () => {
      render(
        <ApiKeyModal
          isOpen={true}
          onClose={mockOnClose}
          platform={mockPlatform}
          onSuccess={mockOnSuccess}
        />
      );

      const customerIdInput = screen.getByLabelText(/고객 ID/);

      await act(async () => {
        fireEvent.focus(customerIdInput);
        fireEvent.blur(customerIdInput);
      });

      expect(screen.getByText('고객 ID을(를) 입력해주세요.')).toBeInTheDocument();
    });
  });

  describe('연동 프로세스', () => {
    it('유효한 입력으로 연동 성공해야 함', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });

      render(
        <ApiKeyModal
          isOpen={true}
          onClose={mockOnClose}
          platform={mockPlatform}
          onSuccess={mockOnSuccess}
        />
      );

      // 필드 입력 (fireEvent 사용)
      const customerIdInput = screen.getByLabelText(/고객 ID/);
      const accessKeyInput = screen.getByLabelText(/Access Key/);
      const secretKeyInput = screen.getByLabelText(/Secret Key/);

      await act(async () => {
        fireEvent.change(customerIdInput, { target: { value: '123456' } });
        fireEvent.change(accessKeyInput, { target: { value: 'test-access-key' } });
        fireEvent.change(secretKeyInput, { target: { value: 'test-secret-key' } });
      });

      // 제출
      const submitButton = screen.getByRole('button', { name: /연동하기/ });

      await act(async () => {
        fireEvent.click(submitButton);
      });

      // 연결 테스트 API 호출 확인
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/connections/test', expect.any(Object));
      });

      // 저장 API 호출 확인
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/connections', expect.any(Object));
      });

      // 성공 메시지 확인
      await waitFor(() => {
        expect(screen.getByText('연동이 완료되었습니다!')).toBeInTheDocument();
      });
    });

    it('연결 테스트 실패 시 에러가 표시되어야 함', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'API 키가 유효하지 않습니다.' }),
      });

      render(
        <ApiKeyModal
          isOpen={true}
          onClose={mockOnClose}
          platform={mockPlatform}
          onSuccess={mockOnSuccess}
        />
      );

      // 필드 입력
      const customerIdInput = screen.getByLabelText(/고객 ID/);
      const accessKeyInput = screen.getByLabelText(/Access Key/);
      const secretKeyInput = screen.getByLabelText(/Secret Key/);

      await act(async () => {
        fireEvent.change(customerIdInput, { target: { value: '123456' } });
        fireEvent.change(accessKeyInput, { target: { value: 'invalid-key' } });
        fireEvent.change(secretKeyInput, { target: { value: 'invalid-secret' } });
      });

      // 제출
      const submitButton = screen.getByRole('button', { name: /연동하기/ });

      await act(async () => {
        fireEvent.click(submitButton);
      });

      // 에러 메시지 확인
      await waitFor(() => {
        expect(screen.getByText('API 키가 유효하지 않습니다.')).toBeInTheDocument();
      });
    });
  });

  describe('기존 연동 갱신', () => {
    it('기존 연동이 있을 때 갱신 UI가 표시되어야 함', () => {
      render(
        <ApiKeyModal
          isOpen={true}
          onClose={mockOnClose}
          platform={mockPlatform}
          onSuccess={mockOnSuccess}
          existingConnection={true}
        />
      );

      expect(screen.getByText('네이버 광고 API 키 갱신')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /API 키 갱신/ })).toBeInTheDocument();
    });
  });

  describe('모달 닫기', () => {
    it('취소 버튼 클릭 시 onClose가 호출되어야 함', async () => {
      render(
        <ApiKeyModal
          isOpen={true}
          onClose={mockOnClose}
          platform={mockPlatform}
          onSuccess={mockOnSuccess}
        />
      );

      const cancelButton = screen.getByRole('button', { name: '취소' });

      await act(async () => {
        fireEvent.click(cancelButton);
      });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });
});
