import { create } from 'zustand';
import type { User } from '@/types/database';

// 고유 ID 생성 함수 (Date.now() + 랜덤 문자열로 충돌 방지)
let toastCounter = 0;
const generateToastId = (): string => {
  toastCounter += 1;
  return `toast-${Date.now()}-${toastCounter}-${Math.random().toString(36).substring(2, 9)}`;
};

// Auth 상태 인터페이스
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

// Toast 아이템 인터페이스
export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

// Toast 상태 인터페이스
interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

// Auth 스토어
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  setUser: (user: User | null) =>
    set({
      user,
      isAuthenticated: !!user,
      isLoading: false,
    }),

  setLoading: (loading: boolean) =>
    set({
      isLoading: loading,
    }),

  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    }),
}));

// Toast 스토어
export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  addToast: (toast: Omit<Toast, 'id'>) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: generateToastId() }],
    })),

  removeToast: (id: string) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),

  clearToasts: () =>
    set({
      toasts: [],
    }),
}));
