"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function SignUpPage() {
  const { register, user, loading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [user, loading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agreed) { setError("Please accept the terms to continue."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setSubmitting(true);
    setError("");
    try {
      await register(email, password);
      router.replace("/onboarding");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#131313] text-[#e5e2e1] flex flex-col items-center justify-center overflow-x-hidden relative">
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#4f46e5]/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#413f82]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-7xl px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-12 z-10">
        {/* Left: Branding */}
        <div className="w-full md:w-1/2 flex flex-col space-y-8">
          <span className="text-4xl font-black tracking-tighter text-[#c3c0ff] font-headline">KLENZOO</span>
          <h1 className="text-5xl md:text-7xl font-extrabold font-headline leading-tight tracking-tighter text-[#e5e2e1]">
            Access the <br />
            <span className="text-[#c3c0ff]">intelligent</span> void.
          </h1>
          <p className="text-[#c7c4d8] text-lg max-w-md leading-relaxed">
            Step into a premium financial ecosystem designed for the modern curator.
          </p>
          <div className="hidden md:flex flex-col space-y-4 pt-4">
            {[
              { icon: "shield", text: "Bank-grade encryption by default" },
              { icon: "language", text: "Borderless assets management" },
              { icon: "auto_awesome", text: "AI-powered spending insights" },
            ].map((f) => (
              <div key={f.icon} className="flex items-center space-x-3 text-[#c7c4d8]">
                <span className="material-symbols-outlined text-[#c3c0ff]">{f.icon}</span>
                <span className="text-sm font-medium">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Form */}
        <div className="w-full md:w-5/12 z-10">
          <div className="glass-panel p-8 md:p-12 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] border border-[#464555]/15">
            <div className="mb-8">
              <h2 className="text-2xl font-bold font-headline mb-2">Create Account</h2>
              <p className="text-[#c7c4d8] text-sm">Welcome to the future of digital asset management.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#c7c4d8] ml-1 uppercase tracking-widest">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-4 text-[#918fa1]">alternate_email</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@klenzoo.com"
                    required
                    autoComplete="email"
                    className="w-full bg-[#1c1b1b] border-none rounded-2xl py-4 pl-12 pr-4 text-[#e5e2e1] placeholder:text-[#918fa1]/50 focus:outline-none focus:ring-1 focus:ring-[#c3c0ff] transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#c7c4d8] ml-1 uppercase tracking-widest">
                  Password
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-4 text-[#918fa1]">lock</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="w-full bg-[#1c1b1b] border-none rounded-2xl py-4 pl-12 pr-12 text-[#e5e2e1] placeholder:text-[#918fa1]/50 focus:outline-none focus:ring-1 focus:ring-[#c3c0ff] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-4 text-[#918fa1] hover:text-[#c3c0ff] transition-colors"
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
                          password.length >= len ? "bg-[#c3c0ff]" : "bg-[#353534]"
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
                  className="w-5 h-5 rounded bg-[#1c1b1b] border-[#464555]/30 text-[#4f46e5] focus:ring-[#c3c0ff] mt-0.5 flex-shrink-0"
                />
                <label htmlFor="terms" className="text-xs text-[#c7c4d8] leading-relaxed">
                  I agree to the{" "}
                  <a href="#" className="text-[#c3c0ff] hover:underline">Terms and conditions</a>{" "}
                  and{" "}
                  <a href="#" className="text-[#c3c0ff] hover:underline">Privacy Policy</a>.
                </label>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-[#93000a]/20 border border-[#ffb4ab]/20 rounded-2xl px-4 py-3">
                  <span className="material-symbols-outlined text-[#ffb4ab] text-sm">error</span>
                  <p className="text-[#ffb4ab] text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full primary-gradient text-white font-bold py-5 rounded-full shadow-lg shadow-[#4f46e5]/20 active:scale-95 transition-all mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Creating account…" : "Join Klenzoo →"}
              </button>

              <div className="pt-4 text-center">
                <p className="text-sm text-[#c7c4d8]">
                  Already have an account?{" "}
                  <Link href="/login" className="text-[#c3c0ff] font-bold hover:text-[#dad7ff] transition-colors ml-1">
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
