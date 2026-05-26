"use client";
import { useState, useEffect } from "react";
import { auth as authApi, type Session } from "@/lib/api";

export default function SecurityPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  useEffect(() => {
    setLoadingSessions(true);
    authApi
      .sessions()
      .then(setSessions)
      .catch(() => {
        setSessions([
          {
            id: "current",
            device: "Current Browser",
            location: "Unknown",
            lastSeen: new Date().toISOString(),
            isCurrent: true,
          },
        ]);
      })
      .finally(() => setLoadingSessions(false));
  }, []);

  async function handlePasswordUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (newPw !== confirmPw) { setPwError("Passwords do not match."); return; }
    if (newPw.length < 8) { setPwError("Password must be at least 8 characters."); return; }
    setPwSaving(true);
    setPwError("");
    try {
      setPwError("Password change endpoint not yet implemented on backend. See BACKEND_FIXES.md");
    } catch (err: unknown) {
      setPwError(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setPwSaving(false);
    }
  }

  async function handleRevoke(id: string) {
    setRevoking(id);
    try {
      await authApi.revokeSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch { /* ignore */ } finally {
      setRevoking(null);
    }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setForgotLoading(true);
    try {
      await authApi.forgotPassword(forgotEmail);
      setForgotSent(true);
    } catch { /* ignore */ } finally {
      setForgotLoading(false);
    }
  }

  return (
    <main className="px-6 lg:px-12 py-6 min-h-screen">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <span className="text-primary uppercase tracking-[0.3em] text-[10px] mb-2 block">Protection</span>
          <h1 className="text-5xl font-headline font-extrabold tracking-tighter text-on-surface">Security</h1>
        </div>

        {/* Change Password */}
        <form onSubmit={handlePasswordUpdate} className="bg-surface rounded-2xl p-8 space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-primary">lock</span>
            <h3 className="font-headline font-bold text-lg">Change Password</h3>
          </div>
          {[
            { label: "Current Password", value: currentPw, set: setCurrentPw, auto: "current-password" },
            { label: "New Password", value: newPw, set: setNewPw, auto: "new-password" },
            { label: "Confirm New Password", value: confirmPw, set: setConfirmPw, auto: "new-password" },
          ].map((f) => (
            <div key={f.label} className="space-y-2">
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest">{f.label}</label>
              <input
                type="password"
                value={f.value}
                onChange={(e) => f.set(e.target.value)}
                placeholder="••••••••"
                autoComplete={f.auto}
                required
                className="w-full bg-input border-none rounded-2xl py-4 px-6 text-on-surface placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
          ))}
          {pwError && (
            <div className="flex items-center gap-2 bg-error/10 border border-error/20 rounded-2xl px-4 py-3">
              <span className="material-symbols-outlined text-error text-sm">error</span>
              <p className="text-error text-sm">{pwError}</p>
            </div>
          )}
          {pwSuccess && (
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-4 py-3">
              <span className="material-symbols-outlined text-emerald-500 text-sm">check_circle</span>
              <p className="text-emerald-500 text-sm">Password updated successfully.</p>
            </div>
          )}
          <button
            type="submit"
            disabled={pwSaving}
            className="px-8 py-3 luminous-gradient text-white rounded-full font-bold text-sm active:scale-95 transition-transform disabled:opacity-50"
          >
            {pwSaving ? "Updating…" : "Update Password"}
          </button>
        </form>

        {/* Forgot Password */}
        <div className="bg-surface rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-primary">mail</span>
            <h3 className="font-headline font-bold text-lg">Forgot Password</h3>
          </div>
          {forgotSent ? (
            <div className="flex items-center gap-3 text-emerald-500">
              <span className="material-symbols-outlined">mark_email_read</span>
              <p className="text-sm">Reset link sent to <strong>{forgotEmail}</strong>. Check your inbox.</p>
            </div>
          ) : (
            <form onSubmit={handleForgot} className="flex gap-3">
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 bg-input border-none rounded-2xl py-3 px-5 text-on-surface placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              />
              <button
                type="submit"
                disabled={forgotLoading}
                className="px-6 py-3 luminous-gradient text-white rounded-full font-bold text-sm active:scale-95 transition-transform disabled:opacity-50 whitespace-nowrap"
              >
                {forgotLoading ? "Sending…" : "Send Link"}
              </button>
            </form>
          )}
        </div>

        {/* Active Sessions */}
        <div className="bg-surface rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-primary">devices</span>
            <h3 className="font-headline font-bold text-lg">Active Sessions</h3>
          </div>
          {loadingSessions ? (
            <div className="space-y-3">
              {[1, 2].map((i) => <div key={i} className="h-16 bg-card-deep rounded-2xl animate-pulse" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((s) => (
                <div key={s.id} className="flex justify-between items-center p-4 bg-card-deep rounded-2xl">
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-on-surface-variant">
                      {s.isCurrent ? "laptop" : "phone_iphone"}
                    </span>
                    <div>
                      <p className="font-semibold text-sm">{s.device}</p>
                      <p className="text-xs text-on-surface-variant">
                        {s.location && `${s.location} · `}
                        {s.isCurrent ? "Current session" : new Date(s.lastSeen).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {s.isCurrent ? (
                    <span className="px-3 py-1 rounded-full text-xs font-bold"
                      style={{ backgroundColor: "rgba(90,77,255,0.1)", color: "var(--color-primary)" }}>
                      Active
                    </span>
                  ) : (
                    <button
                      onClick={() => handleRevoke(s.id)}
                      disabled={revoking === s.id}
                      className="text-error text-xs font-bold hover:underline disabled:opacity-50"
                    >
                      {revoking === s.id ? "Revoking…" : "Revoke"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Passkeys */}
        <div className="bg-surface rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-primary">fingerprint</span>
            <h3 className="font-headline font-bold text-lg">Passkeys</h3>
          </div>
          <div className="space-y-4">
            {[
              {
                label: "Passkey Authentication",
                sub: "Use your device's screen lock (PIN, face, or fingerprint) to sign in securely",
                on: true,
              },
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-center p-4 bg-card-deep rounded-2xl">
                <div>
                  <p className="font-semibold text-sm">{item.label}</p>
                  <p className="text-xs text-on-surface-variant">{item.sub}</p>
                </div>
                <div
                  className="w-12 h-6 rounded-full relative cursor-pointer"
                  style={{ backgroundColor: item.on ? "var(--color-primary)" : "var(--c-card-highest)" }}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${item.on ? "right-1" : "left-1"}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
