"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { finance, type Transaction } from "@/lib/api";

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

const SEED: Transaction[] = [
  { id: 1, userId: 0, amount: 124.50, description: "The Gilded Fork", category: "dining", transactionType: "expense", date: new Date(Date.now() - 3600000).toISOString(), createdAt: "" },
  { id: 2, userId: 0, amount: 4200.00, description: "Salary Deposit", category: "income", transactionType: "income", date: new Date(Date.now() - 86400000).toISOString(), createdAt: "" },
  { id: 3, userId: 0, amount: 89.30, description: "City Power & Light", category: "utilities", transactionType: "expense", date: new Date(Date.now() - 172800000).toISOString(), createdAt: "" },
  { id: 4, userId: 0, amount: 212.05, description: "Whole Foods Market", category: "food", transactionType: "expense", date: new Date(Date.now() - 259200000).toISOString(), createdAt: "" },
  { id: 5, userId: 0, amount: 24.99, description: "Uber Technologies", category: "travel", transactionType: "expense", date: new Date(Date.now() - 345600000).toISOString(), createdAt: "" },
];

export default function ExpensesPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>(SEED);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    finance.getTransactions(user.id)
      .then((data) => { if (data.length > 0) setTransactions(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id]);

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
        <div>
          <span className="text-[#c3c0ff] uppercase tracking-[0.3em] text-[10px] mb-2 block">Monthly Oversight</span>
          <h2 className="text-5xl lg:text-7xl font-headline font-extrabold tracking-tighter text-[#e5e2e1]">Expenses</h2>
        </div>
        <div className="bg-[#1c1b1b] p-6 rounded-2xl border-l-4 border-[#c3c0ff]">
          <p className="text-[#c7c4d8] text-xs uppercase tracking-widest mb-1">Total Outflow</p>
          <p className="text-2xl font-headline font-bold">${totalOutflow.toFixed(2)}</p>
        </div>
      </section>

      {/* Search + Filters */}
      <section className="mb-8 space-y-4">
        <div className="bg-[#1c1b1b] px-4 py-3 rounded-2xl flex items-center border border-[#464555]/10">
          <span className="material-symbols-outlined text-[#918fa1] mr-3">search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search merchants, categories..."
            className="bg-transparent border-none focus:outline-none text-sm text-[#e5e2e1] w-full placeholder:text-[#918fa1]/60"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-[#918fa1] hover:text-[#c3c0ff] transition-colors">
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
                  ? "bg-[#c3c0ff] text-[#0f0069] font-semibold shadow-[0_0_20px_rgba(195,192,255,0.2)]"
                  : "bg-[#2a2a2a] text-[#c7c4d8] hover:bg-[#3a3939]"
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
          {[1,2,3,4].map((i) => <div key={i} className="h-20 bg-[#1c1b1b] rounded-2xl animate-pulse" />)}
        </div>
      ) : grouped.length === 0 ? (
        <div className="text-center py-20 text-[#c7c4d8]">
          <span className="material-symbols-outlined text-5xl mb-4 block opacity-30">receipt_long</span>
          <p className="text-lg font-headline font-bold mb-2">No transactions found</p>
          <p className="text-sm mb-6">
            {search ? "Try a different search term." : "Start tracking your spending."}
          </p>
          <Link href="/expenses/add" className="px-8 py-3 luminous-gradient text-white rounded-full font-bold text-sm">
            Add First Expense
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([date, txs]) => (
            <div key={date}>
              <div className="flex items-center gap-4 py-3">
                <span className="text-xs font-bold text-[#464555] uppercase tracking-widest whitespace-nowrap">{date}</span>
                <div className="h-px w-full bg-[#464555]/10" />
              </div>
              <div className="space-y-2">
                {txs.map((tx) => (
                  <Link key={tx.id} href={`/expenses/${tx.id}`}
                    className="group bg-[#1c1b1b] hover:bg-[#2a2a2a] p-4 lg:p-5 rounded-2xl transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#353534] flex items-center justify-center text-[#c3c0ff] group-hover:scale-110 transition-transform flex-shrink-0">
                        <span className="material-symbols-outlined">{txIcon(tx)}</span>
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-[#e5e2e1] truncate">{tx.description ?? "Transaction"}</h4>
                        <p className="text-xs text-[#c7c4d8] uppercase tracking-wider">{tx.category ?? tx.transactionType}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <p className={`font-headline font-bold text-lg ${tx.transactionType === "income" ? "text-[#c3c0ff]" : "text-[#ffb4ab]"}`}>
                        {tx.transactionType === "income" ? "+" : "-"}${tx.amount.toFixed(2)}
                      </p>
                      <p className="text-[10px] text-[#464555] uppercase tracking-widest">{formatTime(tx.date)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add FAB on mobile */}
      <Link href="/expenses/add" className="lg:hidden fixed right-6 bottom-28 w-14 h-14 rounded-full luminous-gradient text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40">
        <span className="material-symbols-outlined text-2xl">add</span>
      </Link>
    </main>
  );
}
