"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { finance, type Transaction, type CategorySplit, type Budget } from "@/lib/api";

type Period = "Monthly" | "Quarterly" | "Yearly";

const DONUT_COLORS = ["#4f46e5","#c3c0ff","#ffb695","#353534","#2a2a2a"];

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<Period>("Monthly");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<CategorySplit[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    Promise.all([
      finance.getTransactions(),
      finance.getAnalyticsCategories().catch(() => [] as CategorySplit[]),
      finance.getBudgets().catch(() => []),
    ]).then(([txs, cats, bgs]) => {
      setTransactions(txs);
      setCategories(cats);
      setBudgets(bgs);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user?.id]);

  const totalSpend = useMemo(() =>
    transactions.filter((t) => t.transactionType === "expense").reduce((s, t) => s + t.amount, 0),
    [transactions]
  );

  const totalIncome = useMemo(() =>
    transactions.filter((t) => t.transactionType === "income").reduce((s, t) => s + t.amount, 0),
    [transactions]
  );

  // Filter transactions by selected period
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    return transactions.filter((t) => {
      const d = new Date(t.date);
      if (period === "Monthly") {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }
      if (period === "Quarterly") {
        const q = Math.floor(now.getMonth() / 3);
        return Math.floor(d.getMonth() / 3) === q && d.getFullYear() === now.getFullYear();
      }
      // Yearly
      return d.getFullYear() === now.getFullYear();
    });
  }, [transactions, period]);

  const periodSpend = useMemo(() =>
    filteredTransactions.filter((t) => t.transactionType === "expense").reduce((s, t) => s + t.amount, 0),
    [filteredTransactions]
  );

  const periodIncome = useMemo(() =>
    filteredTransactions.filter((t) => t.transactionType === "income").reduce((s, t) => s + t.amount, 0),
    [filteredTransactions]
  );

  // Build category breakdown from transactions if API didn't return it
  const catBreakdown = useMemo(() => {
    if (categories.length > 0) return categories;
    const map = new Map<string, number>();
    filteredTransactions.filter((t) => t.transactionType === "expense").forEach((t) => {
      const cat = t.category ?? "other";
      map.set(cat, (map.get(cat) ?? 0) + t.amount);
    });
    const total = Array.from(map.values()).reduce((s, v) => s + v, 0) || 1;
    return Array.from(map.entries()).map(([category, amount]) => ({
      category,
      amount,
      percentage: Math.round((amount / total) * 100),
      count: filteredTransactions.filter((t) => (t.category ?? "other") === category).length,
    })).sort((a, b) => b.amount - a.amount).slice(0, 5);
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
      
      const label = period === "Yearly" ? d.getFullYear().toString() :
        period === "Quarterly" ? `Q${Math.floor(d.getMonth() / 3) + 1} ${d.getFullYear()}` :
        d.toLocaleString("en-US", { month: "short" });
        
      const expense = transactions
        .filter((t) => {
          const td = new Date(t.date);
          if (t.transactionType !== "expense") return false;
          if (period === "Yearly") return td.getFullYear() === d.getFullYear();
          if (period === "Quarterly") return Math.floor(td.getMonth() / 3) === Math.floor(d.getMonth() / 3) && td.getFullYear() === d.getFullYear();
          return td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear();
        })
        .reduce((s, t) => s + t.amount, 0);
        
      const income = transactions
        .filter((t) => {
          const td = new Date(t.date);
          if (t.transactionType !== "income") return false;
          if (period === "Yearly") return td.getFullYear() === d.getFullYear();
          if (period === "Quarterly") return Math.floor(td.getMonth() / 3) === Math.floor(d.getMonth() / 3) && td.getFullYear() === d.getFullYear();
          return td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear();
        })
        .reduce((s, t) => s + t.amount, 0);
        
      periods.push({ label, expense, income });
    }
    return periods;
  }, [transactions, period]);

  const maxBar = Math.max(...barData.map((b) => Math.max(b.expense, b.income)), 1);

  return (
    <main className="px-6 lg:px-12 py-6 min-h-screen">
      {/* Header */}
      <section className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div>
          <span className="text-[#c3c0ff] font-bold tracking-widest uppercase text-xs mb-2 block">Overview</span>
          <h1 className="text-5xl md:text-6xl font-headline font-extrabold tracking-tight text-white">Analytics</h1>
        </div>
        <div className="flex bg-surface p-1 rounded-full overflow-x-auto no-scrollbar">
          {(["Monthly","Quarterly","Yearly"] as Period[]).map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${period === p ? "bg-[#2a2a2a] text-on-surface" : "text-on-surface-variant hover:text-on-surface"}`}>
              {p}
            </button>
          ))}
        </div>
      </section>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {[8,4,5,7].map((span, i) => (
            <div key={i} className={`md:col-span-${span} h-64 bg-surface rounded-2xl animate-pulse`} />
          ))}
        </div>
      ) : (
        <>
          {/* Main bento */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
            {/* Bar chart */}
            <div className="md:col-span-8 bg-surface rounded-2xl p-8 flex flex-col gap-6 relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-on-surface-variant text-sm font-medium mb-1">Cash Flow ({period})</h3>
                  <div className="flex items-baseline gap-4 mt-2">
                    <p className="text-3xl font-headline font-bold text-white">${(periodIncome - periodSpend).toFixed(2)} <span className="text-sm font-normal text-[#918fa1]">Net</span></p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 text-xs font-bold text-right">
                  <span className="flex items-center gap-1 text-[#c3c0ff] justify-end">
                    <div className="w-2 h-2 rounded-full bg-[#c3c0ff]"></div> Income
                  </span>
                  <span className="flex items-center gap-1 text-[#ffb4ab] justify-end">
                    <div className="w-2 h-2 rounded-full bg-[#ffb4ab]"></div> Expense
                  </span>
                </div>
              </div>
              <div className="h-48 w-full flex items-end gap-2 sm:gap-4 mt-4">
                {barData.map((b, i) => (
                  <div key={i} className="flex-1 flex justify-center items-end gap-1 group relative h-full">
                    <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-surface p-2 rounded-xl text-[10px] whitespace-nowrap z-10 border border-[#464555]/20 shadow-xl pointer-events-none">
                      <p className="text-[#c3c0ff] font-bold">In: ${b.income.toFixed(0)}</p>
                      <p className="text-[#ffb4ab] font-bold">Out: ${b.expense.toFixed(0)}</p>
                    </div>
                    {/* Income bar */}
                    <div
                      className={`w-full max-w-[20px] rounded-t-sm transition-all duration-500 bg-[#c3c0ff] hover:bg-[#c3c0ff]/80`}
                      style={{ height: `${Math.max(2, (b.income / maxBar) * 100)}%` }}
                    />
                    {/* Expense bar */}
                    <div
                      className={`w-full max-w-[20px] rounded-t-sm transition-all duration-500 bg-[#ffb4ab] hover:bg-[#ffb4ab]/80`}
                      style={{ height: `${Math.max(2, (b.expense / maxBar) * 100)}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-on-surface-variant uppercase tracking-widest px-1">
                {barData.map((b) => <span key={b.label}>{b.label}</span>)}
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 blur-[100px] -z-0" />
            </div>

            {/* AI Insights */}
            <div className="md:col-span-4 bg-[#4f46e5] rounded-2xl p-8 text-[#dad7ff] flex flex-col justify-between shadow-xl shadow-indigo-900/20">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-white/20 rounded-xl"><span className="material-symbols-outlined">auto_awesome</span></div>
                  <h3 className="font-headline font-bold text-lg">AI Insights</h3>
                </div>
                <ul className="space-y-5">
                  <li className="flex gap-3">
                    <div className="w-1 bg-white/30 rounded-full flex-shrink-0" />
                    <p className="text-sm leading-relaxed">
                      {period} income: <span className="font-bold text-white">${periodIncome.toFixed(2)}</span>. Savings rate:{" "}
                      <span className="font-bold text-white">
                        {periodIncome > 0 ? `${Math.round(((periodIncome - periodSpend) / periodIncome) * 100)}%` : "N/A"}
                      </span>
                    </p>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-1 bg-white/30 rounded-full flex-shrink-0" />
                    <p className="text-sm leading-relaxed">
                      Top category: <span className="font-bold text-white capitalize">{catBreakdown[0]?.category ?? "—"}</span>{" "}
                      ({catBreakdown[0] ? `$${catBreakdown[0].amount.toFixed(2)}` : "no data"})
                    </p>
                  </li>
                </ul>
              </div>
              <button className="mt-6 flex items-center justify-center gap-2 text-sm font-bold bg-white/10 hover:bg-white/20 transition-colors py-3 rounded-2xl">
                Full Analysis <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* Secondary row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Donut */}
            <div className="md:col-span-5 bg-surface rounded-2xl p-8 flex flex-col items-center">
              <h3 className="w-full text-left text-white font-headline font-bold mb-6">Category Split</h3>
              <div className="relative w-44 h-44 mb-6">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" fill="transparent" r="15.9" stroke="#131313" strokeWidth="4" />
                  {catBreakdown.slice(0, 5).reduce<{ offset: number; els: React.ReactNode[] }>(
                    (acc, cat, i) => {
                      const dash = cat.percentage;
                      acc.els.push(
                        <circle key={cat.category} cx="18" cy="18" fill="transparent" r="15.9"
                          stroke={DONUT_COLORS[i]} strokeDasharray={`${dash} 100`}
                          strokeDashoffset={-acc.offset} strokeWidth="4" />
                      );
                      acc.offset += dash;
                      return acc;
                    },
                    { offset: 0, els: [] }
                  ).els}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-white">${periodSpend.toFixed(0)}</span>
                  <span className="text-[10px] text-on-surface-variant uppercase tracking-widest">Spent</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 w-full">
                {catBreakdown.slice(0, 4).map((cat, i) => (
                  <div key={cat.category} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: DONUT_COLORS[i] }} />
                    <span className="text-xs text-on-surface-variant capitalize truncate">{cat.category} ({cat.percentage}%)</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly variance */}
            <div className="md:col-span-7 bg-surface rounded-2xl p-8">
              <h3 className="text-white font-headline font-bold mb-6">Category Breakdown</h3>
              {catBreakdown.length === 0 ? (
                <p className="text-on-surface-variant text-sm">No expense data yet.</p>
              ) : (
                <div className="space-y-5">
                  {catBreakdown.map((cat) => (
                    <div key={cat.category} className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#2a2a2a] flex items-center justify-center">
                          <span className="material-symbols-outlined text-[#c3c0ff] text-sm">category</span>
                        </div>
                        <div>
                          <p className="text-white font-bold capitalize">{cat.category}</p>
                          <p className="text-xs text-on-surface-variant">{cat.count} transaction{cat.count !== 1 ? "s" : ""}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">${cat.amount.toFixed(2)}</p>
                        <p className="text-xs text-on-surface-variant">{cat.percentage}% of total</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Budget Health Section */}
          <section className="mt-8 bg-surface rounded-2xl p-8 border border-white/5">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-headline font-bold text-white">Budget Health</h3>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-sm text-[#918fa1]">Performance across your defined spending limits</p>
                  <span className="w-1 h-1 rounded-full bg-[#464555]" />
                  <p className="text-[10px] font-bold text-[#ffb4ab]">
                    {budgets.filter(b => (b.spent / (b.limitAmount || 1)) > 1).length} Over Budget
                  </p>
                  <span className="w-1 h-1 rounded-full bg-[#464555]" />
                  <p className="text-[10px] font-bold text-primary">
                    {budgets.filter(b => (b.spent / (b.limitAmount || 1)) <= 1).length} Healthy
                  </p>
                </div>
              </div>
              <Link href="/expenses/budgets" className="px-4 py-2 bg-[#2a2a2a] rounded-xl text-xs font-bold text-on-surface-variant hover:text-white transition-colors flex items-center gap-2">
                Manage All <span className="material-symbols-outlined text-sm">open_in_new</span>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {budgets.map(b => {
                const percent = b.limitAmount > 0 ? (b.spent / b.limitAmount) * 100 : 0;
                const isOver = percent > 100;
                return (
                  <div key={b.id} className="space-y-4 p-5 rounded-[2rem] bg-[#2a2a2a]/30 border border-white/5 hover:border-white/10 transition-all group">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                          <span className="material-symbols-outlined">{b.icon || 'account_balance_wallet'}</span>
                        </div>
                        <div>
                          <p className="font-bold text-white">{b.name}</p>
                          <p className="text-[10px] uppercase tracking-widest text-[#918fa1]">{b.period}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-black ${isOver ? 'text-[#ffb4ab]' : 'text-white'}`}>
                          ${b.spent.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-[#918fa1]">of ${b.limitAmount.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="h-2 w-full bg-background rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${isOver ? 'bg-[#ffb4ab]' : 'bg-primary'}`}
                          style={{ width: `${Math.min(percent, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className={isOver ? 'text-[#ffb4ab]' : 'text-[#918fa1]'}>
                          {isOver ? 'EXCEEDED' : `${Math.round(100 - percent)}% REMAINING`}
                        </span>
                        <span className="text-white">{Math.round(percent)}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {budgets.length === 0 && (
                <div className="col-span-full py-12 text-center bg-background/50 rounded-[2rem] border border-dashed border-white/10">
                  <p className="text-[#918fa1] italic">No active budgets found. Start by creating one in the expenses section.</p>
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </main>
  );
}

