"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { finance, type Group, type Transaction } from "@/lib/api";

const CATEGORY_ICONS: Record<string, string> = {
  food: "restaurant", dining: "restaurant",
  shopping: "shopping_bag", retail: "shopping_bag",
  travel: "flight_takeoff", transport: "directions_car",
  utilities: "bolt", bills: "payments",
  entertainment: "movie", fun: "movie",
  income: "payments", salary: "payments",
  health: "fitness_center",
};

function txIcon(category?: string, type?: string) {
  const cat = (category ?? "").toLowerCase();
  return CATEGORY_ICONS[cat] ?? (type === "income" ? "payments" : "shopping_bag");
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? "Yesterday" : `${d}d ago`;
}

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id);

  const [group, setGroup] = useState<Group | null>(null);
  const [expenses, setExpenses] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingExpenses, setLoadingExpenses] = useState(true);

  const [showAddMember, setShowAddMember] = useState(false);
  const [memberEmail, setMemberEmail] = useState("");
  const [addingMember, setAddingMember] = useState(false);
  const [memberError, setMemberError] = useState("");
  const [memberSuccess, setMemberSuccess] = useState("");
  const [approvingId, setApprovingId] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    finance.getGroup(id)
      .then(setGroup)
      .catch(() => router.replace("/groups"))
      .finally(() => setLoading(false));
  }, [id, router]);

  // Filter group expenses client-side — backend doesn't have
  // GET /finance/groups/:id/transactions yet (see BACKEND_FIXES.md #11)
  useEffect(() => {
    if (!id) return;
    setLoadingExpenses(true);
    finance.getGroupTransactions(id) // Use the new specialized endpoint
      .then((txs) => {
        setExpenses(txs);
      })
      .catch(() => setExpenses([]))
      .finally(() => setLoadingExpenses(false));
  }, [id]);

  async function handleApprove(txId: number) {
    setApprovingId(txId);
    try {
      // Calls the real backend now
      const updatedTx = await finance.approveTransaction(txId);

      // Update local state with the returned data from server
      setExpenses((prev) =>
        prev.map((t) => t.id === txId ? updatedTx : t)
      );

      // Refresh group details to update the netBalance
      const updatedGroup = await finance.getGroup(id);
      setGroup(updatedGroup);
    } catch (err) {
      console.error("Failed to approve transaction", err);
    } finally {
      setApprovingId(null);
    }
  }
  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault();
    if (!memberEmail.trim()) return;
    setAddingMember(true);
    setMemberError("");
    setMemberSuccess("");
    try {
      const updated = await finance.addMember(id, memberEmail.trim());
      setGroup(updated);
      setMemberEmail("");
      setMemberSuccess(`${memberEmail.trim()} added to the group.`);
      setTimeout(() => setMemberSuccess(""), 3000);
    } catch (err: unknown) {
      setMemberError(err instanceof Error ? err.message : "Failed to add member");
    } finally {
      setAddingMember(false);
    }
  }

  function openAddMember() {
    setShowAddMember(true);
    setMemberError("");
    setMemberSuccess("");
  }


  if (loading) {
    return (
      <main className="px-6 lg:px-12 py-6 min-h-screen flex items-center justify-center">
        <div className="flex space-x-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </main>
    );
  }

  if (!group) return null;

  const balance = Number(group.netBalance ?? 0);

  // Separate approved expenses (full group transactions) from pending splits
  // that belong to the current user and need their approval
  const approvedExpenses = expenses.filter(
    (t) => !t.status || t.status === "approved"
  );
  const pendingForMe = expenses.filter(
    (t) => t.status === "pending"
  );

  const totalGroupSpend = approvedExpenses
    .filter((t) => t.transactionType === "expense")
    .reduce((s, t) => s + t.amount, 0);

  return (
    <main className="px-6 lg:px-12 py-6 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Back */}
        <Link href="/groups" className="flex items-center gap-2 text-[#c7c4d8] hover:text-[#c3c0ff] transition-colors text-sm">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Groups
        </Link>

        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900/40 rounded-2xl p-8">
          <h1 className="text-4xl font-headline font-extrabold tracking-tighter mb-2">{group.name}</h1>
          <p className="text-[#c7c4d8]">
            {group.members.length} member{group.members.length !== 1 ? "s" : ""} •{" "}
            Created {new Date(group.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>
          <div className="flex gap-4 mt-6 flex-wrap">
            <Link href={`/expenses/add?groupId=${id}`}
              className="px-6 py-3 rounded-full luminous-gradient text-white font-bold text-sm flex items-center gap-2 active:scale-95 transition-transform">
              <span className="material-symbols-outlined text-sm">add</span>
              Add Expense
            </Link>
            <Link href={`/groups/${id}/balance`}
              className="px-6 py-3 rounded-full bg-[#2a2a2a] text-[#c3c0ff] font-bold text-sm flex items-center gap-2 hover:bg-[#3a3939] transition-colors">
              <span className="material-symbols-outlined text-sm">payments</span>
              Settle Up
            </Link>
            <button
              onClick={() => { setShowAddMember((v) => !v); setMemberError(""); setMemberSuccess(""); }}
              className="px-6 py-3 rounded-full bg-[#2a2a2a] text-[#c7c4d8] font-bold text-sm flex items-center gap-2 hover:bg-[#3a3939] transition-colors"
            >
              <span className="material-symbols-outlined text-sm">person_add</span>
              Add Member
            </button>
          </div>
        </div>

        {/* Add Member Panel */}
        {showAddMember && (
          <div className="bg-[#1c1b1b] rounded-2xl p-6 border border-[#c3c0ff]/10">
            <h3 className="font-headline font-bold text-base mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#c3c0ff] text-sm">person_add</span>
              Invite a Member
            </h3>
            <form onSubmit={handleAddMember} className="flex gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[220px]">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#918fa1] text-sm">alternate_email</span>
                <input
                  type="email"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  placeholder="member@email.com"
                  required
                  className="w-full bg-[#0e0e0e] border-none rounded-2xl py-3 pl-11 pr-4 text-[#e5e2e1] placeholder:text-[#918fa1]/50 focus:outline-none focus:ring-1 focus:ring-[#c3c0ff] transition-all text-sm"
                />
              </div>
              <button type="submit" disabled={addingMember || !memberEmail.trim()}
                className="px-6 py-3 luminous-gradient text-white font-bold text-sm rounded-full active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap">
                {addingMember ? "Adding…" : "Add to Group"}
              </button>
            </form>
            {memberError && (
              <div className="flex items-center gap-2 mt-3 bg-[#93000a]/20 border border-[#ffb4ab]/20 rounded-2xl px-4 py-2">
                <span className="material-symbols-outlined text-[#ffb4ab] text-sm">error</span>
                <p className="text-[#ffb4ab] text-sm">{memberError}</p>
              </div>
            )}
            {memberSuccess && (
              <div className="flex items-center gap-2 mt-3 bg-emerald-900/20 border border-emerald-400/20 rounded-2xl px-4 py-2">
                <span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>
                <p className="text-emerald-400 text-sm">{memberSuccess}</p>
              </div>
            )}
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#1c1b1b] rounded-2xl p-5">
            <p className="text-xs text-[#c7c4d8] uppercase tracking-widest mb-1">Your Balance</p>
            <p className={`text-2xl font-headline font-bold ${balance < 0 ? "text-[#ffb4ab]" : balance > 0 ? "text-[#c3c0ff]" : "text-[#c7c4d8]"}`}>
              {balance === 0 ? "Settled" : balance > 0 ? `+$${balance.toFixed(2)}` : `-$${Math.abs(balance).toFixed(2)}`}
            </p>
            <p className="text-xs text-[#918fa1] mt-1">
              {balance < 0 ? "you owe" : balance > 0 ? "owed to you" : "all clear"}
            </p>
          </div>
          <div className="bg-[#1c1b1b] rounded-2xl p-5">
            <p className="text-xs text-[#c7c4d8] uppercase tracking-widest mb-1">Group Spend</p>
            <p className="text-2xl font-headline font-bold text-[#e5e2e1]">${totalGroupSpend.toFixed(2)}</p>
            <p className="text-xs text-[#918fa1] mt-1">{approvedExpenses.length} transaction{approvedExpenses.length !== 1 ? "s" : ""}
              {pendingForMe.length > 0 && (
                <span className="ml-2 text-[#ffb695] font-bold">{pendingForMe.length} pending</span>
              )}
            </p>
          </div>
        </div>

        {/* Members */}
        <div className="bg-[#1c1b1b] rounded-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-headline font-bold text-lg">Members</h2>
            <button onClick={openAddMember}
              className="flex items-center gap-1 text-[#c3c0ff] text-xs font-bold hover:underline">
              <span className="material-symbols-outlined text-sm">add</span>
              Add
            </button>
          </div>
          {group.members.length === 0 ? (
            <p className="text-[#c7c4d8] text-sm text-center py-4">No members yet.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {group.members.map((m) => (
                <div key={m.id} className="flex flex-col items-center p-4 bg-[#0e0e0e] rounded-2xl">
                  <div className="w-12 h-12 rounded-full bg-[#353534] flex items-center justify-center text-sm font-bold text-[#c7c4d8] mb-3">
                    {(m.name || m.email).slice(0, 2).toUpperCase()}
                  </div>
                  <p className="text-sm font-semibold text-[#e5e2e1] text-center truncate w-full">
                    {m.name || m.email.split("@")[0]}
                  </p>
                  <p className="text-xs text-[#c7c4d8] truncate w-full text-center">{m.email}</p>
                </div>
              ))}
              <button onClick={openAddMember}
                className="flex flex-col items-center p-4 bg-[#0e0e0e] rounded-2xl border-2 border-dashed border-[#464555]/30 hover:border-[#c3c0ff]/40 hover:bg-[#1c1b1b] transition-all group">
                <div className="w-12 h-12 rounded-full bg-[#2a2a2a] flex items-center justify-center mb-3 group-hover:bg-[#353534] transition-colors">
                  <span className="material-symbols-outlined text-[#c3c0ff] text-xl">person_add</span>
                </div>
                <p className="text-xs font-semibold text-[#c7c4d8]">Invite</p>
              </button>
            </div>
          )}
        </div>

        {/* Pending Approvals — shown when the current user has splits to approve */}
        {pendingForMe.length > 0 && (
          <div className="bg-[#2a1a00] rounded-2xl p-6 border border-[#ffb695]/20">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-[#ffb695]">pending_actions</span>
              <h2 className="font-headline font-bold text-base text-[#ffb695]">
                Pending Approval ({pendingForMe.length})
              </h2>
            </div>
            <p className="text-xs text-[#c7c4d8] mb-4 leading-relaxed">
              These expenses were added to the group and split to you. Approve them to include them in your personal expenses and balance.
            </p>
            <div className="space-y-3">
              {pendingForMe.map((tx) => (
                <div key={tx.id}
                  className="flex items-center gap-4 p-4 bg-[#1c1b1b] rounded-2xl border border-[#ffb695]/10">
                  <div className="w-10 h-10 rounded-full bg-[#353534] flex items-center justify-center text-[#ffb695] flex-shrink-0">
                    <span className="material-symbols-outlined text-sm"
                      style={{ fontVariationSettings: "'FILL' 1" }}>
                      {txIcon(tx.category, tx.transactionType)}
                    </span>
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="font-semibold text-[#e5e2e1] text-sm truncate">
                      {tx.description || tx.category || "Group Expense"}
                    </p>
                    <p className="text-xs text-[#c7c4d8]">
                      Your share • {timeAgo(tx.date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <p className="font-bold text-sm text-[#ffb695]">
                      -${tx.amount.toFixed(2)}
                    </p>
                    <button
                      onClick={() => handleApprove(tx.id)}
                      disabled={approvingId === tx.id}
                      className="px-4 py-2 bg-[#4f46e5] text-white rounded-full text-xs font-bold hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 whitespace-nowrap"
                    >
                      {approvingId === tx.id ? "…" : "Approve"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shared Expenses */}
        <div className="bg-[#1c1b1b] rounded-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-headline font-bold text-lg">Shared Expenses</h2>
              {approvedExpenses.length > 0 && (
                <p className="text-xs text-[#918fa1] mt-0.5">
                  ${totalGroupSpend.toFixed(2)} total · {approvedExpenses.length} transaction{approvedExpenses.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>
            <Link href={`/expenses/add?groupId=${id}`}
              className="flex items-center gap-1 text-[#c3c0ff] text-xs font-bold hover:underline">
              <span className="material-symbols-outlined text-sm">add</span>
              Add
            </Link>
          </div>

          {loadingExpenses ? (
            <div className="space-y-3">
              {[1, 2].map((i) => <div key={i} className="h-16 bg-[#0e0e0e] rounded-2xl animate-pulse" />)}
            </div>
          ) : approvedExpenses.length === 0 ? (
            <div className="text-center py-8 text-[#c7c4d8]">
              <span className="material-symbols-outlined text-4xl mb-3 block opacity-30">receipt_long</span>
              <p className="text-sm">No shared expenses yet.</p>
              <Link href={`/expenses/add?groupId=${id}`}
                className="text-[#c3c0ff] text-sm font-semibold hover:underline mt-2 inline-block">
                Add the first one
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {[...approvedExpenses]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((tx) => (
                  <Link key={tx.id} href={`/expenses/${tx.id}`}
                    className="flex items-center gap-4 p-4 bg-[#0e0e0e] rounded-2xl hover:bg-[#2a2a2a] transition-all group">
                    <div className="w-11 h-11 rounded-full bg-[#353534] flex items-center justify-center text-[#c3c0ff] flex-shrink-0 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-sm"
                        style={{ fontVariationSettings: "'FILL' 1" }}>
                        {txIcon(tx.category, tx.transactionType)}
                      </span>
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-[#e5e2e1] text-sm truncate">
                          {tx.description || tx.category || "Expense"}
                        </p>
                        {/* Split badge — shown on parent group transactions */}
                        {!tx.parentTransactionId && tx.groupId && (
                          <span className="flex-shrink-0 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#4f46e5]/20 text-[#c3c0ff]">
                            split
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#c7c4d8]">
                        {tx.category || tx.transactionType} • {timeAgo(tx.date)}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`font-bold text-sm ${tx.transactionType === "income" ? "text-[#c3c0ff]" : "text-[#ffb4ab]"}`}>
                        {tx.transactionType === "income" ? "+" : "-"}${tx.amount.toFixed(2)}
                      </p>
                    </div>
                  </Link>
                ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
