"use client";

import Link from "next/link";
import { useBanners } from "@/lib/banner-context";
import { notifications as notifApi } from "@/lib/api";

/**
 * Announcement / Hello Bar
 *
 * Sits in the document flow (not fixed/absolute) so it naturally pushes
 * page content down — no overlap. Sticky so it stays visible on scroll.
 * Uses the hex color from the backend for both the accent border and text.
 */
export default function NotificationBanner() {
  const { banners, dismissBanner } = useBanners();

  if (banners.length === 0) return null;

  function handleDismiss(id: number | string) {
    notifApi.markRead(id).catch(() => {});
    dismissBanner(id);
  }

  return (
    <div className="sticky top-16 md:top-20 z-30 flex flex-col">
      {banners.map((banner) => {
        let hex = banner.color ?? "#6366f1";
        // Map common color names to theme-friendly hex values if needed
        if (hex === "info") hex = "#5a4dff";
        if (hex === "success") hex = "#10b981";
        if (hex === "warning") hex = "#f59e0b";
        if (hex === "error") hex = "#ef4444";

        return (
          <div
            key={banner.id}
            className="relative w-full flex items-center gap-3 px-4 md:px-6 py-2.5 overflow-hidden border-b border-l-[3px]"
            style={{
              backgroundColor: "var(--c-card)",
              borderBottomColor: `${hex}20`,
              borderLeftColor: hex,
            }}
          >
            {/* Solid accent fill layer with opacity */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundColor: hex,
                opacity: 0.08,
              }}
            />

            {/* Subtle radial glow from left */}
            <div
              className="absolute inset-y-0 left-0 w-40 pointer-events-none"
              style={{
                background: `linear-gradient(to right, ${hex}15, transparent)`,
              }}
            />

            {/* Pulsing dot */}
            <span
              className="relative flex-shrink-0 w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: hex }}
            />

            {/* Title + message */}
            <div className="relative flex-1 min-w-0 flex flex-wrap items-center gap-x-3 gap-y-1">
              {banner.title && (
                <span
                  className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md whitespace-nowrap flex-shrink-0"
                  style={{
                    backgroundColor: `${hex}20`,
                    color: hex,
                    border: `1px solid ${hex}30`,
                  }}
                >
                  {banner.title}
                </span>
              )}
              <p className="text-sm leading-snug min-w-0 text-primary-text">
                {banner.message}
              </p>
            </div>

            {/* Optional CTA */}
            {banner.link && (
              <Link
                href={banner.link}
                className="relative flex-shrink-0 text-[11px] font-bold px-3 py-1 rounded-full whitespace-nowrap transition-opacity hover:opacity-80"
                style={{
                  color: hex,
                  border: `1px solid ${hex}40`,
                  backgroundColor: `${hex}10`,
                }}
              >
                {banner.linkText ?? "Learn more"}
              </Link>
            )}

            {/* Dismiss */}
            {banner.dismissible && (
              <button
                onClick={() => handleDismiss(banner.id)}
                className="relative flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full transition-all hover:bg-black/5 dark:hover:bg-white/10 text-secondary-text hover:text-primary-text"
                aria-label="Dismiss"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
