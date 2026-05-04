"use client";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import { finance, type Transaction, type CategorySplit } from "@/lib/api";

type Period = "Monthly" | "Quarterly" | "Yearly";

const DONUT_COLORS = ["#4f46e5","#c3c0ff","#ffb695","#353534","#2a2a2a"];

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<Period>("Monthly");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<CategorySplit[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    Promise.all([
      finance.getTransactions(),
      finance.getAnalyticsCategories().catch(() => [] as CategorySplit[]),
    ]).then(([txs, cats]) => {
      setTransactions(txs);
      setCategories(cats);
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

  // Build category breakdown from transactions if API didn't return it
  const catBreakdown = useMemo(() => {
    if (categories.length > 0) return categories;
    const map = new Map<string, number>();
    transactions.filter((t) => t.transactionType === "expense").forEach((t) => {
      const cat = t.category ?? "other";
      map.set(cat, (map.get(cat) ?? 0) + t.amount);
    });
    const total = Array.from(map.values()).reduce((s, v) => s + v, 0) || 1;
    return Array.from(map.entries()).map(([category, amount]) => ({
      category,
      amount,
      percentage: Math.round((amount / total) * 100),
      count: transactions.filter((t) => (t.category ?? "other") === category).length,
    })).sort((a, b) => b.amount - a.amount).slice(0, 5);
  }, [categories, transactions]);

  // Monthly bar data (last 7 months)
  const barData = useMemo(() => {
    const months: { label: string; amount: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = d.toLocaleString("en-US", { month: "short" });
      const amount = transactions
        .filter((t) => {
          const td = new Date(t.date);
          return td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear() && t.transactionType === "expense";
        })
        .reduce((s, t) => s + t.amount, 0);
      months.push({ label, amount });
    }
    return months;
  }, [transactions]);

  const maxBar = Math.max(...barData.map((b) => b.amount), 1);

  return (
    <main className="px-6 lg:px-12 py-6 min-h-screen">
      {/* Header */}
      <section className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div>
          <span className="text-[#c3c0ff] font-bold tracking-widest uppercase text-xs mb-2 block">Overview</span>
          <h1 className="text-5xl md:text-6xl font-headline font-extrabold tracking-tight text-white">Analytics</h1>
        </div>
        <div className="flex bg-[#1c1b1b] p-1 rounded-full">
          {(["Monthly","Quarterly","Yearly"] as Period[]).map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${period === p ? "bg-[#2a2a2a] text-[#e5e2e1]" : "text-[#c7c4d8] hover:text-[#e5e2e1]"}`}>
              {p}
            </button>
          ))}
        </div>
      </section>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {[8,4,5,7].map((span, i) => (
            <div key={i} className={`md:col-span-${span} h-64 bg-[#1c1b1b] rounded-2xl animate-pulse`} />
          ))}
        </div>
      ) : (
        <>
          {/* Main bento */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
            {/* Bar chart */}
            <div className="md:col-span-8 bg-[#1c1b1b] rounded-2xl p-8 flex flex-col gap-6 relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-[#c7c4d8] text-sm font-medium mb-1">Total Spending</h3>
                  <p className="text-3xl font-headline font-bold text-white">${totalSpend.toFixed(2)}</p>
                </div>
                <span className="flex items-center gap-1 text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full text-xs font-bold">
                  <span className="material-symbols-outlined text-sm">trending_up</span>
                  vs last period
                </span>
              </div>
              <div className="h-48 w-full flex items-end gap-2">
                {barData.map((b, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className={`w-full rounded-t-xl transition-all duration-500 ${i === barData.length - 2 ? "luminous-gradient glow-line" : "bg-[#2a2a2a] hover:bg-[#4f46e5]/30"}`}
                      style={{ height: `${Math.max(4, (b.amount / maxBar) * 100)}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-[#c7c4d8] uppercase tracking-widest px-1">
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
                      Total income: <span className="font-bold text-white">${totalIncome.toFixed(2)}</span>. Savings rate:{" "}
                      <span className="font-bold text-white">
                        {totalIncome > 0 ? `${Math.round(((totalIncome - totalSpend) / totalIncome) * 100)}%` : "N/A"}
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
            <div className="md:col-span-5 bg-[#1c1b1b] rounded-2xl p-8 flex flex-col items-center">
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
                  <span className="text-xl font-bold text-white">${totalSpend.toFixed(0)}</span>
                  <span className="text-[10px] text-[#c7c4d8] uppercase tracking-widest">Spent</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 w-full">
                {catBreakdown.slice(0, 4).map((cat, i) => (
                  <div key={cat.category} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: DONUT_COLORS[i] }} />
                    <span className="text-xs text-[#c7c4d8] capitalize truncate">{cat.category} ({cat.percentage}%)</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly variance */}
            <div className="md:col-span-7 bg-[#1c1b1b] rounded-2xl p-8">
              <h3 className="text-white font-headline font-bold mb-6">Category Breakdown</h3>
              {catBreakdown.length === 0 ? (
                <p className="text-[#c7c4d8] text-sm">No expense data yet.</p>
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
                          <p className="text-xs text-[#c7c4d8]">{cat.count} transaction{cat.count !== 1 ? "s" : ""}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">${cat.amount.toFixed(2)}</p>
                        <p className="text-xs text-[#c7c4d8]">{cat.percentage}% of total</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </main>
  );
}
