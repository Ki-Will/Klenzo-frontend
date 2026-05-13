"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
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

function txIcon(category?: string, type?: string) {
  const cat = (category ?? "").toLowerCase();
  return CATEGORY_ICONS[cat] ?? (type === "income" ? "payments" : "shopping_bag");
}

export default function ExpenseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id || isNaN(id)) {
      router.replace("/expenses");
      return;
    }

    setLoading(true);
    // Fetch all transactions and find the one with matching ID
    finance.getTransactions()
      .then((txs) => {
        const found = txs.find((t) => t.id === id);
        if (!found) {
          router.replace("/expenses");
        } else {
          setTransaction(found);
        }
      })
      .catch(() => router.replace("/expenses"))
      .finally(() => setLoading(false));
  }, [id, router]);

  async function handleDelete() {
    if (!transaction || !confirm("Delete this transaction? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await finance.deleteTransaction(transaction.id);
      router.push("/expenses");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete");
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <main className="px-6 lg:px-12 py-6 min-h-screen flex items-center justify-center">
        <div className="flex space-x-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </main>
    );
  }

  if (!transaction) return null;

  const isIncome = transaction.transactionType === "income";
  const amount = Math.abs(transaction.amount);

  return (
    <main className="px-6 lg:px-12 py-6 min-h-screen">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Back */}
        <Link href="/expenses" className="flex items-center gap-2 text-[#c7c4d8] hover:text-[#c3c0ff] transition-colors text-sm">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Expenses
        </Link>

        {/* Hero */}
        <div className="bg-[#1c1b1b] rounded-2xl p-8 flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-[#353534] flex items-center justify-center text-[#c3c0ff]">
            <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              {txIcon(transaction.category, transaction.transactionType)}
            </span>
          </div>
          <div>
            <h1 className="text-3xl font-headline font-bold text-[#e5e2e1]">
              {transaction.description || transaction.category || "Transaction"}
            </h1>
            <p className="text-[#c7c4d8] text-sm uppercase tracking-wider mt-1">
              {transaction.category || transaction.transactionType}
            </p>
          </div>
          <div className={`text-5xl font-headline font-extrabold tracking-tighter ${isIncome ? "text-[#c3c0ff]" : "text-[#ffb4ab]"}`}>
            {isIncome ? "+" : "-"}${amount.toFixed(2)}
          </div>
          <span className="px-4 py-1 bg-[#2a2a2a] rounded-full text-xs font-bold uppercase tracking-widest text-[#c7c4d8]">
            {isIncome ? "Income" : "Expense"}
          </span>
        </div>

        {/* Details */}
        <div className="bg-[#1c1b1b] rounded-2xl p-8 space-y-6">
          <h2 className="font-headline font-bold text-lg">Transaction Details</h2>
          {[
            { label: "Date", value: new Date(transaction.date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" }) },
            { label: "Time", value: new Date(transaction.date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) },
            { label: "Category", value: transaction.category || "—" },
            { label: "Type", value: transaction.transactionType },
            { label: "Transaction ID", value: `#${transaction.id}` },
            { label: "Created", value: new Date(transaction.createdAt).toLocaleDateString() },
          ].map((item) => (
            <div key={item.label} className="flex justify-between items-center">
              <span className="text-[#c7c4d8] text-sm">{item.label}</span>
              <span className="text-[#e5e2e1] font-medium text-sm capitalize">{item.value}</span>
            </div>
          ))}
        </div>

        {/* AI Insight */}
        <div className="bg-[#0e0e0e] border border-[#464555]/10 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-4 text-[#ffb695]">
            <span className="material-symbols-outlined">auto_awesome</span>
            <span className="text-xs font-bold uppercase tracking-widest">AI Insight</span>
          </div>
          <p className="text-[#c7c4d8] leading-relaxed">
            This {transaction.transactionType} of <span className="text-[#c3c0ff] font-bold">${amount.toFixed(2)}</span> was recorded on{" "}
            {new Date(transaction.date).toLocaleDateString("en-US", { month: "long", day: "numeric" })}.
            {transaction.category && ` Category: ${transaction.category}.`}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Link href={`/expenses/add`} className="flex-1 py-4 bg-[#2a2a2a] hover:bg-[#3a3939] rounded-full font-bold text-sm transition-all flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-sm">edit</span>
            Edit
          </Link>
          <button onClick={handleDelete} disabled={deleting}
            className="flex-1 py-4 bg-[#93000a]/20 hover:bg-[#93000a]/30 text-[#ffb4ab] rounded-full font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50">
            <span className="material-symbols-outlined text-sm">delete</span>
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </main>
  );
}
