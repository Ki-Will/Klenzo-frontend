"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { finance } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

// ─── Types ────────────────────────────────────────────────────────────────────

type SplitMethod = "equal" | "percentage" | "custom";

interface Member {
  email: string;
  name: string;
}

interface SplitShare {
  email: string;
  name: string;
  value: number; // percentage (0-100) or fixed amount
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function Steps({ current }: { current: number }) {
  const steps = ["Details", "Members", "Split", "Review"];
  return (
    <div className="flex items-center gap-2 mb-10">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={label} className="flex items-center gap-2 flex-1 last:flex-none">
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${done ? "bg-primary text-white" :
                active ? "bg-primary text-white" :
                  "bg-card-high text-muted"
                }`}>
                {done ? <span className="material-symbols-outlined text-sm">check</span> : i + 1}
              </div>
              <span className={`text-xs font-semibold hidden sm:block ${active ? "text-primary-text" : done ? "text-primary" : "text-muted"}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px mx-1 ${done ? "bg-primary/40" : "bg-card-high"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function NewGroupPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(0);

  // Step 0 — Details
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Step 1 — Members
  const [members, setMembers] = useState<Member[]>([{ email: "", name: "" }]);

  // Step 2 — Split
  const [splitMethod, setSplitMethod] = useState<SplitMethod>("equal");
  const [totalAmount, setTotalAmount] = useState("");
  const [shares, setShares] = useState<SplitShare[]>([]);

  // Step 3 — Submit
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // ── Step 0 helpers ──────────────────────────────────────────────────────────

  function goToMembers(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setStep(1);
  }

  // ── Step 1 helpers ──────────────────────────────────────────────────────────

  function addMemberRow() {
    setMembers((prev) => [...prev, { email: "", name: "" }]);
  }

  function removeMemberRow(i: number) {
    setMembers((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateMember(i: number, field: keyof Member, value: string) {
    setMembers((prev) => prev.map((m, idx) => idx === i ? { ...m, [field]: value } : m));
  }

  function goToSplit(e: React.FormEvent) {
    e.preventDefault();
    const valid = [currentUserMember, ...members.filter((m) => m.email.trim())];
    // Initialise shares from valid members
    const amt = parseFloat(totalAmount) || 0;
    const equalShare = valid.length > 0 ? parseFloat((amt / valid.length).toFixed(2)) : 0;
    const equalPct = valid.length > 0 ? parseFloat((100 / valid.length).toFixed(1)) : 0;
    setShares(valid.map((m) => ({
      email: m.email.trim(),
      name: m.name.trim() || m.email.split("@")[0],
      value: splitMethod === "percentage" ? equalPct : equalShare,
    })));
    setStep(2);
  }

  // ── Step 2 helpers ──────────────────────────────────────────────────────────

  const updateShare = useCallback((i: number, raw: string) => {
    const val = parseFloat(raw) || 0;
    setShares((prev) => prev.map((s, idx) => idx === i ? { ...s, value: val } : s));
  }, []);

  function distributeEqually() {
    const amt = parseFloat(totalAmount) || 0;
    const n = shares.length;
    if (n === 0) return;
    if (splitMethod === "percentage") {
      const pct = parseFloat((100 / n).toFixed(1));
      setShares((prev) => prev.map((s) => ({ ...s, value: pct })));
    } else {
      const share = parseFloat((amt / n).toFixed(2));
      setShares((prev) => prev.map((s) => ({ ...s, value: share })));
    }
  }

  const totalAssigned = shares.reduce((s, sh) => s + sh.value, 0);
  const amt = parseFloat(totalAmount) || 0;
  const isBalanced = splitMethod === "percentage"
    ? Math.abs(totalAssigned - 100) < 0.1
    : amt === 0 || Math.abs(totalAssigned - amt) < 0.01;

  // ── Step 3 — Submit ─────────────────────────────────────────────────────────

  async function handleCreate() {
    setSubmitting(true);
    setError("");
    try {
      const memberEmails = members
        .map((m) => m.email.trim())
        .filter((email) => email && email.toLowerCase() !== user?.email?.toLowerCase());
      const group = await finance.createGroup({ name: name.trim(), memberEmails });

      // Add members (best-effort — ignore failures)
      router.push(`/groups/${group.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create group");
      setSubmitting(false);
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  const currentUserMember: Member = {
    email: user?.email ?? "",
    name: user?.name || user?.email?.split("@")[0] || "You",
  };
  const validMembers = members.filter((m) => m.email.trim());
  const reviewMembers = [currentUserMember, ...validMembers];

  return (
    <main className="px-6 lg:px-12 py-6 min-h-screen">
      <div className="max-w-2xl mx-auto">

        <Link href="/groups" className="flex items-center gap-2 text-secondary-text hover:text-primary transition-colors text-sm mb-8">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Groups
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-headline font-extrabold tracking-tighter text-primary-text">New Circle</h1>
          <p className="text-secondary-text mt-1">Set up a group to split expenses with others.</p>
        </div>

        <Steps current={step} />

        {/* ── STEP 0: Details ── */}
        {step === 0 && (
          <form onSubmit={goToMembers} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted uppercase tracking-widest">Group Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Flatmates, Vacation 2025…"
                required
                autoFocus
                className="w-full bg-card border-none rounded-2xl py-4 px-6 text-primary-text placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted uppercase tracking-widest">Description <span className="normal-case text-muted">(optional)</span></label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this group for?"
                rows={2}
                className="w-full bg-card border-none rounded-2xl py-4 px-6 text-primary-text placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-primary transition-all resize-none"
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-muted uppercase tracking-widest block">Total Amount to Split <span className="normal-case text-muted">(optional — set now or later)</span></label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-muted font-bold text-lg">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-card border-none rounded-2xl py-4 pl-10 pr-6 text-primary-text placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full py-4 bg-primary text-white font-headline font-bold rounded-full shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
            >
              Next — Add Members
            </button>
          </form>
        )}

        {/* ── STEP 1: Members ── */}
        {step === 1 && (
          <form onSubmit={goToSplit} className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-muted uppercase tracking-widest">Members</label>
                <button type="button" onClick={addMemberRow}
                  className="flex items-center gap-1 text-primary text-xs font-bold hover:underline">
                  <span className="material-symbols-outlined text-sm">add</span>
                  Add row
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex gap-3 items-start rounded-2xl bg-card border border-primary/20 p-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-primary-text truncate">
                      {currentUserMember.name}
                    </p>
                    <p className="text-xs text-secondary-text truncate">{currentUserMember.email}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                    Owner
                  </span>
                </div>
                {members.map((m, i) => (
                  <div key={i} className="flex gap-3 items-center">
                    <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-muted text-sm">mail</span>
                        <input
                          type="email"
                          value={m.email}
                          onChange={(e) => updateMember(i, "email", e.target.value)}
                          placeholder="email@example.com"
                          className="w-full bg-card border-none rounded-2xl py-3 pl-11 pr-4 text-primary-text placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-primary transition-all text-sm"
                        />
                      </div>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-muted text-sm">person</span>
                        <input
                          type="text"
                          value={m.name}
                          onChange={(e) => updateMember(i, "name", e.target.value)}
                          placeholder="Display name (optional)"
                          className="w-full bg-card border-none rounded-2xl py-3 pl-11 pr-4 text-primary-text placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-primary transition-all text-sm"
                        />
                      </div>
                    </div>
                    {members.length > 1 && (
                      <button type="button" onClick={() => removeMemberRow(i)}
                        className="p-2 text-muted hover:text-error transition-colors flex-shrink-0">
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-muted text-xs">You are always included as the first member.</p>
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(0)}
                className="flex-1 py-4 bg-card-high hover:bg-card-highest text-primary-text font-bold rounded-full transition-all">
                Back
              </button>
              <button type="submit"
                className="flex-1 py-4 bg-primary text-white font-headline font-bold rounded-full shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all">
                Next — Split Method
              </button>
            </div>
          </form>
        )}

        {/* ── STEP 2: Split ── */}
        {step === 2 && (
          <div className="space-y-6">

            {/* Method selector */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-muted uppercase tracking-widest block">Split Method</label>
              <div className="grid grid-cols-3 gap-3">
                {([
                  { key: "equal", icon: "balance", label: "Equal", sub: "Split evenly" },
                  { key: "percentage", icon: "percent", label: "By %", sub: "Custom ratios" },
                  { key: "custom", icon: "attach_money", label: "Custom $", sub: "Fixed amounts" },
                ] as { key: SplitMethod; icon: string; label: string; sub: string }[]).map(({ key, icon, label, sub }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setSplitMethod(key);
                      // Recalculate shares for new method
                      const a = parseFloat(totalAmount) || 0;
                      const n = shares.length;
                      if (n === 0) return;
                      if (key === "percentage") {
                        const pct = parseFloat((100 / n).toFixed(1));
                        setShares((prev) => prev.map((s) => ({ ...s, value: pct })));
                      } else {
                        const share = parseFloat((a / n).toFixed(2));
                        setShares((prev) => prev.map((s) => ({ ...s, value: share })));
                      }
                    }}
                    className={`flex flex-col items-center p-4 rounded-2xl transition-all border ${splitMethod === key
                      ? "bg-primary/20 border-primary/50 text-primary-text"
                      : "bg-card border-outline/10 text-muted hover:bg-card-high"
                      }`}
                  >
                    <span className={`material-symbols-outlined text-2xl mb-1 ${splitMethod === key ? "text-primary" : "text-muted"}`}
                      style={splitMethod === key ? { fontVariationSettings: "'FILL' 1" } : {}}>
                      {icon}
                    </span>
                    <span className="font-bold text-sm">{label}</span>
                    <span className="text-[10px] opacity-60 mt-0.5">{sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Total amount (editable here too) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-muted uppercase tracking-widest">Total Amount</label>
                <button type="button" onClick={distributeEqually}
                  className="text-primary text-xs font-bold hover:underline flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">auto_fix_high</span>
                  Distribute equally
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-muted font-bold text-lg">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={totalAmount}
                  onChange={(e) => {
                    setTotalAmount(e.target.value);
                    // Auto-redistribute on amount change for equal/custom
                    if (splitMethod !== "percentage") {
                      const a = parseFloat(e.target.value) || 0;
                      const n = shares.length;
                      if (n > 0) {
                        const share = parseFloat((a / n).toFixed(2));
                        setShares((prev) => prev.map((s) => ({ ...s, value: share })));
                      }
                    }
                  }}
                  placeholder="0.00"
                  className="w-full bg-card border-none rounded-2xl py-4 pl-10 pr-6 text-primary-text placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
            </div>

            {/* Per-member shares */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-muted uppercase tracking-widest block">
                {splitMethod === "percentage" ? "Share (%)" : "Amount ($)"} per Member
              </label>
              <div className="space-y-2">
                {shares.map((s, i) => (
                  <div key={s.email} className="flex items-center gap-4 bg-card rounded-2xl px-5 py-3">
                    <div className="w-9 h-9 rounded-full bg-card-highest flex items-center justify-center text-xs font-bold text-muted flex-shrink-0">
                      {s.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="text-sm font-semibold text-primary-text truncate">{s.name}</p>
                      <p className="text-xs text-muted truncate">{s.email}</p>
                    </div>
                    <div className="relative flex-shrink-0 w-28">
                      {splitMethod !== "equal" ? (
                        <>
                          <input
                            type="number"
                            min="0"
                            step={splitMethod === "percentage" ? "0.1" : "0.01"}
                            max={splitMethod === "percentage" ? "100" : undefined}
                            value={s.value}
                            onChange={(e) => updateShare(i, e.target.value)}
                            className="w-full bg-card-high border-none rounded-xl py-2 pl-3 pr-7 text-primary-text text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all text-right"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted text-xs font-bold pointer-events-none">
                            {splitMethod === "percentage" ? "%" : "$"}
                          </span>
                        </>
                      ) : (
                        <div className="bg-card-high rounded-xl py-2 px-3 text-right">
                          <span className="text-primary font-bold text-sm">
                            ${s.value.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Balance indicator */}
              <div className={`flex items-center justify-between px-5 py-3 rounded-2xl text-sm font-semibold ${isBalanced ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-error/10 text-error"
                }`}>
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">
                    {isBalanced ? "check_circle" : "warning"}
                  </span>
                  {splitMethod === "percentage"
                    ? `Total: ${totalAssigned.toFixed(1)}% ${isBalanced ? "✓" : `(${(100 - totalAssigned).toFixed(1)}% remaining)`}`
                    : amt > 0
                      ? `Assigned: $${totalAssigned.toFixed(2)} of $${amt.toFixed(2)} ${isBalanced ? "✓" : `($${(amt - totalAssigned).toFixed(2)} remaining)`}`
                      : "Enter a total amount above"}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)}
                className="flex-1 py-4 bg-card-high hover:bg-card-highest text-primary-text font-bold rounded-full transition-all">
                Back
              </button>
              <button type="button" onClick={() => setStep(3)}
                className="flex-1 py-4 bg-primary text-white font-headline font-bold rounded-full shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all">
                Review
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Review & Create ── */}
        {step === 3 && (
          <div className="space-y-6">

            {/* Summary card */}
            <div className="bg-card rounded-2xl p-6 space-y-5">
              {/* Group name */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted uppercase tracking-widest mb-1">Group</p>
                  <p className="text-xl font-headline font-bold text-primary-text">{name}</p>
                  {description && <p className="text-sm text-muted mt-0.5">{description}</p>}
                </div>
                <button onClick={() => setStep(0)} className="text-primary text-xs font-bold hover:underline flex-shrink-0 ml-4">Edit</button>
              </div>

              <div className="h-px bg-outline/10" />

              {/* Members */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-muted uppercase tracking-widest">Members ({reviewMembers.length})</p>
                  <button onClick={() => setStep(1)} className="text-primary text-xs font-bold hover:underline">Edit</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {reviewMembers.map((m, index) => (
                    <div key={m.email} className="flex items-center gap-2 bg-card-high rounded-full px-3 py-1.5">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[9px] font-bold text-primary">
                        {(m.name || m.email).slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-xs text-primary-text">{m.name || m.email.split("@")[0]}</span>
                      {index === 0 && <span className="text-[9px] uppercase tracking-wider text-primary">Owner</span>}
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-px bg-outline/10" />

              {/* Split */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-muted uppercase tracking-widest">
                    Split — {splitMethod === "equal" ? "Equal" : splitMethod === "percentage" ? "By %" : "Custom $"}
                    {amt > 0 && ` · $${amt.toFixed(2)} total`}
                  </p>
                  <button onClick={() => setStep(2)} className="text-primary text-xs font-bold hover:underline">Edit</button>
                </div>
                <div className="space-y-2">
                  {shares.map((s) => (
                    <div key={s.email} className="flex items-center justify-between">
                      <span className="text-sm text-muted">{s.name}</span>
                      <span className="text-sm font-bold text-primary">
                        {splitMethod === "percentage"
                          ? `${s.value.toFixed(1)}%${amt > 0 ? ` · $${(amt * s.value / 100).toFixed(2)}` : ""}`
                          : `$${s.value.toFixed(2)}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-error/10 border border-error/20 rounded-2xl px-4 py-3">
                <span className="material-symbols-outlined text-error text-sm">error</span>
                <p className="text-error text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(2)}
                className="flex-1 py-4 bg-card-high hover:bg-card-highest text-primary-text font-bold rounded-full transition-all">
                Back
              </button>
              <button
                type="button"
                onClick={handleCreate}
                disabled={submitting}
                className="flex-1 py-4 bg-primary text-white font-headline font-bold rounded-full shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
              >
                {submitting ? "Creating…" : "Create Circle"}
              </button>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
