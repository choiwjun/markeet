import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SettingsConnectionsPage from './page';

// Next.js router mock
const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// fetch mock
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('SettingsConnectionsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  it('로딩 상태가 표시되어야 함', () => {
    mockFetch.mockImplementation(() => new Promise(() => {}));

    render(<SettingsConnectionsPage />);

    // Loader2 아이콘은 animate-spin 클래스를 가짐
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('연동된 플랫폼이 없을 때 빈 상태가 표시되어야 함', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ connections: [] }),
    });

    render(<SettingsConnectionsPage />);

    await waitFor(() => {
      expect(screen.getByText('아직 연동된 플랫폼이 없습니다.')).toBeInTheDocument();
    });

    expect(screen.getByText('플랫폼 연동하기')).toBeInTheDocument();
  });

  it('연동된 플랫폼 목록이 표시되어야 함', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          connections: [
            {
              id: 'conn-1',
              platform: 'naver',
              status: 'active',
              created_at: '2024-01-01T00:00:00Z',
              last_sync_at: null,
            },
            {
              id: 'conn-2',
              platform: 'google',
              status: 'active',
              created_at: '2024-01-02T00:00:00Z',
              last_sync_at: null,
            },
          ],
        }),
    });

    render(<SettingsConnectionsPage />);

    await waitFor(() => {
      expect(screen.getByText('연동된 플랫폼 (2)')).toBeInTheDocument();
    });

    expect(screen.getByText('네이버 광고')).toBeInTheDocument();
    expect(screen.getByText('Google Ads')).toBeInTheDocument();
  });

  it('플랫폼 연동하기 버튼 클릭 시 온보딩 페이지로 이동해야 함', async () => {
    const user = userEvent.setup();

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ connections: [] }),
    });

    render(<SettingsConnectionsPage />);

    await waitFor(() => {
      expect(screen.getByText('플랫폼 연동하기')).toBeInTheDocument();
    });

    await user.click(screen.getByText('플랫폼 연동하기'));

    expect(mockPush).toHaveBeenCalledWith('/onboarding');
  });

  it('삭제 버튼 클릭 시 확인 모달이 열려야 함', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          connections: [
            {
              id: 'conn-1',
              platform: 'naver',
              status: 'active',
              created_at: '2024-01-01T00:00:00Z',
              last_sync_at: null,
            },
          ],
        }),
    });

    render(<SettingsConnectionsPage />);

    await waitFor(() => {
      expect(screen.getByText('네이버 광고')).toBeInTheDocument();
    });

    // 삭제 버튼은 그룹 호버 시 표시됨
    const deleteButton = screen.getByTitle('연동 해제');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText('연동 해제 확인')).toBeInTheDocument();
    });
  });

  it('삭제 확인 모달에서 취소 버튼 클릭 시 모달이 닫혀야 함', async () => {
    const user = userEvent.setup();

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          connections: [
            {
              id: 'conn-1',
              platform: 'naver',
              status: 'active',
              created_at: '2024-01-01T00:00:00Z',
              last_sync_at: null,
            },
          ],
        }),
    });

    render(<SettingsConnectionsPage />);

    await waitFor(() => {
      expect(screen.getByText('네이버 광고')).toBeInTheDocument();
    });

    // 삭제 모달 열기
    fireEvent.click(screen.getByTitle('연동 해제'));

    await waitFor(() => {
      expect(screen.getByText('연동 해제 확인')).toBeInTheDocument();
    });

    // 취소 버튼 클릭
    await user.click(screen.getByRole('button', { name: '취소' }));

    await waitFor(() => {
      expect(screen.queryByText('연동 해제 확인')).not.toBeInTheDocument();
    });
  });

  it('삭제 확인 후 API가 호출되어야 함', async () => {
    const user = userEvent.setup();

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            connections: [
              {
                id: 'conn-1',
                platform: 'naver',
                status: 'active',
                created_at: '2024-01-01T00:00:00Z',
                last_sync_at: null,
              },
            ],
          }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: '삭제됨' }),
      });

    render(<SettingsConnectionsPage />);

    await waitFor(() => {
      expect(screen.getByText('네이버 광고')).toBeInTheDocument();
    });

    // 삭제 모달 열기
    fireEvent.click(screen.getByTitle('연동 해제'));

    await waitFor(() => {
      expect(screen.getByText('연동 해제 확인')).toBeInTheDocument();
    });

    // 삭제 확인 (모달 내의 버튼 - getAllByRole로 첫 번째 버튼 제외)
    const deleteButtons = screen.getAllByRole('button', { name: '연동 해제' });
    // 모달 내의 버튼은 마지막에 있음
    await user.click(deleteButtons[deleteButtons.length - 1]);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/connections/conn-1', {
        method: 'DELETE',
      });
    });
  });

  describe('추가 가능한 플랫폼', () => {
    it('연동되지 않은 플랫폼 목록이 표시되어야 함', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            connections: [
              {
                id: 'conn-1',
                platform: 'naver',
                status: 'active',
                created_at: '2024-01-01T00:00:00Z',
                last_sync_at: null,
              },
            ],
          }),
      });

      render(<SettingsConnectionsPage />);

      await waitFor(() => {
        expect(screen.getByText(/추가 가능한 플랫폼/)).toBeInTheDocument();
      });

      // 네이버는 연동됨, 다른 플랫폼들은 추가 가능 섹션에 있어야 함
      expect(screen.getByText('Google Ads')).toBeInTheDocument();
      expect(screen.getByText('Meta 광고')).toBeInTheDocument();
    });
  });
});
