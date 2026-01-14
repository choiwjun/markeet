import { act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore, useToastStore } from './index';
import type { User } from '@/types/database';

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  });

  it('should set user on login', () => {
    const { setUser } = useAuthStore.getState();
    const mockUser: User = {
      id: '1',
      email: 'test@example.com',
      encrypted_password: 'hashed',
      created_at: new Date().toISOString(),
      last_login: null,
      subscription_plan: 'free',
      subscription_expires_at: null,
    };

    act(() => {
      setUser(mockUser);
    });

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
    expect(state.isLoading).toBe(false);
  });

  it('should clear user on logout', () => {
    const { logout } = useAuthStore.getState();

    act(() => {
      logout();
    });

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('should set loading state', () => {
    const { setLoading } = useAuthStore.getState();

    act(() => {
      setLoading(true);
    });

    expect(useAuthStore.getState().isLoading).toBe(true);

    act(() => {
      setLoading(false);
    });

    expect(useAuthStore.getState().isLoading).toBe(false);
  });
});

describe('useToastStore', () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] });
  });

  it('should add toast with unique id', () => {
    const { addToast } = useToastStore.getState();

    act(() => {
      addToast({ message: 'Test 1', type: 'success' });
      addToast({ message: 'Test 2', type: 'error' });
    });

    const state = useToastStore.getState();
    expect(state.toasts).toHaveLength(2);
    expect(state.toasts[0].id).not.toBe(state.toasts[1].id);
    expect(state.toasts[0].message).toBe('Test 1');
    expect(state.toasts[1].message).toBe('Test 2');
  });

  it('should remove toast by id', () => {
    const { addToast, removeToast } = useToastStore.getState();

    act(() => {
      addToast({ message: 'Test', type: 'info' });
    });

    const toastId = useToastStore.getState().toasts[0].id;

    act(() => {
      removeToast(toastId);
    });

    expect(useToastStore.getState().toasts).toHaveLength(0);
  });

  it('should clear all toasts', () => {
    const { addToast, clearToasts } = useToastStore.getState();

    act(() => {
      addToast({ message: 'Test 1', type: 'success' });
      addToast({ message: 'Test 2', type: 'error' });
      addToast({ message: 'Test 3', type: 'warning' });
    });

    expect(useToastStore.getState().toasts).toHaveLength(3);

    act(() => {
      clearToasts();
    });

    expect(useToastStore.getState().toasts).toHaveLength(0);
  });
});
