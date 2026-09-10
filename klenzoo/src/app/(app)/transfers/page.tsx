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
      <div className="max-w-lg mx-auto px-4 py-16 text-center relative">
        <div className="glow-orb glow-orb-primary glass-pulse absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10">
          <div className="w-16 h-16 glass-badge rounded-full mx-auto mb-4 flex items-center justify-center">
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
            className="glass-btn-primary px-8 py-3 text-sm font-semibold text-white cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8 relative">
      {/* Ambient glow */}
      <div className="glow-orb glow-orb-primary glass-pulse absolute -top-20 -left-20 w-64 h-64 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10">
        <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--c-text-primary)" }}>
          Send Money
        </h1>

        <div className="glass-panel rounded-2xl p-6 space-y-5">
          {/* Bank Selection */}
          <div>
            <label className="text-xs font-semibold mb-2 block" style={{ color: "var(--c-text-secondary)" }}>
              Bank
            </label>
            <select
              value={bankCode}
              onChange={(e) => setBankCode(e.target.value)}
              className="glass-input w-full px-4 py-3 text-sm"
            >
              <option value="">Select bank</option>
              {BANKS.map((b) => (
                <option key={b.code} value={b.code}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Account Number */}
          <div>
            <label className="text-xs font-semibold mb-2 block" style={{ color: "var(--c-text-secondary)" }}>
              Account Number
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                onBlur={resolveAccount}
                placeholder="0123456789"
                maxLength={10}
                className="glass-input flex-1 px-4 py-3 text-sm"
              />
              {resolving && (
                <div className="flex items-center px-3">
                  <div className="animate-spin w-5 h-5 border-2 border-t-transparent rounded-full" style={{ borderColor: "var(--color-primary)", borderTopColor: "transparent" }} />
                </div>
              )}
            </div>
            {resolvedName && (
              <p className="text-sm mt-2 flex items-center gap-2" style={{ color: "var(--color-primary)" }}>
                <span className="material-symbols-outlined text-sm">check_circle</span>
                {resolvedName}
              </p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="text-xs font-semibold mb-2 block" style={{ color: "var(--c-text-secondary)" }}>
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold" style={{ color: "var(--c-text-muted)" }}>
                $
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="glass-input w-full pl-10 pr-4 py-4 text-lg font-bold"
              />
            </div>
          </div>

          {/* Narration */}
          <div>
            <label className="text-xs font-semibold mb-2 block" style={{ color: "var(--c-text-secondary)" }}>
              Narration (optional)
            </label>
            <input
              type="text"
              value={narration}
              onChange={(e) => setNarration(e.target.value)}
              placeholder="What's this for?"
              className="glass-input w-full px-4 py-3 text-sm"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-error-container/20 border border-error/20 rounded-2xl px-4 py-3">
              <span className="material-symbols-outlined text-error text-sm">error</span>
              <p className="text-error text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={handleSend}
            disabled={sending || !accountNumber || !bankCode || !amount}
            className="glass-btn-primary w-full py-4 text-sm font-bold text-white disabled:opacity-50 cursor-pointer"
          >
            {sending ? "Sending…" : "Send Money"}
          </button>
        </div>

        {/* Recent Transfers */}
        {transactions.length > 0 && (
          <div className="mt-8">
            <h3 className="text-sm font-bold mb-4" style={{ color: "var(--c-text-secondary)" }}>
              Recent Transfers
            </h3>
            <div className="space-y-2">
              {transactions.slice(0, 5).map((tx) => (
                <div key={tx.id} className="glass-card flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full glass-panel flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-sm">swap_horiz</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "var(--c-text-primary)" }}>
                        {tx.description || "Transfer"}
                      </p>
                      <p className="text-xs" style={{ color: "var(--c-text-muted)" }}>
                        {new Date(tx.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-bold" style={{ color: "var(--color-error)" }}>
                    -${Math.abs(Number(tx.amount)).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
