"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { finance, type TransactionType, type Group, type GroupMember, type Budget } from "@/lib/api";
import CustomDatePicker from "@/components/CustomDatePicker";

// ─── Types ────────────────────────────────────────────────────────────────────

type SplitMethod = "equal" | "percentage" | "custom";

interface MemberSplit {
  member: GroupMember;
  amount: number;       // their share in $
  percentage: number;   // their share in %
  approved: boolean;    // has this member approved their split?
  isMe: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { icon: "restaurant", label: "Dining",    value: "dining" },
  { icon: "shopping_cart", label: "Shopping", value: "shopping" },
  { icon: "directions_car", label: "Travel",  value: "travel" },
  { icon: "bolt",          label: "Utilities",value: "utilities" },
  { icon: "movie",         label: "Fun",      value: "fun" },
  { icon: "more_horiz",    label: "Other",    value: "other" },
];

const ALL_CATEGORIES = [
  { icon: "restaurant", label: "Dining", value: "dining" },
  { icon: "shopping_cart", label: "Shopping", value: "shopping" },
  { icon: "directions_car", label: "Travel", value: "travel" },
  { icon: "bolt", label: "Utilities", value: "utilities" },
  { icon: "movie", label: "Fun", value: "fun" },
  { icon: "payments", label: "Salary", value: "salary" },
  { icon: "account_balance", label: "Investment", value: "investment" },
  { icon: "home", label: "Rent", value: "rent" },
  { icon: "health_and_safety", label: "Health", value: "health" },
  { icon: "school", label: "Education", value: "education" },
  { icon: "fitness_center", label: "Fitness", value: "fitness" },
  { icon: "card_giftcard", label: "Gift", value: "gift" },
  { icon: "medical_services", label: "Medical", value: "medical" },
  { icon: "pets", label: "Pets", value: "pets" },
  { icon: "more_horiz", label: "Other", value: "other" },
];

const NUMPAD = ["1","2","3","4","5","6","7","8","9",".","0","⌫"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function splitEqually(members: GroupMember[], total: number, myId: number): MemberSplit[] {
  const n = members.length || 1;
  const share = parseFloat((total / n).toFixed(2));
  const pct   = parseFloat((100 / n).toFixed(1));
  return members.map((m) => ({
    member: m,
    amount: share,
    percentage: pct,
    approved: m.id === myId, // creator auto-approves their own share
    isMe: m.id === myId,
  }));
}

// ─── Page wrapper (Suspense for useSearchParams) ──────────────────────────────

export default function AddExpensePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-app-shell flex items-center justify-center">
        <div className="flex space-x-2">
          {[0,1,2].map((i) => (
            <div key={i} className="w-2 h-2 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    }>
      <AddExpenseForm />
    </Suspense>
  );
}

// ─── Main form ────────────────────────────────────────────────────────────────

function AddExpenseForm() {
  const { user } = useAuth();
  const router   = useRouter();
  const searchParams = useSearchParams();
  const groupId  = searchParams.get("groupId") ?? undefined;
  const initialBudgetId = searchParams.get("budgetId");

  // ── Amount ──
  const [amount, setAmount] = useState("0");

  // ── Details ──
  const [category,    setCategory]    = useState("shopping");
  const [txType,      setTxType]      = useState<TransactionType>("expense");
  const [description, setDescription] = useState("");
  const [date,        setDate]        = useState(new Date().toISOString().split("T")[0]);
  const [showAllCategories, setShowAllCategories] = useState(false);

  // ── Group split ──
  const [group,       setGroup]       = useState<Group | null>(null);
  const [splitMethod, setSplitMethod] = useState<SplitMethod>("equal");
  const [splits,      setSplits]      = useState<MemberSplit[]>([]);
  const [loadingGroup, setLoadingGroup] = useState(false);

  const [error,      setError]      = useState("");
  const [budgets,    setBudgets]    = useState<Budget[]>([]);
  const [budgetId,   setBudgetId]   = useState<number | undefined>(initialBudgetId ? parseInt(initialBudgetId) : undefined);
  const [submitting, setSubmitting] = useState(false);

  // Fetch budgets on mount
  useEffect(() => {
    finance.getBudgets().then(setBudgets).catch(() => {});
  }, []);

  // Load group when groupId is present
  useEffect(() => {
    if (!groupId) return;
    setLoadingGroup(true);
    finance.getGroup(groupId)
      .then((g) => {
        setGroup(g);
        const total = parseFloat(amount) || 0;
        setSplits(splitEqually(g.members, total, user?.id ?? 0));
      })
      .catch(() => {})
      .finally(() => setLoadingGroup(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  // Re-split when amount changes (equal mode)
  useEffect(() => {
    if (!group || splitMethod !== "equal") return;
    const total = parseFloat(amount) || 0;
    setSplits(splitEqually(group.members, total, user?.id ?? 0));
  }, [amount, group, splitMethod, user?.id]);

  // ── Numpad ──
  function handleNumpad(key: string) {
    if (key === "⌫") {
      setAmount((p) => (p.length <= 1 ? "0" : p.slice(0, -1)));
    } else if (key === ".") {
      setAmount((p) => (p.includes(".") ? p : p + "."));
    } else {
      setAmount((p) => (p === "0" ? key : p + key));
    }
  }

  // ── Split method change ──
  function changeSplitMethod(method: SplitMethod) {
    setSplitMethod(method);
    if (!group) return;
    const total = parseFloat(amount) || 0;
    const n = group.members.length || 1;
    if (method === "equal") {
      setSplits(splitEqually(group.members, total, user?.id ?? 0));
    } else if (method === "percentage") {
      const pct = parseFloat((100 / n).toFixed(1));
      setSplits((prev) => prev.map((s) => ({
        ...s,
        percentage: pct,
        amount: parseFloat(((pct / 100) * total).toFixed(2)),
      })));
    }
    // custom — leave as-is, user edits manually
  }

  // ── Update individual split ──
  function updateSplit(idx: number, raw: string) {
    const val = parseFloat(raw) || 0;
    const total = parseFloat(amount) || 0;
    setSplits((prev) => prev.map((s, i) => {
      if (i !== idx) return s;
      if (splitMethod === "percentage") {
        return { ...s, percentage: val, amount: parseFloat(((val / 100) * total).toFixed(2)) };
      }
      return { ...s, amount: val, percentage: total > 0 ? parseFloat(((val / total) * 100).toFixed(1)) : 0 };
    }));
  }

  const totalSplit   = splits.reduce((s, x) => s + x.amount, 0);
  const totalPct     = splits.reduce((s, x) => s + x.percentage, 0);
  const totalAmt     = parseFloat(amount) || 0;
  const splitOk      = groupId
    ? (splitMethod === "percentage"
        ? Math.abs(totalPct - 100) < 0.2
        : totalAmt === 0 || Math.abs(totalSplit - totalAmt) < 0.02)
    : true;

  // ── Submit ──
  async function handleConfirm() {
    const num = parseFloat(amount);
    if (!num || num <= 0) { setError("Enter a valid amount."); return; }
    if (!user?.id)        { setError("Not authenticated.");    return; }
    if (groupId && !splitOk) { setError("Split amounts don't add up to the total."); return; }

    setSubmitting(true);
    setError("");

    try {
      // 1. Create the main transaction (full amount, tagged with groupId)
      //    This is the "parent" expense — visible in /expenses for the creator
      //    and listed in the group's shared expenses.
      await finance.createTransaction({
        userId: user.id,
        amount: num,
        description: description || undefined,
        category,
        transactionType: txType,
        date: new Date(date).toISOString(),
        groupId,
        budgetId,
      });

      // 2. If this is a group expense, create a PENDING split transaction
      //    for each OTHER member at their ratio amount.
      //    Status = "pending" — they must approve before it counts in their expenses.
      //    The creator's own split is auto-approved (already covered by the main tx).
      if (groupId && group && splits.length > 0) {
        const otherSplits = splits.filter((s) => !s.isMe && s.amount > 0);
        await Promise.allSettled(
          otherSplits.map((s) =>
            finance.createTransaction({
              userId: s.member.id,
              amount: s.amount,
              description: `Split: ${description || category} (${s.percentage.toFixed(1)}%)`,
              category,
              transactionType: txType,
              date: new Date(date).toISOString(),
              groupId,
              status: "pending",          // awaiting member approval
              parentTransactionId: undefined, // backend can link these
            } as Parameters<typeof finance.createTransaction>[0])
          )
        );
      }

      router.push(groupId ? `/groups/${groupId}` : "/expenses");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save transaction");
    } finally {
      setSubmitting(false);
    }
  }

  const isGroupMode = !!groupId;

  return (
    <main className="py-8 px-6 md:px-12 max-w-7xl mx-auto">

      {/* Group context banner */}
      {isGroupMode && group && (
        <div className="mb-8 flex items-center gap-3 bg-primary/10 border border-primary/20 rounded-2xl px-5 py-3">
          <span className="material-symbols-outlined text-primary text-sm">group</span>
          <p className="text-sm text-primary font-semibold">
            Adding to <span className="font-bold">{group.name}</span> — expense will be split among {group.members.length} member{group.members.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-12 items-start justify-center">

        {/* ── Left: Amount + Numpad ── */}
        <section className="w-full lg:w-1/2 flex flex-col items-center space-y-8">

          {/* Type toggle — only for non-group expenses */}
          {!isGroupMode && (
            <div className="flex bg-card p-1 rounded-full w-full max-w-xs">
              {(["expense","income"] as TransactionType[]).map((t) => (
                <button key={t} onClick={() => setTxType(t)}
                  className={`flex-grow py-2.5 rounded-full text-sm font-bold capitalize transition-all ${
                    txType === t ? "bg-primary text-white shadow-md" : "text-secondary-text"
                  }`}>
                  {t}
                </button>
              ))}
            </div>
          )}

          <div className="text-center w-full">
            <p className="font-headline uppercase tracking-widest text-[10px] text-muted mb-4">
              {isGroupMode ? "Total Amount" : "Enter Amount"}
            </p>
            <div className="flex items-center justify-center space-x-2 w-full max-w-full overflow-hidden">
              <span className={`text-4xl font-headline font-bold text-primary`}>$</span>
              <input 
                type="text"
                inputMode="decimal"
                value={amount === "0" ? "" : amount}
                placeholder="0"
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9.]/g, '');
                  if (val.split('.').length > 2) return; // Only one decimal point
                  setAmount(val || "0");
                }}
                className="text-6xl md:text-8xl font-headline font-extrabold tracking-tighter text-primary-text bg-transparent border-none outline-none text-center placeholder:text-primary-text/30 max-w-full min-w-[1ch]"
                style={{ width: `${Math.max(1, amount === "0" ? 1 : amount.length)}ch` }}
              />
            </div>
            {isGroupMode && totalAmt > 0 && splits.length > 0 && (
              <p className="text-muted text-xs mt-2">
                Your share: <span className="text-primary font-bold">
                  ${splits.find((s) => s.isMe)?.amount.toFixed(2) ?? "0.00"}
                </span>
              </p>
            )}
          </div>

          <div className="hidden sm:grid grid-cols-3 gap-3 w-full max-w-sm">
            {NUMPAD.map((key) => (
              <button key={key} onClick={() => handleNumpad(key)}
                className={`aspect-square flex items-center justify-center text-2xl font-headline font-bold hover:bg-card-high active:scale-95 transition-all rounded-2xl ${
                  key === "⌫" ? "text-error hover:bg-error/10" : "text-secondary-text"
                }`}>
                {key === "⌫"
                  ? <span className="material-symbols-outlined text-3xl">backspace</span>
                  : key}
              </button>
            ))}
          </div>
        </section>

        {/* ── Right: Details + Split ── */}
        <section className="w-full lg:w-1/2 space-y-6">

          {/* Category */}
          <div className="space-y-3">
            <label className="font-headline uppercase tracking-widest text-[10px] text-muted block">Category</label>
            <div className="grid grid-cols-3 gap-3">
              {CATEGORIES.slice(0, 5).map((cat) => (
                <button key={cat.value} onClick={() => { setCategory(cat.value); setShowAllCategories(false); }}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all ${
                    category === cat.value && !showAllCategories
                      ? "bg-primary/20 border border-primary/40"
                      : "bg-card hover:bg-card-high"
                  }`}>
                  <span className={`material-symbols-outlined mb-2 ${category === cat.value && !showAllCategories ? "text-primary" : "text-primary-text/60"}`}
                    style={category === cat.value && !showAllCategories ? { fontVariationSettings: "'FILL' 1" } : {}}>
                    {cat.icon}
                  </span>
                  <span className={`text-xs font-medium ${category === cat.value && !showAllCategories ? "text-primary-text font-bold" : "text-secondary-text"}`}>
                    {cat.label}
                  </span>
                </button>
              ))}
              <button onClick={() => setShowAllCategories(!showAllCategories)}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all ${
                  showAllCategories
                    ? "bg-primary/20 border border-primary/40"
                    : "bg-card hover:bg-card-high"
                }`}>
                <span className={`material-symbols-outlined mb-2 ${showAllCategories ? "text-primary" : "text-primary-text/60"}`}
                  style={showAllCategories ? { fontVariationSettings: "'FILL' 1" } : {}}>
                  more_horiz
                </span>
                <span className={`text-xs font-medium ${showAllCategories ? "text-primary-text font-bold" : "text-secondary-text"}`}>
                  Other
                </span>
              </button>
            </div>
            {showAllCategories && (
              <div className="mt-4 p-4 bg-card rounded-2xl border border-outline/20">
                <p className="text-xs text-muted mb-3 uppercase tracking-widest font-bold">All Categories</p>
                <div className="flex flex-wrap gap-2">
                  {ALL_CATEGORIES.map(cat => (
                    <button key={cat.value} onClick={() => setCategory(cat.value)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs transition-all ${
                        category === cat.value
                          ? "bg-primary text-white font-bold shadow-sm"
                          : "bg-card-high text-secondary-text hover:bg-card-highest"
                      }`}>
                      <span className="material-symbols-outlined text-[14px]">{cat.icon}</span>
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Date */}
          <div className="space-y-2">
            <label className="font-headline uppercase tracking-widest text-[10px] text-muted block">Date</label>
            <CustomDatePicker value={date} onChange={(val) => setDate(val)} />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="font-headline uppercase tracking-widest text-[10px] text-muted block">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-card border-none rounded-2xl p-4 text-primary-text placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-primary transition-all resize-none"
              placeholder="Merchant name or note..." rows={2} />
          </div>

          {/* Budget Selection */}
          {!isGroupMode && budgets.length > 0 && (
            <div className="space-y-3">
              <label className="font-headline uppercase tracking-widest text-[10px] text-muted block">Link to Budget</label>
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                <button
                  onClick={() => setBudgetId(undefined)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${!budgetId ? "bg-primary text-white" : "bg-card text-secondary-text"}`}
                >
                  Auto-match
                </button>
                {budgets.map(b => (
                  <button
                    key={b.id}
                    onClick={() => setBudgetId(b.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${budgetId === b.id ? "bg-primary text-white" : "bg-card text-secondary-text"}`}
                    style={budgetId === b.id ? {} : { borderLeft: `3px solid ${b.color || "var(--color-primary)"}` }}
                  >
                    <span className="material-symbols-outlined text-sm">{b.icon || "category"}</span>
                    {b.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Group Split Section ── */}
          {isGroupMode && (
            <div className="space-y-4 bg-card rounded-2xl p-5 border border-primary/20">
              <div className="flex items-center justify-between">
                <label className="font-headline uppercase tracking-widest text-[10px] text-primary block">
                  Split Method
                </label>
                <div className="flex gap-2">
                  {(["equal","percentage","custom"] as SplitMethod[]).map((m) => (
                    <button key={m} onClick={() => changeSplitMethod(m)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                        splitMethod === m
                          ? "bg-primary text-white"
                          : "bg-card-high text-secondary-text hover:bg-card-highest"
                      }`}>
                      {m === "equal" ? "Equal" : m === "percentage" ? "By %" : "Custom $"}
                    </button>
                  ))}
                </div>
              </div>

              {loadingGroup ? (
                <div className="space-y-2">
                  {[1,2].map((i) => <div key={i} className="h-12 bg-card-deep rounded-xl animate-pulse" />)}
                </div>
              ) : splits.length === 0 ? (
                <p className="text-muted text-xs text-center py-2">No members in this group yet.</p>
              ) : (
                <div className="space-y-2">
                  {splits.map((s, i) => (
                    <div key={s.member.id}
                      className={`flex items-center gap-3 p-3 rounded-xl ${
                        s.isMe ? "bg-primary/10 border border-primary/20" : "bg-card-deep"
                      }`}>
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-full bg-card-highest flex items-center justify-center text-xs font-bold text-secondary-text flex-shrink-0">
                        {(s.member.name || s.member.email).slice(0, 2).toUpperCase()}
                      </div>

                      {/* Name */}
                      <div className="flex-grow min-w-0">
                        <p className="text-sm font-semibold text-primary-text truncate">
                          {s.member.name || s.member.email.split("@")[0]}
                          {s.isMe && <span className="text-primary text-xs ml-1">(you)</span>}
                        </p>
                        {/* Approval badge */}
                        <p className={`text-[10px] font-bold uppercase tracking-wider ${
                          s.isMe ? "text-emerald-400" : "text-tertiary"
                        }`}>
                          {s.isMe ? "✓ auto-approved" : "pending approval"}
                        </p>
                      </div>

                      {/* Amount input */}
                      {splitMethod === "equal" ? (
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-bold text-primary">${s.amount.toFixed(2)}</p>
                          <p className="text-[10px] text-muted">{s.percentage.toFixed(1)}%</p>
                        </div>
                      ) : (
                        <div className="relative flex-shrink-0 w-24">
                          <input
                            type="number" min="0"
                            step={splitMethod === "percentage" ? "0.1" : "0.01"}
                            value={splitMethod === "percentage" ? s.percentage : s.amount}
                            onChange={(e) => updateSplit(i, e.target.value)}
                            className="w-full bg-card-deep border-none rounded-xl py-1.5 pl-2 pr-6 text-primary-text text-sm focus:outline-none focus:ring-1 focus:ring-primary text-right"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted text-xs pointer-events-none">
                            {splitMethod === "percentage" ? "%" : "$"}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Balance check */}
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold ${
                    splitOk ? "bg-emerald-900/20 text-emerald-400" : "bg-error/10 text-error"
                  }`}>
                    <span className="material-symbols-outlined text-sm">
                      {splitOk ? "check_circle" : "warning"}
                    </span>
                    {splitMethod === "percentage"
                      ? `${totalPct.toFixed(1)}% of 100% ${splitOk ? "✓" : `— ${(100 - totalPct).toFixed(1)}% unassigned`}`
                      : totalAmt > 0
                        ? `$${totalSplit.toFixed(2)} of $${totalAmt.toFixed(2)} ${splitOk ? "✓" : `— $${(totalAmt - totalSplit).toFixed(2)} unassigned`}`
                        : "Enter a total amount"}
                  </div>

                  {/* Approval note */}
                  <div className="flex items-start gap-2 px-3 py-2 bg-card-high rounded-xl">
                    <span className="material-symbols-outlined text-tertiary text-sm flex-shrink-0 mt-0.5">info</span>
                    <p className="text-[10px] text-secondary-text leading-relaxed">
                      Other members will see a <span className="text-tertiary font-bold">pending approval</span> notification in the group. Their split only counts toward their personal expenses once they approve it.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 bg-error/10 border border-error/20 rounded-2xl px-4 py-3">
              <span className="material-symbols-outlined text-error text-sm">error</span>
              <p className="text-error text-sm">{error}</p>
            </div>
          )}

          <button onClick={handleConfirm}
            disabled={submitting || parseFloat(amount) <= 0 || (isGroupMode && !splitOk && totalAmt > 0)}
            className="w-full h-16 bg-primary text-white rounded-full font-headline font-bold text-lg shadow-md hover:shadow-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed">
            <span className="material-symbols-outlined">
              {submitting ? "hourglass_empty" : isGroupMode ? "group" : "check_circle"}
            </span>
            {submitting
              ? "Saving…"
              : isGroupMode
                ? `Split $${parseFloat(amount) > 0 ? parseFloat(amount).toFixed(2) : "0.00"} among ${splits.length}`
                : "Confirm Transaction"}
          </button>

        </section>
      </div>
    </main>
  );
}

