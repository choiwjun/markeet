import { expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

// IntersectionObserver mock for Framer Motion animations
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    // Immediately trigger callback with all elements as intersecting
    setTimeout(() => {
      callback(
        [{ isIntersecting: true, intersectionRatio: 1 }] as IntersectionObserverEntry[],
        this
      );
    }, 0);
  }

  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
}

window.IntersectionObserver = MockIntersectionObserver;

// ResizeObserver mock
class MockResizeObserver implements ResizeObserver {
  constructor(callback: ResizeObserverCallback) {}
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

window.ResizeObserver = MockResizeObserver;

// matchMedia mock
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// requestAnimationFrame mock
window.requestAnimationFrame = vi.fn((callback) => {
  return setTimeout(callback, 0) as unknown as number;
});
window.cancelAnimationFrame = vi.fn((id) => {
  clearTimeout(id);
});
