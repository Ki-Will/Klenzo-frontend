"use client";
import Link from "next/link";
import { useState, useMemo, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useNotificationWebSocket } from "@/lib/ws-notification-context";
import { useAuth } from "@/lib/auth-context";
import KlenzooLogo from "@/components/KlenzooLogo";
import {
  productivity,
  habits as habitsApi,
  finance,
  type Task,
  type Habit,
  type Transaction,
  type Group,
} from "@/lib/api";

interface TopBarProps {
  showClose?: boolean;
}

interface SearchResult {
  id: string | number;
  title: string;
  subtitle?: string;
  type: "task" | "habit" | "finance" | "setting" | "group";
  href: string;
  icon: string;
}

// Map routes to page titles for mobile header
const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/habits": "Habits",
  "/productivity": "Tasks",
  "/expenses": "Finance",
  "/expenses/add": "Add Entry",
  "/analytics": "Analytics",
  "/groups": "Groups",
  "/settings": "Settings",
  "/notifications": "Notifications",
  "/profile": "Profile",
  "/security": "Security",
  "/admin": "Admin",
  "/sms-automation": "SMS Sync",
};

function getIconForRoute(route: string) {
  const icons: Record<string, string> = {
    "/dashboard": "space_dashboard",
    "/habits": "auto_awesome",
    "/productivity": "task_alt",
    "/expenses": "account_balance_wallet",
    "/analytics": "insights",
    "/groups": "group",
    "/settings": "settings",
    "/notifications": "notifications",
    "/profile": "person",
    "/security": "shield",
    "/admin": "admin_panel_settings",
    "/sms-automation": "sms",
  };
  return icons[route] || "link";
}

export default function TopBar({ showClose = false }: TopBarProps) {
  const pathname = usePathname();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const { unreadCount } = useNotificationWebSocket();
  const { user, logout } = useAuth();

  // Search State
  const [query, setQuery] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const resultsRef = useRef<HTMLDivElement>(null);
  const router = useRouter(); // Need router for Enter key navigation

  // Prefetch data once
  useEffect(() => {
    async function fetchData() {
      try {
        const [t, h, f, g] = await Promise.all([
          productivity.getTasks().catch(() => []),
          habitsApi.getHabits().catch(() => []),
          finance.getTransactions().catch(() => []),
          finance.getGroups().catch(() => []),
        ]);
        setTasks(t);
        setHabits(h);
        setTransactions(f);
        setGroups(g);
      } catch (err) {
        console.error("Global search data prefetch failed:", err);
      }
    }
    fetchData();
  }, []);

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const items: SearchResult[] = [];

    // 1. Pages/Settings
    Object.entries(PAGE_TITLES).forEach(([href, title]) => {
      if (title.toLowerCase().includes(q)) {
        items.push({
          id: href,
          title,
          type: "setting",
          href,
          icon: getIconForRoute(href),
        });
      }
    });

    // 2. Tasks
    tasks.forEach((t) => {
      if (
        t.title.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q)
      ) {
        items.push({
          id: `task-${t.id}`,
          title: t.title,
          subtitle: `Task • ${t.status.replace("_", " ")}`,
          type: "task",
          href: "/productivity",
          icon: "task_alt",
        });
      }
    });

    // 3. Habits
    habits.forEach((h) => {
      if (h.name.toLowerCase().includes(q)) {
        items.push({
          id: `habit-${h.id}`,
          title: h.name,
          subtitle: `Habit • ${h.currentStreak} day streak`,
          type: "habit",
          href: "/habits",
          icon: "auto_awesome",
        });
      }
    });

    // 4. Finance
    transactions.forEach((tx) => {
      if (
        tx.description?.toLowerCase().includes(q) ||
        tx.category?.toLowerCase().includes(q)
      ) {
        items.push({
          id: `tx-${tx.id}`,
          title: tx.description || tx.category || "Transaction",
          subtitle: `Finance • ${tx.transactionType === "expense" ? "-" : "+"}$${tx.amount}`,
          type: "finance",
          href: "/expenses",
          icon: "account_balance_wallet",
        });
      }
    });

    // 5. Groups
    groups.forEach((g) => {
      if (g.name.toLowerCase().includes(q)) {
        items.push({
          id: `group-${g.id}`,
          title: g.name,
          subtitle: `Group • ${g.members.length} members`,
          type: "group",
          href: `/groups/${g.id}`,
          icon: "group",
        });
      }
    });

    // 6. Utility actions (Sign Out)
    if ("sign out".includes(q) || "logout".includes(q) || "exit".includes(q)) {
      items.push({
        id: "action-signout",
        title: "Sign Out",
        subtitle: "End your current session",
        type: "setting",
        href: "#",
        icon: "logout",
      });
    }

    return items.slice(0, 8);
  }, [query, tasks, habits, transactions, groups]);

  // Reset active index when query changes
  useEffect(() => {
    setActiveIndex(-1);
  }, [query]);

  // Handle Keyboard Navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!query.trim() || searchResults.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : searchResults.length - 1));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0) {
        e.preventDefault();
        const target = searchResults[activeIndex];
        if (target.id === "action-signout") {
          logout();
          return;
        }
        setQuery("");
        setMobileSearchOpen(false);
        router.push(target.href);
      }
    } else if (e.key === "Escape") {
      setQuery("");
      setMobileSearchOpen(false);
    }
  };

  // Click outside search results to close
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (resultsRef.current && !resultsRef.current.contains(e.target as Node)) {
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Responsive logic
  const isAddExpense = pathname === "/expenses/add";
  const useClose = showClose || isAddExpense;
  const title =
    PAGE_TITLES[pathname] ??
    Object.entries(PAGE_TITLES).find(([k]) => pathname.startsWith(k + "/"))?.[
      1
    ] ??
    "Klenzoo";

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-16 md:h-20
                 flex items-center justify-between
                 px-4 md:px-8 lg:left-72 lg:px-10
                 backdrop-blur-xl bg-[#131313]/90
                 border-b border-white/[0.04]"
    >
      {/* ── Left ── */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {useClose ? (
          <Link
            href="/dashboard"
            className="flex-shrink-0 w-9 h-9 flex items-center justify-center
                       rounded-full hover:bg-[#2a2a2a] transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined text-[#e5e2e1] text-[20px]">
              close
            </span>
          </Link>
        ) : (
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

        {/* Mobile Title / Logo */}
        <div className="lg:hidden min-w-0">
          {pathname.split("/").length <= 2 ? (
            <Link href="/dashboard" className="block">
              <KlenzooLogo className="w-10 h-auto" variant="small" />
            </Link>
          ) : (
            <span className="text-base font-bold text-[#e5e2e1] font-headline truncate">
              {title}
            </span>
          )}
        </div>

        {/* Desktop Search */}
        <div className="hidden lg:block relative ml-4" ref={resultsRef}>
          <div
            className="flex items-center bg-[#1c1b1b] px-5 py-2.5 rounded-full
                          w-72 xl:w-96 border border-[#464555]/10 focus-within:border-[#4f46e5]/40 transition-all"
          >
            <span className="material-symbols-outlined text-[#c7c4d8] mr-3 text-[18px] flex-shrink-0">
              search
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search tasks, habits, finance..."
              className="bg-transparent border-none focus:outline-none text-sm
                         text-[#e5e2e1] placeholder:text-[#c7c4d8]/40 w-full"
            />
          </div>

          {/* Desktop Results Dropdown */}
          {query.trim() && (
            <div
              className="absolute top-full mt-3 left-0 right-0 bg-[#161616] border border-white/5 
                         rounded-2xl shadow-2xl overflow-hidden backdrop-blur-2xl z-50 transition-all"
            >
              <div className="py-2">
                {searchResults.length > 0 ? (
                  searchResults.map((res, idx) => (
                    <Link
                      key={res.id}
                      href={res.href}
                      onClick={(e) => {
                        if (res.id === "action-signout") {
                          e.preventDefault();
                          logout();
                        } else {
                          setQuery("");
                        }
                      }}
                      className={`flex items-center gap-4 px-5 py-3 transition-colors group ${
                        activeIndex === idx
                          ? "bg-white/[0.08]"
                          : "hover:bg-white/[0.03]"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                          activeIndex === idx
                            ? "bg-[#4f46e5]/40"
                            : "bg-[#202020] group-hover:bg-[#4f46e5]/20"
                        }`}
                      >
                        <span
                          className={`material-symbols-outlined text-[20px] transition-colors ${
                            activeIndex === idx
                              ? "text-[#c3c0ff]"
                              : "text-[#c7c4d8] group-hover:text-[#c3c0ff]"
                          }`}
                        >
                          {res.icon}
                        </span>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold text-[#e5e2e1] truncate">
                          {res.title}
                        </span>
                        {res.subtitle && (
                          <span className="text-[11px] text-[#918fa1] uppercase tracking-wider font-bold">
                            {res.subtitle}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="px-6 py-10 text-center">
                    <span className="material-symbols-outlined text-4xl text-[#c7c4d8]/20 mb-3 block">
                      search_off
                    </span>
                    <p className="text-sm text-[#c7c4d8]/50">
                      No results found for "{query}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Right ── */}
      <div className="flex items-center gap-1 md:gap-2 flex-shrink-0 ml-4">
        {/* Mobile Search Toggle */}
        <button
          onClick={() => setMobileSearchOpen((v) => !v)}
          className="lg:hidden w-9 h-9 flex items-center justify-center
                     rounded-full text-[#c7c4d8] hover:text-[#c3c0ff]
                     hover:bg-[#2a2a2a] transition-colors active:scale-95"
          aria-label="Search"
        >
          <span className="material-symbols-outlined text-[20px]">search</span>
        </button>

        {/* Notifications */}
        <Link
          href="/notifications"
          className="w-9 h-9 flex items-center justify-center rounded-full relative
                     text-[#c7c4d8] hover:text-[#c3c0ff]
                     hover:bg-[#2a2a2a] transition-colors active:scale-95"
          aria-label="Notifications"
        >
          <span className="material-symbols-outlined text-[20px]">
            notifications
          </span>
          {unreadCount > 0 && (
            <span
              className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center
                             bg-[#ffb4ab] text-[#2b0002] text-[10px] font-bold rounded-full
                             shadow-[0_0_8px_rgba(255,138,128,0.5)]"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Link>

        {/* User Avatar */}
        <Link
          href="/settings"
          className="w-9 h-9 rounded-full overflow-hidden border border-[#4f46e5]/30
                     bg-[#2a2a2a] flex items-center justify-center
                     hover:border-[#4f46e5]/60 transition-colors active:scale-95"
          aria-label="Profile"
        >
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || user?.email?.split("@")[0] || "User")}&background=353534&color=c7c4d8&size=128`}
              alt="Default Avatar"
              className="w-full h-full object-cover"
            />
          )}
        </Link>
      </div>

      {/* Mobile search overlay */}
      {mobileSearchOpen && (
        <div
          className="lg:hidden absolute top-full left-0 right-0
                     bg-[#0e0e0e]/98 backdrop-blur-xl
                     px-4 py-3 border-b border-white/5
                     shadow-[0_8px_32px_rgba(0,0,0,0.4)] z-50 overflow-y-auto max-h-[80vh]"
        >
          <div className="flex items-center bg-[#1c1b1b] px-4 py-3 rounded-2xl border border-[#464555]/10 mb-4">
            <span className="material-symbols-outlined text-[#c7c4d8] mr-3 text-[18px]">
              search
            </span>
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search tasks, habits, finance..."
              className="bg-transparent border-none focus:outline-none text-sm
                         text-[#e5e2e1] placeholder:text-[#c7c4d8]/40 w-full"
            />
            <button
              onClick={() => {
                setMobileSearchOpen(false);
                setQuery("");
              }}
              className="ml-2 text-[#c7c4d8] hover:text-white"
            >
              <span className="material-symbols-outlined text-[18px]">
                close
              </span>
            </button>
          </div>

          {query.trim() && (
            <div className="space-y-1 pb-4">
              {searchResults.length > 0 ? (
                searchResults.map((res, idx) => (
                  <Link
                    key={res.id}
                    href={res.href}
                    onClick={(e) => {
                      if (res.id === "action-signout") {
                        e.preventDefault();
                        logout();
                      } else {
                        setMobileSearchOpen(false);
                        setQuery("");
                      }
                    }}
                    className={`flex items-center gap-4 p-3 rounded-2xl transition-all ${
                      activeIndex === idx
                        ? "bg-white/[0.08]"
                        : "hover:bg-white/[0.03] active:bg-white/[0.05]"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                        activeIndex === idx ? "bg-[#4f46e5]/40" : "bg-[#202020]"
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined text-[20px] transition-colors ${
                          activeIndex === idx ? "text-[#c3c0ff]" : "text-[#c7c4d8]"
                        }`}
                      >
                        {res.icon}
                      </span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold text-[#e5e2e1] truncate">
                        {res.title}
                      </span>
                      {res.subtitle && (
                        <span className="text-[10px] text-[#918fa1] uppercase tracking-wider font-bold">
                          {res.subtitle}
                        </span>
                      )}
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-center py-8 text-sm text-[#c7c4d8]/40">
                  No results found
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
