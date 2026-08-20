"use client";
import { useAuth } from "@/lib/auth-context";

const STEPS = [
  { icon: "person_outline", title: "Personal Information", subtitle: "Full name, date of birth, nationality" },
  { icon: "credit_card", title: "Government ID", subtitle: "NIN, passport, or driver license" },
  { icon: "camera_alt", title: "Selfie Verification", subtitle: "Live photo to match your ID" },
];

function statusBadge(status: string) {
  const map: Record<string, { bg: string; fg: string; label: string }> = {
    verified: { bg: "rgba(34,197,94,0.12)", fg: "#22c55e", label: "VERIFIED" },
    pending: { bg: "rgba(245,158,11,0.12)", fg: "#f59e0b", label: "PENDING" },
    rejected: { bg: "rgba(239,68,68,0.12)", fg: "#ef4444", label: "REJECTED" },
  };
  return map[status] ?? { bg: "rgba(148,163,184,0.12)", fg: "#94a3b8", label: "UNVERIFIED" };
}

export default function KycPage() {
  const { user } = useAuth();
  const status = (user as any)?.kycStatus ?? "unverified";
  const badge = statusBadge(status);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--c-text-primary)" }}>
        Identity Verification
      </h1>

      {/* Status Card */}
      <div
        className="rounded-2xl p-6 mb-8 flex items-center gap-4"
        style={{ backgroundColor: "var(--c-card)", border: "1px solid var(--c-border)" }}
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: "rgba(99,102,241,0.12)" }}
        >
          <span className="material-symbols-outlined" style={{ color: "var(--color-primary)" }}>
            shield
          </span>
        </div>
        <div>
          <p className="text-sm" style={{ color: "var(--c-text-muted)" }}>
            KYC Status
          </p>
          <span
            className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-semibold"
            style={{ backgroundColor: badge.bg, color: badge.fg }}
          >
            {badge.label}
          </span>
        </div>
      </div>

      {status === "unverified" || status === "rejected" ? (
        <>
          <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--c-text-primary)" }}>
            Complete Verification
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--c-text-secondary)" }}>
            Verify your identity to unlock all Klenzo features including higher transfer limits and payroll.
          </p>

          <div className="space-y-3 mb-8">
            {STEPS.map((step, i) => (
              <div
                key={i}
                className="rounded-2xl p-4 flex items-center gap-4"
                style={{ backgroundColor: "var(--c-card)", border: "1px solid var(--c-border)" }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "rgba(99,102,241,0.12)" }}
                >
                  <span className="material-symbols-outlined text-lg" style={{ color: "var(--color-primary)" }}>
                    {step.icon}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: "var(--c-text-primary)" }}>
                    {step.title}
                  </p>
                  <p className="text-xs" style={{ color: "var(--c-text-muted)" }}>
                    {step.subtitle}
                  </p>
                </div>
                <span className="material-symbols-outlined" style={{ color: "var(--c-text-muted)" }}>
                  chevron_right
                </span>
              </div>
            ))}
          </div>

          <button
            className="w-full py-4 rounded-full luminous-gradient text-white font-bold text-sm flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
            Start Verification
          </button>
        </>
      ) : status === "pending" ? (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-6xl mb-4" style={{ color: "#f59e0b" }}>
            hourglass_top
          </span>
          <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--c-text-primary)" }}>
            Verification Under Review
          </h2>
          <p className="text-sm" style={{ color: "var(--c-text-secondary)" }}>
            We are reviewing your documents. This usually takes 1–2 business days.
          </p>
        </div>
      ) : (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-6xl mb-4" style={{ color: "#22c55e" }}>
            verified
          </span>
          <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--c-text-primary)" }}>
            Identity Verified
          </h2>
          <p className="text-sm" style={{ color: "var(--c-text-secondary)" }}>
            Your account is fully verified. Enjoy all Klenzo features.
          </p>
        </div>
      )}
    </div>
  );
}
