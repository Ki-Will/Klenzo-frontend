"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  adminApi,
  type PlatformStats,
  type ManageUser,
  type Banner,
  type BannerColor,
  type CreateAdminDto,
} from "@/lib/api";
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
  monthlyRevenue: [
    30000, 45000, 35000, 60000, 55000, 75000, 65000, 80000, 70000, 90000, 85000,
    95000,
  ],
};

const SEED_USERS: ManageUser[] = [
  {
    id: 1,
    email: "alex@klenzoo.com",
    name: "Alex Rivers",
    isActive: true,
    role: "user",
    lastLogin: new Date().toISOString(),
    createdAt: "2024-01-15",
    transactionCount: 342,
    totalVolume: 18500,
  },
  {
    id: 2,
    email: "priya@klenzoo.com",
    name: "Priya Lal",
    isActive: true,
    role: "user",
    lastLogin: new Date(Date.now() - 900000).toISOString(),
    createdAt: "2024-03-22",
    transactionCount: 128,
    totalVolume: 7200,
  },
  {
    id: 3,
    email: "marcus@klenzoo.com",
    name: "Marcus Webb",
    isActive: false,
    role: "user",
    lastLogin: new Date(Date.now() - 3600000).toISOString(),
    createdAt: "2024-06-10",
    transactionCount: 56,
    totalVolume: 2100,
  },
  {
    id: 4,
    email: "sofia@klenzoo.com",
    name: "Sofia Chen",
    isActive: true,
    role: "admin",
    lastLogin: new Date(Date.now() - 10800000).toISOString(),
    createdAt: "2024-02-08",
    transactionCount: 210,
    totalVolume: 9400,
  },
  {
    id: 5,
    email: "james@klenzoo.com",
    name: "James Wright",
    isActive: true,
    role: "user",
    lastLogin: new Date(Date.now() - 86400000).toISOString(),
    createdAt: "2024-08-14",
    transactionCount: 89,
    totalVolume: 4500,
  },
  {
    id: 6,
    email: "lina@klenzoo.com",
    name: "Lina K.",
    isActive: false,
    role: "user",
    createdAt: "2024-11-01",
    transactionCount: 12,
    totalVolume: 800,
  },
];

const SEED_BROADCASTS: Banner[] = [
  {
    id: 1,
    message: "System maintenance scheduled for Sunday 2 AM UTC",
    color: "warning",
    active: true,
    dismissible: true,
  },
  {
    id: 2,
    message: "Welcome to Klenzoo! New analytics features are now live.",
    color: "info",
    active: false,
    dismissible: true,
  },
];

// ─── Tab type ─────────────────────────────────────────────────────────────────
type AdminTab = "dashboard" | "users" | "admins" | "broadcasts";

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: string;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="bg-card rounded-2xl p-6 space-y-3">
      <div className="flex justify-between items-start">
        <div className="w-10 h-10 bg-card-high rounded-xl flex items-center justify-center">
          <span className="material-symbols-outlined text-primary">{icon}</span>
        </div>
      </div>
      <div>
        <p className="text-2xl font-headline font-extrabold text-primary-text">
          {value}
        </p>
        <p className="text-xs text-secondary-text uppercase tracking-widest mt-1">
          {label}
        </p>
        {sub && <p className="text-xs text-primary mt-1">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Broadcast Modal ──────────────────────────────────────────────────────────
function BroadcastModal({
  onClose,
  onSent,
}: {
  onClose: () => void;
  onSent: (b: Banner) => void;
}) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [color, setColor] = useState("#6366f1");
  const [dismissible, setDismissible] = useState(true);
  const [link, setLink] = useState("");
  const [linkText, setLinkText] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sendEmail, setSendEmail] = useState(false);
  const [priority, setPriority] = useState<"low" | "normal" | "high">("normal");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const PRESET_COLORS = [
    { value: "#6366f1", label: "Indigo" },
    { value: "#10b981", label: "Green" },
    { value: "#f59e0b", label: "Amber" },
    { value: "#ef4444", label: "Red" },
    { value: "#a855f7", label: "Purple" },
  ];

  const isInvalidDates = () => {
    if (startDate && isNaN(Date.parse(startDate))) return true;
    if (endDate && isNaN(Date.parse(endDate))) return true;
    if (startDate && endDate && new Date(endDate) < new Date(startDate))
      return true;
    return false;
  };

  const isSubmitDisabled = !title.trim() || !message.trim() || isInvalidDates();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitDisabled) return;
    setSubmitting(true);
    setError("");
    try {
      const banner = await adminApi.broadcast({
        title: title.trim(),
        message: message.trim(),
        color,
        dismissible,
        link: link.trim() || undefined,
        linkText: linkText.trim() || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        sendEmail,
        priority,
      });
      onSent(banner);
      onClose();
    } catch (err: any) {
      // Fallback: create locally
      const local: Banner = {
        id: Date.now(),
        title: title.trim(),
        message: message.trim(),
        color,
        active: true,
        dismissible,
        link: link.trim() || undefined,
        linkText: linkText.trim() || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      };
      onSent(local);
      onClose();
      void err;
    } finally {
      setSubmitting(false);
    }
  }

  // Live Preview Hex
  let previewHex = color || "#6366f1";
  if (previewHex === "info") previewHex = "#5a4dff";
  if (previewHex === "success") previewHex = "#10b981";
  if (previewHex === "warning") previewHex = "#f59e0b";
  if (previewHex === "error") previewHex = "#ef4444";

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `,
        }}
      />

      <div className="w-full max-w-lg bg-card border-l border-[var(--c-border)] shadow-2xl h-full flex flex-col justify-between animate-slide-in overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-[var(--c-border)] flex justify-between items-center bg-card">
          <div>
            <h2 className="text-xl font-headline font-extrabold text-primary-text">
              Create Broadcast
            </h2>
            <p className="text-xs text-secondary-text mt-0.5">
              Compose announcements and banners
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-card-high hover:bg-card-highest text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Form Container (Scrollable) */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar"
        >
          {/* Live Preview */}
          <div className="border border-[var(--c-border)] rounded-2xl p-4 bg-card-deep space-y-2">
            <div className="text-[10px] uppercase font-bold text-secondary-text tracking-wider">
              Live Preview
            </div>
            <div
              className="relative w-full flex items-center gap-3 px-4 py-2.5 overflow-hidden border-b border-l-[3px] rounded-lg"
              style={{
                backgroundColor: "var(--c-card)",
                borderBottomColor: `${previewHex}20`,
                borderLeftColor: previewHex,
              }}
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundColor: previewHex,
                  opacity: 0.08,
                }}
              />
              <div
                className="absolute inset-y-0 left-0 w-32 pointer-events-none"
                style={{
                  background: `linear-gradient(to right, ${previewHex}15, transparent)`,
                }}
              />
              <span
                className="relative flex-shrink-0 w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: previewHex }}
              />
              <div className="relative flex-1 min-w-0 flex flex-wrap items-center gap-x-2 gap-y-1">
                {title.trim() && (
                  <span
                    className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-md whitespace-nowrap flex-shrink-0"
                    style={{
                      backgroundColor: `${previewHex}20`,
                      color: previewHex,
                      border: `1px solid ${previewHex}30`,
                    }}
                  >
                    {title}
                  </span>
                )}
                <p className="text-xs leading-snug min-w-0 text-primary-text font-medium">
                  {message.trim() || "Broadcast message preview..."}
                </p>
              </div>
              {link.trim() && (
                <span
                  className="relative flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
                  style={{
                    color: previewHex,
                    border: `1px solid ${previewHex}40`,
                    backgroundColor: `${previewHex}10`,
                  }}
                >
                  {linkText.trim() || "Learn more"}
                </span>
              )}
              {dismissible && (
                <div className="relative flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full text-secondary-text">
                  <span className="material-symbols-outlined text-xs">
                    close
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-secondary-text uppercase tracking-widest block">
              Broadcast Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. System Update"
              required
              className="w-full bg-card-deep border-none rounded-2xl py-4 px-5 text-primary-text placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-primary transition-all text-sm font-semibold"
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-secondary-text uppercase tracking-widest block">
              Broadcast Message *
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter details of the announcement..."
              required
              rows={3}
              className="w-full bg-card-deep border-none rounded-2xl py-4 px-5 text-primary-text placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-primary transition-all resize-none text-sm"
            />
          </div>

          {/* Color Accent */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-secondary-text uppercase tracking-widest block">
              Color Accent
            </label>
            <div className="flex items-center gap-3">
              {PRESET_COLORS.map((pc) => (
                <button
                  key={pc.value}
                  type="button"
                  onClick={() => setColor(pc.value)}
                  className="w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center cursor-pointer"
                  style={{
                    backgroundColor: pc.value,
                    borderColor: color === pc.value ? "#ffffff" : "transparent",
                    boxShadow:
                      color === pc.value
                        ? "0 0 8px rgba(255,255,255,0.5)"
                        : "none",
                  }}
                  title={pc.label}
                >
                  {color === pc.value && (
                    <span className="material-symbols-outlined text-white text-sm font-bold">
                      check
                    </span>
                  )}
                </button>
              ))}
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#6366f1"
                className="w-28 bg-card-deep border-none rounded-2xl py-3 px-4 text-xs text-primary-text focus:outline-none focus:ring-1 focus:ring-primary transition-all font-mono"
              />
            </div>
          </div>

          {/* Settings Toggles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-card-deep p-4 rounded-2xl">
              <div>
                <p className="text-sm font-semibold text-primary-text">
                  Dismissible
                </p>
                <p className="text-[11px] text-secondary-text">
                  Allow users to close this banner
                </p>
              </div>
              <input
                type="checkbox"
                checked={dismissible}
                onChange={(e) => setDismissible(e.target.checked)}
                className="w-5 h-5 rounded border-none bg-card-high text-primary focus:ring-primary cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between bg-card-deep p-4 rounded-2xl">
              <div>
                <p className="text-sm font-semibold text-primary-text">
                  Send Email Notification
                </p>
                <p className="text-[11px] text-secondary-text">
                  Send a copy to all users' email address
                </p>
              </div>
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="w-5 h-5 rounded border-none bg-card-high text-primary focus:ring-primary cursor-pointer"
              />
            </div>
          </div>

          {/* Link URL & Text */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-secondary-text uppercase tracking-widest block">
                Link URL
              </label>
              <input
                type="text"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="e.g. /dashboard"
                className="w-full bg-card-deep border-none rounded-2xl py-4 px-5 text-primary-text placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-primary transition-all text-xs"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-secondary-text uppercase tracking-widest block">
                Link Text
              </label>
              <input
                type="text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="e.g. Learn More"
                className="w-full bg-card-deep border-none rounded-2xl py-4 px-5 text-primary-text placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-primary transition-all text-xs"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-secondary-text uppercase tracking-widest block">
                Start Date
              </label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-card-deep border-none rounded-2xl py-4 px-4 text-xs text-primary-text focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-secondary-text uppercase tracking-widest block">
                End Date
              </label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-card-deep border-none rounded-2xl py-4 px-4 text-xs text-primary-text focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-secondary-text uppercase tracking-widest block">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full bg-card-deep border-none rounded-2xl py-4 px-5 text-xs text-primary-text focus:outline-none focus:ring-1 focus:ring-primary transition-all"
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
          </div>

          {error && <p className="text-error text-xs font-semibold">{error}</p>}
          {startDate && endDate && new Date(endDate) < new Date(startDate) && (
            <p className="text-error text-xs font-semibold">
              End Date cannot be before Start Date
            </p>
          )}
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-[var(--c-border)] bg-card flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-4 rounded-full bg-card-high text-secondary-text hover:text-primary-text font-headline font-bold text-sm hover:bg-card-highest transition-all cursor-pointer text-center"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={submitting || isSubmitDisabled}
            onClick={handleSubmit}
            className="flex-1 py-4 luminous-gradient text-white font-headline font-bold text-sm rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-40 disabled:hover:scale-100 disabled:active:scale-100 cursor-pointer text-center"
          >
            {submitting ? "Publishing…" : "Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Admin Inseminator Modal ──────────────────────────────────────────────────
function SeedAdminModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
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
      await adminApi.createAdmin({
        email: email.trim(),
        password,
        name: name.trim(),
        role,
      });
      onCreated();
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to create admin");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50
flex items-end sm:items-stretch sm:justify-end
bg-black/60 backdrop-blur-sm transition-opacity

pb-[72px] sm:pb-0
overflow-hidden"
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes slideIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }

          .animate-slide-in {
            animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        `,
        }}
      />

      <div
        className="w-full max-w-lg
bg-card
border-t sm:border-t-0
sm:border-l border-[var(--c-border)]
shadow-2xl

h-[calc(100dvh-72px)]
sm:h-full

rounded-t-3xl sm:rounded-none

flex flex-col
animate-slide-in
overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[var(--c-border)] bg-card">
          <div>
            <h2 className="text-lg sm:text-xl font-headline font-bold text-primary-text">
              Seed Administrator
            </h2>
            <p className="text-[11px] sm:text-xs text-secondary-text mt-0.5">
              Create a new administrator account
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-card-high hover:bg-card-highest text-secondary-text hover:text-primary-text transition-colors cursor-pointer flex-shrink-0"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Scrollable Form */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-5 no-scrollbar pb-32"
        >
          {/* Name */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-secondary-text uppercase tracking-widest block">
              Full Name *
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Admin Name"
              required
              className="w-full bg-card-deep border-none rounded-2xl py-3.5 sm:py-4 px-4 sm:px-5 text-sm text-primary-text placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-primary transition-all"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-secondary-text uppercase tracking-widest block">
              Email *
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@klenzoo.com"
              required
              className="w-full bg-card-deep border-none rounded-2xl py-3.5 sm:py-4 px-4 sm:px-5 text-sm text-primary-text placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-primary transition-all"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-secondary-text uppercase tracking-widest block">
              Password *
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              required
              minLength={8}
              className="w-full bg-card-deep border-none rounded-2xl py-3.5 sm:py-4 px-4 sm:px-5 text-sm text-primary-text placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-primary transition-all"
            />
          </div>

          {/* Role */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-secondary-text uppercase tracking-widest block">
              Role
            </label>

            <select
              value={role}
              onChange={(e) =>
                setRole(e.target.value as "admin" | "superadmin")
              }
              className="w-full bg-card-deep border-none rounded-2xl py-3.5 sm:py-4 px-4 sm:px-5 text-sm text-primary-text focus:outline-none focus:ring-1 focus:ring-primary transition-all"
            >
              <option value="admin">Admin</option>
              <option value="superadmin">Super Admin</option>
            </select>
          </div>

          {error && <p className="text-error text-xs font-semibold">{error}</p>}
        </form>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-[var(--c-border)] bg-card flex gap-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3.5 rounded-xl bg-card-high text-secondary-text hover:text-primary-text font-bold text-sm hover:bg-card-highest transition-all cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            onClick={handleSubmit}
            className="flex-1 py-3.5 luminous-gradient text-white font-bold text-sm rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 cursor-pointer"
          >
            {submitting ? "Creating…" : "Create Admin"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Confirmation Modal ───────────────────────────────────────────────────────
function ConfirmModal({
  title,
  message,
  onConfirm,
  onClose,
}: {
  title: string;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm bg-card rounded-2xl p-8 shadow-2xl border border-[var(--c-border)]">
        <h2 className="text-lg font-headline font-bold mb-3">{title}</h2>
        <p className="text-sm text-secondary-text mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-full bg-card-high text-secondary-text font-semibold text-sm hover:bg-card-highest transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-full bg-error-container text-on-error-container font-semibold text-sm hover:opacity-90 transition-opacity cursor-pointer"
          >
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
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    message: string;
    action: () => void;
  } | null>(null);
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
    adminApi
      .getStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tab]);

  // Fetch users
  useEffect(() => {
    if (tab !== "users") return;
    setLoading(true);
    adminApi
      .getUsers(1, 100)
      .then((data) => {
        if (data.users.length > 0) setUsers(data.users);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tab]);

  // Fetch broadcasts
  useEffect(() => {
    if (tab !== "broadcasts") return;
    setLoading(true);
    adminApi
      .getBroadcasts()
      .then((data) => {
        if (data.length > 0) setBroadcasts(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tab]);

  const handleToggleActive = useCallback(
    async (userId: number, currentlyActive: boolean) => {
      try {
        await adminApi.toggleUserActive(userId, !currentlyActive);
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId ? { ...u, isActive: !currentlyActive } : u,
          ),
        );
      } catch {
        // Optimistic
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId ? { ...u, isActive: !currentlyActive } : u,
          ),
        );
      }
    },
    [],
  );

  const handleDeleteUser = useCallback((userId: number) => {
    setConfirmAction({
      title: "Delete User",
      message:
        "Are you sure you want to permanently delete this user? This action cannot be undone.",
      action: async () => {
        try {
          await adminApi.deleteUser(userId);
        } catch {}
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        setConfirmAction(null);
      },
    });
  }, []);

  const handleDeleteBroadcast = useCallback(async (id: number | string) => {
    try {
      await adminApi.deleteBroadcast(id);
    } catch {}
    setBroadcasts((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const handleRemoveAdmin = useCallback((adminId: number) => {
    setConfirmAction({
      title: "Remove Admin",
      message: "Are you sure you want to revoke this admin's privileges?",
      action: async () => {
        try {
          await adminApi.removeAdmin(adminId);
        } catch {}
        setConfirmAction(null);
      },
    });
  }, []);

  const filteredUsers = search
    ? users.filter(
        (u) =>
          u.email.toLowerCase().includes(search.toLowerCase()) ||
          (u.name ?? "").toLowerCase().includes(search.toLowerCase()),
      )
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
        <BroadcastModal
          onClose={() => setShowBroadcast(false)}
          onSent={(b) => {
            setBroadcasts((prev) => [b, ...prev]);
            setTab("broadcasts");
          }}
        />
      )}
      {showSeedAdmin && (
        <SeedAdminModal
          onClose={() => setShowSeedAdmin(false)}
          onCreated={() => setShowSeedAdmin(false)}
        />
      )}

      <main className="px-6 lg:px-12 py-6 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-primary font-headline uppercase tracking-[0.3em] text-[10px] mb-2 block">
                Super User Controls
              </span>
              <h1 className="text-5xl font-headline font-extrabold tracking-tighter text-primary-text">
                Admin Panel
              </h1>
            </div>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => setShowSeedAdmin(true)}
                className="px-5 py-3 rounded-full bg-card-high text-primary font-semibold text-sm flex items-center gap-2 hover:bg-card-highest transition-colors border border-[var(--c-border)] cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">
                  person_add
                </span>
                Seed Admin
              </button>
              <button
                onClick={() => setShowBroadcast(true)}
                className="px-4 py-2.5 bg-primary text-white rounded-full font-headline font-bold text-xs flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-[var(--c-btn-primary-shadow)] cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">
                  campaign
                </span>
                Create Broadcast
              </button>
            </div>
          </div>

          {/* Tab Nav */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm whitespace-nowrap transition-all flex-shrink-0 cursor-pointer ${
                  tab === t.key
                    ? "bg-primary-container text-on-primary-container font-semibold"
                    : "bg-card-high text-secondary-text hover:bg-card-highest"
                }`}
              >
                <span className="material-symbols-outlined text-sm">
                  {t.icon}
                </span>
                {t.label}
              </button>
            ))}
          </div>

          {/* ─── DASHBOARD TAB ───────────────────────────────────────────────── */}
          {tab === "dashboard" && (
            <div className="space-y-8">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  icon="group"
                  label="Total Users"
                  value={stats.totalUsers.toLocaleString()}
                  sub={`+${stats.userGrowth}% growth`}
                />
                <StatCard
                  icon="wifi"
                  label="Active Sessions"
                  value={String(stats.activeSessions)}
                />
                <StatCard
                  icon="payments"
                  label="Transaction Volume"
                  value={`$${(stats.transactionVolume / 1_000_000).toFixed(1)}M`}
                  sub={`+${stats.revenueGrowth}%`}
                />
                <StatCard
                  icon="monitor_heart"
                  label="System Health"
                  value={`${stats.systemHealth}%`}
                  sub="Stable"
                />
              </div>

              {/* Revenue Chart */}
              <div className="bg-card rounded-2xl p-8">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="font-headline font-bold text-xl">
                    Revenue Overview
                  </h3>
                  <div className="flex bg-card-deep p-1 rounded-full">
                    {["30D", "90D", "All"].map((t, i) => (
                      <button
                        key={t}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${i === 0 ? "bg-card-high text-primary-text" : "text-secondary-text hover:text-primary-text"}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="h-48 w-full flex items-end gap-1">
                  {stats.monthlyRevenue.map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-lg bg-primary/70 hover:bg-primary transition-all"
                      style={{
                        height: `${Math.max(4, (h / Math.max(...stats.monthlyRevenue)) * 100)}%`,
                      }}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-secondary-text uppercase tracking-widest mt-3 px-1">
                  {[
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                  ].map((m) => (
                    <span key={m}>{m}</span>
                  ))}
                </div>
              </div>

              {/* System Status */}
              <div className="bg-card rounded-2xl p-8">
                <h3 className="font-headline font-bold text-lg mb-6">
                  System Status
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    {
                      name: "API Gateway",
                      status: "Operational",
                      color: "text-emerald-500 dark:text-emerald-400",
                    },
                    {
                      name: "Database Cluster",
                      status: "Operational",
                      color: "text-emerald-500 dark:text-emerald-400",
                    },
                    {
                      name: "SMS Gateway",
                      status: "Degraded",
                      color: "text-tertiary",
                    },
                    {
                      name: "AI Engine",
                      status: "Operational",
                      color: "text-emerald-500 dark:text-emerald-400",
                    },
                  ].map((s) => (
                    <div
                      key={s.name}
                      className="flex justify-between items-center p-4 bg-card-deep rounded-xl"
                    >
                      <span className="text-sm font-medium text-primary-text">
                        {s.name}
                      </span>
                      <span className={`text-xs font-bold ${s.color}`}>
                        {s.status}
                      </span>
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
              <div className="bg-card px-4 py-3 rounded-2xl flex items-center border border-[var(--c-border)]">
                <span className="material-symbols-outlined text-muted mr-3">
                  search
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or email..."
                  className="bg-transparent border-none focus:outline-none text-sm text-primary-text w-full placeholder:text-muted/60"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="text-muted hover:text-primary transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">
                      close
                    </span>
                  </button>
                )}
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-16 bg-card rounded-2xl animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-card rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[var(--c-border)]">
                          <th className="text-left p-4 text-xs font-bold text-secondary-text uppercase tracking-widest">
                            User
                          </th>
                          <th className="text-left p-4 text-xs font-bold text-secondary-text uppercase tracking-widest hidden md:table-cell">
                            Role
                          </th>
                          <th className="text-left p-4 text-xs font-bold text-secondary-text uppercase tracking-widest hidden lg:table-cell">
                            Volume
                          </th>
                          <th className="text-left p-4 text-xs font-bold text-secondary-text uppercase tracking-widest">
                            Status
                          </th>
                          <th className="text-right p-4 text-xs font-bold text-secondary-text uppercase tracking-widest">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((user) => (
                          <tr
                            key={user.id}
                            className="border-b border-[var(--c-border)]/5 hover:bg-card-high transition-colors"
                          >
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-card-highest flex items-center justify-center text-sm font-bold text-secondary-text flex-shrink-0">
                                  {(user.name ?? user.email)
                                    .slice(0, 2)
                                    .toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-semibold text-primary-text">
                                    {user.name ?? "—"}
                                  </p>
                                  <p className="text-xs text-secondary-text">
                                    {user.email}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 hidden md:table-cell">
                              <span
                                className={`text-xs font-bold px-2 py-1 rounded-full ${user.role === "admin" || user.role === "superadmin" ? "bg-primary-container text-on-primary-container" : "bg-card-highest text-secondary-text"}`}
                              >
                                {user.role}
                              </span>
                            </td>
                            <td className="p-4 hidden lg:table-cell">
                              <span className="text-sm text-primary-text">
                                ${(user.totalVolume ?? 0).toLocaleString()}
                              </span>
                            </td>
                            <td className="p-4">
                              <button
                                onClick={() =>
                                  handleToggleActive(user.id, user.isActive)
                                }
                                className={`text-xs font-bold px-3 py-1 rounded-full transition-colors cursor-pointer ${
                                  user.isActive
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 dark:bg-emerald-400/10"
                                    : "bg-error-container/20 text-error hover:bg-error-container/30"
                                }`}
                              >
                                {user.isActive ? "Active" : "Disabled"}
                              </button>
                            </td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="p-2 text-secondary-text hover:text-error hover:bg-error-container/10 rounded-full transition-colors cursor-pointer"
                                title="Delete user"
                              >
                                <span className="material-symbols-outlined text-sm">
                                  delete
                                </span>
                              </button>
                            </td>
                          </tr>
                        ))}
                        {filteredUsers.length === 0 && (
                          <tr>
                            <td
                              colSpan={5}
                              className="p-8 text-center text-secondary-text"
                            >
                              <span className="material-symbols-outlined text-4xl mb-2 block opacity-30">
                                person_off
                              </span>
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
              <div className="bg-card rounded-2xl p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-headline font-bold text-lg">
                    Current Administrators
                  </h3>
                  <button
                    onClick={() => setShowSeedAdmin(true)}
                    className="px-4 py-2 rounded-full luminous-gradient text-white text-xs font-bold flex items-center gap-2 active:scale-95 transition-transform cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">
                      add
                    </span>
                    Add Admin
                  </button>
                </div>
                <div className="space-y-3">
                  {[
                    {
                      id: 1,
                      name: "System Root",
                      email: "root@klenzoo.com",
                      role: "superadmin" as const,
                      isActive: true,
                      lastLogin: new Date().toISOString(),
                      createdAt: "2024-01-01",
                    },
                    {
                      id: 2,
                      name: "Sofia Chen",
                      email: "sofia@klenzoo.com",
                      role: "admin" as const,
                      isActive: true,
                      lastLogin: new Date(Date.now() - 10800000).toISOString(),
                      createdAt: "2024-02-08",
                    },
                  ].map((admin) => (
                    <div
                      key={admin.id}
                      className="flex items-center justify-between p-4 bg-card-deep rounded-xl"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-sm font-bold text-on-primary-container">
                          {admin.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-primary-text">
                            {admin.name}
                          </p>
                          <p className="text-xs text-secondary-text">
                            {admin.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded-full ${admin.role === "superadmin" ? "bg-tertiary/10 text-tertiary" : "bg-primary-container text-on-primary-container"}`}
                        >
                          {admin.role}
                        </span>
                        {admin.role !== "superadmin" && (
                          <button
                            onClick={() => handleRemoveAdmin(admin.id)}
                            className="p-2 text-secondary-text hover:text-error hover:bg-error-container/10 rounded-full transition-colors cursor-pointer"
                            title="Remove admin"
                          >
                            <span className="material-symbols-outlined text-sm">
                              remove
                            </span>
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
                <h3 className="font-headline font-bold text-xl">
                  Active Broadcasts
                </h3>
                <button
                  onClick={() => setShowBroadcast(true)}
                  className="px-5 py-2.5 rounded-full luminous-gradient text-white text-sm font-bold flex items-center gap-2 active:scale-95 transition-transform cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  New Broadcast
                </button>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-20 bg-card rounded-2xl animate-pulse"
                    />
                  ))}
                </div>
              ) : broadcasts.length === 0 ? (
                <div className="text-center py-20 text-secondary-text">
                  <span className="material-symbols-outlined text-5xl mb-4 block opacity-30">
                    campaign
                  </span>
                  <p className="font-headline font-bold text-lg mb-2">
                    No broadcasts
                  </p>
                  <p className="text-sm">Send a notification to all users.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {broadcasts.map((b) => {
                    let hex = b.color ?? "#6366f1";
                    if (hex === "info") hex = "#5a4dff";
                    if (hex === "success") hex = "#10b981";
                    if (hex === "warning") hex = "#f59e0b";
                    if (hex === "error") hex = "#ef4444";

                    return (
                      <div
                        key={b.id}
                        className="relative flex items-center justify-between p-5 rounded-2xl border-b border-l-[4px] overflow-hidden"
                        style={{
                          backgroundColor: "var(--c-card)",
                          borderBottomColor: `${hex}20`,
                          borderLeftColor: hex,
                        }}
                      >
                        {/* Solid accent fill layer with opacity */}
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            backgroundColor: hex,
                            opacity: 0.05,
                          }}
                        />
                        {/* Subtle radial glow from left */}
                        <div
                          className="absolute inset-y-0 left-0 w-32 pointer-events-none"
                          style={{
                            background: `linear-gradient(to right, ${hex}15, transparent)`,
                          }}
                        />

                        <div className="flex items-center gap-3 min-w-0 relative">
                          <span
                            className="material-symbols-outlined text-lg flex-shrink-0"
                            style={{ color: hex }}
                          >
                            campaign
                          </span>
                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              {b.title && (
                                <span
                                  className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded"
                                  style={{
                                    backgroundColor: `${hex}20`,
                                    color: hex,
                                    border: `1px solid ${hex}30`,
                                  }}
                                >
                                  {b.title}
                                </span>
                              )}
                              <p className="text-sm text-primary-text font-semibold truncate">
                                {b.message}
                              </p>
                            </div>
                            <p className="text-[10px] text-secondary-text">
                              {b.active ? "Active" : "Inactive"} •{" "}
                              {b.dismissible ? "Dismissible" : "Permanent"}
                              {b.startDate &&
                                ` • Starts: ${new Date(b.startDate).toLocaleDateString()}`}
                              {b.endDate &&
                                ` • Ends: ${new Date(b.endDate).toLocaleDateString()}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0 ml-3 relative">
                          {b.link && (
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
                              style={{
                                color: hex,
                                border: `1px solid ${hex}40`,
                                backgroundColor: `${hex}10`,
                              }}
                            >
                              {b.linkText || "Link"}
                            </span>
                          )}
                          <button
                            onClick={() => handleDeleteBroadcast(b.id)}
                            className="p-2 text-secondary-text hover:text-error hover:bg-error/10 rounded-full transition-colors cursor-pointer"
                            title="Delete broadcast"
                          >
                            <span className="material-symbols-outlined text-sm">
                              delete
                            </span>
                          </button>
                        </div>
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
