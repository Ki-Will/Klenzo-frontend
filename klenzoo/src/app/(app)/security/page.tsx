"use client";
import { useState, useEffect } from "react";
import { auth as authApi, type Session } from "@/lib/api";

export default function SecurityPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);

  // Password change state
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  // Forgot password flow
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
    if (newPw !== confirmPw) {
      setPwError("Passwords do not match.");
      return;
    }
    if (newPw.length < 8) {
      setPwError("Password must be at least 8 characters.");
      return;
    }
    setPwSaving(true);
    setPwError("");
    try {
      // Note: Backend doesn't have a dedicated change-password endpoint yet.
      // This will fail until backend implements POST /auth/change-password
      // For now, show a helpful error message
      setPwError(
        "Password change endpoint not yet implemented on backend. See BACKEND_FIXES.md",
      );
      // await authApi.changePassword(currentPw, newPw); // TODO: implement this endpoint
    } catch (err: unknown) {
      setPwError(
        err instanceof Error ? err.message : "Failed to update password",
      );
    } finally {
      setPwSaving(false);
    }
  }

  async function handleRevoke(id: string) {
    setRevoking(id);
    try {
      await authApi.revokeSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch {
      // ignore
    } finally {
      setRevoking(null);
    }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setForgotLoading(true);
    try {
      await authApi.forgotPassword(forgotEmail);
      setForgotSent(true);
    } catch {
      // ignore
    } finally {
      setForgotLoading(false);
    }
  }

  return (
    <main className="px-6 lg:px-12 py-6 min-h-screen">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <span className="text-[#c3c0ff] uppercase tracking-[0.3em] text-[10px] mb-2 block">
            Protection
          </span>
          <h1 className="text-5xl font-headline font-extrabold tracking-tighter text-on-surface">
            Security
          </h1>
        </div>

        {/* Change Password */}
        <form
          onSubmit={handlePasswordUpdate}
          className="bg-surface rounded-2xl p-8 space-y-5"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-[#c3c0ff]">
              lock
            </span>
            <h3 className="font-headline font-bold text-lg">Change Password</h3>
          </div>
          {[
            {
              label: "Current Password",
              value: currentPw,
              set: setCurrentPw,
              auto: "current-password",
            },
            {
              label: "New Password",
              value: newPw,
              set: setNewPw,
              auto: "new-password",
            },
            {
              label: "Confirm New Password",
              value: confirmPw,
              set: setConfirmPw,
              auto: "new-password",
            },
          ].map((f) => (
            <div key={f.label} className="space-y-2">
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest">
                {f.label}
              </label>
              <input
                type="password"
                value={f.value}
                onChange={(e) => f.set(e.target.value)}
                placeholder="••••••••"
                autoComplete={f.auto}
                required
                className="w-full bg-[#0e0e0e] border-none rounded-2xl py-4 px-6 text-on-surface placeholder:text-[#918fa1]/50 focus:outline-none focus:ring-1 focus:ring-[#c3c0ff] transition-all"
              />
            </div>
          ))}
          {pwError && (
            <div className="flex items-center gap-2 bg-[#93000a]/20 border border-[#ffb4ab]/20 rounded-2xl px-4 py-3">
              <span className="material-symbols-outlined text-[#ffb4ab] text-sm">
                error
              </span>
              <p className="text-[#ffb4ab] text-sm">{pwError}</p>
            </div>
          )}
          {pwSuccess && (
            <div className="flex items-center gap-2 bg-emerald-900/20 border border-emerald-400/20 rounded-2xl px-4 py-3">
              <span className="material-symbols-outlined text-emerald-400 text-sm">
                check_circle
              </span>
              <p className="text-emerald-400 text-sm">
                Password updated successfully.
              </p>
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
            <span className="material-symbols-outlined text-[#c3c0ff]">
              mail
            </span>
            <h3 className="font-headline font-bold text-lg">Forgot Password</h3>
          </div>
          {forgotSent ? (
            <div className="flex items-center gap-3 text-emerald-400">
              <span className="material-symbols-outlined">mark_email_read</span>
              <p className="text-sm">
                Reset link sent to <strong>{forgotEmail}</strong>. Check your
                inbox.
              </p>
            </div>
          ) : (
            <form onSubmit={handleForgot} className="flex gap-3">
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 bg-[#0e0e0e] border-none rounded-2xl py-3 px-5 text-on-surface placeholder:text-[#918fa1]/50 focus:outline-none focus:ring-1 focus:ring-[#c3c0ff] transition-all"
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
            <span className="material-symbols-outlined text-[#c3c0ff]">
              devices
            </span>
            <h3 className="font-headline font-bold text-lg">Active Sessions</h3>
          </div>
          {loadingSessions ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-16 bg-[#0e0e0e] rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className="flex justify-between items-center p-4 bg-[#0e0e0e] rounded-2xl"
                >
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-on-surface-variant">
                      {s.isCurrent ? "laptop" : "phone_iphone"}
                    </span>
                    <div>
                      <p className="font-semibold text-sm">{s.device}</p>
                      <p className="text-xs text-on-surface-variant">
                        {s.location && `${s.location} · `}
                        {s.isCurrent
                          ? "Current session"
                          : new Date(s.lastSeen).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {s.isCurrent ? (
                    <span className="px-3 py-1 bg-[#c3c0ff]/10 text-[#c3c0ff] rounded-full text-xs font-bold">
                      Active
                    </span>
                  ) : (
                    <button
                      onClick={() => handleRevoke(s.id)}
                      disabled={revoking === s.id}
                      className="text-[#ffb4ab] text-xs font-bold hover:underline disabled:opacity-50"
                    >
                      {revoking === s.id ? "Revoking…" : "Revoke"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Biometric toggles (UI only — no backend endpoint) */}
        <div className="bg-surface rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-[#c3c0ff]">
              fingerprint
            </span>
            <h3 className="font-headline font-bold text-lg">
              Passkeys
            </h3>
          </div>
          <div className="space-y-4">
            {[
              {
                label: "Passkey Authentication",
                sub: "Use your device's screen lock (PIN, face, or fingerprint) to sign in securely",
                on: true,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex justify-between items-center p-4 bg-[#0e0e0e] rounded-2xl"
              >
                <div>
                  <p className="font-semibold text-sm">{item.label}</p>
                  <p className="text-xs text-on-surface-variant">{item.sub}</p>
                </div>
                <div
                  className={`w-12 h-6 rounded-full relative cursor-pointer ${item.on ? "bg-[#4f46e5]" : "bg-[#353534]"}`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${item.on ? "right-1" : "left-1"}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

