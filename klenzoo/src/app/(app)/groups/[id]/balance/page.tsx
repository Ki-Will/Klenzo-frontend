"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { finance, type Group, type GroupBalance } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function GroupBalancePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = String(params.id);

  const [group, setGroup] = useState<Group | null>(null);
  const [balances, setBalances] = useState<GroupBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [settling, setSettling] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      finance.getGroup(id),
      finance.getGroupBalances(id).catch(() => [] as GroupBalance[]),
    ])
      .then(([g, b]) => { setGroup(g); setBalances(b); })
      .catch(() => router.replace("/groups"))
      .finally(() => setLoading(false));
  }, [id, router]);

  async function handleSettle(toUserId: number, amount: number) {
    if (!user?.id || !group) return;
    setSettling(true);
    try {
      await finance.settleGroup(id, user.id, toUserId, amount);
      // Refresh balances
      const updated = await finance.getGroupBalances(id).catch(() => balances);
      setBalances(updated);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to settle");
    } finally {
      setSettling(false);
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

  if (!group) return null;

  // Debts: members with negative balance owe money to members with positive balance
  const debtors = balances.filter((b) => b.balance < 0);
  const creditors = balances.filter((b) => b.balance > 0);
  const myBalance = balances.find((b) => b.userId === user?.id);
  const totalOwed = Math.abs(myBalance?.balance ?? 0);

  return (
    <main className="px-6 lg:px-12 py-6 min-h-screen">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link href={`/groups/${id}`} className="flex items-center gap-2 text-[#c7c4d8] hover:text-[#c3c0ff] transition-colors text-sm">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to {group.name}
        </Link>

        <div>
          <h1 className="text-4xl font-headline font-extrabold tracking-tighter text-[#e5e2e1]">Balance Overview</h1>
          <p className="text-[#c7c4d8] mt-2">{group.name} • Settlement Summary</p>
        </div>

        {/* My net balance */}
        {myBalance && (
          <div className="bg-[#1c1b1b] rounded-2xl p-8 text-center">
            <p className="text-[#c7c4d8] text-sm uppercase tracking-widest mb-4">
              {myBalance.balance < 0 ? "You owe in total" : myBalance.balance > 0 ? "You are owed" : "You are settled up"}
            </p>
            <p className={`text-6xl font-headline font-extrabold tracking-tighter ${myBalance.balance < 0 ? "text-[#ffb4ab]" : myBalance.balance > 0 ? "text-[#c3c0ff]" : "text-[#c7c4d8]"}`}>
              ${totalOwed.toFixed(2)}
            </p>
          </div>
        )}

        {/* All balances */}
        {balances.length > 0 && (
          <div className="bg-[#1c1b1b] rounded-2xl p-8 space-y-4">
            <h2 className="font-headline font-bold text-lg">Who Owes Whom</h2>
            {debtors.map((debtor) =>
              creditors.map((creditor) => {
                const amount = Math.min(Math.abs(debtor.balance), creditor.balance);
                if (amount <= 0) return null;
                const isMe = debtor.userId === user?.id;
                return (
                  <div key={`${debtor.userId}-${creditor.userId}`} className="flex items-center gap-4 p-4 bg-[#0e0e0e] rounded-2xl">
                    <div className="w-10 h-10 rounded-full bg-[#353534] flex items-center justify-center text-xs font-bold text-[#c7c4d8]">
                      {debtor.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-grow flex items-center gap-2 min-w-0">
                      <span className="text-sm font-medium text-[#e5e2e1] truncate">{debtor.name}</span>
                      <span className="material-symbols-outlined text-[#c7c4d8] text-sm flex-shrink-0">arrow_forward</span>
                      <span className="text-sm font-medium text-[#e5e2e1] truncate">{creditor.name}</span>
                    </div>
                    <span className="font-bold text-[#ffb4ab] flex-shrink-0">${amount.toFixed(2)}</span>
                    {isMe && (
                      <button
                        onClick={() => handleSettle(creditor.userId, amount)}
                        disabled={settling}
                        className="px-4 py-2 bg-[#4f46e5] text-white rounded-full text-xs font-bold hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 flex-shrink-0"
                      >
                        {settling ? "…" : "Settle"}
                      </button>
                    )}
                  </div>
                );
              })
            )}
            {debtors.length === 0 && (
              <div className="text-center py-6 text-[#c7c4d8]">
                <span className="material-symbols-outlined text-3xl mb-2 block text-emerald-400">check_circle</span>
                Everyone is settled up!
              </div>
            )}
          </div>
        )}

        {/* All member balances */}
        {balances.length > 0 && (
          <div className="bg-[#1c1b1b] rounded-2xl p-8 space-y-3">
            <h2 className="font-headline font-bold text-lg mb-4">Member Balances</h2>
            {balances.map((b) => (
              <div key={b.userId} className="flex items-center justify-between p-4 bg-[#0e0e0e] rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#353534] flex items-center justify-center text-xs font-bold text-[#c7c4d8]">
                    {b.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="font-medium text-sm">{b.name}{b.userId === user?.id ? " (You)" : ""}</span>
                </div>
                <span className={`font-bold text-sm ${b.balance < 0 ? "text-[#ffb4ab]" : b.balance > 0 ? "text-[#c3c0ff]" : "text-[#c7c4d8]"}`}>
                  {b.balance === 0 ? "Settled" : b.balance > 0 ? `+$${b.balance.toFixed(2)}` : `-$${Math.abs(b.balance).toFixed(2)}`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
