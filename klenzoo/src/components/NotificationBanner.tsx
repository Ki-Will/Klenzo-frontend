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
        const hex = banner.color ?? "#6366f1";

        return (
          <div
            key={banner.id}
            className="relative w-full flex items-center gap-3 px-4 md:px-6 py-2.5 overflow-hidden"
            style={{
              backgroundColor: `${hex}18`,   // 10% opacity fill
              borderBottom: `1px solid ${hex}30`,
              borderLeft: `3px solid ${hex}`,
            }}
          >
            {/* Subtle radial glow from left */}
            <div
              className="absolute inset-y-0 left-0 w-40 pointer-events-none"
              style={{
                background: `linear-gradient(to right, ${hex}20, transparent)`,
              }}
            />

            {/* Pulsing dot */}
            <span
              className="relative flex-shrink-0 w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: hex }}
            />

            {/* Title + message — both use the hex color for title, muted for body */}
            <div className="relative flex-1 min-w-0 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              {banner.title && (
                <span
                  className="text-[11px] font-bold uppercase tracking-widest whitespace-nowrap flex-shrink-0"
                  style={{ color: hex }}
                >
                  {banner.title}
                </span>
              )}
              <p
                className="text-sm leading-snug min-w-0"
                style={{ color: `${hex}cc` }}   // 80% opacity of the same hex
              >
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
                  border: `1px solid ${hex}50`,
                  backgroundColor: `${hex}15`,
                }}
              >
                {banner.linkText ?? "Learn more"}
              </Link>
            )}

            {/* Dismiss */}
            {banner.dismissible && (
              <button
                onClick={() => handleDismiss(banner.id)}
                className="relative flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full transition-all hover:bg-white/10"
                style={{ color: `${hex}99` }}
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
