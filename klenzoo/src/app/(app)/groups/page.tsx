"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { finance, type Group } from "@/lib/api";

const GROUP_BG = [
  "bg-primary/10",
  "bg-tertiary/10",
  "bg-primary/20",
  "bg-tertiary/20",
];

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    finance.getGroups()
      .then((data) => setGroups(data))
      .catch(() => setGroups([]))
      .finally(() => setLoading(false));
  }, []);

  const totalOwed = groups.reduce((s, g) => s + Math.max(0, -(Number(g.netBalance) ?? 0)), 0);
  const totalOwing = groups.reduce((s, g) => s + Math.max(0, Number(g.netBalance) ?? 0), 0);
  const netBalance = totalOwing - totalOwed;

  return (
    <main className="px-6 lg:px-12 py-6 min-h-screen">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-5xl md:text-6xl font-extrabold font-headline tracking-tighter text-on-surface mb-2">
            Social <span className="text-primary">Circles</span>
          </h1>
          <p className="text-on-surface-variant text-lg max-w-md">Coordinate shared expenses seamlessly.</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Link href="/groups/new" className="px-5 py-3 rounded-full bg-primary text-white font-bold text-sm shadow-md hover:shadow-lg active:scale-95 transition-transform flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">add_circle</span>
            New Group
          </Link>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Net Balance */}
        <div className="lg:col-span-4 bg-surface p-8 rounded-2xl flex flex-col justify-between">
          <div>
            <p className="text-on-surface-variant uppercase tracking-widest text-xs font-bold mb-6">Net Balance</p>
            <h3 className={`text-5xl font-black font-headline tracking-tighter ${netBalance >= 0 ? "text-primary" : "text-tertiary"}`}>
              {netBalance >= 0 ? "+" : ""}${Math.abs(netBalance).toFixed(2)}
            </h3>
            <p className="text-on-surface-variant text-sm mt-2">
              {netBalance < 0 ? "You owe more than you are owed." : "You are owed more than you owe."}
            </p>
          </div>
          <div className="mt-8 space-y-3">
            <div className="flex items-center justify-between p-4 bg-card-deep rounded-2xl">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-error">arrow_downward</span>
                <span className="text-sm font-medium">You owe</span>
              </div>
              <span className="font-bold text-error">${totalOwed.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-card-deep rounded-2xl">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">arrow_upward</span>
                <span className="text-sm font-medium">You are owed</span>
              </div>
              <span className="font-bold text-primary">${totalOwing.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Group Cards */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
          {loading ? (
            [1,2,3].map((i) => <div key={i} className="h-56 bg-surface rounded-2xl animate-pulse" />)
          ) : (
            <>
              {groups.map((group, idx) => {
                const balance = Number(group.netBalance ?? 0);
                return (
                  <Link key={group.id} href={`/groups/${group.id}`}
                    className="bg-card rounded-2xl overflow-hidden flex flex-col border border-outline/10 group hover:border-primary/30 transition-all duration-300">
                    <div className={`h-28 relative ${GROUP_BG[idx % GROUP_BG.length]}`}>
                      <div className="absolute inset-0 bg-card/10" />
                      <div className="absolute bottom-4 left-5">
                        <h3 className="text-xl font-bold font-headline">{group.name}</h3>
                        <p className="text-xs text-on-surface-variant">{group.members.length} member{group.members.length !== 1 ? "s" : ""}</p>
                      </div>
                    </div>
                    <div className="p-5 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Status</p>
                        <p className={`font-semibold text-sm ${balance < 0 ? "text-error" : balance > 0 ? "text-primary" : "text-on-surface-variant"}`}>
                          {balance === 0 ? "Settled Up" : balance > 0 ? `Owed $${balance.toFixed(2)}` : `You owe $${Math.abs(balance).toFixed(2)}`}
                        </p>
                      </div>
                      <button className="p-2.5 bg-card-high rounded-full hover:bg-primary hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                      </button>
                    </div>
                  </Link>
                );
              })}
              <Link href="/groups/new"
                className="bg-surface rounded-2xl border-2 border-dashed border-outline/20 flex items-center justify-center p-10 hover:bg-card-high hover:border-primary/50 transition-all group">
                <div className="text-center">
                  <div className="w-14 h-14 bg-card-highest rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-primary text-2xl">add</span>
                  </div>
                  <p className="font-headline font-bold text-on-surface">New Circle</p>
                  <p className="text-xs text-on-surface-variant mt-1">Split rent, bills, or dinner</p>
                </div>
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

