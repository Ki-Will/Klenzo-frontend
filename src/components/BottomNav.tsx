"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard",    icon: "home",         label: "Home" },
  { href: "/habits",       icon: "auto_awesome", label: "Habits" },
  { href: "/expenses/add", icon: "add_circle",   label: "Add",   isFab: true },
  { href: "/productivity", icon: "task_alt",     label: "Tasks" },
  { href: "/analytics",    icon: "query_stats",  label: "Insights" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50
                 flex items-end justify-around
                 px-2 pt-3 pb-safe
                 bg-[#0a0a0a]/95 backdrop-blur-2xl
                 rounded-t-[2rem]
                 shadow-[0_-8px_32px_rgba(0,0,0,0.5)]
                 border-t border-white/5"
      style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
    >
      {navItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/expenses/add" && pathname.startsWith(item.href + "/"));

        if (item.isFab) {
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label="Add expense"
              className="flex flex-col items-center justify-center
                         w-14 h-14 rounded-full
                         bg-[#4f46e5]
                         shadow-[0_0_24px_rgba(79,70,229,0.5)]
                         -translate-y-3
                         active:scale-90 transition-transform"
            >
              <span className="material-symbols-outlined text-white text-[22px] leading-none">
                {item.icon}
              </span>
            </Link>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-1
                        min-w-[3rem] px-1 py-1
                        active:scale-90 transition-all duration-150
                        ${isActive ? "text-[#c3c0ff]" : "text-[#918fa1]"}`}
          >
            <span
              className="material-symbols-outlined text-[22px] leading-none"
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              {item.icon}
            </span>
            <span
              className={`text-[9px] font-semibold tracking-wide leading-none
                          ${isActive ? "text-[#c3c0ff]" : "text-[#918fa1]"}`}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
