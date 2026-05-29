"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import KlenzooLogo from "@/components/KlenzooLogo";

export default function LoginForm() {
  const { login, user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  // Validate redirect param — only allow relative paths starting with /
  const rawRedirect = searchParams.get("redirect") ?? "/dashboard";
  const redirect = rawRedirect.startsWith("/") ? rawRedirect : "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  // Only auto-redirect on initial load if already authenticated.
  // Don't run after a manual login — handleLogin does that itself.
  const didManualLogin = useRef(false);
  useEffect(() => {
    if (!loading && user && !didManualLogin.current) {
      router.replace(redirect);
    }
  }, [user, loading, router, redirect]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      didManualLogin.current = true;
      await login(email, password);
      router.replace(redirect);
    } catch (err: unknown) {
      didManualLogin.current = false;
      setError(err instanceof Error ? err.message : "Invalid credentials");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const { auth } = await import("@/lib/api");
      await auth.forgotPassword(email);
      setForgotSent(true);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Could not send reset email",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-background text-on-surface flex flex-col items-center justify-center overflow-hidden relative">
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md px-6 py-12 md:py-24">
        <div className="flex flex-col items-center">
          <div className="mb-12 text-center w-full flex flex-col items-center">
            <KlenzooLogo className="w-40 md:w-56 h-auto mb-2" />
            <p className="text-on-surface-variant text-[10px] uppercase tracking-wide">
              {forgotMode ? "Password Recovery" : "Secure Gateway to the Void"}
            </p>
          </div>

          {forgotSent ? (
            <div className="w-full text-center space-y-6">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-primary text-3xl">
                  mark_email_read
                </span>
              </div>
              <p className="text-on-surface-variant">
                Reset link sent to{" "}
                <span className="text-primary font-bold">{email}</span>.
              </p>
              <button
                onClick={() => {
                  setForgotMode(false);
                  setForgotSent(false);
                }}
                className="text-primary text-sm font-bold hover:underline cursor-pointer"
              >
                Back to login
              </button>
            </div>
          ) : forgotMode ? (
            <form onSubmit={handleForgot} className="w-full space-y-6">
              <div>
                <label className="block text-on-surface-variant text-[11px] font-semibold mb-2 ml-4 uppercase tracking-widest">
                  Email
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-muted text-sm">
                    alternate_email
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="w-full bg-surface border-none rounded-2xl py-4 pl-12 pr-4 text-on-surface placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-card-high transition-all"
                  />
                </div>
              </div>
              {error && (
                <p className="text-error text-sm text-center">{error}</p>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="w-full luminous-gradient text-white font-headline font-extrabold py-4 rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
              >
                {submitting ? "Sending…" : "Send Reset Link"}
              </button>
              <button
                type="button"
                onClick={() => setForgotMode(false)}
                className="w-full text-center text-on-surface-variant text-sm hover:text-primary transition-colors cursor-pointer"
              >
                Back to login
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="w-full space-y-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-on-surface-variant text-[11px] font-semibold mb-2 ml-4 uppercase tracking-widest">
                    Identifier
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-muted text-sm">
                      alternate_email
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email or username"
                      required
                      autoComplete="email"
                      className="w-full bg-surface border-none rounded-2xl py-4 pl-12 pr-4 text-on-surface placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-card-high transition-all"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2 px-4">
                    <label className="text-on-surface-variant text-[11px] font-semibold uppercase tracking-widest">
                      Secret
                    </label>
                    <button
                      type="button"
                      onClick={() => setForgotMode(true)}
                      className="text-primary text-[11px] font-bold hover:opacity-80 uppercase tracking-widest cursor-pointer"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-muted text-sm">
                      lock
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                      className="w-full bg-surface border-none rounded-2xl py-4 pl-12 pr-12 text-on-surface placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-card-high transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-error-container/20 border border-error/20 rounded-2xl px-4 py-3">
                  <span className="material-symbols-outlined text-error text-sm">
                    error
                  </span>
                  <p className="text-error text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full luminous-gradient text-white font-headline font-extrabold py-4 rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {submitting ? "Accessing…" : "ACCESS PORTAL"}
              </button>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-[var(--c-border)]" />
                <span className="flex-shrink mx-4 text-on-surface-variant text-[10px] tracking-[0.2em] uppercase">
                  Auth Sync
                </span>
                <div className="flex-grow border-t border-[var(--c-border)]" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  className="flex items-center justify-center gap-3 glass-panel border border-[var(--c-border)] py-3 rounded-2xl hover:bg-card-high transition-all cursor-pointer"
                >
                  <span className="text-xs font-semibold tracking-wider">
                    GOOGLE
                  </span>
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-3 glass-panel border border-[var(--c-border)] py-3 rounded-2xl hover:bg-card-high transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xl opacity-80">
                    phone_iphone
                  </span>
                  <span className="text-xs font-semibold tracking-wider">
                    APPLE
                  </span>
                </button>
              </div>

              <div className="text-center">
                <p className="text-on-surface-variant text-sm">
                  New to the void?{" "}
                  <Link
                    href="/sign-up"
                    className="text-primary font-bold hover:underline underline-offset-4 ml-1"
                  >
                    Create Account
                  </Link>
                </p>
              </div>
            </form>
          )}
        </div>

        <div className="mt-16 text-center opacity-20 select-none">
          <span className="text-[8px] tracking-[1em] text-on-surface uppercase">
            Encrypted 256-bit Environment
          </span>
        </div>
      </div>
    </main>
  );
}
