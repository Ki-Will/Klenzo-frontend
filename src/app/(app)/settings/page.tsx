"use client";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function SettingsPage() {
  const { user, logout } = useAuth();

  return (
    <main className="min-h-screen py-6">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-5xl font-extrabold font-headline tracking-tighter mb-2">Settings</h1>
          <p className="text-[#c7c4d8]">Manage your financial ecosystem and personal preferences.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Profile Card */}
          <section className="md:col-span-8 bg-[#1c1b1b] rounded-2xl p-8 relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="w-24 h-24 rounded-full bg-[#353534] flex items-center justify-center ring-4 ring-[#4f46e5]/20 flex-shrink-0">
                <span className="material-symbols-outlined text-5xl text-[#c7c4d8]">account_circle</span>
              </div>
              <div className="text-center md:text-left flex-1">
                <h2 className="text-2xl font-bold font-headline mb-1">
                  {user?.name ?? user?.email?.split("@")[0] ?? "User"}
                </h2>
                <p className="text-[#c3c0ff] font-medium mb-4">{user?.email}</p>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <span className="px-4 py-2 bg-[#2a2a2a] rounded-full text-xs font-bold uppercase tracking-wider text-[#c7c4d8]">
                    {user?.isActive ? "Active Member" : "Inactive"}
                  </span>
                  <span className="px-4 py-2 bg-[#c3c0ff]/10 rounded-full text-xs font-bold uppercase tracking-wider text-[#c3c0ff]">
                    Identity Verified
                  </span>
                </div>
              </div>
              <Link href="/profile" className="bg-[#2a2a2a] hover:bg-[#3a3939] transition-colors p-3 rounded-full flex-shrink-0">
                <span className="material-symbols-outlined">edit</span>
              </Link>
            </div>
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#c3c0ff]/5 rounded-full blur-[100px]" />
          </section>

          {/* Security Card */}
          <section className="md:col-span-4 bg-[#1c1b1b] rounded-2xl p-8 flex flex-col justify-between border-b-4 border-[#c3c0ff]/20">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-[#c3c0ff]">shield_person</span>
                <h3 className="text-lg font-bold font-headline">Security</h3>
              </div>
              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm font-semibold block">FaceID</span>
                    <span className="text-xs text-[#c7c4d8]">Biometric entry</span>
                  </div>
                  <div className="w-12 h-6 bg-[#4f46e5] rounded-full relative">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm font-semibold block">Passcode</span>
                    <span className="text-xs text-[#c7c4d8]">6-digit security</span>
                  </div>
                  <Link href="/security" className="text-[#c3c0ff] text-xs font-bold uppercase hover:underline">
                    Manage
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Notifications */}
          <section className="md:col-span-5 bg-[#1c1b1b] rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-[#c3c0ff]">notifications_active</span>
              <h3 className="text-lg font-bold font-headline">Notifications</h3>
            </div>
            <div className="space-y-5">
              {[
                { label: "Smart Insights", on: false },
                { label: "Transaction Alerts", on: true },
                { label: "Security Alerts", on: true },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{item.label}</span>
                  <div className={`w-12 h-6 rounded-full relative cursor-pointer ${item.on ? "bg-[#4f46e5]" : "bg-[#353534]"}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${item.on ? "right-1" : "left-1"}`} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Quick Nav */}
          <section className="md:col-span-7 bg-[#1c1b1b] rounded-2xl p-8">
            <h3 className="text-lg font-bold font-headline mb-6">Quick Navigation</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { href: "/profile", icon: "person", label: "Edit Profile" },
                { href: "/security", icon: "lock", label: "Security" },
                { href: "/notifications", icon: "notifications", label: "Notifications" },
                { href: "/sms-automation", icon: "sms", label: "SMS Tracking" },
                { href: "/analytics", icon: "insights", label: "Analytics" },
                { href: "/admin", icon: "admin_panel_settings", label: "Admin" },
              ].map((item) => (
                <Link key={item.href} href={item.href}
                  className="flex items-center gap-3 p-4 bg-[#0e0e0e] rounded-2xl hover:bg-[#2a2a2a] transition-colors group">
                  <span className="material-symbols-outlined text-[#c3c0ff] text-sm">{item.icon}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                  <span className="material-symbols-outlined text-[#c7c4d8] text-sm ml-auto opacity-0 group-hover:opacity-100 transition-opacity">chevron_right</span>
                </Link>
              ))}
            </div>
          </section>

          {/* Support & Sign Out */}
          <section className="md:col-span-12 bg-[#1c1b1b] rounded-2xl p-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#c3c0ff]">support_agent</span>
                <span className="font-bold">Support Center</span>
              </div>
              <div className="h-6 w-px bg-[#464555]/30 hidden md:block" />
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#c3c0ff]">description</span>
                <span className="font-bold">Legal &amp; Privacy</span>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={logout}
                className="px-8 py-3 bg-[#2a2a2a] rounded-full font-bold text-sm hover:bg-[#3a3939] transition-all"
              >
                Sign Out
              </button>
              <button className="px-8 py-3 bg-gradient-to-br from-[#4f46e5] to-[#c3c0ff] text-white rounded-full font-bold text-sm shadow-[0_0_20px_rgba(79,70,229,0.2)] active:scale-95 transition-transform">
                Contact Expert
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
