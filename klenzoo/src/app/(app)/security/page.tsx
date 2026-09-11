"use client";
import { useState, useEffect, useRef } from "react";
import { auth as authApi, type Session } from "@/lib/api";

type MfaSetupState =
  | { step: "idle"; enabled: boolean }
  | { step: "setup"; secret: string; otpauthUrl: string }
  | { step: "verify"; secret: string }
  | { step: "done" }
  | { step: "disable"; enabled: boolean };

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

  // ── MFA state ──
  const [mfaState, setMfaState] = useState<MfaSetupState>({ step: "idle", enabled: false });
  const [mfaCode, setMfaCode] = useState("");
  const [mfaError, setMfaError] = useState("");
  const [mfaLoading, setMfaLoading] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [mfaSuccess, setMfaSuccess] = useState("");
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

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

    authApi
      .mfaStatus()
      .then((r) => setMfaState({ step: "idle", enabled: r.mfaEnabled }))
      .catch(() => {});
  }, []);

  // Generate QR data URL whenever otpauthUrl is set
  useEffect(() => {
    if (mfaState.step === "setup" && mfaState.otpauthUrl && !qrDataUrl) {
      (async () => {
        try {
          const QRCode = await import("qrcode");
          const url = await QRCode.toDataURL(mfaState.otpauthUrl, {
            width: 220,
            margin: 2,
            color: { dark: "#ffffff", light: "#00000000" },
          });
          setQrDataUrl(url);
        } catch {
          // QR generation failed — the user can still enter the secret manually
        }
      })();
    }
  }, [mfaState, qrDataUrl]);

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

  // ── MFA handlers ──

  async function startMfaSetup() {
    setMfaLoading(true);
    setMfaError("");
    try {
      const res = await authApi.setupMfa();
      setMfaState({ step: "setup", secret: res.secret, otpauthUrl: res.otpauthUrl });
      setQrDataUrl(null);
    } catch (err: unknown) {
      setMfaError(err instanceof Error ? err.message : "Failed to start MFA setup");
    } finally {
      setMfaLoading(false);
    }
  }

  async function confirmMfaEnable(e: React.FormEvent) {
    e.preventDefault();
    if (mfaCode.length !== 6 || mfaState.step !== "setup") return;
    setMfaLoading(true);
    setMfaError("");
    try {
      await authApi.enableMfa(mfaCode);
      setMfaState({ step: "idle", enabled: true });
      setMfaCode("");
      setQrDataUrl(null);
      setMfaSuccess("Two-factor authentication has been enabled.");
    } catch (err: unknown) {
      setMfaError(err instanceof Error ? err.message : "Invalid code — try again");
    } finally {
      setMfaLoading(false);
    }
  }

  async function confirmMfaDisable(e: React.FormEvent) {
    e.preventDefault();
    if (mfaCode.length !== 6) return;
    setMfaLoading(true);
    setMfaError("");
    try {
      await authApi.disableMfa(mfaCode);
      setMfaState({ step: "idle", enabled: false });
      setMfaCode("");
      setMfaSuccess("Two-factor authentication has been disabled.");
    } catch (err: unknown) {
      setMfaError(err instanceof Error ? err.message : "Invalid code — try again");
    } finally {
      setMfaLoading(false);
    }
  }

  return (
    <main className="px-6 lg:px-12 py-6 min-h-screen relative">
      {/* Ambient glow */}
      <div className="glow-orb glow-orb-primary glass-pulse absolute -top-20 -left-20 w-72 h-72 rounded-full blur-[100px] pointer-events-none" />
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <span className="text-primary uppercase tracking-[0.3em] text-[10px] mb-2 block">Protection</span>
          <h1 className="text-5xl font-headline font-extrabold tracking-tighter text-on-surface">Security</h1>
        </div>

        {/* Two-Factor Authentication */}
        <div className="glass-panel rounded-2xl p-8 relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-primary">security</span>
            <h3 className="font-headline font-bold text-lg">Two-Factor Authentication</h3>
          </div>

          {mfaSuccess && (
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-4 py-3 mb-4">
              <span className="material-symbols-outlined text-emerald-500 text-sm">check_circle</span>
              <p className="text-emerald-500 text-sm">{mfaSuccess}</p>
            </div>
          )}

          {mfaState.step === "idle" && (
            <div className="space-y-4">
              <div className="glass-card flex justify-between items-center p-4">
                <div>
                  <p className="font-semibold text-sm">
                    {mfaState.enabled ? "Authenticator App (Enabled)" : "Authenticator App"}
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    {mfaState.enabled
                      ? "Your account is protected with a TOTP authenticator app."
                      : "Add an extra layer of security with a TOTP authenticator app (Google Authenticator, Authy, etc.)."}
                  </p>
                </div>
                {mfaState.enabled ? (
                  <button
                    onClick={() => { setMfaState({ step: "disable", enabled: true }); setMfaCode(""); setMfaError(""); setMfaSuccess(""); }}
                    className="text-error text-xs font-bold hover:underline"
                  >
                    Disable
                  </button>
                ) : (
                  <button
                    onClick={() => { setMfaSuccess(""); startMfaSetup(); }}
                    disabled={mfaLoading}
                    className="glass-btn-primary px-4 py-2 text-white text-xs font-bold disabled:opacity-50 cursor-pointer"
                  >
                    {mfaLoading ? "Setting up…" : "Enable"}
                  </button>
                )}
              </div>
            </div>
          )}

          {mfaState.step === "setup" && (
            <div className="space-y-5">
              <p className="text-on-surface-variant text-sm">
                1. Scan this QR code with your authenticator app, or enter the key manually.
              </p>
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="bg-white rounded-xl p-3 flex-shrink-0">
                  {qrDataUrl ? (
                    <img src={qrDataUrl} alt="MFA QR Code" width={220} height={220} />
                  ) : (
                    <div className="w-[220px] h-[220px] flex items-center justify-center text-gray-400 text-sm">
                      Generating QR…
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest">Manual Key</p>
                  <code className="block glass-card px-4 py-2 text-sm font-mono break-all text-on-surface">
                    {mfaState.secret}
                  </code>
                </div>
              </div>

              <p className="text-on-surface-variant text-sm">2. Enter the 6-digit code from your authenticator to verify.</p>
              <form onSubmit={confirmMfaEnable} className="space-y-4">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  pattern="[0-9]{6}"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  required
                  autoFocus
                  className="glass-input w-full max-w-xs py-3 text-center text-lg tracking-[0.5em] font-mono focus:outline-none"
                />
                {mfaError && (
                  <div className="flex items-center gap-2 bg-error/10 border border-error/20 rounded-2xl px-4 py-3">
                    <span className="material-symbols-outlined text-error text-sm">error</span>
                    <p className="text-error text-sm">{mfaError}</p>
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={mfaLoading || mfaCode.length !== 6}
                    className="glass-btn-primary px-6 py-3 text-white font-bold text-sm disabled:opacity-50 cursor-pointer"
                  >
                    {mfaLoading ? "Verifying…" : "Verify & Enable"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMfaState({ step: "idle", enabled: false }); setQrDataUrl(null); }}
                    className="px-6 py-3 text-on-surface-variant text-sm hover:text-primary transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {mfaState.step === "disable" && (
            <div className="space-y-4">
              <p className="text-on-surface-variant text-sm">
                Enter your authenticator code to disable two-factor authentication.
              </p>
              <form onSubmit={confirmMfaDisable} className="space-y-4">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  pattern="[0-9]{6}"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  required
                  autoFocus
                  className="glass-input w-full max-w-xs py-3 text-center text-lg tracking-[0.5em] font-mono focus:outline-none"
                />
                {mfaError && (
                  <div className="flex items-center gap-2 bg-error/10 border border-error/20 rounded-2xl px-4 py-3">
                    <span className="material-symbols-outlined text-error text-sm">error</span>
                    <p className="text-error text-sm">{mfaError}</p>
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={mfaLoading || mfaCode.length !== 6}
                    className="px-6 py-3 bg-error/20 text-error font-bold text-sm rounded-xl disabled:opacity-50 cursor-pointer"
                  >
                    {mfaLoading ? "Disabling…" : "Disable MFA"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMfaState({ step: "idle", enabled: true }); setMfaCode(""); setMfaError(""); }}
                    className="px-6 py-3 text-on-surface-variant text-sm hover:text-primary transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Change Password */}
        <form onSubmit={handlePasswordUpdate} className="glass-panel rounded-2xl p-8 space-y-5 relative z-10">
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
                className="glass-input w-full px-4 py-3 text-sm"
                placeholder="••••••••"
                autoComplete={f.auto}
                required
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
            className="glass-btn-primary px-8 py-3 text-white font-bold text-sm disabled:opacity-50 cursor-pointer"
          >
            {pwSaving ? "Updating…" : "Update Password"}
          </button>
        </form>

        {/* Forgot Password */}
        <div className="glass-panel rounded-2xl p-8 relative z-10">
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
                className="glass-input flex-1 py-3 px-5 text-on-surface placeholder:text-muted/50 focus:outline-none"
              />
              <button
                type="submit"
                disabled={forgotLoading}
                className="glass-btn-primary px-6 py-3 text-white font-bold text-sm disabled:opacity-50 whitespace-nowrap cursor-pointer"
              >
                {forgotLoading ? "Sending…" : "Send Link"}
              </button>
            </form>
          )}
        </div>

        {/* Active Sessions */}
        <div className="glass-panel rounded-2xl p-8 relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-primary">devices</span>
            <h3 className="font-headline font-bold text-lg">Active Sessions</h3>
          </div>
          {loadingSessions ? (
            <div className="space-y-3">
              {[1, 2].map((i) => <div key={i} className="glass-panel h-16 rounded-2xl animate-pulse" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((s) => (
                <div key={s.id} className="glass-card flex justify-between items-center p-4">
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
        <div className="glass-panel rounded-2xl p-8 relative z-10">
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
              <div key={item.label} className="glass-card flex justify-between items-center p-4">
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
