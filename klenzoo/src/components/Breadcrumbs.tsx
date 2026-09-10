"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ROUTE_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  wallets: "Wallets",
  expenses: "Expenses",
  transfers: "Transfers",
  habits: "Habits",
  productivity: "Productivity",
  notifications: "Notifications",
  profile: "Profile",
  settings: "Settings",
  security: "Security",
  analytics: "Analytics",
  admin: "Admin",
  kyc: "KYC",
  groups: "Groups",
  "sms-automation": "SMS",
  budgets: "Budgets",
  add: "Add New",
  new: "Create",
  balance: "Balance",
};

/**
 * Breadcrumb navigation component.
 * Automatically generates breadcrumbs from the current URL path.
 */
export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length <= 1) return null;

  const breadcrumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const label =
      ROUTE_LABELS[segment] ||
      segment.charAt(0).toUpperCase() + segment.slice(1);
    const isLast = index === segments.length - 1;

    return { href, label, isLast };
  });

  return (
    <nav className="flex items-center gap-1 text-xs mb-4" aria-label="Breadcrumb">
      <Link
        href="/dashboard"
        className="text-muted hover:text-primary-text transition-colors"
      >
        <span className="material-symbols-outlined text-sm">home</span>
      </Link>
      {breadcrumbs.map((crumb) => (
        <span key={crumb.href} className="flex items-center gap-1">
          <span className="material-symbols-outlined text-muted text-xs">
            chevron_right
          </span>
          {crumb.isLast ? (
            <span className="text-primary-text font-semibold">{crumb.label}</span>
          ) : (
            <Link
              href={crumb.href}
              className="text-muted hover:text-primary-text transition-colors"
            >
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
