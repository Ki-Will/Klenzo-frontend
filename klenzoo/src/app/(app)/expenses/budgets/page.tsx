"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { finance, type Budget, type CreateBudgetDto, type Transaction } from "@/lib/api";

const PERIODS = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
  { value: "custom", label: "Custom" },
];

const COLORS = ["#c3c0ff", "#ffb4ab", "#b2eeff", "#d0bcff", "#f2b8b5", "#80deea"];
const ICONS = ["account_balance_wallet", "shopping_cart", "restaurant", "flight", "bolt", "movie", "home", "fitness_center"];

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [expandedBudgetId, setExpandedBudgetId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [limit, setLimit] = useState("");
  const [period, setPeriod] = useState("monthly");
  const [color, setColor] = useState(COLORS[0]);
  const [icon, setIcon] = useState(ICONS[0]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    loadBudgets();
  }, []);

  async function loadBudgets() {
    setLoading(true);
    try {
      const [bgs, txs] = await Promise.all([
        finance.getBudgets(),
        finance.getTransactions()
      ]);
      setBudgets(bgs);
      setTransactions(txs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!name || !limit) return;
    setSubmitting(true);
    try {
      const dto: Partial<CreateBudgetDto> = {
        name,
        category: category || undefined,
        limitAmount: parseFloat(limit),
        period,
        color,
        icon,
        startDate: period === "custom" ? startDate : undefined,
        endDate: period === "custom" ? endDate : undefined,
      };

      if (editingBudget) {
        await finance.updateBudget(editingBudget.id, dto);
      } else {
        await finance.createBudget(dto as CreateBudgetDto);
      }
      
      setShowModal(false);
      resetForm();
      await loadBudgets();
      setToast({ message: editingBudget ? "Budget updated successfully!" : "Budget created successfully!", type: "success" });
      setTimeout(() => setToast(null), 3000);
    } catch (e: any) {
      console.error(e);
      setToast({ message: e.message || "Failed to save budget", type: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this budget? Transactions will be unlinked.")) return;
    try {
      await finance.deleteBudget(id);
      await loadBudgets();
      setToast({ message: "Budget deleted successfully", type: "success" });
      setTimeout(() => setToast(null), 3000);
    } catch (e: any) {
      console.error(e);
      setToast({ message: "Failed to delete budget", type: "error" });
    }
  }

  function handleEdit(b: Budget) {
    setEditingBudget(b);
    setName(b.name);
    setCategory(b.category || "");
    setLimit(b.limitAmount.toString());
    setPeriod(b.period);
    setColor(b.color || COLORS[0]);
    setIcon(b.icon || ICONS[0]);
    setStartDate(b.startDate || "");
    setEndDate(b.endDate || "");
    setShowModal(true);
  }

  function resetForm() {
    setEditingBudget(null);
    setName("");
    setCategory("");
    setLimit("");
    setPeriod("monthly");
    setColor(COLORS[0]);
    setIcon(ICONS[0]);
    setStartDate("");
    setEndDate("");
  }

  return (
    <main className="px-6 lg:px-12 py-12 min-h-screen">
      <section className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <Link href="/expenses" className="text-[#c3c0ff] text-xs uppercase tracking-widest mb-4 flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="material-symbols-outlined text-sm">arrow_back</span> Back to Finance
          </Link>
          <h2 className="text-5xl font-black tracking-tight text-white mb-2">Manage Budgets</h2>
          <p className="text-[#918fa1] text-lg">Define limits and group your expenses.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="px-8 py-4 luminous-gradient text-white rounded-full font-bold shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
        >
          <span className="material-symbols-outlined">add</span> Create New Budget
        </button>
      </section>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-48 bg-surface rounded-3xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map(b => (
            <div key={b.id} className="bg-surface p-6 rounded-3xl border border-[#464555]/10 group hover:border-white/10 transition-all relative overflow-hidden">
              {/* Background Accent */}
              <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.03] -mr-8 -mt-8 blur-3xl rounded-full" style={{ backgroundColor: b.color }} />
              
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${b.color}20`, color: b.color }}>
                  <span className="material-symbols-outlined">{b.icon || 'category'}</span>
                </div>
                <div className="flex gap-1 items-center">
                  <Link 
                    href={`/expenses/add?budgetId=${b.id}`}
                    title="Add Transaction"
                    className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary transition-all hover:bg-primary hover:text-white"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                  </Link>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleEdit(b); }}
                    title="Edit"
                    className="w-8 h-8 rounded-full bg-[#c3c0ff]/10 flex items-center justify-center text-[#c3c0ff] transition-all hover:bg-[#c3c0ff] hover:text-[#0f0069]"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(b.id); }}
                    title="Delete"
                    className="w-8 h-8 rounded-full bg-[#ffb4ab]/10 flex items-center justify-center text-[#ffb4ab] transition-all hover:bg-[#ffb4ab] hover:text-[#0f0069]"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>

              <div className="mb-6 cursor-pointer" onClick={() => setExpandedBudgetId(expandedBudgetId === b.id ? null : b.id)}>
                <div className="flex justify-between items-end mb-2">
                  <h4 className="text-xl font-bold text-white group-hover:text-primary transition-colors">{b.name}</h4>
                  <p className="text-xs font-black text-[#918fa1] uppercase tracking-widest">{b.period}</p>
                </div>
                
                <div className="flex justify-between items-baseline mb-3">
                  <p className="text-2xl font-black text-white">${Number(b.spent).toLocaleString()}</p>
                  <p className="text-xs text-[#918fa1]">of ${Number(b.limitAmount).toLocaleString()}</p>
                </div>

                <div className="h-3 w-full bg-[#2a2a2a] rounded-full overflow-hidden p-[2px]">
                  <div 
                    className="h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(255,255,255,0.05)]" 
                    style={{ 
                      width: `${Math.min((b.spent / b.limitAmount) * 100, 100)}%`,
                      backgroundColor: (b.spent / b.limitAmount) > 0.9 ? "#ffb4ab" : b.color || '#4f46e5'
                    }} 
                  />
                </div>
                
                <div className="flex justify-between mt-3">
                  <p className={`text-[10px] font-black uppercase tracking-widest ${ (b.spent / b.limitAmount) > 1 ? 'text-[#ffb4ab]' : 'text-primary' }`}>
                    {(b.spent / b.limitAmount) > 1 ? 'Over Limit' : `${Math.round(100 - (b.spent / b.limitAmount) * 100)}% Left`}
                  </p>
                  <div className="flex items-center gap-1 text-[10px] text-[#918fa1] font-bold">
                    <span>VIEW EXPENSES</span>
                    <span className={`material-symbols-outlined text-xs transition-transform ${expandedBudgetId === b.id ? 'rotate-180' : ''}`}>expand_more</span>
                  </div>
                </div>
              </div>

              {/* Expanded Expenses List */}
              {expandedBudgetId === b.id && (
                <div className="mt-6 pt-6 border-t border-white/5 space-y-3 max-h-60 overflow-y-auto no-scrollbar animate-in slide-in-from-top-4 duration-300">
                  {transactions.filter(t => t.budgetId === b.id || (b.category && t.category === b.category && !t.budgetId)).length === 0 ? (
                    <p className="text-[10px] text-[#918fa1] italic text-center py-4 uppercase tracking-widest">No expenses found</p>
                  ) : (
                    transactions
                      .filter(t => t.budgetId === b.id || (b.category && t.category === b.category && !t.budgetId))
                      .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map(t => (
                        <div key={t.id} className="flex items-center justify-between p-3 bg-[#2a2a2a]/30 rounded-2xl hover:bg-[#2a2a2a]/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center text-[#c3c0ff]">
                              <span className="material-symbols-outlined text-sm">payments</span>
                            </div>
                            <div>
                              <p className="text-[11px] font-bold text-white truncate max-w-[120px]">{t.description || t.category}</p>
                              <p className="text-[9px] text-[#918fa1] uppercase tracking-widest">{new Date(t.date).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <p className="text-xs font-black text-white">-${Number(t.amount).toFixed(0)}</p>
                        </div>
                      ))
                  )}
                </div>
              )}
            </div>
          ))}
          {budgets.length === 0 && (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-[#464555]/20 rounded-3xl">
               <span className="material-symbols-outlined text-6xl text-[#464555] mb-4">account_balance_wallet</span>
               <p className="text-on-surface-variant font-medium">No budgets created yet.</p>
               <button onClick={() => setShowModal(true)} className="text-[#c3c0ff] text-sm mt-2 hover:underline">Start by creating one</button>
            </div>
          )}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
          <div className="bg-surface w-full max-w-xl rounded-[40px] overflow-hidden border border-white/5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8 lg:p-10">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-3xl font-black text-white">{editingBudget ? 'Edit Budget' : 'New Budget'}</h3>
                <button onClick={() => { setShowModal(false); resetForm(); }} className="w-10 h-10 rounded-full bg-[#2a2a2a] flex items-center justify-center text-on-surface-variant hover:text-white transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-[10px] uppercase tracking-widest text-[#918fa1] font-bold mb-2 block">Budget Name</label>
                    <input 
                      type="text" value={name} onChange={e => setName(e.target.value)}
                      placeholder="e.g. Summer Vacation, Daily Commute"
                      className="w-full bg-[#0e0e0e] border-none rounded-2xl p-4 text-on-surface focus:ring-2 focus:ring-[#c3c0ff] transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-[#918fa1] font-bold mb-2 block">Limit Amount ($)</label>
                    <input 
                      type="number" value={limit} onChange={e => setLimit(e.target.value)}
                      placeholder="1000"
                      className="w-full bg-[#0e0e0e] border-none rounded-2xl p-4 text-on-surface focus:ring-2 focus:ring-[#c3c0ff] transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-[#918fa1] font-bold mb-2 block">Period</label>
                    <select 
                      value={period} onChange={e => setPeriod(e.target.value)}
                      className="w-full bg-[#0e0e0e] border-none rounded-2xl p-4 text-on-surface focus:ring-2 focus:ring-[#c3c0ff] transition-all appearance-none"
                    >
                      {PERIODS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                  </div>
                </div>

                {period === "custom" && (
                  <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-[#918fa1] font-bold mb-2 block">Start Date</label>
                      <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-[#0e0e0e] border-none rounded-2xl p-4 text-on-surface" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-[#918fa1] font-bold mb-2 block">End Date</label>
                      <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-[#0e0e0e] border-none rounded-2xl p-4 text-on-surface" />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-[#918fa1] font-bold mb-2 block">Auto-match Category (Optional)</label>
                  <input 
                    type="text" value={category} onChange={e => setCategory(e.target.value)}
                    placeholder="e.g. food, travel"
                    className="w-full bg-[#0e0e0e] border-none rounded-2xl p-4 text-on-surface focus:ring-2 focus:ring-[#c3c0ff] transition-all"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-[#918fa1] font-bold mb-2 block">Style & Icon</label>
                  <div className="flex gap-4 items-center">
                    <div className="flex flex-wrap gap-2 flex-1">
                      {COLORS.map(c => (
                        <button key={c} onClick={() => setColor(c)} className={`w-8 h-8 rounded-full transition-all ${color === c ? "scale-125 ring-2 ring-white ring-offset-2 ring-offset-[#1c1b1b]" : "opacity-40 hover:opacity-100"}`} style={{ backgroundColor: c }} />
                      ))}
                    </div>
                    <div className="h-12 w-px bg-[#464555]/20" />
                    <div className="flex flex-wrap gap-2 flex-1">
                      {ICONS.map(i => (
                        <button key={i} onClick={() => setIcon(i)} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${icon === i ? "bg-white text-[#0f0069]" : "bg-[#2a2a2a] text-on-surface-variant hover:text-white"}`}>
                          <span className="material-symbols-outlined text-[18px]">{i}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleSave}
                  disabled={submitting || !name || !limit}
                  className="w-full py-5 luminous-gradient text-white rounded-full font-bold text-lg shadow-xl hover:shadow-2xl active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {submitting ? "Saving…" : editingBudget ? "Update Budget" : "Confirm Budget"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] px-8 py-4 rounded-3xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 flex items-center gap-3 ${toast.type === "success" ? "bg-[#c3c0ff] text-[#0f0069]" : "bg-[#ffb4ab] text-[#0f0069]"}`}>
          <span className="material-symbols-outlined">{toast.type === "success" ? "check_circle" : "error"}</span>
          <span className="font-bold">{toast.message}</span>
        </div>
      )}
    </main>
  );
}

