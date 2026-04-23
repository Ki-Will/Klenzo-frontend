"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", icon: "dashboard", label: "Dashboard" },
  { href: "/expenses", icon: "receipt_long", label: "Expenses" },
  { href: "/groups", icon: "group", label: "Groups" },
  { href: "/analytics", icon: "insights", label: "Analytics" },
  { href: "/settings", icon: "settings", label: "Settings" },
];

export default function SideNav() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 border-r border-white/5 bg-[#0a0a0a] hidden lg:flex flex-col p-6 space-y-4 z-40">
      <div className="mb-8 pt-4">
        <div className="text-xl font-bold text-white font-headline">Klenzoo</div>
        <div className="text-[10px] font-manrope uppercase tracking-widest text-neutral-500">
          Premium Finance
        </div>
      </div>
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 p-3 rounded-xl transition-all ease-in-out duration-300 font-manrope uppercase tracking-widest text-[10px] ${
                isActive
                  ? "text-white bg-indigo-600/10"
                  : "text-neutral-500 hover:text-indigo-300 hover:bg-neutral-900"
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <Link
        href="/expenses/add"
        className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold text-xs uppercase tracking-widest transition-all text-center active:scale-95"
      >
        Add Expense
      </Link>
    </aside>
  );
}
