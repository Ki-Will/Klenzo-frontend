"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", icon: "home", label: "Home" },
  { href: "/habits", icon: "auto_awesome", label: "Habits" },
  { href: "/expenses", icon: "credit_card", label: "Finance" },
  { href: "/productivity", icon: "bolt", label: "Productivity" },
  { href: "/analytics", icon: "analytics", label: "Analytics" },
  { href: "/groups", icon: "group", label: "Groups" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50
                 flex items-end justify-around
                 px-2 pt-3"
      style={{
        backgroundColor: "var(--c-sidenav-bg)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderTop: "1px solid var(--c-border-subtle)",
        boxShadow: "var(--c-bottom-nav-shadow)",
        paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))",
      }}
    >
      {navItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/expenses/add" &&
            pathname.startsWith(item.href + "/"));

        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center justify-center gap-1
                       min-w-[3rem] px-1 py-1
                       active:scale-90 transition-all duration-150"
            style={{
              // color: isActive ? "var(--color-primary)" : "var(--c-text-muted)",
              color: isActive ? "var(--color-primary)" : "var(--c-text-muted)",
              boxShadow: isActive ? "var(--color-primary)" : "none",
            }}
          >
            <span
              className="material-symbols-outlined text-[22px] leading-none"
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              {item.icon}
            </span>
            <span className="text-[9px] font-semibold tracking-wide leading-none">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
