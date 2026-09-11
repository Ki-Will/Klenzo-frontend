"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

function OAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { completeMfaLogin } = useAuth();

  const status = searchParams.get("status");
  const redirect = searchParams.get("redirect") || "/dashboard";
  const mfaToken = searchParams.get("token");
  const message = searchParams.get("message");

  // MFA flow state
  const [mfaCode, setMfaCode] = useState("");
  const [mfaError, setMfaError] = useState("");
  const [mfaLoading, setMfaLoading] = useState(false);

  const needMfa = status === "mfa_required" && mfaToken;

  useEffect(() => {
    if (status === "success") {
      router.replace(redirect);
    }
  }, [status, redirect, router]);

  // Error state
  if (status === "error") {
    return (
      <main className="min-h-screen bg-background text-on-surface flex items-center justify-center">
        <div className="glass-panel rounded-2xl p-8 max-w-md text-center space-y-4">
          <span className="material-symbols-outlined text-error text-4xl">
            error
          </span>
          <h2 className="text-xl font-bold">Authentication Failed</h2>
          <p className="text-on-surface-variant text-sm">
            {message || "Something went wrong during Google authentication."}
          </p>
          <button
            onClick={() => router.replace("/login")}
            className="glass-btn-primary px-6 py-3 text-white font-bold text-sm cursor-pointer"
          >
            Back to Login
          </button>
        </div>
      </main>
    );
  }

  // MFA required after Google OAuth
  if (needMfa) {
    async function handleMfa(e: React.FormEvent) {
      e.preventDefault();
      if (mfaCode.length !== 6 || !mfaToken) return;
      setMfaLoading(true);
      setMfaError("");
      try {
        await completeMfaLogin(mfaToken, mfaCode);
        router.replace(redirect);
      } catch (err: unknown) {
        setMfaError(err instanceof Error ? err.message : "Invalid code");
      } finally {
        setMfaLoading(false);
      }
    }

    return (
      <main className="min-h-screen bg-background text-on-surface flex items-center justify-center">
        <div className="glass-panel rounded-2xl p-8 max-w-md text-center space-y-6">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 glass-badge flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-3xl">
                security
              </span>
            </div>
            <h2 className="text-xl font-bold">Two-Factor Authentication</h2>
            <p className="text-on-surface-variant text-sm">
              Your account requires a verification code from your authenticator
              app.
            </p>
          </div>
          <form onSubmit={handleMfa} className="space-y-4">
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
              className="glass-input w-full py-4 text-center text-lg tracking-[0.5em] font-mono text-on-surface placeholder:text-muted/50 focus:outline-none"
            />
            {mfaError && (
              <p className="text-error text-sm">{mfaError}</p>
            )}
            <button
              type="submit"
              disabled={mfaLoading || mfaCode.length !== 6}
              className="glass-btn-primary w-full text-white font-bold py-3 disabled:opacity-50 cursor-pointer"
            >
              {mfaLoading ? "Verifying…" : "VERIFY"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  // Loading — waiting for redirect or callback to resolve
  return (
    <main className="min-h-screen bg-background text-on-surface flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-on-surface-variant text-sm">
          Completing authentication…
        </p>
      </div>
    </main>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <OAuthCallbackContent />
    </Suspense>
  );
}
