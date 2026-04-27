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
    authApi.sessions()
      .then(setSessions)
      .catch(() => {
        setSessions([
          { id: "current", device: "Current Browser", location: "Unknown", lastSeen: new Date().toISOString(), isCurrent: true },
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
      // Use reset-password flow with current password as token (backend-dependent)
      await authApi.resetPassword(currentPw, newPw);
      setPwSuccess(true);
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      setTimeout(() => setPwSuccess(false), 3000);
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
          <span className="text-[#c3c0ff] uppercase tracking-[0.3em] text-[10px] mb-2 block">Protection</span>
          <h1 className="text-5xl font-headline font-extrabold tracking-tighter text-[#e5e2e1]">Security</h1>
        </div>

        {/* Change Password */}
        <form onSubmit={handlePasswordUpdate} className="bg-[#1c1b1b] rounded-2xl p-8 space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-[#c3c0ff]">lock</span>
            <h3 className="font-headline font-bold text-lg">Change Password</h3>
          </div>
          {[
            { label: "Current Password", value: currentPw, set: setCurrentPw, auto: "current-password" },
            { label: "New Password", value: newPw, set: setNewPw, auto: "new-password" },
            { label: "Confirm New Password", value: confirmPw, set: setConfirmPw, auto: "new-password" },
          ].map((f) => (
            <div key={f.label} className="space-y-2">
              <label className="text-xs font-semibold text-[#c7c4d8] uppercase tracking-widest">{f.label}</label>
              <input
                type="password"
                value={f.value}
                onChange={(e) => f.set(e.target.value)}
                placeholder="••••••••"
                autoComplete={f.auto}
                required
                className="w-full bg-[#0e0e0e] border-none rounded-2xl py-4 px-6 text-[#e5e2e1] placeholder:text-[#918fa1]/50 focus:outline-none focus:ring-1 focus:ring-[#c3c0ff] transition-all"
              />
            </div>
          ))}
          {pwError && (
            <div className="flex items-center gap-2 bg-[#93000a]/20 border border-[#ffb4ab]/20 rounded-2xl px-4 py-3">
              <span className="material-symbols-outlined text-[#ffb4ab] text-sm">error</span>
              <p className="text-[#ffb4ab] text-sm">{pwError}</p>
            </div>
          )}
          {pwSuccess && (
            <div className="flex items-center gap-2 bg-emerald-900/20 border border-emerald-400/20 rounded-2xl px-4 py-3">
              <span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>
              <p className="text-emerald-400 text-sm">Password updated successfully.</p>
            </div>
          )}
          <button type="submit" disabled={pwSaving}
            className="px-8 py-3 luminous-gradient text-white rounded-full font-bold text-sm active:scale-95 transition-transform disabled:opacity-50">
            {pwSaving ? "Updating…" : "Update Password"}
          </button>
        </form>

        {/* Forgot Password */}
        <div className="bg-[#1c1b1b] rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-[#c3c0ff]">mail</span>
            <h3 className="font-headline font-bold text-lg">Forgot Password</h3>
          </div>
          {forgotSent ? (
            <div className="flex items-center gap-3 text-emerald-400">
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
                className="flex-1 bg-[#0e0e0e] border-none rounded-2xl py-3 px-5 text-[#e5e2e1] placeholder:text-[#918fa1]/50 focus:outline-none focus:ring-1 focus:ring-[#c3c0ff] transition-all"
              />
              <button type="submit" disabled={forgotLoading}
                className="px-6 py-3 luminous-gradient text-white rounded-full font-bold text-sm active:scale-95 transition-transform disabled:opacity-50 whitespace-nowrap">
                {forgotLoading ? "Sending…" : "Send Link"}
              </button>
            </form>
          )}
        </div>

        {/* Active Sessions */}
        <div className="bg-[#1c1b1b] rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-[#c3c0ff]">devices</span>
            <h3 className="font-headline font-bold text-lg">Active Sessions</h3>
          </div>
          {loadingSessions ? (
            <div className="space-y-3">
              {[1,2].map((i) => <div key={i} className="h-16 bg-[#0e0e0e] rounded-2xl animate-pulse" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((s) => (
                <div key={s.id} className="flex justify-between items-center p-4 bg-[#0e0e0e] rounded-2xl">
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-[#c7c4d8]">
                      {s.isCurrent ? "laptop" : "phone_iphone"}
                    </span>
                    <div>
                      <p className="font-semibold text-sm">{s.device}</p>
                      <p className="text-xs text-[#c7c4d8]">
                        {s.location && `${s.location} · `}
                        {s.isCurrent ? "Current session" : new Date(s.lastSeen).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {s.isCurrent ? (
                    <span className="px-3 py-1 bg-[#c3c0ff]/10 text-[#c3c0ff] rounded-full text-xs font-bold">Active</span>
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
        <div className="bg-[#1c1b1b] rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-[#c3c0ff]">fingerprint</span>
            <h3 className="font-headline font-bold text-lg">Biometric Authentication</h3>
          </div>
          <div className="space-y-4">
            {[
              { label: "Face ID", sub: "Use facial recognition to unlock", on: true },
              { label: "Fingerprint", sub: "Use fingerprint to authenticate", on: false },
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-center p-4 bg-[#0e0e0e] rounded-2xl">
                <div>
                  <p className="font-semibold text-sm">{item.label}</p>
                  <p className="text-xs text-[#c7c4d8]">{item.sub}</p>
                </div>
                <div className={`w-12 h-6 rounded-full relative cursor-pointer ${item.on ? "bg-[#4f46e5]" : "bg-[#353534]"}`}>
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
