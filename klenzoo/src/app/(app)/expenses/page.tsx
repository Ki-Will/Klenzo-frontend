"use client";
import { useState, useEffect, useMemo, useCallback, Fragment } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  finance,
  type Transaction,
  type Budget,
  type CreateBudgetDto,
} from "@/lib/api";

const CATEGORIES = ["All", "Food", "Travel", "Bills", "Shopping", "Other"];
const CAT_ICONS: Record<string, string> = {
  All: "apps",
  Food: "restaurant",
  Travel: "flight",
  Bills: "payments",
  Shopping: "shopping_bag",
  Other: "more_horiz",
};
const CATEGORY_ICONS: Record<string, string> = {
  food: "restaurant",
  dining: "restaurant",
  shopping: "shopping_bag",
  retail: "shopping_bag",
  travel: "flight_takeoff",
  transport: "directions_car",
  utilities: "bolt",
  bills: "payments",
  entertainment: "movie",
  fun: "movie",
  income: "payments",
  salary: "payments",
  payroll: "account_balance",
};

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

function txIcon(tx: Transaction) {
  const cat = (tx.category ?? "").toLowerCase();
  return (
    CATEGORY_ICONS[cat] ??
    (tx.transactionType === "income" ? "payments" : "shopping_bag")
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Budget Drawer Component ──────────────────────────────────────────────────
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

// ─── Bulk Assign Modal Component ─────────────────────────────────────────────
function BulkAssignModal({
  budget,
  transactions,
  onClose,
  onAssigned,
}: {
  budget: Budget;
  transactions: Transaction[];
  onClose: () => void;
  onAssigned: (ids: number[]) => void;
}) {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const filtered = transactions.filter(
    (t) =>
      !search ||
      (t.description ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (t.category ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  const toggleSelection = (id: number) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleAssign = () => {
    onAssigned(Array.from(selectedIds));
    onClose();
  };

  const toggleAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((t) => t.id)));
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/75 backdrop-blur-md">
      <div className="bg-card w-full max-w-2xl rounded-[40px] overflow-hidden border border-outline/15 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-8 lg:p-10">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-3xl font-black text-primary-text">
              Add to Budget: {budget.name}
            </h3>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-card-high flex items-center justify-center text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-surface px-4 py-3 rounded-2xl flex items-center border border-outline/10">
              <span className="material-symbols-outlined text-muted mr-3">search</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search transactions..."
                className="bg-transparent border-none focus:outline-none text-sm text-on-surface w-full placeholder:text-muted/60"
              />
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2 pr-2">
              {filtered.length === 0 ? (
                <p className="text-center py-8 text-muted">No transactions found</p>
              ) : (
                <>
                  <div className="flex items-center gap-3 px-4 py-2 bg-card-deep rounded-xl">
                    <input
                      type="checkbox"
                      checked={filtered.length > 0 && selectedIds.size === filtered.length}
                      onChange={toggleAll}
                      className="w-4 h-4 rounded text-primary accent-primary"
                    />
                    <span className="text-[10px] uppercase tracking-widest font-bold text-secondary-text flex-1">
                      Select All ({filtered.length})
                    </span>
                  </div>

                  {filtered.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => toggleSelection(t.id)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors ${
                        selectedIds.has(t.id)
                          ? "bg-primary/10 border border-primary/20"
                          : "bg-card hover:bg-card-high border border-outline/10"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.has(t.id)}
                        readOnly
                        className="w-4 h-4 rounded text-primary accent-primary"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{t.description || t.category}</p>
                        <p className="text-[10px] text-secondary-text">
                          {t.category} • {new Date(t.date).toLocaleDateString()}
                        </p>
                      </div>
                      <p className={`font-bold text-sm whitespace-nowrap ${
                        t.transactionType === "income" ? "text-primary" : "text-error"
                      }`}>
                        {t.transactionType === "income" ? "+" : "-"}${Number(t.amount).toFixed(0)}
                      </p>
                    </div>
                  ))}
                </>
              )}
            </div>

            <button
              onClick={handleAssign}
              disabled={selectedIds.size === 0}
              className="w-full py-4 luminous-gradient text-white rounded-full font-bold text-lg hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
            >
              Add {selectedIds.size} Transaction{selectedIds.size !== 1 ? "s" : ""} to Budget
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Expenses Page Component ────────────────────────────────────────────
export default function ExpensesPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [bulkAssignBudgetId, setBulkAssignBudgetId] = useState<number | null>(null);
  const [bulkAssignSearch, setBulkAssignSearch] = useState("");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const loadData = useCallback(() => {
    if (!user?.id) return;
    setLoading(true);
    Promise.all([finance.getTransactions(), finance.getBudgets()])
      .then(([txs, bgs]) => {
        setTransactions(txs);
        setBudgets(bgs);
      })
      .catch(() => {
        setTransactions([]);
        setBudgets([]);
      })
      .finally(() => setLoading(false));
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      const matchSearch =
        !search ||
        (tx.description ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (tx.category ?? "").toLowerCase().includes(search.toLowerCase());
      const matchCat =
        activeCategory === "All" ||
        (tx.category ?? "")
          .toLowerCase()
          .includes(activeCategory.toLowerCase());
      return matchSearch && matchCat;
    });
  }, [transactions, search, activeCategory]);

  // Group by date
  const grouped = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    [...filtered]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .forEach((tx) => {
        const key = formatDate(tx.date);
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(tx);
      });
    return Array.from(map.entries());
  }, [filtered]);

  const totalOutflow = transactions
    .filter((t) => t.transactionType === "expense")
    .reduce((s, t) => s + t.amount, 0);

  // Budget table calculations
  const budgetTable = useMemo(() => {
    const txs = transactions || [];
    const bgs = budgets || [];

    return bgs
      .map((b) => {
        const linkedTxs = txs.filter(
          (t) => t.budgetId === b.id && t.transactionType === "expense",
        );

        const catTxs = b.category
          ? txs.filter(
              (t) =>
                t.category === b.category &&
                t.transactionType === "expense" &&
                !t.budgetId,
            )
          : [];

        const totalSpent = [...linkedTxs, ...catTxs].reduce(
          (s, t) => s + Number(t.amount || 0),
          0,
        );
        const limit = Number(b.limitAmount || 0);
        const remaining = limit - totalSpent;
        const percent =
          limit > 0 ? Math.min((totalSpent / limit) * 100, 100) : 0;

        return {
          id: b.id,
          name: b.name,
          icon: b.icon || "category",
          color: b.color || "var(--color-primary)",
          period: b.period,
          spent: totalSpent,
          budget: limit,
          remaining,
          percent,
          category: b.category,
        };
      })
      .sort((a, b) => b.spent - a.spent);
  }, [transactions, budgets]);

  function showToast(message: string, type: "success" | "error" = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  function openCreateBudget() {
    setEditingBudget(null);
    setShowModal(true);
  }

  function startEditBudget(b: Budget) {
    setEditingBudget(b);
    setShowModal(true);
  }

  function handleBudgetSaved() {
    loadData();
    showToast(editingBudget ? "Budget updated!" : "Budget created!", "success");
  }

  async function handleDeleteBudget(id: number) {
    if (
      !confirm(
        "Are you sure you want to delete this budget? Transactions will be unlinked.",
      )
    )
      return;
    try {
      await finance.deleteBudget(id);
      loadData();
      showToast("Budget deleted", "success");
    } catch {
      showToast("Failed to delete budget", "error");
    }
  }

  async function handleAddToBudget(budgetId: number, transactionId: number) {
    try {
      await finance.updateTransaction(transactionId, { budgetId });
      loadData();
      showToast("Added to budget", "success");
    } catch {
      showToast("Failed to add to budget", "error");
    }
  }

  async function handleBulkAddToBudget(budgetId: number, transactionIds: number[]) {
    try {
      for (const txId of transactionIds) {
        await finance.updateTransaction(txId, { budgetId });
      }
      loadData();
      showToast(`${transactionIds.length} transactions added to budget`, "success");
    } catch {
      showToast("Failed to add transactions", "error");
    }
  }

  function closeBulkAssign() {
    setBulkAssignBudgetId(null);
    setBulkAssignSearch("");
  }
  return (
    <main className="px-6 lg:px-12 py-6 min-h-screen pb-32">
      {/* Hero Section */}
      <section className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-primary uppercase tracking-[0.3em] text-[10px] mb-2 block">
              Monthly Oversight
            </span>
            <h2 className="text-5xl lg:text-7xl font-black tracking-[-0.04em] leading-none text-primary-text flex items-center gap-6">
              <span className="drop-shadow-[0_0_25px_rgba(255,255,255,0.08)]">
                Activity
              </span>
              <span className="h-3 w-3 rounded-full bg-primary shadow-[0_0_18px_rgba(139,127,255,0.9)]"></span>
            </h2>
          </div>
          <div className="bg-surface p-6 rounded-2xl border-l-4 border-primary">
            <p className="text-on-surface-variant text-xs uppercase tracking-widest mb-1">
              Total Outflow
            </p>
            <p className="text-2xl font-headline font-bold">
              ${totalOutflow.toFixed(2)}
            </p>
          </div>
        </div>
        <button
          onClick={openCreateBudget}
          className="self-start md:self-auto px-6 sm:px-8 py-3 sm:py-4 bg-primary text-on-primary rounded-full font-bold shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
        >
          <span className="material-symbols-outlined">add</span>
          Create Budget
        </button>
      </section>

      {/* Budget Manager Table */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="text-xl font-headline font-black text-primary-text flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">
              account_balance_wallet
            </span>
            Budget Manager
          </h3>
        </div>
        <div className="bg-card rounded-[2.5rem] overflow-hidden border border-outline/10 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-card-high/30">
                  <th className="p-4 md:p-6 text-[10px] font-black text-secondary-text uppercase tracking-[0.2em]">
                    Item
                  </th>
                  <th className="p-4 md:p-6 text-[10px] font-black text-secondary-text uppercase tracking-[0.2em] text-right">
                    Limit
                  </th>
                  <th className="p-4 md:p-6 text-[10px] font-black text-secondary-text uppercase tracking-[0.2em] text-right">
                    Actual
                  </th>
                  <th className="p-4 md:p-6 text-[10px] font-black text-secondary-text uppercase tracking-[0.2em] text-center w-48">
                    Utilization
                  </th>
                  <th className="p-4 md:p-6 text-[10px] font-black text-secondary-text uppercase tracking-[0.2em] text-right">
                    Left
                  </th>
                  <th className="p-4 md:p-6 text-[10px] font-black text-secondary-text uppercase tracking-[0.2em] text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/5">
                {budgetTable.map((row) => (
                  <Fragment key={row.id}>
                    {/* Main Row */}
                    <tr
                      onClick={() =>
                        setExpandedRow(expandedRow === row.id ? null : row.id)
                      }
                      className="hover:bg-card-high/40 cursor-pointer transition-colors group"
                    >
                      {/* Item */}
                      <td className="p-4 md:p-6">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                            style={{
                              backgroundColor: `color-mix(in srgb, ${row.color} 12%, transparent)`,
                              color: row.color,
                            }}
                          >
                            <span className="material-symbols-outlined text-lg">
                              {row.icon}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-sm text-primary-text truncate">
                              {row.name}
                            </p>
                            <p className="text-[10px] uppercase tracking-widest text-secondary-text">
                              {row.period}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Limit */}
                      <td className="p-4 md:p-6 text-right font-bold text-sm text-secondary-text whitespace-nowrap">
                        ${row.budget.toLocaleString()}
                      </td>

                      {/* Actual */}
                      <td className="p-4 md:p-6 text-right font-black text-sm text-primary-text whitespace-nowrap">
                        ${row.spent.toFixed(2)}
                      </td>

                      {/* Utilization */}
                      <td className="p-4 md:p-6 w-[180px]">
                        <div className="space-y-2">
                          <div className="h-2 rounded-full bg-card-high overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${row.percent}%`,
                                backgroundColor:
                                  row.percent > 90
                                    ? "var(--color-error)"
                                    : row.color,
                              }}
                            />
                          </div>
                          <p className="text-[10px] text-right font-bold text-secondary-text">
                            {row.percent.toFixed(0)}%
                          </p>
                        </div>
                      </td>

                      {/* Remaining */}
                      <td
                        className={`p-4 md:p-6 text-right font-black text-sm whitespace-nowrap ${row.remaining < 0 ? "text-error" : "text-primary"}`}
                      >
                        <div className="flex items-center justify-end gap-2">
                          <span>
                            {row.remaining < 0 ? "-" : ""}$
                            {Math.abs(row.remaining).toLocaleString()}
                          </span>
                          <span
                            className={`material-symbols-outlined text-sm transition-transform ${expandedRow === row.id ? "rotate-180" : ""}`}
                          >
                            expand_more
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4 md:p-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditBudget(row as unknown as Budget);
                            }}
                            className="w-8 h-8 rounded-full bg-card-high flex items-center justify-center text-primary hover:bg-card-highest transition-colors"
                            title="Edit"
                          >
                            <span className="material-symbols-outlined text-sm">
                              edit
                            </span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteBudget(row.id);
                            }}
                            className="w-8 h-8 rounded-full bg-card-high flex items-center justify-center text-error hover:bg-card-highest transition-colors"
                            title="Delete"
                          >
                            <span className="material-symbols-outlined text-sm">
                              delete
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Row - Linked Transactions */}
                    {expandedRow === row.id && (
                      <tr>
                        <td
                          colSpan={6}
                          className="bg-card-deep/40 border-t border-outline/10"
                        >
                          <div className="p-4 md:p-6 space-y-4">
                            <div className="flex items-center justify-between">
                              <h5 className="text-[10px] uppercase tracking-[0.2em] font-black text-primary">
                                Linked Items
                              </h5>
                              <div className="flex gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (row.category) {
                                      setBulkAssignBudgetId(row.id);
                                      setBulkAssignSearch("");
                                    }
                                  }}
                                  className="px-3 py-1 rounded-full bg-card-high text-[10px] font-bold hover:bg-card-highest cursor-pointer transition-all"
                                >
                                  Add to Budget
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startEditBudget(row as unknown as Budget);
                                  }}
                                  className="w-8 h-8 rounded-full bg-card-high flex items-center justify-center text-primary hover:bg-card-highest transition-colors"
                                  title="Edit Budget"
                                >
                                  <span className="material-symbols-outlined text-sm">edit</span>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteBudget(row.id);
                                  }}
                                  className="w-8 h-8 rounded-full bg-card-high flex items-center justify-center text-error hover:bg-card-highest transition-colors"
                                  title="Delete Budget"
                                >
                                  <span className="material-symbols-outlined text-sm">delete</span>
                                </button>
                              </div>
                            </div>

                            <div className="space-y-2">
                              {transactions.filter(
                                (t) =>
                                  t.budgetId === row.id ||
                                  (row.category &&
                                    t.category === row.category &&
                                    !t.budgetId),
                              ).length === 0 ? (
                                <p className="text-center py-4 text-muted text-xs uppercase tracking-widest">
                                  No linked expenses found
                                </p>
                              ) : (
                                transactions
                                  .filter(
                                    (t) =>
                                      t.budgetId === row.id ||
                                      (row.category &&
                                        t.category === row.category &&
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
                                      className="bg-card p-4 rounded-2xl border border-outline/10 flex items-center justify-between group"
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-primary flex-shrink-0">
                                          <span className="material-symbols-outlined text-sm">
                                            {txIcon(t)}
                                          </span>
                                        </div>
                                        <div>
                                          <p className="font-bold text-sm truncate max-w-[150px]">
                                            {t.description || t.category}
                                          </p>
                                          <p className="text-[10px] text-secondary-text uppercase tracking-widest">
                                            {new Date(
                                              t.date,
                                            ).toLocaleDateString()}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <p className="font-black text-sm whitespace-nowrap">
                                          {t.transactionType === "income"
                                            ? "+"
                                            : "-"}
                                          ${Number(t.amount).toFixed(0)}
                                        </p>
                                        <button
                                          onClick={async () => {
                                            try {
                                              await finance.updateTransaction(t.id, {
                                                budgetId: undefined,
                                              });
                                              showToast("Removed from budget", "success");
                                              loadData();
                                            } catch (e: any) {
                                              showToast("Failed to remove from budget", "error");
                                            }
                                          }}
                                          className="group flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-card-high hover:text-error transition-all"
                                          title="Remove from budget"
                                        >
                                          <span className="material-symbols-outlined text-[18px]">
                                            link_off
                                          </span>
                                        </button>
                                      </div>
                                    </div>
                                  ))
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}

                {budgetTable.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-muted">
                      <p className="text-lg font-medium mb-2">
                        No budgets created yet
                      </p>
                      <button
                        onClick={openCreateBudget}
                        className="text-primary text-sm hover:underline cursor-pointer"
                      >
                        Create your first budget to get started
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      {/* Search + Filters */}
      <section className="mb-8 space-y-4">
        <div className="bg-surface px-4 py-3 rounded-2xl flex items-center border border-outline/10">
          <span className="material-symbols-outlined text-muted mr-3">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search merchants, categories..."
            className="bg-transparent border-none focus:outline-none text-sm text-on-surface w-full placeholder:text-muted/60"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-muted hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm whitespace-nowrap transition-all flex-shrink-0 ${
                activeCategory === cat
                  ? "bg-primary text-on-primary font-semibold shadow-[0_0_20px_rgba(90,77,255,0.2)]"
                  : "bg-card-high text-on-surface-variant hover:bg-card-highest"
              }`}
            >
              <span className="material-symbols-outlined text-sm">
                {CAT_ICONS[cat]}
              </span>
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Transaction List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-20 bg-surface rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : grouped.length === 0 ? (
        <div className="text-center py-20 text-on-surface-variant">
          <span className="material-symbols-outlined text-5xl mb-4 block opacity-30">
            receipt_long
          </span>
          <p className="text-lg font-headline font-bold mb-2">
            No transactions found
          </p>
          <p className="text-sm mb-6">
            {search
              ? "Try a different search term."
              : "Start tracking your spending."}
          </p>
          <Link
            href="/expenses/add"
            className="px-8 py-3 bg-primary text-white rounded-full font-bold text-sm shadow-md hover:shadow-lg"
          >
            Add First Expense
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([date, txs]) => (
            <div key={date}>
              <div className="flex items-center gap-4 py-3">
                <span className="text-xs font-bold text-secondary-text uppercase tracking-widest whitespace-nowrap">
                  {date}
                </span>
                <div className="h-px w-full bg-outline/10" />
              </div>
              <div className="space-y-2">
                {txs.map((tx) => (
                  <Link
                    key={tx.id}
                    href={`/expenses/${tx.id}`}
                    className="group bg-surface hover:bg-card-high p-4 lg:p-5 rounded-2xl transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-card-highest flex items-center justify-center text-primary group-hover:scale-110 transition-transform flex-shrink-0">
                        <span className="material-symbols-outlined">
                          {txIcon(tx)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-on-surface truncate">
                          {tx.description ?? "Transaction"}
                        </h4>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-on-surface-variant uppercase tracking-wider">
                            {tx.category ?? tx.transactionType}
                          </p>
                          {tx.budgetId &&
                            budgets.find((b) => b.id === tx.budgetId) && (
                              <>
                                <span className="w-1 h-1 rounded-full bg-card-highest" />
                                <div className="flex items-center gap-1 bg-primary/10 px-1.5 py-0.5 rounded text-[9px] font-bold text-primary border border-primary/20">
                                  <span className="material-symbols-outlined text-[10px]">
                                    account_balance_wallet
                                  </span>
                                  {
                                    budgets.find((b) => b.id === tx.budgetId)
                                      ?.name
                                  }
                                </div>
                              </>
                            )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <p
                        className={`font-headline font-bold text-lg ${tx.transactionType === "income" ? "text-primary" : "text-error"}`}
                      >
                        {tx.transactionType === "income" ? "+" : "-"}$
                        {tx.amount.toFixed(2)}
                      </p>
                      <p className="text-[10px] text-secondary-text uppercase tracking-widest">
                        {formatTime(tx.date)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add FAB on mobile */}
      <Link
        href="/expenses/add"
        className="lg:hidden fixed right-6 bottom-28 w-14 h-14 rounded-full bg-primary text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40"
      >
        <span className="material-symbols-outlined text-2xl">add</span>
      </Link>

      {/* Budget Drawer */}
      {showModal && (
        <BudgetDrawer
          editingBudget={editingBudget}
          onClose={() => {
            setShowModal(false);
            setEditingBudget(null);
          }}
          onSaved={handleBudgetSaved}
        />
      )}

      {/* Bulk Assign Modal */}
      {bulkAssignBudgetId && budgets.find((b) => b.id === bulkAssignBudgetId) && (
        <BulkAssignModal
          budget={budgets.find((b) => b.id === bulkAssignBudgetId)!}
          transactions={transactions}
          onClose={closeBulkAssign}
          onAssigned={(ids) => handleBulkAddToBudget(bulkAssignBudgetId, ids)}
        />
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

