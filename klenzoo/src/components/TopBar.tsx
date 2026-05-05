"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useNotificationWebSocket } from "@/lib/ws-notification-context";

interface TopBarProps {
  showClose?: boolean;
}

// Map routes to page titles for mobile header
const PAGE_TITLES: Record<string, string> = {
  "/dashboard":    "Dashboard",
  "/habits":       "Habits",
  "/productivity": "Tasks",
  "/expenses":     "Expenses",
  "/expenses/add": "Add Expense",
  "/analytics":    "Analytics",
  "/groups":       "Groups",
  "/settings":     "Settings",
  "/notifications":"Notifications",
  "/profile":      "Profile",
  "/security":     "Security",
  "/admin":        "Admin",
  "/sms-automation": "SMS Tracking",
};

export default function TopBar({ showClose = false }: TopBarProps) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const { unreadCount } = useNotificationWebSocket();

  // Find the best matching title
  const title =
    PAGE_TITLES[pathname] ??
    Object.entries(PAGE_TITLES).find(([k]) => pathname.startsWith(k + "/"))?.[1] ??
    "Klenzoo";

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-16 md:h-20
                 flex items-center justify-between
                 px-4 md:px-8 lg:pl-80
                 backdrop-blur-xl bg-[#131313]/90
                 border-b border-white/[0.04]"
    >
      {/* ── Left ── */}
      <div className="flex items-center gap-3 min-w-0">
        {showClose ? (
          <Link
            href="/dashboard"
            className="flex-shrink-0 w-9 h-9 flex items-center justify-center
                       rounded-full hover:bg-[#2a2a2a] transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined text-[#e5e2e1] text-[20px]">close</span>
          </Link>
        ) : (
          /* Mobile: back chevron when inside a sub-route */
          pathname.split("/").length > 2 && (
            <button
              onClick={() => window.history.back()}
              className="lg:hidden flex-shrink-0 w-9 h-9 flex items-center justify-center
                         rounded-full hover:bg-[#2a2a2a] transition-colors active:scale-95"
            >
              <span className="material-symbols-outlined text-[#e5e2e1] text-[20px]">
                arrow_back
              </span>
            </button>
          )
        )}

        {/* Mobile: brand logo on top-level pages, page title on sub-pages */}
        <div className="lg:hidden min-w-0">
          {pathname.split("/").length <= 2 ? (
            <Link
              href="/dashboard"
              className="text-xl font-black text-[#4f46e5] tracking-tighter font-headline"
            >
              Klenzoo
            </Link>
          ) : (
            <span className="text-base font-bold text-[#e5e2e1] font-headline truncate">
              {title}
            </span>
          )}
        </div>

        {/* Desktop: search bar */}
        <div className="hidden lg:flex items-center bg-[#1c1b1b] px-5 py-2.5 rounded-full
                        w-72 xl:w-96 border border-[#464555]/10">
          <span className="material-symbols-outlined text-[#c7c4d8] mr-3 text-[18px] flex-shrink-0">
            search
          </span>
          <input
            type="text"
            placeholder="Search tasks, habits, finance..."
            className="bg-transparent border-none focus:outline-none text-sm
                       text-[#e5e2e1] placeholder:text-[#c7c4d8]/40 w-full"
          />
        </div>
      </div>

      {/* ── Right ── */}
      <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
        {/* Mobile search toggle */}
        <button
          onClick={() => setSearchOpen((v) => !v)}
          className="lg:hidden w-9 h-9 flex items-center justify-center
                     rounded-full text-[#c7c4d8] hover:text-[#c3c0ff]
                     hover:bg-[#2a2a2a] transition-colors active:scale-95"
          aria-label="Search"
        >
          <span className="material-symbols-outlined text-[20px]">search</span>
        </button>

        <Link
          href="/notifications"
          className="w-9 h-9 flex items-center justify-center rounded-full relative
                     text-[#c7c4d8] hover:text-[#c3c0ff]
                     hover:bg-[#2a2a2a] transition-colors active:scale-95"
          aria-label="Notifications"
        >
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center
                             bg-[#ffb4ab] text-[#2b0002] text-[10px] font-bold rounded-full
                             shadow-[0_0_8px_rgba(255,138,128,0.5)] animate-pulse">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Link>

        <Link
          href="/settings"
          className="w-9 h-9 rounded-full overflow-hidden border border-[#4f46e5]/30
                     bg-[#2a2a2a] flex items-center justify-center
                     hover:border-[#4f46e5]/60 transition-colors active:scale-95"
          aria-label="Profile"
        >
          <span className="material-symbols-outlined text-[#c7c4d8] text-[20px]">
            account_circle
          </span>
        </Link>
      </div>

      {/* Mobile search overlay */}
      {searchOpen && (
        <div
          className="lg:hidden absolute top-full left-0 right-0
                     bg-[#0e0e0e]/98 backdrop-blur-xl
                     px-4 py-3 border-b border-white/5
                     shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
        >
          <div className="flex items-center bg-[#1c1b1b] px-4 py-3 rounded-2xl
                          border border-[#464555]/10">
            <span className="material-symbols-outlined text-[#c7c4d8] mr-3 text-[18px]">
              search
            </span>
            <input
              autoFocus
              type="text"
              placeholder="Search tasks, habits, finance..."
              className="bg-transparent border-none focus:outline-none text-sm
                         text-[#e5e2e1] placeholder:text-[#c7c4d8]/40 w-full"
            />
            <button
              onClick={() => setSearchOpen(false)}
              className="ml-2 text-[#c7c4d8] hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
