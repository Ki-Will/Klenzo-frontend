"use client";
import { useAuth } from "@/lib/auth-context";
import { finance, type Transaction } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Stat } from "@/components/ui/Stat";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, type CurrencyCode } from "@/lib/currency";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

/* ── Helpers ────────────────────────────────────────────────── */

const CATEGORY_ICONS: Record<string, string> = {
  food: "restaurant", dining: "restaurant",
  shopping: "shopping_bag", retail: "shopping_bag",
  travel: "flight_takeoff", transport: "directions_car",
  utilities: "bolt", bills: "payments",
  entertainment: "movie", fun: "movie",
  income: "payments", salary: "payments",
  health: "fitness_center",
};

function txIcon(tx: Transaction) {
  const cat = (tx.category ?? "").toLowerCase();
  return CATEGORY_ICONS[cat] ?? (tx.transactionType === "income" ? "payments" : "shopping_bag");
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return "Yesterday";
  return `${d}d ago`;
}

/* ── Spending chart data ────────────────────────────────────── */

function buildWeeklyChart(transactions: Transaction[]) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7)); // Monday
  startOfWeek.setHours(0, 0, 0, 0);

  const buckets = days.map((day) => ({ day, expense: 0, income: 0 }));

  transactions.forEach((tx) => {
    const d = new Date(tx.date);
    if (d >= startOfWeek) {
      const dayIdx = (d.getDay() + 6) % 7; // Mon=0
      if (tx.transactionType === "expense") {
        buckets[dayIdx].expense += Math.abs(tx.amount);
      } else {
        buckets[dayIdx].income += tx.amount;
      }
    }
  });

  return buckets;
}

/* ── Custom tooltip ─────────────────────────────────────────── */

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-xl px-4 py-3 shadow-lg">
      <p className="text-xs font-semibold text-on-surface-variant mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="text-sm" style={{ color: p.color }}>
          {p.dataKey === "expense" ? "Spent" : "Earned"}: {formatCurrency(p.value, "RWF")}
        </p>
      ))}
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────── */

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ["transactions"],
    queryFn: () => finance.getTransactions(),
    enabled: !!user?.id,
  });

  const totalIncome = transactions
    .filter((t) => t.transactionType === "income")
    .reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = transactions
    .filter((t) => t.transactionType === "expense")
    .reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
  const balance = totalIncome - totalExpense;

  const recent = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const chartData = buildWeeklyChart(transactions);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex space-x-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <main className="px-4 md:px-8 lg:px-12 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8 py-8">
        {/* ── Hero: Balance + Stats ── */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-sm font-medium uppercase tracking-[0.15em] text-on-surface-variant">
              Welcome back, {user.email.split("@")[0]}
            </h2>
            <div className="flex items-baseline gap-4 flex-wrap">
              <h1
                className="text-4xl md:text-6xl font-headline font-extrabold tracking-tight text-on-surface"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {formatCurrency(balance, "RWF")}
              </h1>
              <Badge variant="primary" icon="account_balance">Net Balance</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Stat
              label="Income"
              value={formatCurrency(totalIncome, "RWF")}
              icon="trending_up"
              compact
            />
            <Stat
              label="Expenses"
              value={formatCurrency(totalExpense, "RWF")}
              icon="trending_down"
              compact
            />
            <Stat
              label="Savings Rate"
              value={totalIncome > 0 ? `${Math.round((balance / totalIncome) * 100)}%` : "—"}
              icon="savings"
              compact
            />
          </div>
        </section>

        {/* ── Quick Actions ── */}
        <section className="grid grid-cols-3 gap-3">
          <button className="glass-btn-primary flex flex-col items-center justify-center gap-2 py-5 text-white cursor-pointer">
            <span className="material-symbols-outlined text-xl">send</span>
            <span className="text-[10px] uppercase font-bold tracking-widest">Send</span>
          </button>
          <button className="glass-card flex flex-col items-center justify-center gap-2 py-5 cursor-pointer">
            <span className="material-symbols-outlined text-xl">request_page</span>
            <span className="text-[10px] uppercase font-bold tracking-widest">Request</span>
          </button>
          <Link
            href="/expenses/add"
            className="glass-card flex flex-col items-center justify-center gap-2 py-5"
          >
            <span className="material-symbols-outlined text-xl">add</span>
            <span className="text-[10px] uppercase font-bold tracking-widest">Add</span>
          </Link>
        </section>

        {/* ── Chart + Insight ── */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Card padding="lg" className="xl:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline font-bold text-lg">Weekly Spending</h3>
              <Badge variant="default" size="sm">This Week</Badge>
            </div>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--c-border)" vertical={false} />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11, fill: "var(--c-text-muted)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "var(--c-text-muted)" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="expense" fill="var(--color-error)" radius={[4, 4, 0, 0]} maxBarSize={32} />
                  <Bar dataKey="income" fill="var(--color-primary)" radius={[4, 4, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card padding="lg" className="flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-warning">
                <span className="material-symbols-outlined">lightbulb</span>
                <span className="text-xs font-bold uppercase tracking-widest">Insight</span>
              </div>
              <p className="text-lg font-headline font-light leading-snug text-on-surface">
                You&apos;ve spent{" "}
                <span className="text-error font-bold">{formatCurrency(totalExpense, "RWF")}</span>{" "}
                and earned{" "}
                <span className="text-primary font-bold">{formatCurrency(totalIncome, "RWF")}</span>{" "}
                this period.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-[var(--c-border)]">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-on-surface-variant">Savings Rate</span>
                <span className="font-bold text-primary-text" style={{ fontVariantNumeric: "tabular-nums" }}>
                  {totalIncome > 0 ? `${Math.round((balance / totalIncome) * 100)}%` : "—"}
                </span>
              </div>
              <div className="glass-progress w-full h-2">
                <div
                  className="bg-primary h-full transition-all rounded-full"
                  style={{
                    width: totalIncome > 0
                      ? `${Math.min(100, Math.max(0, (balance / totalIncome) * 100))}%`
                      : "0%",
                  }}
                />
              </div>
            </div>
          </Card>
        </section>

        {/* ── Recent Activity + Quick Links ── */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex justify-between items-end">
              <h3 className="font-headline font-bold text-xl tracking-tight">Recent Activity</h3>
              <Link href="/expenses" className="text-primary text-sm font-semibold hover:underline">
                View All
              </Link>
            </div>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="glass-panel h-18 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : recent.length === 0 ? (
              <EmptyState
                icon="receipt_long"
                title="No transactions yet"
                description="Start tracking your finances by adding your first transaction."
                action={
                  <Link href="/expenses/add" className="glass-btn-primary px-5 py-2.5 text-sm text-white font-semibold">
                    Add Transaction
                  </Link>
                }
              />
            ) : (
              <div className="space-y-2">
                {recent.map((tx) => (
                  <Link
                    key={tx.id}
                    href={`/expenses/${tx.id}`}
                    className="glass-card flex items-center justify-between p-4 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                          {txIcon(tx)}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-on-surface">
                          {tx.description ?? tx.category ?? "Transaction"}
                        </h4>
                        <p className="text-xs text-on-surface-variant">
                          {tx.category ?? tx.transactionType} · {timeAgo(tx.date)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`font-bold text-sm ${tx.transactionType === "income" ? "text-success" : "text-on-surface"}`}
                      style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      {tx.transactionType === "income" ? "+" : "−"}
                      {formatCurrency(Math.abs(tx.amount), "RWF")}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-4">
            <Card padding="lg" className="relative overflow-hidden">
              <div className="absolute inset-0 bg-primary/[0.03]" />
              <div className="relative">
                <h3 className="font-headline font-bold text-lg mb-1">Quick Links</h3>
                <p className="text-sm text-on-surface-variant mb-5">Navigate your ecosystem</p>
                <div className="space-y-2">
                  {[
                    { href: "/habits", icon: "auto_awesome", label: "Habits Tracker" },
                    { href: "/productivity", icon: "task_alt", label: "Task Board" },
                    { href: "/groups", icon: "group", label: "Social Circles" },
                    { href: "/analytics", icon: "insights", label: "Analytics" },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="glass-card flex items-center gap-3 p-3 group"
                    >
                      <span className="material-symbols-outlined text-primary text-sm">{item.icon}</span>
                      <span className="text-sm font-medium text-primary-text">{item.label}</span>
                      <span className="material-symbols-outlined text-on-surface-variant text-sm ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                        arrow_forward
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}
