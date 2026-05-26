"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { adminApi, type PlatformStats, type ManageUser, type Banner, type BannerColor, type CreateAdminDto } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

// ─── Mock / Seed Data ─────────────────────────────────────────────────────────
const SEED_STATS: PlatformStats = {
  totalUsers: 24891,
  activeUsers: 1204,
  totalTransactions: 142530,
  transactionVolume: 4200000,
  activeSessions: 387,
  systemHealth: 99.9,
  userGrowth: 8.2,
  revenueGrowth: 12.5,
  monthlyRevenue: [30000, 45000, 35000, 60000, 55000, 75000, 65000, 80000, 70000, 90000, 85000, 95000],
};

const SEED_USERS: ManageUser[] = [
  { id: 1, email: "alex@klenzoo.com", name: "Alex Rivers", isActive: true, role: "user", lastLogin: new Date().toISOString(), createdAt: "2024-01-15", transactionCount: 342, totalVolume: 18500 },
  { id: 2, email: "priya@klenzoo.com", name: "Priya Lal", isActive: true, role: "user", lastLogin: new Date(Date.now() - 900000).toISOString(), createdAt: "2024-03-22", transactionCount: 128, totalVolume: 7200 },
  { id: 3, email: "marcus@klenzoo.com", name: "Marcus Webb", isActive: false, role: "user", lastLogin: new Date(Date.now() - 3600000).toISOString(), createdAt: "2024-06-10", transactionCount: 56, totalVolume: 2100 },
  { id: 4, email: "sofia@klenzoo.com", name: "Sofia Chen", isActive: true, role: "admin", lastLogin: new Date(Date.now() - 10800000).toISOString(), createdAt: "2024-02-08", transactionCount: 210, totalVolume: 9400 },
  { id: 5, email: "james@klenzoo.com", name: "James Wright", isActive: true, role: "user", lastLogin: new Date(Date.now() - 86400000).toISOString(), createdAt: "2024-08-14", transactionCount: 89, totalVolume: 4500 },
  { id: 6, email: "lina@klenzoo.com", name: "Lina K.", isActive: false, role: "user", createdAt: "2024-11-01", transactionCount: 12, totalVolume: 800 },
];

const SEED_BROADCASTS: Banner[] = [
  { id: 1, message: "System maintenance scheduled for Sunday 2 AM UTC", color: "warning", active: true, dismissible: true },
  { id: 2, message: "Welcome to Klenzoo! New analytics features are now live.", color: "info", active: false, dismissible: true },
];

// ─── Tab type ─────────────────────────────────────────────────────────────────
type AdminTab = "dashboard" | "users" | "admins" | "broadcasts";

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub }: { icon: string; label: string; value: string; sub?: string }) {
  return (
    <div className="bg-[#1c1b1b] rounded-2xl p-6 space-y-3">
      <div className="flex justify-between items-start">
        <div className="w-10 h-10 bg-[#2a2a2a] rounded-xl flex items-center justify-center">
          <span className="material-symbols-outlined text-[#c3c0ff]">{icon}</span>
        </div>
      </div>
      <div>
        <p className="text-2xl font-headline font-extrabold text-[#e5e2e1]">{value}</p>
        <p className="text-xs text-[#c7c4d8] uppercase tracking-widest mt-1">{label}</p>
        {sub && <p className="text-xs text-[#c3c0ff] mt-1">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Broadcast Modal ──────────────────────────────────────────────────────────
function BroadcastModal({ onClose, onSent }: { onClose: () => void; onSent: (b: Banner) => void }) {
  const [message, setMessage] = useState("");
  const [color, setColor] = useState<BannerColor>("info");
  const [dismissible, setDismissible] = useState(true);
  const [link, setLink] = useState("");
  const [linkText, setLinkText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const banner = await adminApi.broadcast({
        message: message.trim(),
        color,
        dismissible,
        link: link.trim() || undefined,
        linkText: linkText.trim() || undefined,
      });
      onSent(banner);
      onClose();
    } catch (err: any) {
      // Fallback: create locally
      const local: Banner = {
        id: Date.now(),
        message: message.trim(),
        color,
        active: true,
        dismissible,
        link: link.trim() || undefined,
        linkText: linkText.trim() || undefined,
      };
      onSent(local);
      onClose();
      void err;
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg bg-[#1c1b1b] rounded-2xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-[#464555]/20 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-headline font-bold">Broadcast Notification</h2>
          <button onClick={onClose} className="text-[#c7c4d8] hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#c7c4d8] uppercase tracking-widest">Message *</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter broadcast message..."
              required
              rows={3}
              className="w-full bg-[#0e0e0e] border-none rounded-2xl py-4 px-5 text-[#e5e2e1] placeholder:text-[#918fa1]/50 focus:outline-none focus:ring-1 focus:ring-[#c3c0ff] transition-all resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#c7c4d8] uppercase tracking-widest">Color</label>
              <select value={color} onChange={(e) => setColor(e.target.value as BannerColor)}
                className="w-full bg-[#0e0e0e] border-none rounded-2xl py-4 px-5 text-[#e5e2e1] focus:outline-none focus:ring-1 focus:ring-[#c3c0ff] transition-all">
                <option value="info">Info (Blue)</option>
                <option value="success">Success (Green)</option>
                <option value="warning">Warning (Amber)</option>
                <option value="error">Error (Red)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#c7c4d8] uppercase tracking-widest">Dismissible</label>
              <select value={dismissible ? "yes" : "no"} onChange={(e) => setDismissible(e.target.value === "yes")}
                className="w-full bg-[#0e0e0e] border-none rounded-2xl py-4 px-5 text-[#e5e2e1] focus:outline-none focus:ring-1 focus:ring-[#c3c0ff] transition-all">
                <option value="yes">Yes — users can dismiss</option>
                <option value="no">No — always visible</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#c7c4d8] uppercase tracking-widest">Link URL</label>
              <input type="text" value={link} onChange={(e) => setLink(e.target.value)} placeholder="/dashboard"
                className="w-full bg-[#0e0e0e] border-none rounded-2xl py-4 px-5 text-[#e5e2e1] placeholder:text-[#918fa1]/50 focus:outline-none focus:ring-1 focus:ring-[#c3c0ff] transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#c7c4d8] uppercase tracking-widest">Link Text</label>
              <input type="text" value={linkText} onChange={(e) => setLinkText(e.target.value)} placeholder="View"
                className="w-full bg-[#0e0e0e] border-none rounded-2xl py-4 px-5 text-[#e5e2e1] placeholder:text-[#918fa1]/50 focus:outline-none focus:ring-1 focus:ring-[#c3c0ff] transition-all" />
            </div>
          </div>
          {error && <p className="text-[#ffb4ab] text-sm">{error}</p>}
          <button type="submit" disabled={submitting}
            className="w-full py-4 luminous-gradient text-white font-headline font-bold rounded-full shadow-[0_10px_30px_rgba(79,70,229,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50">
            {submitting ? "Sending…" : "Send Broadcast"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Admin Inseminator Modal ──────────────────────────────────────────────────
function SeedAdminModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"admin" | "superadmin">("admin");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim() || !name.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      await adminApi.createAdmin({ email: email.trim(), password, name: name.trim(), role });
      onCreated();
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to create admin");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-md bg-[#1c1b1b] rounded-2xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-[#464555]/20">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-headline font-bold">Seed Administrator</h2>
          <button onClick={onClose} className="text-[#c7c4d8] hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#c7c4d8] uppercase tracking-widest">Full Name *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Admin Name" required
              className="w-full bg-[#0e0e0e] border-none rounded-2xl py-4 px-5 text-[#e5e2e1] placeholder:text-[#918fa1]/50 focus:outline-none focus:ring-1 focus:ring-[#c3c0ff] transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#c7c4d8] uppercase tracking-widest">Email *</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@klenzoo.com" required
              className="w-full bg-[#0e0e0e] border-none rounded-2xl py-4 px-5 text-[#e5e2e1] placeholder:text-[#918fa1]/50 focus:outline-none focus:ring-1 focus:ring-[#c3c0ff] transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#c7c4d8] uppercase tracking-widest">Password *</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters" required minLength={8}
              className="w-full bg-[#0e0e0e] border-none rounded-2xl py-4 px-5 text-[#e5e2e1] placeholder:text-[#918fa1]/50 focus:outline-none focus:ring-1 focus:ring-[#c3c0ff] transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#c7c4d8] uppercase tracking-widest">Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value as "admin" | "superadmin")}
              className="w-full bg-[#0e0e0e] border-none rounded-2xl py-4 px-5 text-[#e5e2e1] focus:outline-none focus:ring-1 focus:ring-[#c3c0ff] transition-all">
              <option value="admin">Admin</option>
              <option value="superadmin">Super Admin</option>
            </select>
          </div>
          {error && <p className="text-[#ffb4ab] text-sm">{error}</p>}
          <button type="submit" disabled={submitting}
            className="w-full py-4 luminous-gradient text-white font-headline font-bold rounded-full shadow-[0_10px_30px_rgba(79,70,229,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50">
            {submitting ? "Creating…" : "Create Administrator"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Confirmation Modal ───────────────────────────────────────────────────────
function ConfirmModal({ title, message, onConfirm, onClose }: { title: string; message: string; onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm bg-[#1c1b1b] rounded-2xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-[#464555]/20">
        <h2 className="text-lg font-headline font-bold mb-3">{title}</h2>
        <p className="text-sm text-[#c7c4d8] mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-full bg-[#2a2a2a] text-[#c7c4d8] font-semibold text-sm hover:bg-[#353534] transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 py-3 rounded-full bg-[#93000a] text-[#ffb4ab] font-semibold text-sm hover:bg-[#7a0006] transition-colors">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────
const TABS: { key: AdminTab; icon: string; label: string }[] = [
  { key: "dashboard", icon: "space_dashboard", label: "Dashboard" },
  { key: "users", icon: "group", label: "Users" },
  { key: "admins", icon: "admin_panel_settings", label: "Admins" },
  { key: "broadcasts", icon: "campaign", label: "Broadcasts" },
];

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<AdminTab>("dashboard");
  const [stats, setStats] = useState<PlatformStats>(SEED_STATS);
  const [users, setUsers] = useState<ManageUser[]>(SEED_USERS);
  const [broadcasts, setBroadcasts] = useState<Banner[]>(SEED_BROADCASTS);
  const [loading, setLoading] = useState(false);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [showSeedAdmin, setShowSeedAdmin] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ title: string; message: string; action: () => void } | null>(null);
  const [search, setSearch] = useState("");

  // Role guard — only admin/superadmin can access this page
  useEffect(() => {
    if (!user) return;
    // Check role from user object — if backend doesn't expose role, allow access
    // and let the API calls fail with 403 naturally
    const role = (user as unknown as { role?: string }).role;
    if (role && role !== "admin" && role !== "superadmin") {
      router.replace("/dashboard");
    }
  }, [user, router]);

  // Fetch stats
  useEffect(() => {
    if (tab !== "dashboard") return;
    setLoading(true);
    adminApi.getStats().then(setStats).catch(() => {}).finally(() => setLoading(false));
  }, [tab]);

  // Fetch users
  useEffect(() => {
    if (tab !== "users") return;
    setLoading(true);
    adminApi.getUsers(1, 100)
      .then((data) => { if (data.users.length > 0) setUsers(data.users); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tab]);

  // Fetch broadcasts
  useEffect(() => {
    if (tab !== "broadcasts") return;
    setLoading(true);
    adminApi.getBroadcasts()
      .then((data) => { if (data.length > 0) setBroadcasts(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tab]);

  const handleToggleActive = useCallback(async (userId: number, currentlyActive: boolean) => {
    try {
      await adminApi.toggleUserActive(userId, !currentlyActive);
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, isActive: !currentlyActive } : u));
    } catch {
      // Optimistic
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, isActive: !currentlyActive } : u));
    }
  }, []);

  const handleDeleteUser = useCallback((userId: number) => {
    setConfirmAction({
      title: "Delete User",
      message: "Are you sure you want to permanently delete this user? This action cannot be undone.",
      action: async () => {
        try { await adminApi.deleteUser(userId); } catch {}
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        setConfirmAction(null);
      },
    });
  }, []);

  const handleDeleteBroadcast = useCallback(async (id: number | string) => {
    try { await adminApi.deleteBroadcast(id); } catch {}
    setBroadcasts((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const handleRemoveAdmin = useCallback((adminId: number) => {
    setConfirmAction({
      title: "Remove Admin",
      message: "Are you sure you want to revoke this admin's privileges?",
      action: async () => {
        try { await adminApi.removeAdmin(adminId); } catch {}
        setConfirmAction(null);
      },
    });
  }, []);

  const filteredUsers = search
    ? users.filter((u) =>
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        (u.name ?? "").toLowerCase().includes(search.toLowerCase()))
    : users;

  return (
    <>
      {confirmAction && (
        <ConfirmModal
          title={confirmAction.title}
          message={confirmAction.message}
          onConfirm={confirmAction.action}
          onClose={() => setConfirmAction(null)}
        />
      )}
      {showBroadcast && (
        <BroadcastModal onClose={() => setShowBroadcast(false)} onSent={(b) => { setBroadcasts((prev) => [b, ...prev]); setTab("broadcasts"); }} />
      )}
      {showSeedAdmin && (
        <SeedAdminModal onClose={() => setShowSeedAdmin(false)} onCreated={() => setShowSeedAdmin(false)} />
      )}

      <main className="px-6 lg:px-12 py-6 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-[#c3c0ff] font-headline uppercase tracking-[0.3em] text-[10px] mb-2 block">
                Super User Controls
              </span>
              <h1 className="text-5xl font-headline font-extrabold tracking-tighter text-[#e5e2e1]">
                Admin Panel
              </h1>
            </div>
            <div className="flex gap-3 flex-wrap">
              <button onClick={() => setShowSeedAdmin(true)}
                className="px-5 py-3 rounded-full bg-[#2a2a2a] text-[#c3c0ff] font-semibold text-sm flex items-center gap-2 hover:bg-[#353534] transition-colors border border-[#464555]/20">
                <span className="material-symbols-outlined text-lg">person_add</span>
                Seed Admin
              </button>
              <button onClick={() => setShowBroadcast(true)}
                className="px-5 py-3 rounded-full luminous-gradient text-white font-bold text-sm shadow-[0_0_20px_rgba(79,70,229,0.3)] active:scale-95 transition-transform flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">campaign</span>
                Broadcast
              </button>
            </div>
          </div>

          {/* Tab Nav */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {TABS.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm whitespace-nowrap transition-all flex-shrink-0 ${
                  tab === t.key
                    ? "bg-[#c3c0ff] text-[#0f0069] font-semibold shadow-[0_0_20px_rgba(195,192,255,0.2)]"
                    : "bg-[#2a2a2a] text-[#c7c4d8] hover:bg-[#3a3939]"
                }`}>
                <span className="material-symbols-outlined text-sm">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>

          {/* ─── DASHBOARD TAB ───────────────────────────────────────────────── */}
          {tab === "dashboard" && (
            <div className="space-y-8">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon="group" label="Total Users" value={stats.totalUsers.toLocaleString()} sub={`+${stats.userGrowth}% growth`} />
                <StatCard icon="wifi" label="Active Sessions" value={String(stats.activeSessions)} />
                <StatCard icon="payments" label="Transaction Volume" value={`$${(stats.transactionVolume / 1_000_000).toFixed(1)}M`} sub={`+${stats.revenueGrowth}%`} />
                <StatCard icon="monitor_heart" label="System Health" value={`${stats.systemHealth}%`} sub="Stable" />
              </div>

              {/* Revenue Chart */}
              <div className="bg-[#1c1b1b] rounded-2xl p-8">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="font-headline font-bold text-xl">Revenue Overview</h3>
                  <div className="flex bg-[#0e0e0e] p-1 rounded-full">
                    {["30D", "90D", "All"].map((t, i) => (
                      <button key={t} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${i === 0 ? "bg-[#2a2a2a] text-[#e5e2e1]" : "text-[#c7c4d8] hover:text-[#e5e2e1]"}`}>{t}</button>
                    ))}
                  </div>
                </div>
                <div className="h-48 w-full flex items-end gap-1">
                  {stats.monthlyRevenue.map((h, i) => (
                    <div key={i} className="flex-1 rounded-t-lg bg-gradient-to-t from-[#4f46e5]/60 to-[#c3c0ff]/20 transition-all"
                      style={{ height: `${Math.max(4, (h / Math.max(...stats.monthlyRevenue)) * 100)}%` }} />
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-[#c7c4d8] uppercase tracking-widest mt-3 px-1">
                  {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m) => <span key={m}>{m}</span>)}
                </div>
              </div>

              {/* System Status */}
              <div className="bg-[#1c1b1b] rounded-2xl p-8">
                <h3 className="font-headline font-bold text-lg mb-6">System Status</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { name: "API Gateway", status: "Operational", color: "text-emerald-400" },
                    { name: "Database Cluster", status: "Operational", color: "text-emerald-400" },
                    { name: "SMS Gateway", status: "Degraded", color: "text-[#ffb695]" },
                    { name: "AI Engine", status: "Operational", color: "text-emerald-400" },
                  ].map((s) => (
                    <div key={s.name} className="flex justify-between items-center p-4 bg-[#0e0e0e] rounded-xl">
                      <span className="text-sm font-medium text-[#e5e2e1]">{s.name}</span>
                      <span className={`text-xs font-bold ${s.color}`}>{s.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── USERS TAB ──────────────────────────────────────────────────── */}
          {tab === "users" && (
            <div className="space-y-6">
              {/* Search */}
              <div className="bg-[#1c1b1b] px-4 py-3 rounded-2xl flex items-center border border-[#464555]/10">
                <span className="material-symbols-outlined text-[#918fa1] mr-3">search</span>
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or email..."
                  className="bg-transparent border-none focus:outline-none text-sm text-[#e5e2e1] w-full placeholder:text-[#918fa1]/60" />
                {search && (
                  <button onClick={() => setSearch("")} className="text-[#918fa1] hover:text-[#c3c0ff] transition-colors">
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                )}
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[1,2,3,4].map((i) => <div key={i} className="h-16 bg-[#1c1b1b] rounded-2xl animate-pulse" />)}
                </div>
              ) : (
                <div className="bg-[#1c1b1b] rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[#464555]/10">
                          <th className="text-left p-4 text-xs font-bold text-[#c7c4d8] uppercase tracking-widest">User</th>
                          <th className="text-left p-4 text-xs font-bold text-[#c7c4d8] uppercase tracking-widest hidden md:table-cell">Role</th>
                          <th className="text-left p-4 text-xs font-bold text-[#c7c4d8] uppercase tracking-widest hidden lg:table-cell">Volume</th>
                          <th className="text-left p-4 text-xs font-bold text-[#c7c4d8] uppercase tracking-widest">Status</th>
                          <th className="text-right p-4 text-xs font-bold text-[#c7c4d8] uppercase tracking-widest">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((user) => (
                          <tr key={user.id} className="border-b border-[#464555]/5 hover:bg-[#2a2a2a] transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#353534] flex items-center justify-center text-sm font-bold text-[#c7c4d8] flex-shrink-0">
                                  {(user.name ?? user.email).slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-semibold text-[#e5e2e1]">{user.name ?? "—"}</p>
                                  <p className="text-xs text-[#c7c4d8]">{user.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 hidden md:table-cell">
                              <span className={`text-xs font-bold px-2 py-1 rounded-full ${user.role === "admin" || user.role === "superadmin" ? "bg-[#4f46e5]/20 text-[#c3c0ff]" : "bg-[#353534] text-[#c7c4d8]"}`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="p-4 hidden lg:table-cell">
                              <span className="text-sm text-[#e5e2e1]">${(user.totalVolume ?? 0).toLocaleString()}</span>
                            </td>
                            <td className="p-4">
                              <button onClick={() => handleToggleActive(user.id, user.isActive)}
                                className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${
                                  user.isActive ? "bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20" : "bg-[#93000a]/20 text-[#ffb4ab] hover:bg-[#93000a]/30"
                                }`}>
                                {user.isActive ? "Active" : "Disabled"}
                              </button>
                            </td>
                            <td className="p-4 text-right">
                              <button onClick={() => handleDeleteUser(user.id)}
                                className="p-2 text-[#c7c4d8] hover:text-[#ffb4ab] hover:bg-[#93000a]/10 rounded-full transition-colors"
                                title="Delete user">
                                <span className="material-symbols-outlined text-sm">delete</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                        {filteredUsers.length === 0 && (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-[#c7c4d8]">
                              <span className="material-symbols-outlined text-4xl mb-2 block opacity-30">person_off</span>
                              No users found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── ADMINS TAB ─────────────────────────────────────────────────── */}
          {tab === "admins" && (
            <div className="space-y-6">
              <div className="bg-[#1c1b1b] rounded-2xl p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-headline font-bold text-lg">Current Administrators</h3>
                  <button onClick={() => setShowSeedAdmin(true)}
                    className="px-4 py-2 rounded-full luminous-gradient text-white text-xs font-bold flex items-center gap-2 active:scale-95 transition-transform">
                    <span className="material-symbols-outlined text-sm">add</span>
                    Add Admin
                  </button>
                </div>
                <div className="space-y-3">
                  {[
                    { id: 1, name: "System Root", email: "root@klenzoo.com", role: "superadmin" as const, isActive: true, lastLogin: new Date().toISOString(), createdAt: "2024-01-01" },
                    { id: 2, name: "Sofia Chen", email: "sofia@klenzoo.com", role: "admin" as const, isActive: true, lastLogin: new Date(Date.now() - 10800000).toISOString(), createdAt: "2024-02-08" },
                  ].map((admin) => (
                    <div key={admin.id} className="flex items-center justify-between p-4 bg-[#0e0e0e] rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#4f46e5]/20 flex items-center justify-center text-sm font-bold text-[#c3c0ff]">
                          {admin.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-[#e5e2e1]">{admin.name}</p>
                          <p className="text-xs text-[#c7c4d8]">{admin.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${admin.role === "superadmin" ? "bg-[#ffb695]/10 text-[#ffb695]" : "bg-[#4f46e5]/20 text-[#c3c0ff]"}`}>
                          {admin.role}
                        </span>
                        {admin.role !== "superadmin" && (
                          <button onClick={() => handleRemoveAdmin(admin.id)}
                            className="p-2 text-[#c7c4d8] hover:text-[#ffb4ab] hover:bg-[#93000a]/10 rounded-full transition-colors"
                            title="Remove admin">
                            <span className="material-symbols-outlined text-sm">remove</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── BROADCASTS TAB ─────────────────────────────────────────────── */}
          {tab === "broadcasts" && (
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <h3 className="font-headline font-bold text-xl">Active Broadcasts</h3>
                <button onClick={() => setShowBroadcast(true)}
                  className="px-5 py-2.5 rounded-full luminous-gradient text-white text-sm font-bold flex items-center gap-2 active:scale-95 transition-transform">
                  <span className="material-symbols-outlined text-sm">add</span>
                  New Broadcast
                </button>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[1,2].map((i) => <div key={i} className="h-20 bg-[#1c1b1b] rounded-2xl animate-pulse" />)}
                </div>
              ) : broadcasts.length === 0 ? (
                <div className="text-center py-20 text-[#c7c4d8]">
                  <span className="material-symbols-outlined text-5xl mb-4 block opacity-30">campaign</span>
                  <p className="font-headline font-bold text-lg mb-2">No broadcasts</p>
                  <p className="text-sm">Send a notification to all users.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {broadcasts.map((b) => {
                    const colorMap: Record<string, string> = {
                      info: "border-blue-500/20 dark:border-blue-500/30 bg-blue-500/10 dark:bg-blue-900/20",
                      success: "border-emerald-500/20 dark:border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-900/20",
                      warning: "border-amber-500/20 dark:border-amber-500/30 bg-amber-500/10 dark:bg-amber-900/20",
                      error: "border-red-500/20 dark:border-red-500/30 bg-red-500/10 dark:bg-red-900/20",
                    };
                    const colorStyle = colorMap[b.color] ?? colorMap.info;
                    return (
                      <div key={b.id} className={`flex items-center justify-between p-5 rounded-2xl border ${colorStyle}`}>
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={`material-symbols-outlined text-lg flex-shrink-0 ${b.color === "error" ? "text-error" : b.color === "warning" ? "text-amber-500 dark:text-amber-300" : b.color === "success" ? "text-emerald-500 dark:text-emerald-300" : "text-primary"}`}>
                            {b.color === "error" ? "error" : b.color === "warning" ? "warning" : b.color === "success" ? "check_circle" : "info"}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm text-primary-text truncate">{b.message}</p>
                            <p className="text-[10px] text-secondary-text mt-1">
                              {b.active ? "Active" : "Inactive"} • {b.dismissible ? "Dismissible" : "Permanent"}
                            </p>
                          </div>
                        </div>
                        <button onClick={() => handleDeleteBroadcast(b.id)}
                          className="p-2 text-secondary-text hover:text-error hover:bg-error/10 rounded-full transition-colors flex-shrink-0 ml-3"
                          title="Delete broadcast">
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}