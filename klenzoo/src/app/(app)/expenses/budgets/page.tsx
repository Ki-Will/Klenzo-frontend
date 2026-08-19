"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  finance,
  type Budget,
  type CreateBudgetDto,
  type Transaction,
} from "@/lib/api";

const PERIODS = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
  { value: "custom", label: "Custom" },
];

const COLORS = [
  "var(--color-primary)",
  "var(--color-secondary)",
  "var(--color-tertiary)",
  "var(--color-error)",
  "#10b981",
  "#f59e0b",
];
const ICONS = [
  "account_balance_wallet",
  "shopping_cart",
  "restaurant",
  "flight",
  "bolt",
  "movie",
  "home",
  "fitness_center",
];

// ─── Budget Drawer ────────────────────────────────────────────────────────────
function BudgetDrawer({
  editingBudget,
  onClose,
  onSaved,
}: {
  editingBudget: Budget | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(editingBudget?.name ?? "");
  const [category, setCategory] = useState(editingBudget?.category ?? "");
  const [limit, setLimit] = useState(
    editingBudget?.limitAmount?.toString() ?? "",
  );
  const [period, setPeriod] = useState(editingBudget?.period ?? "monthly");
  const [color, setColor] = useState(editingBudget?.color ?? COLORS[0]);
  const [icon, setIcon] = useState(editingBudget?.icon ?? ICONS[0]);
  const [startDate, setStartDate] = useState(editingBudget?.startDate ?? "");
  const [endDate, setEndDate] = useState(editingBudget?.endDate ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isSubmitDisabled = !name.trim() || !limit;

  async function handleSave() {
    if (isSubmitDisabled) return;
    setSubmitting(true);
    setError("");
    try {
      const dto: Partial<CreateBudgetDto> = {
        name,
        category: category || undefined,
        limitAmount: parseFloat(limit),
        period,
        color,
        icon,
        startDate: period === "custom" ? startDate : undefined,
        endDate: period === "custom" ? endDate : undefined,
      };
      if (editingBudget) {
        await finance.updateBudget(editingBudget.id, dto);
      } else {
        await finance.createBudget(dto as CreateBudgetDto);
      }
      onSaved();
      onClose();
    } catch (e: any) {
      setError(e?.message || "Failed to save budget");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-sm">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in { animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `,
        }}
      />

      <div className="w-full max-w-lg bg-card border-l border-[var(--c-border)] shadow-2xl h-full flex flex-col animate-slide-in overflow-hidden">
        {/* Header */}
        <div className="px-5 sm:px-6 py-5 border-b border-[var(--c-border)] flex justify-between items-center bg-card flex-shrink-0">
          <div>
            <h2 className="text-xl font-headline font-extrabold text-primary-text">
              {editingBudget ? "Edit Budget" : "New Budget"}
            </h2>
            <p className="text-xs text-secondary-text mt-0.5">
              {editingBudget
                ? "Update your spending limit"
                : "Define a new spending limit"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-card-high hover:bg-card-highest text-secondary-text hover:text-primary-text transition-colors cursor-pointer flex-shrink-0"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Scrollable Form */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-6 no-scrollbar">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-secondary-text uppercase tracking-widest block">
              Budget Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Summer Vacation, Daily Commute"
              className="w-full bg-card-deep border-none rounded-2xl py-4 px-5 text-primary-text placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-primary transition-all text-sm"
            />
          </div>

          {/* Limit + Period */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-secondary-text uppercase tracking-widest block">
                Limit Amount ($) *
              </label>
              <input
                type="number"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                placeholder="1000"
                className="w-full bg-card-deep border-none rounded-2xl py-4 px-4 text-primary-text placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-primary transition-all text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-secondary-text uppercase tracking-widest block">
                Period
              </label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full bg-card-deep border-none rounded-2xl py-4 px-4 text-primary-text text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              >
                {PERIODS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Custom date range */}
          {period === "custom" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-secondary-text uppercase tracking-widest block">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-card-deep border-none rounded-2xl py-4 px-4 text-primary-text text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-secondary-text uppercase tracking-widest block">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-card-deep border-none rounded-2xl py-4 px-4 text-primary-text text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
            </div>
          )}

          {/* Auto-match category */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-secondary-text uppercase tracking-widest block">
              Auto-match Category (Optional)
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. food, travel"
              className="w-full bg-card-deep border-none rounded-2xl py-4 px-5 text-primary-text placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-primary transition-all text-sm"
            />
          </div>

          {/* Color */}
          <div className="space-y-3">
            <label className="text-[11px] font-semibold text-secondary-text uppercase tracking-widest block">
              Color
            </label>
            <div className="flex items-center gap-3 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-all cursor-pointer flex items-center justify-center ${
                    color === c
                      ? "scale-125 ring-2 ring-white ring-offset-2 ring-offset-card"
                      : "opacity-50 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: c }}
                >
                  {color === c && (
                    <span className="material-symbols-outlined text-white text-xs">
                      check
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Icon */}
          <div className="space-y-3">
            <label className="text-[11px] font-semibold text-secondary-text uppercase tracking-widest block">
              Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    icon === ic
                      ? "bg-primary text-white"
                      : "bg-card-deep text-secondary-text hover:bg-card-high hover:text-primary-text"
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">
                    {ic}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-error text-xs font-semibold">{error}</p>}
        </div>

        {/* Footer */}
        <div className="p-5 sm:p-6 border-t border-[var(--c-border)] bg-card flex gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-4 rounded-full bg-card-high text-secondary-text hover:text-primary-text font-headline font-bold text-sm hover:bg-card-highest transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={submitting || isSubmitDisabled}
            onClick={handleSave}
            className="flex-1 py-4 luminous-gradient text-white font-headline font-bold text-sm rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-40 disabled:hover:scale-100 cursor-pointer"
          >
            {submitting
              ? "Saving…"
              : editingBudget
                ? "Update Budget"
                : "Create Budget"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [expandedBudgetId, setExpandedBudgetId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    loadBudgets();
  }, []);

  async function loadBudgets() {
    setLoading(true);
    try {
      const [bgs, txs] = await Promise.all([
        finance.getBudgets(),
        finance.getTransactions(),
      ]);
      setBudgets(bgs);
      setTransactions(txs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (
      !confirm(
        "Are you sure you want to delete this budget? Transactions will be unlinked.",
      )
    )
      return;
    try {
      await finance.deleteBudget(id);
      await loadBudgets();
      showToast("Budget deleted successfully", "success");
    } catch {
      showToast("Failed to delete budget", "error");
    }
  }

  function handleEdit(b: Budget) {
    setEditingBudget(b);
    setShowDrawer(true);
  }

  function openCreate() {
    setEditingBudget(null);
    setShowDrawer(true);
  }

  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleSaved() {
    await loadBudgets();
    showToast(editingBudget ? "Budget updated!" : "Budget created!", "success");
  }

  return (
    <main className="px-4 sm:px-6 lg:px-12 py-8 sm:py-12 min-h-screen pb-32">
      {/* Drawer */}
      {showDrawer && (
        <BudgetDrawer
          editingBudget={editingBudget}
          onClose={() => {
            setShowDrawer(false);
            setEditingBudget(null);
          }}
          onSaved={handleSaved}
        />
      )}

      {/* Header */}
      <section className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <Link
            href="/expenses"
            className="text-primary text-xs uppercase tracking-widest mb-4 flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <span className="material-symbols-outlined text-sm">
              arrow_back
            </span>
            Back to Finance
          </Link>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-primary-text mb-2">
            Manage Budgets
          </h1>
          <p className="text-muted text-base sm:text-lg">
            Define limits and group your expenses.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="self-start md:self-auto px-6 sm:px-8 py-3 sm:py-4 bg-primary text-on-primary rounded-full font-bold shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-3 cursor-pointer"
        >
          <span className="material-symbols-outlined">add</span>
          Create New Budget
        </button>
      </section>

      {/* Budget Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 bg-surface rounded-2xl sm:rounded-3xl animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {budgets.map((b) => {
            const rawPercent =
              b.limitAmount > 0 ? (b.spent / b.limitAmount) * 100 : 0;
            const safePercent = Number.isFinite(rawPercent)
              ? Math.max(0, Math.min(rawPercent, 100))
              : 0;
            const isOver = rawPercent > 100;

            return (
              <div
                key={b.id}
                className="bg-surface p-4 sm:p-6 rounded-2xl border border-outline/10 group hover:border-primary/10 transition-all relative overflow-hidden"
              >
                {/* Background Accent */}
                <div
                  className="absolute top-0 right-0 w-32 h-32 opacity-[0.03] -mr-8 -mt-8 blur-3xl rounded-full"
                  style={{ backgroundColor: b.color || "var(--color-primary)" }}
                />

                <div className="flex items-center justify-between mb-5">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${b.color || "var(--color-primary)"} 12%, transparent)`,
                      color: b.color || "var(--color-primary)",
                    }}
                  >
                    <span className="material-symbols-outlined">
                      {b.icon || "category"}
                    </span>
                  </div>
                  <div className="flex gap-1.5 items-center">
                    <Link
                      href={`/expenses/add?budgetId=${b.id}`}
                      title="Add Transaction"
                      className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary transition-all hover:bg-primary hover:text-on-primary"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        add
                      </span>
                    </Link>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(b);
                      }}
                      title="Edit"
                      className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary transition-all hover:bg-primary hover:text-on-primary cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        edit
                      </span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(b.id);
                      }}
                      title="Delete"
                      className="w-7 h-7 rounded-full bg-error/10 flex items-center justify-center text-error transition-all hover:bg-error hover:text-on-primary cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        delete
                      </span>
                    </button>
                  </div>
                </div>

                <div
                  className="mb-5 cursor-pointer"
                  onClick={() =>
                    setExpandedBudgetId(expandedBudgetId === b.id ? null : b.id)
                  }
                >
                  <div className="flex justify-between items-end mb-1.5">
                    <h4 className="text-lg font-bold text-primary-text group-hover:text-primary transition-colors truncate max-w-[160px]">
                      {b.name}
                    </h4>
                    <p className="text-[10px] font-black text-muted uppercase tracking-widest ml-2 flex-shrink-0">
                      {b.period}
                    </p>
                  </div>

                  <div className="flex justify-between items-baseline mb-3">
                    <p className="text-2xl font-black text-primary-text">
                      ${Number(b.spent).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted">
                      of ${Number(b.limitAmount).toLocaleString()}
                    </p>
                  </div>

                  <div className="h-2.5 w-full bg-card-high rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${Math.max(4, safePercent)}%`,
                        backgroundColor: isOver
                          ? "var(--color-error)"
                          : b.color || "var(--color-primary)",
                      }}
                    />
                  </div>

                  <div className="flex justify-between mt-2.5">
                    <p
                      className={`text-[10px] font-black uppercase tracking-widest ${isOver ? "text-error" : "text-primary"}`}
                    >
                      {isOver
                        ? "Over Limit"
                        : `${Math.round(100 - rawPercent)}% Left`}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-muted font-bold">
                      <span>VIEW EXPENSES</span>
                      <span
                        className={`material-symbols-outlined text-xs transition-transform ${expandedBudgetId === b.id ? "rotate-180" : ""}`}
                      >
                        expand_more
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expanded Expenses */}
                {expandedBudgetId === b.id && (
                  <div className="mt-4 pt-4 border-t border-outline/10 space-y-2.5 max-h-56 overflow-y-auto no-scrollbar">
                    {transactions.filter(
                      (t) =>
                        t.budgetId === b.id ||
                        (b.category &&
                          t.category === b.category &&
                          !t.budgetId),
                    ).length === 0 ? (
                      <p className="text-[10px] text-muted italic text-center py-4 uppercase tracking-widest">
                        No expenses found
                      </p>
                    ) : (
                      transactions
                        .filter(
                          (t) =>
                            t.budgetId === b.id ||
                            (b.category &&
                              t.category === b.category &&
                              !t.budgetId),
                        )
                        .sort(
                          (a, bx) =>
                            new Date(bx.date).getTime() -
                            new Date(a.date).getTime(),
                        )
                        .map((t) => (
                          <div
                            key={t.id}
                            className="flex items-center justify-between p-2.5 bg-card-high/30 rounded-xl hover:bg-card-high/50 transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-background flex items-center justify-center text-primary flex-shrink-0">
                                <span className="material-symbols-outlined text-sm">
                                  payments
                                </span>
                              </div>
                              <div>
                                <p className="text-[11px] font-bold text-primary-text truncate max-w-[110px]">
                                  {t.description || t.category}
                                </p>
                                <p className="text-[9px] text-muted uppercase tracking-widest">
                                  {new Date(t.date).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <p className="text-xs font-black text-primary-text">
                              -${Number(t.amount).toFixed(0)}
                            </p>
                          </div>
                        ))
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {budgets.length === 0 && (
            <div className="col-span-full py-16 text-center border-2 border-dashed border-outline/20 rounded-2xl">
              <span className="material-symbols-outlined text-5xl text-muted mb-4 block">
                account_balance_wallet
              </span>
              <p className="text-on-surface-variant font-medium mb-2">
                No budgets created yet.
              </p>
              <button
                onClick={openCreate}
                className="text-primary text-sm hover:underline cursor-pointer"
              >
                Start by creating one
              </button>
            </div>
          )}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 ${
            toast.type === "success"
              ? "bg-primary text-on-primary"
              : "bg-error text-on-primary"
          }`}
        >
          <span className="material-symbols-outlined">
            {toast.type === "success" ? "check_circle" : "error"}
          </span>
          <span className="font-bold text-sm">{toast.message}</span>
        </div>
      )}
    </main>
  );
}
