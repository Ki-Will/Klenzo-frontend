"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import KlenzooLogo from "@/components/KlenzooLogo";

export default function SignUpPage() {
  const { register, user, loading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [didRegister, setDidRegister] = useState(false);

  // Only auto-redirect if user was already logged in on mount (not after registration)
  useEffect(() => {
    if (!loading && user && !didRegister) {
      router.replace("/dashboard");
    }
  }, [user, loading, router, didRegister]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agreed) {
      setError("Please accept the terms to continue.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setSubmitting(true);
    setError("");
    setDidRegister(true); // Prevent auto-redirect useEffect from interfering
    try {
      await register(email, password);
      router.replace("/onboarding");
    } catch (err: unknown) {
      setDidRegister(false);
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-background text-on-surface flex flex-col items-center justify-center overflow-x-hidden relative">
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-7xl px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-12 z-10">
        {/* Left: Branding */}
        <div className="w-full md:w-1/2 flex flex-col space-y-8">
          <KlenzooLogo className="w-40 md:w-56 h-auto" />
          <h1 className="text-5xl md:text-7xl font-extrabold font-headline leading-tight tracking-tighter text-on-surface">
            Access the <br />
            <span className="text-primary">intelligent</span> void.
          </h1>
          <p className="text-on-surface-variant text-lg max-w-md leading-relaxed">
            Step into a premium financial ecosystem designed for the modern
            curator.
          </p>
          <div className="hidden md:flex flex-col space-y-4 pt-4">
            {[
              { icon: "shield", text: "Bank-grade encryption by default" },
              { icon: "language", text: "Borderless assets management" },
              { icon: "auto_awesome", text: "AI-powered spending insights" },
            ].map((f) => (
              <div
                key={f.icon}
                className="flex items-center space-x-3 text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-primary">
                  {f.icon}
                </span>
                <span className="text-sm font-medium">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Form */}
        <div className="w-full md:w-5/12 z-10">
          <div className="glass-panel p-8 md:p-12 rounded-2xl shadow-2xl border border-[var(--c-border)]">
            <div className="mb-8">
              <h2 className="text-2xl font-bold font-headline mb-2">
                Create Account
              </h2>
              <p className="text-on-surface-variant text-sm">
                Welcome to the future of digital asset management.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-on-surface-variant ml-1 uppercase tracking-widest">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-4 text-muted">
                    alternate_email
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@klenzoo.com"
                    required
                    autoComplete="email"
                    className="w-full bg-surface border-none rounded-2xl py-4 pl-12 pr-4 text-on-surface placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-on-surface-variant ml-1 uppercase tracking-widest">
                  Password
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-4 text-muted">
                    lock
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="w-full bg-surface border-none rounded-2xl py-4 pl-12 pr-12 text-on-surface placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-4 text-muted hover:text-primary transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
                {password.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {[8, 12, 16].map((len) => (
                      <div
                        key={len}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          password.length >= len
                            ? "bg-primary"
                            : "bg-card-highest"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Terms */}
              <div className="flex items-start space-x-3 pt-2">
                <input
                  id="terms"
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="w-5 h-5 rounded bg-surface border-[var(--c-border)] text-primary focus:ring-primary mt-0.5 flex-shrink-0"
                />
                <label
                  htmlFor="terms"
                  className="text-xs text-on-surface-variant leading-relaxed"
                >
                  I agree to the{" "}
                  <a href="#" className="text-primary hover:underline">
                    Terms and conditions
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-primary hover:underline">
                    Privacy Policy
                  </a>
                  .
                </label>
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
                className="w-full primary-gradient text-white font-bold py-5 rounded-full active:scale-95 transition-all mt-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {submitting ? "Creating account…" : "Join Klenzoo →"}
              </button>

              <div className="pt-4 text-center">
                <p className="text-sm text-on-surface-variant">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="text-primary font-bold hover:text-primary-container transition-colors ml-1"
                  >
                    Login
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
