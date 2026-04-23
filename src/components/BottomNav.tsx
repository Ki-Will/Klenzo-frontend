"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", icon: "home", label: "Home" },
  { href: "/expenses", icon: "account_balance_wallet", label: "Costs" },
  { href: "/expenses/add", icon: "add_circle", label: "Add", isFab: true },
  { href: "/groups", icon: "group", label: "Social" },
  { href: "/analytics", icon: "query_stats", label: "Insights" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 w-full flex justify-around items-end px-6 pb-8 pt-4 bg-neutral-950/90 backdrop-blur-2xl z-50 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.4)]">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        if (item.isFab) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center bg-indigo-600 text-white rounded-full p-3 mb-2 transform -translate-y-2 shadow-[0_0_20px_rgba(79,70,229,0.4)] active:scale-90 transition-transform"
            >
              <span className="material-symbols-outlined">{item.icon}</span>
            </Link>
          );
        }
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center p-2 active:scale-90 transition-transform ${
              isActive ? "text-indigo-400" : "text-neutral-500 hover:text-indigo-400"
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              {item.icon}
            </span>
            <span className="font-inter text-[10px] font-medium mt-1">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
