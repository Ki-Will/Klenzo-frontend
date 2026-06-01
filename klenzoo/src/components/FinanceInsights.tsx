import { useState, useMemo } from "react";
import { finance, type Transaction, type Budget } from "@/lib/api";
import Link from "next/link";

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
  "#10b981", // emerald
  "#f59e0b", // amber
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

interface FinanceInsightsProps {
  transactions: Transaction[];
  budgets: Budget[];
  onRefresh?: () => void;
}

export default function FinanceInsights({
  transactions,
  budgets,
  onRefresh,
}: FinanceInsightsProps) {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [limit, setLimit] = useState("");
  const [period, setPeriod] = useState("monthly");
  const [color, setColor] = useState(COLORS[0]);
  const [icon, setIcon] = useState(ICONS[0]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Assignment State
  const [showAssignor, setShowAssignor] = useState<number | null>(null);

  // Inline Editing
  const [inlineEditingId, setInlineEditingId] = useState<number | null>(null);
  const [inlineName, setInlineName] = useState("");
  const stats = useMemo(() => {
    const txs = transactions || [];
    const totalExpenses = txs
      .filter((t) => t.transactionType === "expense")
      .reduce((s, t) => s + Number(t.amount || 0), 0);
    const totalIncome = txs
      .filter((t) => t.transactionType === "income")
      .reduce((s, t) => s + Number(t.amount || 0), 0);

    const daysInMonth = Math.max(new Date().getDate(), 1);
    const dailyAverage = totalExpenses / daysInMonth;
    const savingsRate =
      totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

    return { totalExpenses, totalIncome, dailyAverage, savingsRate };
  }, [transactions]);

  const budgetTable = useMemo(() => {
    const txs = transactions || [];
    const bgs = budgets || [];

    return bgs
      .map((b) => {
        // Transactions linked manually to this budget
        const linkedTxs = txs.filter(
          (t) => t.budgetId === b.id && t.transactionType === "expense",
        );

        // Fallback: Transactions with the same category that aren&apos;t linked elsewhere
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
        };
      })
      .sort((a, b) => b.spent - a.spent);
  }, [transactions, budgets]);

  function resetForm() {
    setEditingBudget(null);
    setName("");
    setCategory("");
    setLimit("");
    setPeriod("monthly");
    setColor(COLORS[0]);
    setIcon(ICONS[0]);
    setStartDate("");
    setEndDate("");
  }

  async function handleSave() {
    if (!name || !limit) return;
    setSubmitting(true);
    try {
      const dto = {
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
        await finance.createBudget(dto as any);
      }

      setShowModal(false);
      resetForm();
      onRefresh?.();
      showToast(editingBudget ? "Budget updated" : "Budget created");
    } catch (e: any) {
      showToast(e.message || "Failed to save", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleInlineSave(id: number) {
    if (!inlineName) return;
    try {
      await finance.updateBudget(id, { name: inlineName });
      setInlineEditingId(null);
      onRefresh?.();
      showToast("Name updated");
    } catch (e: any) {
      showToast("Failed to rename", "error");
    }
  }

  async function assignTransaction(budgetId: number, transactionId: number) {
    try {
      await finance.updateTransaction(transactionId, { budgetId });
      onRefresh?.();
      showToast("Item assigned");
    } catch (e: any) {
      showToast("Failed to assign", "error");
    }
  }

  async function unassignTransaction(transactionId: number) {
    try {
      await finance.updateTransaction(transactionId, { budgetId: null as any });
      onRefresh?.();
      showToast("Item unlinked");
    } catch (e: any) {
      showToast("Failed to unlink", "error");
    }
  }

  function showToast(message: string, type: "success" | "error" = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  function startEdit(b: Budget) {
    setEditingBudget(b);
    setName(b.name);
    setCategory(b.category || "");
    setLimit(b.limitAmount.toString());
    setPeriod(b.period);
    setColor(b.color || COLORS[0]);
    setIcon(b.icon || ICONS[0]);
    setStartDate(b.startDate?.split("T")[0] || "");
    setEndDate(b.endDate?.split("T")[0] || "");
    setShowModal(true);
  }

  return (
    <div className="space-y-8">
      {/* Smart Insights Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface p-8 rounded-[2rem] border border-outline/10 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <span className="material-symbols-outlined text-6xl text-primary">
              auto_graph
            </span>
          </div>
          <h3 className="text-xl font-headline font-black text-primary-text mb-6 flex items-center gap-3">
            <span className="w-2 h-6 bg-primary rounded-full" />
            Spending Velocity
          </h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-text text-xs uppercase tracking-widest font-bold mb-1">
                  Month Progress
                </p>
                <p className="text-2xl font-bold text-primary-text">
                  {Math.round((new Date().getDate() / 30) * 100)}%
                </p>
              </div>
              <div className="text-right">
                <p className="text-secondary-text text-xs uppercase tracking-widest font-bold mb-1">
                  Budget Used
                </p>
                <p
                  className={`text-2xl font-bold ${stats.savingsRate < 10 ? "text-error" : "text-primary"}`}
                >
                  {Math.round(
                    (stats.totalExpenses /
                      (budgets.reduce((a, b) => a + Number(b.limitAmount), 0) ||
                        1)) *
                      100,
                  )}
                  %
                </p>
              </div>
            </div>
            <div className="bg-card-high p-4 rounded-2xl border border-outline/10">
              <p className="text-sm text-secondary-text leading-relaxed flex items-start gap-2">
                {stats.dailyAverage * 30 > stats.totalIncome ? (
                  <>
                    <span
                      className="material-symbols-outlined text-error text-base flex-shrink-0 mt-0.5"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      warning
                    </span>
                    <span>
                      Your current spending pace exceeds your monthly income.
                      Consider reducing &apos;Other&apos; expenses.
                    </span>
                  </>
                ) : (
                  <>
                    <span
                      className="material-symbols-outlined text-emerald-500 dark:text-emerald-400 text-base flex-shrink-0 mt-0.5"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      check_circle
                    </span>
                    <span>
                      You are spending within your means. Great job on
                      maintaining a healthy burn rate!
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card p-8 rounded-[2rem] border border-outline/10 flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="text-xl font-headline font-black text-primary-text mb-6">
              Savings Potential
            </h3>
            <div className="space-y-4">
              {budgetTable.slice(0, 2).map((b) => (
                <div key={b.id} className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${b.color || "var(--color-primary)"} 12%, transparent)`,
                      color: b.color || "var(--color-primary)",
                    }}
                  >
                    <span className="material-symbols-outlined">{b.icon}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-end">
                      <p className="text-sm font-bold text-primary-text">
                        {b.name}
                      </p>
                      <p className="text-xs text-secondary-text">
                        ${b.spent.toFixed(0)} spent
                      </p>
                    </div>
                    <div className="h-1.5 w-full bg-card-high rounded-full mt-1 overflow-hidden">
                      <div
                        className="h-full"
                        style={{
                          width: `${b.percent}%`,
                          backgroundColor: b.color || "var(--color-primary)",
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Link
            href="/insights"
            className="mt-8 flex items-center justify-center gap-2 text-xs font-bold text-primary hover:gap-4 transition-all"
          >
            VIEW FULL ANALYTICS{" "}
            <span className="material-symbols-outlined text-sm">
              arrow_forward
            </span>
          </Link>
        </div>
      </section>

      {/* Budget vs Actual Table */}
      <section>
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="text-xl font-headline font-black text-primary-text flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">
              account_balance_wallet
            </span>
            Budget Manager
          </h3>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="px-6 py-2 bg-primary text-on-primary rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">add</span> New
            Budget
          </button>
        </div>
        <div className="bg-card rounded-[2.5rem] overflow-hidden border border-outline/10 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-card-high/30">
                  <th className="p-6 text-[10px] font-black text-secondary-text uppercase tracking-[0.2em]">
                    Item
                  </th>
                  <th className="p-6 text-[10px] font-black text-secondary-text uppercase tracking-[0.2em] text-right">
                    Limit
                  </th>
                  <th className="p-6 text-[10px] font-black text-secondary-text uppercase tracking-[0.2em] text-right">
                    Actual
                  </th>
                  <th className="p-6 text-[10px] font-black text-secondary-text uppercase tracking-[0.2em] text-center w-48">
                    Utilization
                  </th>
                  <th className="p-6 text-[10px] font-black text-secondary-text uppercase tracking-[0.2em] text-right">
                    Left
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/5">
                {budgetTable.map((row) => (
                  <>
                    {/* Main Row */}
                    <tr
                      key={row.id}
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
                        className={`p-4 md:p-6 text-right font-black text-sm whitespace-nowrap ${
                          row.remaining < 0 ? "text-error" : "text-primary"
                        }`}
                      >
                        <div className="flex items-center justify-end gap-2">
                          <span>
                            {row.remaining < 0 ? "-" : ""}$
                            {Math.abs(row.remaining).toLocaleString()}
                          </span>

                          <span
                            className={`material-symbols-outlined text-sm transition-transform ${
                              expandedRow === row.id ? "rotate-180" : ""
                            }`}
                          >
                            expand_more
                          </span>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Row */}
                    {expandedRow === row.id && (
                      <tr>
                        <td
                          colSpan={5}
                          className="bg-card-deep/40 border-t border-outline/10"
                        >
                          <div className="p-4 md:p-6 space-y-4">
                            <div className="flex items-center justify-between">
                              <h5 className="text-[10px] uppercase tracking-[0.2em] font-black text-primary">
                                Linked Items
                              </h5>

                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();

                                    setShowAssignor((prev) =>
                                      prev === row.id ? null : row.id,
                                    );
                                  }}
                                  className="px-3 py-1 rounded-full bg-card-high text-[10px] font-bold hover:bg-card-highest cursor-pointer transition-all"
                                >
                                  Assign
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startEdit(
                                      budgets.find((b) => b.id === row.id)!,
                                    );
                                  }}
                                  className="w-8 h-8 rounded-full bg-card-high flex items-center justify-center"
                                >
                                  <span className="material-symbols-outlined text-sm">
                                    settings
                                  </span>
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {transactions
                                .filter(
                                  (t) =>
                                    t.budgetId === row.id &&
                                    t.transactionType === "expense",
                                )
                                .map((t) => (
                                  <div
                                    key={t.id}
                                    className="bg-card p-4 rounded-2xl border border-outline/10"
                                  >
                                    <div className="flex items-center justify-between gap-3">
                                      <div className="min-w-0">
                                        <p className="font-bold text-sm truncate">
                                          {t.description || t.category}
                                        </p>

                                        <p className="text-[10px] text-secondary-text">
                                          {new Date(
                                            t.date,
                                          ).toLocaleDateString()}
                                        </p>
                                      </div>

                                      <p className="font-black text-sm whitespace-nowrap">
                                        -${Number(t.amount).toFixed(0)}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Modal & Toast */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/75 backdrop-blur-md">
          <div className="bg-card w-full max-w-xl rounded-[40px] overflow-hidden border border-outline/15 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8 lg:p-10">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-3xl font-black text-primary-text">
                  {editingBudget ? "Edit Budget" : "New Budget"}
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="w-10 h-10 rounded-full bg-card-high flex items-center justify-center text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-[10px] uppercase tracking-widest text-secondary-text font-bold mb-2 block">
                      Budget Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Summer Vacation"
                      className="w-full bg-card-deep border border-outline/20 rounded-2xl p-4 text-primary-text focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-secondary-text font-bold mb-2 block">
                      Limit Amount ($)
                    </label>
                    <input
                      type="number"
                      value={limit}
                      onChange={(e) => setLimit(e.target.value)}
                      placeholder="1000"
                      className="w-full bg-card-deep border border-outline/20 rounded-2xl p-4 text-primary-text focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-secondary-text font-bold mb-2 block">
                      Period
                    </label>
                    <div className="relative">
                      <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="w-full bg-card-deep border border-outline/20 rounded-2xl p-4 text-primary-text focus:ring-2 focus:ring-primary focus:outline-none transition-all appearance-none"
                      >
                        {PERIODS.map((p) => (
                          <option
                            key={p.value}
                            value={p.value}
                            className="bg-card text-primary-text"
                          >
                            {p.label}
                          </option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-secondary-text">
                        unfold_more
                      </span>
                    </div>
                  </div>
                </div>

                {period === "custom" && (
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-card-deep border border-outline/20 rounded-2xl p-4 text-primary-text focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-card-deep border border-outline/20 rounded-2xl p-4 text-primary-text focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  </div>
                )}

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-secondary-text font-bold mb-2 block">
                    Auto-match Category
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. food"
                    className="w-full bg-card-deep border border-outline/20 rounded-2xl p-4 text-primary-text focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-secondary-text font-bold mb-2 block">
                    Style
                  </label>
                  <div className="flex gap-4 items-center">
                    <div className="flex flex-wrap gap-2 flex-1">
                      {COLORS.map((c) => (
                        <button
                          key={c}
                          onClick={() => setColor(c)}
                          className={`w-6 h-6 rounded-full transition-all cursor-pointer ${color === c ? "ring-2 ring-primary ring-offset-2 ring-offset-[var(--c-card)] scale-110" : "opacity-40 hover:opacity-70"}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2 flex-1">
                      {ICONS.map((i) => (
                        <button
                          key={i}
                          onClick={() => setIcon(i)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${icon === i ? "bg-primary text-on-primary scale-110" : "bg-card-high text-secondary-text hover:bg-card-highest"}`}
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {i}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSave}
                  disabled={submitting || !name || !limit}
                  className="w-full py-5 luminous-gradient text-white rounded-full font-bold text-lg hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "Saving…" : editingBudget ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-4 ${toast.type === "success" ? "bg-primary-container text-on-primary-container" : "bg-error-container text-on-error-container"}`}
        >
          <span className="material-symbols-outlined">
            {toast.type === "success" ? "check_circle" : "error"}
          </span>
          <span className="font-bold">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
