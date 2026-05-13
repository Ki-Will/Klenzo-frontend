"use client";

import SideNav from "@/components/SideNav";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import NotificationBanner from "@/components/NotificationBanner";
import { NotificationWebSocketProvider } from "@/lib/ws-notification-context";
import { BannerProvider } from "@/lib/banner-context";
import { useAuth } from "@/lib/auth-context";

function AppShell({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth();

  // Show a spinner while the initial auth check is in flight.
  // The middleware already redirects unauthenticated requests to /login,
  // so we don't need to do any redirect logic here.
  if (loading) {
    return (
      <div className="min-h-screen bg-[#131313] flex items-center justify-center">
        <div className="flex space-x-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#131313]">
      <TopBar />
      <SideNav />
      {/* pt-16/pt-20 offsets for the fixed TopBar. lg:ml-72 for sidebar. */}
      <div className="pt-16 md:pt-20 lg:ml-72 pb-28 lg:pb-8">
        {/* Announcement banner sits in flow — pushes content down, no overlap */}
        <NotificationBanner />
        {children}
      </div>
      <BottomNav />
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <NotificationWebSocketProvider>
      <BannerProvider>
        <AppShell>{children}</AppShell>
      </BannerProvider>
    </NotificationWebSocketProvider>
  );
}
