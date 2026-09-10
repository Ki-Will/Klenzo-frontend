"use client";

/**
 * Skeleton loading components.
 * Provides consistent loading states across the app.
 */

export function SkeletonLine({
  className = "",
  width,
  height = "h-4",
}: {
  className?: string;
  width?: string;
  height?: string;
}) {
  return (
    <div
      className={`${height} ${width || "w-full"} glass-panel rounded-lg animate-pulse ${className}`}
    />
  );
}

export function SkeletonCircle({
  size = "w-10 h-10",
  className = "",
}: {
  size?: string;
  className?: string;
}) {
  return (
    <div
      className={`${size} glass-panel rounded-full animate-pulse ${className}`}
    />
  );
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`glass-panel rounded-2xl p-5 space-y-3 ${className}`}>
      <div className="flex items-center gap-3">
        <SkeletonCircle />
        <div className="flex-1 space-y-2">
          <SkeletonLine width="w-1/3" />
          <SkeletonLine width="w-2/3" height="h-3" />
        </div>
      </div>
      <SkeletonLine height="h-8" width="w-1/2" />
    </div>
  );
}

export function SkeletonTransactionList() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-8">
      {/* Hero skeleton */}
      <div className="space-y-4">
        <SkeletonLine width="w-1/3" height="h-4" />
        <SkeletonLine width="w-1/2" height="h-12" />
        <div className="flex gap-4">
          <SkeletonLine width="w-24" height="h-4" />
          <SkeletonLine width="w-24" height="h-4" />
        </div>
      </div>

      {/* Cards skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 glass-panel rounded-2xl p-6 h-64 animate-pulse" />
        <div className="glass-panel rounded-2xl p-6 h-64 animate-pulse" />
      </div>

      {/* List skeleton */}
      <SkeletonTransactionList />
    </div>
  );
}
