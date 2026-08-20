"use client";
import { useState, useEffect } from "react";
import { finance, type Transaction } from "@/lib/api";

const BANKS = [
  { name: "Access Bank", code: "044" },
  { name: "GTBank", code: "058" },
  { name: "Zenith Bank", code: "057" },
  { name: "UBA", code: "033" },
  { name: "First Bank", code: "011" },
  { name: "Kuda", code: "090267" },
  { name: "Opay", code: "100004" },
];

export default function TransfersPage() {
  const [accountNumber, setAccountNumber] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [amount, setAmount] = useState("");
  const [narration, setNarration] = useState("");
  const [resolvedName, setResolvedName] = useState("");
  const [resolving, setResolving] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    finance.getTransactions().then(setTransactions).catch(() => {});
  }, []);

  async function resolveAccount() {
    if (accountNumber.length < 10 || !bankCode) return;
    setResolving(true);
    setResolvedName("");
    // Placeholder — backend resolve endpoint
    setTimeout(() => {
      setResolvedName("Account Holder Name");
      setResolving(false);
    }, 1000);
  }

  async function handleSend() {
    if (!accountNumber || !bankCode || !amount || Number(amount) <= 0) {
      setError("Please fill all fields");
      return;
    }
    setSending(true);
    setError("");
    try {
      await finance.createTransaction({
        userId: 0,
        amount: Number(amount),
        description: narration || "Transfer",
        transactionType: "expense",
        date: new Date().toISOString(),
      });
      setSuccess(true);
      setAccountNumber("");
      setAmount("");
      setNarration("");
      setResolvedName("");
    } catch (e: any) {
      setError(e.message || "Transfer failed");
    } finally {
      setSending(false);
    }
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div
          className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
          style={{ backgroundColor: "rgba(34,197,94,0.12)" }}
        >
          <span className="material-symbols-outlined text-3xl" style={{ color: "#22c55e" }}>
            check
          </span>
        </div>
        <h2 className="text-xl font-bold mb-2" style={{ color: "var(--c-text-primary)" }}>
          Transfer Sent!
        </h2>
        <p className="text-sm mb-6" style={{ color: "var(--c-text-secondary)" }}>
          Your transfer is being processed.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="px-8 py-3 rounded-full text-sm font-semibold text-white"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          Done
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--c-text-primary)" }}>
        Send Money
      </h1>

      <div className="space-y-4">
        {/* Bank */}
        <div>
          <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--c-text-secondary)" }}>
            Bank
          </label>
          <select
            value={bankCode}
            onChange={(e) => { setBankCode(e.target.value); setResolvedName(""); }}
            className="w-full rounded-xl px-4 py-3 text-sm"
            style={{
              backgroundColor: "var(--c-input-bg)",
              color: "var(--c-text-primary)",
              border: "1px solid var(--c-border)",
            }}
          >
            <option value="">Select bank</option>
            {BANKS.map((b) => (
              <option key={b.code} value={b.code}>{b.name}</option>
            ))}
          </select>
        </div>

        {/* Account Number */}
        <div>
          <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--c-text-secondary)" }}>
            Account Number
          </label>
          <input
            type="text"
            value={accountNumber}
            onChange={(e) => { setAccountNumber(e.target.value); setResolvedName(""); }}
            onBlur={resolveAccount}
            maxLength={10}
            placeholder="0123456789"
            className="w-full rounded-xl px-4 py-3 text-sm"
            style={{
              backgroundColor: "var(--c-input-bg)",
              color: "var(--c-text-primary)",
              border: "1px solid var(--c-border)",
            }}
          />
          {resolving && (
            <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ backgroundColor: "var(--c-hover-overlay)" }}>
              <div className="h-full animate-pulse rounded-full" style={{ backgroundColor: "var(--color-primary)", width: "60%" }} />
            </div>
          )}
          {resolvedName && (
            <div
              className="mt-2 rounded-xl px-4 py-3 flex items-center gap-2"
              style={{ backgroundColor: "rgba(99,102,241,0.08)" }}
            >
              <span className="material-symbols-outlined text-sm" style={{ color: "var(--color-primary)" }}>
                verified_user
              </span>
              <span className="text-sm font-medium" style={{ color: "var(--color-primary)" }}>
                {resolvedName}
              </span>
            </div>
          )}
        </div>

        {/* Amount */}
        <div>
          <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--c-text-secondary)" }}>
            Amount (NGN)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            className="w-full rounded-xl px-4 py-3 text-sm"
            style={{
              backgroundColor: "var(--c-input-bg)",
              color: "var(--c-text-primary)",
              border: "1px solid var(--c-border)",
            }}
          />
        </div>

        {/* Narration */}
        <div>
          <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--c-text-secondary)" }}>
            Narration (optional)
          </label>
          <input
            type="text"
            value={narration}
            onChange={(e) => setNarration(e.target.value)}
            placeholder="Payment for..."
            className="w-full rounded-xl px-4 py-3 text-sm"
            style={{
              backgroundColor: "var(--c-input-bg)",
              color: "var(--c-text-primary)",
              border: "1px solid var(--c-border)",
            }}
          />
        </div>

        {error && (
          <div
            className="rounded-xl px-4 py-3 text-sm"
            style={{ backgroundColor: "rgba(239,68,68,0.12)", color: "#ef4444" }}
          >
            {error}
          </div>
        )}

        <button
          onClick={handleSend}
          disabled={sending}
          className="w-full py-4 rounded-full text-sm font-bold text-white disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          {sending ? (
            <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <>
              <span className="material-symbols-outlined text-sm">send</span>
              Send Money
            </>
          )}
        </button>
      </div>

      {/* Recent Transfers */}
      {transactions.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--c-text-muted)" }}>
            RECENT ACTIVITY
          </h3>
          <div className="space-y-2">
            {transactions.slice(0, 5).map((tx) => (
              <div
                key={tx.id}
                className="rounded-xl px-4 py-3 flex items-center justify-between"
                style={{ backgroundColor: "var(--c-card)", border: "1px solid var(--c-border)" }}
              >
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--c-text-primary)" }}>
                    {tx.description || "Transfer"}
                  </p>
                  <p className="text-xs" style={{ color: "var(--c-text-muted)" }}>
                    {new Date(tx.date).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className="text-sm font-semibold"
                  style={{ color: tx.transactionType === "income" ? "#22c55e" : "#ef4444" }}
                >
                  {tx.transactionType === "income" ? "+" : "-"}${Number(tx.amount).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
