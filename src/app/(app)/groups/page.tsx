"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { finance, type Group } from "@/lib/api";

const SEED_GROUPS: Group[] = [
  { id: "flatmates", name: "Flatmates", members: [], netBalance: -125, createdAt: "" },
  { id: "vacation-2024", name: "Vacation 2024", members: [], netBalance: 340.20, createdAt: "" },
  { id: "gym-squad", name: "Gym Squad", members: [], netBalance: 0, createdAt: "" },
];

const GROUP_BG = [
  "from-indigo-900/40 to-slate-900/40",
  "from-teal-900/40 to-slate-900/40",
  "from-purple-900/40 to-slate-900/40",
  "from-rose-900/40 to-slate-900/40",
];

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>(SEED_GROUPS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    finance.getGroups()
      .then((data) => { if (data.length > 0) setGroups(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalOwed = groups.reduce((s, g) => s + Math.max(0, -(g.netBalance ?? 0)), 0);
  const totalOwing = groups.reduce((s, g) => s + Math.max(0, g.netBalance ?? 0), 0);
  const netBalance = totalOwing - totalOwed;

  return (
    <main className="px-6 lg:px-12 py-6 min-h-screen">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-5xl md:text-6xl font-extrabold font-headline tracking-tighter text-[#e5e2e1] mb-2">
            Social <span className="text-[#c3c0ff]">Circles</span>
          </h1>
          <p className="text-[#c7c4d8] text-lg max-w-md">Coordinate shared expenses seamlessly.</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button className="px-5 py-3 rounded-full bg-[#2a2a2a]/60 text-[#c3c0ff] border border-[#464555]/15 font-semibold text-sm flex items-center gap-2 hover:bg-[#353534] transition-colors">
            <span className="material-symbols-outlined text-lg">payments</span>
            Settle Up
          </button>
          <Link href="/groups/new" className="px-5 py-3 rounded-full luminous-gradient text-white font-bold text-sm shadow-[0_0_20px_rgba(79,70,229,0.3)] active:scale-95 transition-transform flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">add_circle</span>
            New Group
          </Link>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Net Balance */}
        <div className="lg:col-span-4 bg-[#1c1b1b] p-8 rounded-2xl flex flex-col justify-between">
          <div>
            <p className="text-[#c7c4d8] uppercase tracking-widest text-xs font-bold mb-6">Net Balance</p>
            <h3 className={`text-5xl font-black font-headline tracking-tighter ${netBalance >= 0 ? "text-[#c3c0ff]" : "text-[#ffb695]"}`}>
              {netBalance >= 0 ? "+" : ""}${Math.abs(netBalance).toFixed(2)}
            </h3>
            <p className="text-[#c7c4d8] text-sm mt-2">
              {netBalance < 0 ? "You owe more than you are owed." : "You are owed more than you owe."}
            </p>
          </div>
          <div className="mt-8 space-y-3">
            <div className="flex items-center justify-between p-4 bg-[#0e0e0e] rounded-2xl">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#ffb4ab]">arrow_downward</span>
                <span className="text-sm font-medium">You owe</span>
              </div>
              <span className="font-bold text-[#ffb4ab]">${totalOwed.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-[#0e0e0e] rounded-2xl">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#c3c0ff]">arrow_upward</span>
                <span className="text-sm font-medium">You are owed</span>
              </div>
              <span className="font-bold text-[#c3c0ff]">${totalOwing.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Group Cards */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
          {loading ? (
            [1,2,3].map((i) => <div key={i} className="h-56 bg-[#1c1b1b] rounded-2xl animate-pulse" />)
          ) : (
            <>
              {groups.map((group, idx) => {
                const balance = group.netBalance ?? 0;
                return (
                  <Link key={group.id} href={`/groups/${group.id}`}
                    className="bg-[#201f1f] rounded-2xl overflow-hidden flex flex-col border border-[#464555]/10 group hover:border-[#c3c0ff]/30 transition-all duration-300">
                    <div className={`h-28 relative bg-gradient-to-br ${GROUP_BG[idx % GROUP_BG.length]}`}>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#201f1f] to-transparent" />
                      <div className="absolute bottom-4 left-5">
                        <h3 className="text-xl font-bold font-headline">{group.name}</h3>
                        <p className="text-xs text-[#c7c4d8]">{group.members.length} member{group.members.length !== 1 ? "s" : ""}</p>
                      </div>
                    </div>
                    <div className="p-5 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-[#c7c4d8] font-bold">Status</p>
                        <p className={`font-semibold text-sm ${balance < 0 ? "text-[#ffb4ab]" : balance > 0 ? "text-[#c3c0ff]" : "text-[#c7c4d8]"}`}>
                          {balance === 0 ? "Settled Up" : balance > 0 ? `Owed $${balance.toFixed(2)}` : `You owe $${Math.abs(balance).toFixed(2)}`}
                        </p>
                      </div>
                      <button className="p-2.5 bg-[#2a2a2a] rounded-full hover:bg-[#c3c0ff] hover:text-[#0f0069] transition-colors">
                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                      </button>
                    </div>
                  </Link>
                );
              })}
              <Link href="/groups/new"
                className="bg-[#1c1b1b] rounded-2xl border-2 border-dashed border-[#464555]/20 flex items-center justify-center p-10 hover:bg-[#2a2a2a] hover:border-[#c3c0ff]/50 transition-all group">
                <div className="text-center">
                  <div className="w-14 h-14 bg-[#353534] rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[#c3c0ff] text-2xl">add</span>
                  </div>
                  <p className="font-headline font-bold text-[#e5e2e1]">New Circle</p>
                  <p className="text-xs text-[#c7c4d8] mt-1">Split rent, bills, or dinner</p>
                </div>
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
