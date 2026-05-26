"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { finance, type Transaction, type Budget } from "@/lib/api";
import FinanceInsights from "@/components/FinanceInsights";

const CATEGORIES = ["All", "Food", "Travel", "Bills", "Shopping", "Other"];
const CAT_ICONS: Record<string, string> = {
  All: "apps", Food: "restaurant", Travel: "flight",
  Bills: "payments", Shopping: "shopping_bag", Other: "more_horiz",
};
const CATEGORY_ICONS: Record<string, string> = {
  food: "restaurant", dining: "restaurant",
  shopping: "shopping_bag", retail: "shopping_bag",
  travel: "flight_takeoff", transport: "directions_car",
  utilities: "bolt", bills: "payments",
  entertainment: "movie", fun: "movie",
  income: "payments", salary: "payments", payroll: "account_balance",
};

function txIcon(tx: Transaction) {
  const cat = (tx.category ?? "").toLowerCase();
  return CATEGORY_ICONS[cat] ?? (tx.transactionType === "income" ? "payments" : "shopping_bag");
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export default function ExpensesPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const loadData = useCallback(() => {
    if (!user?.id) return;
    setLoading(true);
    Promise.all([
      finance.getTransactions(),
      finance.getBudgets(),
    ]).then(([txs, bgs]) => {
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
      const matchSearch = !search ||
        (tx.description ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (tx.category ?? "").toLowerCase().includes(search.toLowerCase());
      const matchCat = activeCategory === "All" ||
        (tx.category ?? "").toLowerCase().includes(activeCategory.toLowerCase());
      return matchSearch && matchCat;
    });
  }, [transactions, search, activeCategory]);

  // Group by date
  const grouped = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
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


  return (
    <main className="px-6 lg:px-12 py-6 min-h-screen">
      {/* Hero */}
      <section className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-primary uppercase tracking-[0.3em] text-[10px] mb-2 block">Monthly Oversight</span>
            <h2 className="text-5xl lg:text-7xl font-black tracking-[-0.04em] leading-none text-primary-text flex items-center gap-6">
              <span className="drop-shadow-[0_0_25px_rgba(255,255,255,0.08)]">
                Activity
              </span>
              <span className="h-3 w-3 rounded-full bg-primary shadow-[0_0_18px_rgba(139,127,255,0.9)]"></span>
            </h2>
          </div>
          <div className="bg-surface p-6 rounded-2xl border-l-4 border-primary">
            <p className="text-on-surface-variant text-xs uppercase tracking-widest mb-1">Total Outflow</p>
            <p className="text-2xl font-headline font-bold">${totalOutflow.toFixed(2)}</p>
          </div>
        </div>
      </section>

      {/* Budget Summary Table */}
      <FinanceInsights transactions={transactions} budgets={budgets} onRefresh={loadData} />

      {/* Search + Filters */}
      <section className="mb-8 space-y-4">
        <div className="bg-surface px-4 py-3 rounded-2xl flex items-center border border-outline/10">
          <span className="material-symbols-outlined text-muted mr-3">search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search merchants, categories..."
            className="bg-transparent border-none focus:outline-none text-sm text-on-surface w-full placeholder:text-muted/60"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-muted hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm whitespace-nowrap transition-all flex-shrink-0 ${activeCategory === cat
                ? "bg-primary text-on-primary font-semibold shadow-[0_0_20px_rgba(90,77,255,0.2)]"
                : "bg-card-high text-on-surface-variant hover:bg-card-highest"
                }`}
            >
              <span className="material-symbols-outlined text-sm">{CAT_ICONS[cat]}</span>
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-20 bg-surface rounded-2xl animate-pulse" />)}
        </div>
      ) : grouped.length === 0 ? (
        <div className="text-center py-20 text-on-surface-variant">
          <span className="material-symbols-outlined text-5xl mb-4 block opacity-30">receipt_long</span>
          <p className="text-lg font-headline font-bold mb-2">No transactions found</p>
          <p className="text-sm mb-6">
            {search ? "Try a different search term." : "Start tracking your spending."}
          </p>
          <Link href="/expenses/add" className="px-8 py-3 bg-primary text-white rounded-full font-bold text-sm shadow-md hover:shadow-lg">
            Add First Expense
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([date, txs]) => (
            <div key={date}>
              <div className="flex items-center gap-4 py-3">
                <span className="text-xs font-bold text-secondary-text uppercase tracking-widest whitespace-nowrap">{date}</span>
                <div className="h-px w-full bg-outline/10" />
              </div>
              <div className="space-y-2">
                {txs.map((tx) => (
                  <Link key={tx.id} href={`/expenses/${tx.id}`}
                    className="group bg-surface hover:bg-card-high p-4 lg:p-5 rounded-2xl transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-card-highest flex items-center justify-center text-primary group-hover:scale-110 transition-transform flex-shrink-0">
                        <span className="material-symbols-outlined">{txIcon(tx)}</span>
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-on-surface truncate">{tx.description ?? "Transaction"}</h4>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-on-surface-variant uppercase tracking-wider">{tx.category ?? tx.transactionType}</p>
                          {tx.budgetId && budgets.find(b => b.id === tx.budgetId) && (
                            <>
                              <span className="w-1 h-1 rounded-full bg-card-highest" />
                              <div className="flex items-center gap-1 bg-primary/10 px-1.5 py-0.5 rounded text-[9px] font-bold text-primary border border-primary/20">
                                <span className="material-symbols-outlined text-[10px]">account_balance_wallet</span>
                                {budgets.find(b => b.id === tx.budgetId)?.name}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <p className={`font-headline font-bold text-lg ${tx.transactionType === "income" ? "text-primary" : "text-error"}`}>
                        {tx.transactionType === "income" ? "+" : "-"}${tx.amount.toFixed(2)}
                      </p>
                      <p className="text-[10px] text-secondary-text uppercase tracking-widest">{formatTime(tx.date)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add FAB on mobile */}
      <Link href="/expenses/add" className="lg:hidden fixed right-6 bottom-28 w-14 h-14 rounded-full bg-primary text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40">
        <span className="material-symbols-outlined text-2xl">add</span>
      </Link>
    </main>
  );
}

