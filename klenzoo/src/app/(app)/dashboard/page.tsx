"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { finance, type Transaction } from "@/lib/api";

const CATEGORY_ICONS: Record<string, string> = {
  food: "restaurant", dining: "restaurant", restaurant: "restaurant",
  shopping: "shopping_bag", retail: "shopping_bag",
  travel: "flight_takeoff", transport: "directions_car",
  utilities: "bolt", bills: "payments",
  entertainment: "movie", fun: "movie",
  income: "payments", salary: "payments", payroll: "account_balance",
  health: "fitness_center",
};

function txIcon(tx: Transaction) {
  const cat = (tx.category ?? "").toLowerCase();
  return CATEGORY_ICONS[cat] ?? (tx.transactionType === "income" ? "payments" : "shopping_bag");
}

function formatAmount(tx: Transaction) {
  const n = Number(tx.amount);
  return tx.transactionType === "income" ? `+$${n.toFixed(2)}` : `-$${Math.abs(n).toFixed(2)}`;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return "Yesterday";
  return `${d} days ago`;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTx, setLoadingTx] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setLoadingTx(false);
      return;
    }
    setLoadingTx(true);
    finance.getTransactions()
      .then((data) => setTransactions(data))
      .catch(() => setTransactions([]))
      .finally(() => setLoadingTx(false));
  }, [user?.id]);

  const totalIncome = transactions
    .filter((t) => t.transactionType === "income")
    .reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = transactions
    .filter((t) => t.transactionType === "expense")
    .reduce((s, t) => s + Number(t.amount), 0);
  const balance = totalIncome - totalExpense;
  const recent = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  return (
    <main className="px-6 md:px-12 min-h-screen">
      {!user ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex space-x-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      ) : (
      <div className="max-w-7xl mx-auto space-y-12 py-8">
        {/* Hero */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-on-surface-variant text-sm uppercase tracking-[0.2em]">
              {user ? `Welcome back, ${user.email.split("@")[0]}` : "Total Liquidity"}
            </h2>
            <div className="flex items-baseline space-x-4 flex-wrap gap-y-2">
              <h1 className="text-5xl md:text-7xl font-headline font-extrabold tracking-tighter text-on-surface">
                ${balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h1>
              <div className="flex items-center text-[#c3c0ff] bg-[#4f46e5]/10 px-3 py-1 rounded-full text-sm font-semibold">
                <span className="material-symbols-outlined text-sm mr-1">trending_up</span>
                Net Balance
              </div>
            </div>
            <div className="flex gap-6 text-sm">
              <div>
                <span className="text-on-surface-variant">Income </span>
                <span className="text-[#c3c0ff] font-bold">${totalIncome.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-on-surface-variant">Spent </span>
                <span className="text-[#ffb4ab] font-bold">${totalExpense.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 grid grid-cols-3 gap-4">
            <button className="flex flex-col items-center justify-center space-y-2 p-5 rounded-2xl bg-[#4f46e5] text-[#dad7ff] hover:brightness-110 transition-all active:scale-95 shadow-[0_0_20px_rgba(79,70,229,0.3)]">
              <span className="material-symbols-outlined text-2xl">send</span>
              <span className="text-[10px] uppercase font-bold tracking-widest">Send</span>
            </button>
            <button className="flex flex-col items-center justify-center space-y-2 p-5 rounded-2xl bg-[#2a2a2a] hover:bg-[#3a3939] transition-all active:scale-95">
              <span className="material-symbols-outlined text-2xl">request_page</span>
              <span className="text-[10px] uppercase font-bold tracking-widest">Request</span>
            </button>
            <Link href="/expenses/add" className="flex flex-col items-center justify-center space-y-2 p-5 rounded-2xl bg-[#2a2a2a] hover:bg-[#3a3939] transition-all active:scale-95 border border-[#464555]/10">
              <span className="material-symbols-outlined text-2xl">add</span>
              <span className="text-[10px] uppercase font-bold tracking-widest">Add</span>
            </Link>
          </div>
        </section>

        {/* Chart + Insight */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 bg-surface rounded-2xl p-8 space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="font-headline font-bold text-xl">Spending Velocity</h3>
              <div className="flex space-x-2">
                <button className="px-4 py-1 text-xs rounded-full bg-[#353534] text-on-surface">Weekly</button>
                <button className="px-4 py-1 text-xs rounded-full text-on-surface-variant hover:bg-[#2a2a2a] transition-colors">Monthly</button>
              </div>
            </div>
            <div className="h-48 w-full relative pt-4 flex items-end gap-1">
              {[0.35, 0.55, 0.2, 0.8, 0.45, 0.65, 0.3].map((ratio, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-lg bg-primary-fixed-dim/30"
                    style={{ height: `${Math.max(4, ratio * 100)}%` }}
                  />
                </div>
              ))}
              <div className="absolute bottom-[-20px] left-0 w-full flex justify-between text-[10px] text-on-surface-variant">
                {["MON","TUE","WED","THU","FRI","SAT","SUN"].map((d) => <span key={d}>{d}</span>)}
              </div>
            </div>
          </div>

          <div className="bg-[#0e0e0e] border border-[#464555]/10 rounded-2xl p-8 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-[#ffb695]">
                <span className="material-symbols-outlined">lightbulb</span>
                <span className="text-xs font-bold uppercase tracking-widest">Klenzoo Insight</span>
              </div>
              <p className="text-xl font-headline font-light leading-snug">
                You&apos;ve spent <span className="text-[#ffb4ab] font-bold">${totalExpense.toFixed(2)}</span> and earned{" "}
                <span className="text-[#c3c0ff] font-bold">${totalIncome.toFixed(2)}</span> in tracked transactions.
              </p>
            </div>
            <div className="pt-6 border-t border-[#464555]/5">
              <div className="flex items-center justify-between text-sm mb-3">
                <span className="text-on-surface-variant">Savings Rate</span>
                <span className="text-white font-bold">
                  {totalIncome > 0 ? `${Math.round((balance / totalIncome) * 100)}%` : "—"}
                </span>
              </div>
              <div className="w-full bg-[#2a2a2a] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#c3c0ff] h-full transition-all"
                  style={{ width: totalIncome > 0 ? `${Math.min(100, Math.max(0, (balance / totalIncome) * 100))}%` : "0%" }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Transactions + Vault */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="flex justify-between items-end">
              <h3 className="font-headline font-bold text-2xl tracking-tight">Recent Activity</h3>
              <Link href="/expenses" className="text-[#c3c0ff] text-sm font-semibold hover:underline">View All</Link>
            </div>
            {loadingTx ? (
              <div className="space-y-3">
                {[1,2,3].map((i) => (
                  <div key={i} className="h-20 bg-surface rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {recent.map((tx) => (
                  <Link key={tx.id} href={`/expenses/${tx.id}`} className="group flex items-center justify-between p-5 rounded-2xl bg-surface hover:bg-[#2a2a2a] transition-all">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-[#353534] flex items-center justify-center text-[#c3c0ff] group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{txIcon(tx)}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-on-surface">{tx.description ?? tx.category ?? "Transaction"}</h4>
                        <p className="text-xs text-on-surface-variant">{tx.category ?? tx.transactionType} • {timeAgo(tx.date)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${tx.transactionType === "income" ? "text-[#c3c0ff]" : "text-on-surface"}`}>
                        {formatAmount(tx)}
                      </p>
                    </div>
                  </Link>
                ))}
                {recent.length === 0 && (
                  <div className="text-center py-12 text-on-surface-variant">
                    <span className="material-symbols-outlined text-4xl mb-3 block opacity-30">receipt_long</span>
                    No transactions yet.{" "}
                    <Link href="/expenses/add" className="text-[#c3c0ff] hover:underline">Add one</Link>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="lg:col-span-4 bg-surface rounded-2xl overflow-hidden relative min-h-[280px]">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-transparent" />
            <div className="relative p-8 h-full flex flex-col justify-between">
              <div>
                <h3 className="font-headline font-bold text-xl">Quick Links</h3>
                <p className="text-sm text-on-surface-variant mt-1">Navigate your ecosystem</p>
              </div>
              <div className="space-y-3 mt-6">
                {[
                  { href: "/habits", icon: "auto_awesome", label: "Habits Tracker" },
                  { href: "/productivity", icon: "task_alt", label: "Task Board" },
                  { href: "/groups", icon: "group", label: "Social Circles" },
                  { href: "/analytics", icon: "insights", label: "Analytics" },
                ].map((item) => (
                  <Link key={item.href} href={item.href} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all group">
                    <span className="material-symbols-outlined text-[#c3c0ff] text-sm">{item.icon}</span>
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className="material-symbols-outlined text-on-surface-variant text-sm ml-auto opacity-0 group-hover:opacity-100 transition-opacity">arrow_forward</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
      )}
    </main>
  );
}

