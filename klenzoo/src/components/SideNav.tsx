"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import KlenzooLogo from "@/components/KlenzooLogo";

const navItems = [
  { href: "/dashboard", icon: "space_dashboard", label: "Dashboard" },
  { href: "/habits", icon: "auto_awesome", label: "Habits" },
  { href: "/productivity", icon: "task_alt", label: "Productivity" },
  { href: "/expenses", icon: "account_balance_wallet", label: "Finance" },
  { href: "/analytics", icon: "query_stats", label: "Analytics" },
  { href: "/groups", icon: "group", label: "Groups" },
  { href: "/settings", icon: "settings", label: "Settings" },
];

export default function SideNav() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-[#131313] hidden lg:flex flex-col p-8 z-40 rounded-r-[3rem]">
      {/* Brand */}
      <div className="mb-12">
        <Link
          href="/dashboard"
          className="block w-32 h-auto hover:opacity-80 transition-opacity"
        >
          <KlenzooLogo variant="full" className="w-48" />
        </Link>
      </div>

      {/* Nav links */}
      <nav className="flex flex-col gap-2 flex-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 py-3 px-4 rounded-xl transition-all duration-300 text-sm font-headline relative ${
                isActive
                  ? "text-[#4f46e5] font-bold bg-[#4f46e5]/5 after:content-[''] after:absolute after:right-0 after:w-1 after:h-8 after:bg-[#4f46e5] after:rounded-full"
                  : "text-[#c7c4d8] opacity-60 hover:opacity-100 hover:bg-[#2a2a2a]"
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* CTA */}
      <Link
        href="/expenses/add"
        className="mt-8 w-full py-4 rounded-full luminous-gradient text-white font-bold text-sm text-center shadow-lg shadow-[#4f46e5]/20 active:scale-95 transition-transform flex items-center justify-center gap-2"
      >
        <span className="material-symbols-outlined text-sm">add</span>
        Add New Entry
      </Link>
    </aside>
  );
}
