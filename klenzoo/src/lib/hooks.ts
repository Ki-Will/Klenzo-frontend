"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/**
 * Hook to abort fetch requests on unmount.
 * Prevents state updates on unmounted components.
 */
export function useAbortController() {
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    controllerRef.current = new AbortController();
    return () => {
      controllerRef.current?.abort();
    };
  }, []);

  const getSignal = useCallback(() => {
    return controllerRef.current?.signal;
  }, []);

  return { signal: getSignal(), abort: () => controllerRef.current?.abort() };
}

/**
 * Hook to fetch data with AbortController support.
 */
export function useFetchWithAbort<T>(
  fetchFn: (signal?: AbortSignal) => Promise<T>,
  deps: any[] = [],
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    controllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    fetchFn(controllerRef.current.signal)
      .then(setData)
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError(err.message || "Failed to fetch");
        }
      })
      .finally(() => setLoading(false));

    return () => {
      controllerRef.current?.abort();
    };
  }, deps);

  return { data, loading, error, refetch: () => {} };
}

/**
 * Debounce hook.
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Debounced callback hook.
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300,
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  return useCallback(
    (...args: any[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay],
  ) as T;
}

/**
 * Local storage hook with SSR safety.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    },
    [key, storedValue],
  );

  return [storedValue, setValue];
}

/**
 * Intersection Observer hook for infinite scroll.
 */
export function useIntersectionObserver(
  callback: () => void,
  options?: IntersectionObserverInit,
) {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          callbackRef.current();
        }
      },
      { threshold: 0.1, ...options },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return targetRef;
}

/**
 * Keyboard shortcut hook.
 */
export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  modifiers: { ctrl?: boolean; meta?: boolean; shift?: boolean } = {},
) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === key) {
        const ctrlMatch = modifiers.ctrl ? e.ctrlKey : !e.ctrlKey;
        const metaMatch = modifiers.meta ? e.metaKey : !e.metaKey;
        const shiftMatch = modifiers.shift ? e.shiftKey : !e.shiftKey;

        if (ctrlMatch && metaMatch && shiftMatch) {
          e.preventDefault();
          callback();
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [key, callback, modifiers]);
}
