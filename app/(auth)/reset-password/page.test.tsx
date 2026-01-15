import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

// Next.js 모킹
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => ({
    get: () => null,
  }),
}));

// Next.js Link 모킹
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Supabase 모킹
const mockGetSession = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: () => mockGetSession(),
    },
  },
}));

vi.mock('@/lib/supabase/auth', () => ({
  updatePassword: vi.fn().mockResolvedValue({ error: null }),
  getAuthErrorMessage: (error: { message: string } | null) => error?.message || '',
}));

// import after mocks
import ResetPasswordPage from './page';

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockReset();
  });

  it('토큰 검증 중 로딩 상태가 표시된다', () => {
    // never resolving promise
    mockGetSession.mockImplementation(() => new Promise(() => {}));

    render(<ResetPasswordPage />);

    expect(screen.getByText('링크 유효성 확인 중...')).toBeInTheDocument();
  });

  it('유효한 세션이 있으면 폼이 표시된다', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: 'test-user' } } },
    });

    render(<ResetPasswordPage />);

    await waitFor(() => {
      expect(screen.getByText('새 비밀번호 설정')).toBeInTheDocument();
    });
  });
});
