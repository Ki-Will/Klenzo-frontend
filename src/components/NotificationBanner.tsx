"use client";

import Link from "next/link";
import { useBanners } from "@/lib/banner-context";
import type { BannerColor } from "@/lib/api";

const COLOR_MAP: Record<
  BannerColor,
  { bg: string; text: string; icon: string; border: string }
> = {
  info: {
    bg: "bg-primary-container/20",
    text: "text-primary-fixed-dim",
    icon: "info",
    border: "border-primary/30",
  },
  success: {
    bg: "bg-emerald-900/20",
    text: "text-emerald-300",
    icon: "check_circle",
    border: "border-emerald-500/30",
  },
  warning: {
    bg: "bg-amber-900/20",
    text: "text-amber-300",
    icon: "warning",
    border: "border-amber-500/30",
  },
  error: {
    bg: "bg-error-container/40",
    text: "text-error",
    icon: "error",
    border: "border-error/30",
  },
};

export default function NotificationBanner() {
  const { banners, dismissBanner } = useBanners();

  if (banners.length === 0) return null;

  return (
    <div className="fixed top-16 md:top-20 left-0 right-0 z-40 flex flex-col gap-2 px-4 pt-3 lg:pl-80 pointer-events-none">
      {banners.map((banner) => {
        const colors = COLOR_MAP[banner.color] ?? COLOR_MAP.info;
        return (
          <div
            key={banner.id}
            className={`pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-2xl border ${colors.bg} ${colors.border} backdrop-blur-xl shadow-lg animate-slide-down`}
          >
            <span
              className={`material-symbols-outlined ${colors.text} text-lg flex-shrink-0`}
            >
              {colors.icon}
            </span>

            <p className={`flex-1 text-sm font-medium ${colors.text} min-w-0`}>
              {banner.message}
            </p>

            {banner.link && (
              <Link
                href={banner.link}
                className={`flex-shrink-0 text-xs font-bold ${colors.text} opacity-80 hover:opacity-100 hover:underline underline-offset-2 transition-opacity`}
              >
                {banner.linkText ?? "View"}
              </Link>
            )}

            {banner.dismissible && (
              <button
                onClick={() => dismissBanner(banner.id)}
                className={`flex-shrink-0 p-1 rounded-full hover:bg-white/10 transition-colors ${colors.text}`}
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