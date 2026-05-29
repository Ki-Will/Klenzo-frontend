"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  finance,
  type Transaction,
  type CategorySplit,
  type Budget,
} from "@/lib/api";

type Period = "Monthly" | "Quarterly" | "Yearly";

const DONUT_COLORS = [
  "var(--color-primary)",
  "var(--color-secondary)",
  "var(--color-tertiary)",
  "var(--c-card-highest)",
  "var(--c-card-high)",
];

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<Period>("Monthly");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<CategorySplit[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(false);

  const [customDateRange, setCustomDateRange] = useState();
  const [compareMode, setCompareMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    Promise.all([
      finance.getTransactions(),
      finance.getAnalyticsCategories().catch(() => [] as CategorySplit[]),
      finance.getBudgets().catch(() => []),
    ])
      .then(([txs, cats, bgs]) => {
        setTransactions(txs);
        setCategories(cats);
        setBudgets(bgs);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id]);

  const totalSpend = useMemo(
    () =>
      transactions
        .filter((t) => t.transactionType === "expense")
        .reduce((s, t) => s + t.amount, 0),
    [transactions],
  );

  const totalIncome = useMemo(
    () =>
      transactions
        .filter((t) => t.transactionType === "income")
        .reduce((s, t) => s + t.amount, 0),
    [transactions],
  );

  // Filter transactions by selected period
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    return transactions.filter((t) => {
      const d = new Date(t.date);
      if (period === "Monthly") {
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      }
      if (period === "Quarterly") {
        const q = Math.floor(now.getMonth() / 3);
        return (
          Math.floor(d.getMonth() / 3) === q &&
          d.getFullYear() === now.getFullYear()
        );
      }
      // Yearly
      return d.getFullYear() === now.getFullYear();
    });
  }, [transactions, period]);

  const expenseTransactions = useMemo(
    () => filteredTransactions.filter((t) => t.transactionType === "expense"),
    [filteredTransactions],
  );

  const incomeTransactions = useMemo(
    () => filteredTransactions.filter((t) => t.transactionType === "income"),
    [filteredTransactions],
  );

  const periodSpend = useMemo(
    () => expenseTransactions.reduce((s, t) => s + t.amount, 0),
    [expenseTransactions],
  );

  const periodIncome = useMemo(
    () => incomeTransactions.reduce((s, t) => s + t.amount, 0),
    [incomeTransactions],
  );

  // Build category breakdown from transactions if API didn't return it
  const catBreakdown = useMemo(() => {
    if (categories.length > 0) return categories;
    const map = new Map<string, number>();
    expenseTransactions.forEach((t) => {
      const cat = t.category ?? "other";
      map.set(cat, (map.get(cat) ?? 0) + t.amount);
    });
    const total = Array.from(map.values()).reduce((s, v) => s + v, 0) || 1;
    return Array.from(map.entries())
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: Math.round((amount / total) * 100),
        count: filteredTransactions.filter(
          (t) => (t.category ?? "other") === category,
        ).length,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [categories, filteredTransactions]);

  // Monthly bar data (last 7 months)
  const barData = useMemo(() => {
    const periods: { label: string; expense: number; income: number }[] = [];
    const count = period === "Monthly" ? 7 : period === "Quarterly" ? 4 : 12;
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date();
      if (period === "Quarterly") {
        d.setMonth(d.getMonth() - i * 3);
      } else if (period === "Yearly") {
        d.setFullYear(d.getFullYear() - i);
      } else {
        d.setMonth(d.getMonth() - i);
      }

      const label =
        period === "Yearly"
          ? d.getFullYear().toString()
          : period === "Quarterly"
            ? `Q${Math.floor(d.getMonth() / 3) + 1} ${d.getFullYear()}`
            : d.toLocaleString("en-US", { month: "short" });

      const expense = transactions
        .filter((t) => {
          const td = new Date(t.date);
          if (t.transactionType !== "expense") return false;
          if (period === "Yearly") return td.getFullYear() === d.getFullYear();
          if (period === "Quarterly")
            return (
              Math.floor(td.getMonth() / 3) === Math.floor(d.getMonth() / 3) &&
              td.getFullYear() === d.getFullYear()
            );
          return (
            td.getMonth() === d.getMonth() &&
            td.getFullYear() === d.getFullYear()
          );
        })
        .reduce((s, t) => s + t.amount, 0);

      const income = transactions
        .filter((t) => {
          const td = new Date(t.date);
          if (t.transactionType !== "income") return false;
          if (period === "Yearly") return td.getFullYear() === d.getFullYear();
          if (period === "Quarterly")
            return (
              Math.floor(td.getMonth() / 3) === Math.floor(d.getMonth() / 3) &&
              td.getFullYear() === d.getFullYear()
            );
          return (
            td.getMonth() === d.getMonth() &&
            td.getFullYear() === d.getFullYear()
          );
        })
        .reduce((s, t) => s + t.amount, 0);

      periods.push({ label, expense, income });
    }
    return periods;
  }, [transactions, period]);

  const maxBar = Math.max(
    ...barData.map((b) => Math.max(b.expense, b.income)),
    1,
  );
  const skeletonClasses = [
    "md:col-span-8",
    "md:col-span-4",
    "md:col-span-5",
    "md:col-span-7",
  ];
  if (!loading && transactions.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <span className="material-symbols-outlined text-6xl text-muted mb-4">
            analytics
          </span>
          <h2 className="text-2xl font-headline font-bold text-primary-text mb-2">
            No analytics yet
          </h2>
          <p className="text-muted mb-6">
            Start adding transactions to generate insights and spending
            analytics.
          </p>
          <Link
            href="/expenses"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-primary text-white font-bold"
          >
            Add Transactions
          </Link>
        </div>
      </main>
    );
  }
  return (
    <main className="min-h-screen px-4 sm:px-6 lg:px-10 xl:px-12 py-4 sm:py-6 pb-28">
      {/* Header */}
      <section className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div>
          <span className="text-primary font-bold tracking-widest uppercase text-xs mb-2 block">
            Overview
          </span>
          <h1 className="text-5xl md:text-6xl font-headline font-extrabold tracking-tight text-primary-text">
            Analytics
          </h1>
        </div>
        <div className="flex w-full sm:w-auto bg-surface p-1 rounded-full overflow-x-auto no-scrollbar border border-[var(--c-border)]">
          {(["Monthly", "Quarterly", "Yearly"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 sm:flex-none px-4 sm:px-5 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${period === p ? "bg-card-high text-on-surface" : "text-on-surface-variant hover:text-on-surface"}`}
            >
              {p}
            </button>
          ))}
        </div>
      </section>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {skeletonClasses.map((cls, i) => (
            <div
              key={i}
              className={`${cls} h-64 bg-surface rounded-3xl animate-pulse`}
            />
          ))}
        </div>
      ) : (
        <>
          {/* Main bento */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 lg:gap-6 mb-8">
            {/* Bar chart */}
            <div className="xl:col-span-8 bg-surface rounded-2xl p-5 sm:p-6 lg:p-8 flex flex-col gap-6 relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-on-surface-variant text-sm font-medium mb-1">
                    Cash Flow ({period})
                  </h3>
                  <div className="flex items-baseline gap-4 mt-2">
                    <p className="text-3xl font-headline font-bold text-primary-text">
                      ${(periodIncome - periodSpend).toFixed(2)}{" "}
                      <span className="text-sm font-normal text-muted">
                        Net
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 text-xs font-bold text-right">
                  <span className="flex items-center gap-1 text-primary justify-end">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>{" "}
                    Income
                  </span>
                  <span className="flex items-center gap-1 text-error justify-end">
                    <div className="w-2 h-2 rounded-full bg-error"></div>{" "}
                    Expense
                  </span>
                </div>
              </div>
              <div className="h-56 sm:h-64 w-full flex items-end gap-1 sm:gap-2 md:gap-3 mt-6 overflow-hidden">
                {barData.map((b, i) => (
                  <div
                    key={i}
                    className="flex-1 flex justify-center items-end gap-1 group relative h-full"
                  >
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-surface p-2 rounded-xl text-[10px] whitespace-nowrap z-10 border border-[var(--c-border)] shadow-xl pointer-events-none">
                      <p className="text-primary font-bold">
                        In: ${b.income.toFixed(0)}
                      </p>
                      <p className="text-error font-bold">
                        Out: ${b.expense.toFixed(0)}
                      </p>
                    </div>
                    {/* Income bar */}
                    <div
                      className={`max-w-[14px] sm:max-w-[18px] md:max-w-[22px] w-full max-w-[20px] rounded-t-sm transition-all duration-500 bg-primary hover:bg-primary/80`}
                      style={{
                        height: `${Math.max(2, (b.income / maxBar) * 100)}%`,
                      }}
                    />
                    {/* Expense bar */}
                    <div
                      className={`max-w-[14px] sm:max-w-[18px] md:max-w-[22px]w-full max-w-[20px] rounded-t-sm transition-all duration-500 bg-error hover:bg-error/80`}
                      style={{
                        height: `${Math.max(2, (b.expense / maxBar) * 100)}%`,
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-on-surface-variant uppercase tracking-widest px-1">
                {barData.map((b) => (
                  <span key={b.label}>{b.label}</span>
                ))}
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 blur-[100px] -z-0" />
            </div>

            {/* AI Insights */}
            <div className="bg-primary h-[500px] xl:col-span-4 rounded-2xl p-5 sm:p-6 lg:p-8 text-on-primary flex flex-col justify-between shadow-xl shadow-indigo-900/20">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-on-primary/20 rounded-xl">
                    <span className="material-symbols-outlined">
                      auto_awesome
                    </span>
                  </div>
                  <h3 className="font-headline font-bold text-lg text-on-primary">
                    AI Insights
                  </h3>
                </div>
                <ul className="space-y-5">
                  <li className="flex gap-3">
                    <div className="w-1 bg-on-primary/30 rounded-full flex-shrink-0" />
                    <p className="text-sm leading-relaxed text-on-primary">
                      {period} income:{" "}
                      <span className="font-bold text-on-primary">
                        ${periodIncome.toFixed(2)}
                      </span>
                      . Savings rate:{" "}
                      <span className="font-bold text-on-primary">
                        {periodIncome > 0
                          ? `${Math.round(((periodIncome - periodSpend) / periodIncome) * 100)}%`
                          : "N/A"}
                      </span>
                    </p>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-1 bg-on-primary/30 rounded-full flex-shrink-0" />
                    <p className="text-sm leading-relaxed text-on-primary">
                      Top category:{" "}
                      <span className="font-bold text-on-primary capitalize">
                        {catBreakdown[0]?.category ?? "—"}
                      </span>{" "}
                      (
                      {catBreakdown[0]
                        ? `$${catBreakdown[0].amount.toFixed(2)}`
                        : "no data"}
                      )
                    </p>
                  </li>
                </ul>
              </div>
              <button className="mt-6 flex items-center justify-center gap-2 text-sm font-bold bg-on-primary/10 hover:bg-on-primary/20 transition-colors py-3 rounded-2xl cursor-pointer">
                Full Analysis{" "}
                <span className="material-symbols-outlined text-sm">
                  arrow_forward
                </span>
              </button>
            </div>
          </div>

          {/* Secondary row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Donut */}
            <div className="md:col-span-5 bg-surface rounded-2xl p-5 sm:p-6 lg:p-8 flex flex-col items-center">
              <h3 className="w-full text-left text-primary-text font-headline font-bold mb-6">
                Category Split
              </h3>
              <div className="relative w-36 h-36 sm:w-44 sm:h-44 mb-6">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    fill="transparent"
                    r="15.9"
                    stroke="var(--c-app-shell-bg)"
                    strokeWidth="4"
                  />
                  {
                    catBreakdown
                      .slice(0, 5)
                      .reduce<{ offset: number; els: React.ReactNode[] }>(
                        (acc, cat, i) => {
                          const dash = cat.percentage;
                          acc.els.push(
                            <circle
                              key={cat.category}
                              cx="18"
                              cy="18"
                              fill="transparent"
                              r="15.9"
                              stroke={DONUT_COLORS[i]}
                              strokeDasharray={`${dash} 100`}
                              strokeDashoffset={-acc.offset}
                              strokeWidth="4"
                              strokeLinecap="butt"
                            />,
                          );
                          acc.offset += dash;
                          return acc;
                          void i;
                        },
                        { offset: 0, els: [] },
                      ).els
                  }
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-primary-text">
                    ${periodSpend.toFixed(0)}
                  </span>
                  <span className="text-[10px] text-on-surface-variant uppercase tracking-widest">
                    Spent
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 w-full">
                {catBreakdown.slice(0, 4).map((cat, i) => (
                  <div key={cat.category} className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: DONUT_COLORS[i] }}
                    />
                    <span className="text-xs text-on-surface-variant capitalize truncate  max-w-[120px]">
                      {cat.category} ({cat.percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly variance */}
            <div className="md:col-span-7 bg-surface rounded-2xl p-5 sm:p-6 lg:p-8">
              <h3 className="text-primary-text font-headline font-bold mb-6">
                Category Breakdown
              </h3>
              {catBreakdown.length === 0 ? (
                <p className="text-on-surface-variant text-sm">
                  No expense data yet.
                </p>
              ) : (
                <div className="space-y-5">
                  {catBreakdown.map((cat) => (
                    <div
                      key={cat.category}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-card-high flex items-center justify-center">
                          <span className="material-symbols-outlined text-primary text-sm">
                            category
                          </span>
                        </div>
                        <div>
                          <p className="text-primary-text font-bold capitalize">
                            {cat.category}
                          </p>
                          <p className="text-xs text-on-surface-variant">
                            {cat.count} transaction{cat.count !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-primary-text font-bold">
                          ${cat.amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          {cat.percentage}% of total
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Budget Health Section */}
          <section className="mt-8 bg-surface rounded-2xl p-5 sm:p-6 lg:p-8 border border-[var(--c-border)]">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-headline font-bold text-primary-text">
                  Budget Health
                </h3>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-sm text-muted">
                    Performance across your defined spending limits
                  </p>
                  <span className="w-1 h-1 rounded-full bg-[var(--color-outline)]" />
                  <p className="text-[10px] font-bold text-error">
                    {
                      budgets.filter((b) => b.spent / (b.limitAmount || 1) > 1)
                        .length
                    }{" "}
                    Over Budget
                  </p>
                  <span className="w-1 h-1 rounded-full bg-[var(--color-outline)]" />
                  <p className="text-[10px] font-bold text-primary">
                    {
                      budgets.filter((b) => b.spent / (b.limitAmount || 1) <= 1)
                        .length
                    }{" "}
                    Healthy
                  </p>
                </div>
              </div>
              <Link
                href="/expenses/budgets"
                className="px-4 py-2 bg-card-high rounded-xl text-xs font-bold text-on-surface-variant hover:text-primary-text transition-colors flex items-center gap-2"
              >
                Manage All{" "}
                <span className="material-symbols-outlined text-sm">
                  open_in_new
                </span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-5 sm:p-6 lg:p-8">
              {budgets.map((b) => {
                const percent =
                  b.limitAmount > 0 ? (b.spent / b.limitAmount) * 100 : 0;
                const isOver = percent > 100;
                return (
                  <div
                    key={b.id}
                    className="space-y-4 p-5 rounded-[2rem] bg-card-high/30 border border-[var(--c-border)] hover:border-outline-variant/20 transition-all group"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                          <span className="material-symbols-outlined">
                            {b.icon || "account_balance_wallet"}
                          </span>
                        </div>
                        <div>
                          <p className="font-bold text-primary-text">
                            {b.name}
                          </p>
                          <p className="text-[10px] uppercase tracking-widest text-muted">
                            {b.period}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-sm font-black ${isOver ? "text-error" : "text-primary-text"}`}
                        >
                          ${b.spent.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-muted">
                          of ${b.limitAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="h-2 w-full bg-background rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-1000 ${isOver ? "bg-error" : "bg-primary"}`}
                          style={{
                            width: `${Math.max(4, Math.min(percent, 100))}%`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className={isOver ? "text-error" : "text-muted"}>
                          {isOver
                            ? "EXCEEDED"
                            : `${Math.max(0, Math.round(100 - percent))}% REMAINING`}
                        </span>
                        <span className="text-primary-text">
                          {Math.round(percent)}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {budgets.length === 0 && (
                <div className="col-span-full py-12 text-center bg-background/50 rounded-[2rem] border border-dashed border-[var(--c-border)]">
                  <p className="text-muted italic">
                    No active budgets found. Start by creating one in the
                    expenses section.
                  </p>
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
