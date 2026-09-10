"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useIntersectionObserver } from "@/lib/hooks";

interface InfiniteScrollProps<T> {
  fetchFn: (page: number) => Promise<{ data: T[]; hasNext: boolean }>;
  renderItem: (item: T, index: number) => React.ReactNode;
  emptyMessage?: string;
  loadingComponent?: React.ReactNode;
}

/**
 * Infinite scroll component.
 * Uses Intersection Observer for lazy loading.
 */
export function InfiniteScroll<T>({
  fetchFn,
  renderItem,
  emptyMessage = "No items found",
  loadingComponent,
}: InfiniteScrollProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasNext, setHasNext] = useState(true);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasNext) return;
    setLoading(true);
    try {
      const result = await fetchFn(page);
      setItems((prev) => [...prev, ...result.data]);
      setHasNext(result.hasNext);
      setPage((p) => p + 1);
    } catch {
      setHasNext(false);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasNext, fetchFn]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasNext) {
          loadMore();
        }
      },
      { threshold: 0.1 },
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [loadMore, loading, hasNext]);

  // Initial load
  useEffect(() => {
    loadMore();
  }, []);

  if (items.length === 0 && !loading) {
    return (
      <div className="text-center py-12 text-muted">{emptyMessage}</div>
    );
  }

  return (
    <div>
      {items.map((item, index) => (
        <div key={index}>{renderItem(item, index)}</div>
      ))}

      {/* Load more trigger */}
      <div ref={loadMoreRef} className="h-4" />

      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center py-4">
          {loadingComponent || (
            <div className="flex space-x-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {!hasNext && items.length > 0 && (
        <p className="text-center text-xs text-muted py-4">
          No more items
        </p>
      )}
    </div>
  );
}
