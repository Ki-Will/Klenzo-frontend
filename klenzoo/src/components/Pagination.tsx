"use client";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Pagination component for API responses.
 */
export function Pagination({
  page,
  totalPages,
  onPageChange,
  hasNext,
  hasPrev,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
    const start = Math.max(1, Math.min(page - 2, totalPages - 4));
    return start + i;
  }).filter((p) => p <= totalPages);

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={!hasPrev}
        className="glass-btn-ghost px-3 py-2 text-sm disabled:opacity-30 cursor-pointer"
      >
        <span className="material-symbols-outlined text-sm">chevron_left</span>
      </button>

      {pages[0] > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="glass-card w-10 h-10 text-sm cursor-pointer"
          >
            1
          </button>
          {pages[0] > 2 && (
            <span className="text-muted px-1">...</span>
          )}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            p === page
              ? "glass-btn-primary text-white"
              : "glass-card"
          }`}
        >
          {p}
        </button>
      ))}

      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && (
            <span className="text-muted px-1">...</span>
          )}
          <button
            onClick={() => onPageChange(totalPages)}
            className="glass-card w-10 h-10 text-sm cursor-pointer"
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={!hasNext}
        className="glass-btn-ghost px-3 py-2 text-sm disabled:opacity-30 cursor-pointer"
      >
        <span className="material-symbols-outlined text-sm">chevron_right</span>
      </button>
    </div>
  );
}
