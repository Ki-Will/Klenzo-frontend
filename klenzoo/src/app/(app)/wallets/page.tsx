"use client";
import { useState, useEffect } from "react";
import { finance } from "@/lib/api";

interface Wallet {
  id: string;
  name: string;
  currency: string;
  balance: number;
  status: string;
  accountNumber?: string;
  bankName?: string;
}

function formatCurrency(amount: number, currency = "USD") {
  const symbols: Record<string, string> = { NGN: "₦", GBP: "£", EUR: "€", USD: "$" };
  return `${symbols[currency] ?? "$"}${Number(amount).toFixed(2)}`;
}

export default function WalletsPage() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCurrency, setNewCurrency] = useState("NGN");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadWallets();
  }, []);

  async function loadWallets() {
    setLoading(true);
    try {
      const data = await finance.getAccounts();
      setWallets(data as Wallet[]);
    } catch (e: any) {
      setError(e.message || "Failed to load wallets");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 relative">
      {/* Ambient glow */}
      <div className="glow-orb glow-orb-primary glass-pulse absolute -top-20 -right-20 w-72 h-72 rounded-full blur-[100px] pointer-events-none" />

      <div className="flex items-center justify-between mb-6 relative z-10">
        <h1 className="text-2xl font-bold" style={{ color: "var(--c-text-primary)" }}>
          Wallets
        </h1>
        <button
          onClick={() => setShowCreate(true)}
          className="glass-btn-primary px-4 py-2 text-sm font-semibold flex items-center gap-2 text-white cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          New Wallet
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="animate-spin w-8 h-8 border-2 border-t-transparent rounded-full mx-auto" style={{ borderColor: "var(--color-primary)", borderTopColor: "transparent" }} />
        </div>
      ) : error ? (
        <p className="text-center py-16" style={{ color: "#ef4444" }}>{error}</p>
      ) : wallets.length === 0 ? (
        <div className="glass-panel text-center py-16 rounded-2xl">
          <span className="material-symbols-outlined text-6xl mb-4" style={{ color: "var(--c-text-muted)" }}>
            account_balance_wallet
          </span>
          <p className="text-lg font-medium mb-2" style={{ color: "var(--c-text-primary)" }}>
            No wallets yet
          </p>
          <p className="text-sm" style={{ color: "var(--c-text-muted)" }}>
            Create your first wallet to get started
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 relative z-10">
          {wallets.map((w) => (
            <div
              key={w.id}
              className="glass-card p-6 luminous-gradient text-white"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm opacity-70">{w.name}</span>
                <span
                  className="glass-badge px-2 py-0.5 text-xs font-semibold"
                  style={{
                    backgroundColor: w.status === "active" ? "rgba(34,197,94,0.3)" : "rgba(245,158,11,0.3)",
                  }}
                >
                  {w.status?.toUpperCase() ?? "ACTIVE"}
                </span>
              </div>
              <p className="text-3xl font-bold mb-1">{formatCurrency(w.balance, w.currency)}</p>
              <p className="text-sm opacity-50">{w.currency}</p>
              {w.accountNumber && (
                <p className="text-xs opacity-60 mt-3">
                  {w.bankName ?? ""} • {w.accountNumber}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Wallet Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center glass-overlay">
          <div className="glass-panel w-full max-w-md mx-4 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--c-text-primary)" }}>
              New Wallet
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--c-text-secondary)" }}>
                  Wallet Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Main Account"
                  className="glass-input w-full px-4 py-3 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--c-text-secondary)" }}>
                  Currency
                </label>
                <select
                  value={newCurrency}
                  onChange={(e) => setNewCurrency(e.target.value)}
                  className="glass-input w-full px-4 py-3 text-sm"
                >
                  <option value="NGN">NGN — Nigerian Naira</option>
                  <option value="USD">USD — US Dollar</option>
                  <option value="GBP">GBP — British Pound</option>
                  <option value="EUR">EUR — Euro</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowCreate(false)}
                  className="glass-btn-ghost flex-1 py-3 text-sm font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!newName.trim()) return;
                    setCreating(true);
                    try {
                      await finance.createAccount({ name: newName, currency: newCurrency });
                      setShowCreate(false);
                      setNewName("");
                      loadWallets();
                    } catch (e: any) {
                      setError(e.message || "Failed to create wallet");
                    } finally {
                      setCreating(false);
                    }
                  }}
                  disabled={creating || !newName.trim()}
                  className="glass-btn-primary flex-1 py-3 text-sm font-semibold text-white disabled:opacity-50 cursor-pointer"
                >
                  {creating ? "Creating…" : "Create Wallet"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
