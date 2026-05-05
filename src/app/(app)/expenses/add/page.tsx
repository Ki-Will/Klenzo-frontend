"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { finance, type TransactionType } from "@/lib/api";

const CATEGORIES = [
  { icon: "restaurant", label: "Dining", value: "dining" },
  { icon: "shopping_cart", label: "Shopping", value: "shopping" },
  { icon: "directions_car", label: "Travel", value: "travel" },
  { icon: "bolt", label: "Utilities", value: "utilities" },
  { icon: "movie", label: "Fun", value: "fun" },
  { icon: "more_horiz", label: "Other", value: "other" },
];

const NUMPAD = ["1","2","3","4","5","6","7","8","9",".","0","⌫"];

export default function AddExpensePage() {
  const { user } = useAuth();
  const router = useRouter();

  const [amount, setAmount] = useState("0");
  const [category, setCategory] = useState("shopping");
  const [txType, setTxType] = useState<TransactionType>("expense");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function handleNumpad(key: string) {
    if (key === "⌫") {
      setAmount((p) => (p.length <= 1 ? "0" : p.slice(0, -1)));
    } else if (key === ".") {
      setAmount((p) => (p.includes(".") ? p : p + "."));
    } else {
      setAmount((p) => (p === "0" ? key : p + key));
    }
  }

  async function handleConfirm() {
    const num = parseFloat(amount);
    if (!num || num <= 0) { setError("Enter a valid amount."); return; }
    if (!user?.id) { setError("Not authenticated."); return; }
    setSubmitting(true);
    setError("");
    try {
      await finance.createTransaction({
        userId: user.id,
        amount: num,
        description: description || undefined,
        category,
        transactionType: txType,
        date: new Date(date).toISOString(),
      });
      router.push("/expenses");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save transaction");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="py-8 px-6 md:px-12 max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 items-start justify-center">
      {/* Left: Amount + Numpad */}
      <section className="w-full lg:w-1/2 flex flex-col items-center space-y-8">
        {/* Type toggle */}
        <div className="flex bg-[#1c1b1b] p-1 rounded-full w-full max-w-xs">
          {(["expense","income"] as TransactionType[]).map((t) => (
            <button
              key={t}
              onClick={() => setTxType(t)}
              className={`flex-1 py-2.5 rounded-full text-sm font-bold capitalize transition-all ${
                txType === t ? "luminous-gradient text-white shadow-lg" : "text-[#c7c4d8]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="text-center w-full">
          <p className="font-headline uppercase tracking-widest text-[10px] text-[#918fa1] mb-4">
            Enter Amount
          </p>
          <div className="flex items-center justify-center space-x-2">
            <span className={`text-4xl font-headline font-bold ${txType === "income" ? "text-[#c3c0ff]" : "text-[#4f46e5]"}`}>$</span>
            <h2 className="text-6xl md:text-8xl font-headline font-extrabold tracking-tighter text-[#e5e2e1] min-w-0 break-all">
              {amount}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
          {NUMPAD.map((key) => (
            <button
              key={key}
              onClick={() => handleNumpad(key)}
              className={`aspect-square flex items-center justify-center text-2xl font-headline font-bold hover:bg-[#2a2a2a] active:scale-95 transition-all rounded-2xl ${
                key === "⌫" ? "text-[#ffb4ab] hover:bg-[#93000a]/20" : "text-[#c7c4d8]"
              }`}
            >
              {key === "⌫" ? <span className="material-symbols-outlined text-3xl">backspace</span> : key}
            </button>
          ))}
        </div>
      </section>

      {/* Right: Details */}
      <section className="w-full lg:w-1/2 space-y-6">
        {/* Category */}
        <div className="space-y-3">
          <label className="font-headline uppercase tracking-widest text-[10px] text-[#918fa1] block">Category</label>
          <div className="grid grid-cols-3 gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all ${
                  category === cat.value
                    ? "bg-[#4f46e5]/20 border border-[#4f46e5]/40"
                    : "bg-[#1c1b1b] hover:bg-[#2a2a2a]"
                }`}
              >
                <span className={`material-symbols-outlined mb-2 ${category === cat.value ? "text-[#c3c0ff]" : "text-[#c3c0ff]/60"}`}
                  style={category === cat.value ? { fontVariationSettings: "'FILL' 1" } : {}}>
                  {cat.icon}
                </span>
                <span className={`text-xs font-medium ${category === cat.value ? "text-white font-bold" : "text-[#c7c4d8]"}`}>
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Date */}
        <div className="space-y-2">
          <label className="font-headline uppercase tracking-widest text-[10px] text-[#918fa1] block">Date</label>
          <div className="flex items-center gap-3 bg-[#1c1b1b] p-4 rounded-2xl border border-[#464555]/10">
            <span className="material-symbols-outlined text-[#918fa1]">calendar_today</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-[#e5e2e1] flex-1 text-sm"
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="font-headline uppercase tracking-widest text-[10px] text-[#918fa1] block">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-[#1c1b1b] border-none rounded-2xl p-4 text-[#e5e2e1] placeholder:text-[#918fa1]/50 focus:outline-none focus:ring-1 focus:ring-[#4f46e5] transition-all resize-none"
            placeholder="Merchant name or note..."
            rows={3}
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-[#93000a]/20 border border-[#ffb4ab]/20 rounded-2xl px-4 py-3">
            <span className="material-symbols-outlined text-[#ffb4ab] text-sm">error</span>
            <p className="text-[#ffb4ab] text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={handleConfirm}
          disabled={submitting || parseFloat(amount) <= 0}
          className="w-full h-16 bg-gradient-to-r from-[#4f46e5] to-indigo-700 rounded-full text-white font-headline font-bold text-lg shadow-[0_20px_40px_rgba(79,70,229,0.3)] hover:shadow-[0_25px_50px_rgba(79,70,229,0.5)] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined">{submitting ? "hourglass_empty" : "check_circle"}</span>
          {submitting ? "Saving…" : "Confirm Transaction"}
        </button>
      </section>
    </main>
  );
}
