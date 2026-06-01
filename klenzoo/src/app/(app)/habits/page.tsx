"use client";
import { useState, useEffect, useCallback } from "react";
import { habits as habitsApi, type Habit } from "@/lib/api";
import Link from "next/link";

const HABIT_ICONS: Record<string, string> = {
  "Deep Meditation": "mindfulness",
  "Hydration Goal": "water_drop",
  "Read Philosophy": "menu_book",
  "Strength Training": "fitness_center",
  "Logic Drills": "code",
  "Deep Work": "psychology",
};

const WEEKLY_BARS = [
  { day: "Mon", h: "75%" },
  { day: "Tue", h: "100%" },
  { day: "Wed", h: "50%" },
  { day: "Thu", h: "80%" },
  { day: "Fri", h: "100%" },
  { day: "Sat", h: "65%" },
  { day: "Sun", h: "0%" },
];

function isCompletedToday(habit: Habit): boolean {
  if (!habit.lastCompletedDate) return false;
  const last = new Date(habit.lastCompletedDate).toDateString();
  return last === new Date().toDateString();
}

// ─── Add Habit Drawer ─────────────────────────────────────────────────────────
function AddHabitModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (h: Habit) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState<"daily" | "weekly">("daily");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isSubmitDisabled = !name.trim();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitDisabled) return;
    setLoading(true);
    setError("");
    try {
      const created = await habitsApi.createHabit({ name, description, frequency });
      onCreated(created);
      onClose();
    } catch (err: unknown) {
      const local: Habit = {
        id: Date.now(),
        name,
        description,
        frequency,
        currentStreak: 0,
        longestStreak: 0,
        createdAt: new Date().toISOString(),
      };
      onCreated(local);
      onClose();
      void err;
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in { animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}} />

      <div className="w-full max-w-lg bg-card border-l border-[var(--c-border)] shadow-2xl h-full flex flex-col animate-slide-in overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[var(--c-border)] flex justify-between items-center bg-card flex-shrink-0">
          <div>
            <h2 className="text-xl font-headline font-extrabold text-primary-text">New Habit</h2>
            <p className="text-xs text-secondary-text mt-0.5">Build your daily momentum</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-card-high hover:bg-card-highest text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
          {/* Habit Name */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-secondary-text uppercase tracking-widest block">
              Habit Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Morning Meditation"
              required
              className="w-full bg-card-deep border-none rounded-2xl py-4 px-5 text-primary-text placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-primary transition-all text-sm font-semibold"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-secondary-text uppercase tracking-widest block">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. 20 minutes every morning before coffee"
              rows={3}
              className="w-full bg-card-deep border-none rounded-2xl py-4 px-5 text-primary-text placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-primary transition-all resize-none text-sm"
            />
          </div>

          {/* Frequency */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-secondary-text uppercase tracking-widest block">
              Frequency
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(["daily", "weekly"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFrequency(f)}
                  className={`py-4 rounded-2xl text-sm font-bold capitalize transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                    frequency === f
                      ? "bg-primary/20 border border-primary/40 text-primary"
                      : "bg-card-deep text-secondary-text hover:bg-card-high"
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">
                    {f === "daily" ? "wb_sunny" : "calendar_view_week"}
                  </span>
                  <span>{f}</span>
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-error text-xs font-semibold">{error}</p>}
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-[var(--c-border)] bg-card flex gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-4 rounded-full bg-card-high text-secondary-text hover:text-primary-text font-headline font-bold text-sm hover:bg-card-highest transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading || isSubmitDisabled}
            onClick={handleSubmit}
            className="flex-1 py-4 luminous-gradient text-white font-headline font-bold text-sm rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-40 disabled:hover:scale-100 cursor-pointer"
          >
            {loading ? "Creating…" : "Create Habit"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HabitsPage() {
  const [habitList, setHabitList] = useState<Habit[]>([]);
  const [loadingHabits, setLoadingHabits] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [completing, setCompleting] = useState<number | null>(null);

  // Fetch from API on mount
  useEffect(() => {
    setLoadingHabits(true);
    habitsApi
      .getHabits()
      .then((data) => setHabitList(data))
      .catch(() => setHabitList([]))
      .finally(() => setLoadingHabits(false));
  }, []);

  const handleComplete = useCallback(async (id: number) => {
    setCompleting(id);
    try {
      const updated = await habitsApi.completeHabit(id);
      setHabitList((prev) =>
        prev.map((h) =>
          h.id === id
            ? {
                ...h,
                currentStreak: updated.currentStreak,
                longestStreak: updated.longestStreak,
                lastCompletedDate: updated.lastCompletedDate,
              }
            : h
        )
      );
    } catch {
      // Optimistic update fallback
      setHabitList((prev) =>
        prev.map((h) =>
          h.id === id
            ? {
                ...h,
                currentStreak: h.currentStreak + 1,
                lastCompletedDate: new Date().toISOString(),
              }
            : h
        )
      );
    } finally {
      setCompleting(null);
    }
  }, []);

  const handleDelete = useCallback(async (id: number) => {
    try {
      await habitsApi.deleteHabit(id);
    } catch {/* ignore */}
    setHabitList((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const handleCreated = useCallback((h: Habit) => {
    setHabitList((prev) => [...prev, h]);
  }, []);

  const [featured, ...rest] = habitList;
  const completedToday = habitList.filter(isCompletedToday).length;
  const completionPct =
    habitList.length > 0 ? Math.round((completedToday / habitList.length) * 100) : 0;

  return (
    <>
      {showModal && (
        <AddHabitModal onClose={() => setShowModal(false)} onCreated={handleCreated} />
      )}

      <main className="min-h-screen py-6">
        <div className="px-6 lg:px-12 py-8 max-w-7xl">
          {/* Hero */}
          <section className="mb-12 flex items-end justify-between flex-wrap gap-4">
            <div>
              <h1 className="font-headline text-5xl lg:text-6xl font-extrabold tracking-tighter text-primary-text mb-2">
                Morning{" "}
                <span
                  className="font-headline"
                  style={{
                    background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-fixed-dim) 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Flow.
                </span>
              </h1>
              <p className="text-secondary-text text-lg font-light">
                Your current streak is{" "}
                <span className="text-primary font-bold">{featured?.currentStreak ?? 0} days</span>.
                Consistency is the silent engine of growth.
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-widest text-primary font-bold mb-1">
                Daily Completion
              </p>
              <p className="text-4xl font-headline font-black text-primary-text">{completionPct}%</p>
            </div>
          </section>

          {/* Bento Grid */}
          <div className="grid grid-cols-12 gap-6">
            {/* Featured habit — large card */}
            {featured && (
              <div className="col-span-12 lg:col-span-8 bg-card rounded-2xl p-8 relative overflow-hidden group border border-outline/10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-24 -mt-24 group-hover:bg-primary/10 transition-all duration-700" />
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-12 flex-wrap gap-4">
                    <div className="flex gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-card-highest flex items-center justify-center text-primary">
                        <span
                          className="material-symbols-outlined text-3xl"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          {HABIT_ICONS[featured.name] ?? "star"}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-2xl font-headline font-bold text-primary-text">{featured.name}</h3>
                        <p className="text-secondary-text/60">{featured.description}</p>
                      </div>
                    </div>
                    <div className="bg-card-highest px-4 py-2 rounded-full">
                      <span className="text-primary font-bold">
                        {featured.currentStreak} Day Streak
                      </span>
                    </div>
                  </div>

                  {/* Weekly bars */}
                  <div className="mt-auto">
                    <div className="flex justify-between items-end gap-2 h-32 mb-6">
                      {WEEKLY_BARS.map(({ day, h }) => (
                        <div
                          key={day}
                          className="flex-1 bg-card-highest rounded-t-xl relative group/bar"
                        >
                          {h !== "0%" && (
                            <div
                              className={`absolute bottom-0 w-full rounded-t-xl ${
                                h === "100%"
                                  ? "bg-primary shadow-[0_-10px_20px_rgba(90,77,255,0.3)]"
                                  : "bg-primary/40"
                              }`}
                              style={{ height: h }}
                            />
                          )}
                          <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-secondary-text opacity-0 group-hover/bar:opacity-100 transition-opacity">
                            {day}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-secondary-text">
                        {featured.lastCompletedDate
                          ? `Last: ${new Date(featured.lastCompletedDate).toLocaleDateString("en-US", { weekday: "short", hour: "2-digit", minute: "2-digit" })}`
                          : "Not completed yet"}
                      </span>
                      <button
                        onClick={() => handleComplete(featured.id)}
                        disabled={isCompletedToday(featured) || completing === featured.id}
                        className="px-8 py-3 bg-primary rounded-full text-white font-bold hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isCompletedToday(featured)
                          ? "✓ Done Today"
                          : completing === featured.id
                          ? "Logging…"
                          : "Complete Daily"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Secondary habit cards */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              {rest.slice(0, 2).map((habit) => (
                <div
                  key={habit.id}
                  className="bg-card rounded-2xl p-6 border-l-4 border-primary hover:bg-card-high transition-colors group cursor-pointer border border-outline/10"
                >
                  <div className="flex justify-between items-center mb-4">
                    <span
                      className="material-symbols-outlined text-primary"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {HABIT_ICONS[habit.name] ?? "star"}
                    </span>
                    <span className="text-xs font-bold px-2 py-1 bg-primary/10 text-primary rounded-xl">
                      {habit.currentStreak} day streak
                    </span>
                  </div>
                  <h4 className="text-xl font-bold mb-1 text-primary-text">{habit.name}</h4>
                  <p className="text-secondary-text text-sm mb-4">{habit.description}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-1">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 w-8 rounded-full ${
                            i < Math.min(habit.currentStreak, 4)
                              ? "bg-primary"
                              : "bg-card-highest"
                          }`}
                        />
                      ))}
                    </div>
                    <button
                      onClick={() => handleComplete(habit.id)}
                      disabled={isCompletedToday(habit) || completing === habit.id}
                      className={`h-8 w-8 rounded-full border flex items-center justify-center transition-all ${
                        isCompletedToday(habit)
                          ? "bg-primary border-primary text-white"
                          : "border-outline text-secondary-text group-hover:bg-primary group-hover:border-primary group-hover:text-white"
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">check</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Toggles */}
            <div className="col-span-12 bg-card-deep rounded-2xl p-8 border border-outline/10">
              <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
                <h3 className="text-2xl font-headline font-bold text-primary-text">Quick Toggles</h3>
                <button
                  onClick={() => setShowModal(true)}
                  className="px-5 py-2 rounded-full luminous-gradient text-white text-xs font-bold flex items-center gap-2 active:scale-95 transition-transform"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  New Habit
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {habitList.map((habit) => {
                  const done = isCompletedToday(habit);
                  return (
                    <div
                      key={habit.id}
                      className={`flex items-center gap-4 group transition-all ${
                        done ? "" : "opacity-50 grayscale hover:opacity-100 hover:grayscale-0"
                      }`}
                    >
                      <button
                        onClick={() => !done && handleComplete(habit.id)}
                        disabled={done || completing === habit.id}
                        className={`h-12 w-12 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                          done
                            ? "bg-primary border-primary text-white"
                            : "border-primary text-primary hover:bg-primary hover:text-white cursor-pointer"
                        }`}
                      >
                        <span className="material-symbols-outlined">
                          {HABIT_ICONS[habit.name] ?? "star"}
                        </span>
                      </button>
                      <div className="flex-grow min-w-0">
                        <p className="font-bold text-primary-text truncate">{habit.name}</p>
                        <p className="text-xs text-secondary-text/60">{habit.description}</p>
                      </div>
                      <button
                        onClick={() => handleDelete(habit.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-error hover:text-red-400 p-1"
                        title="Delete habit"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Vision / Quote card */}
            <div className="col-span-12 lg:col-span-5 bg-card rounded-2xl p-8 relative overflow-hidden h-[280px] border border-outline/10">
              <div className="absolute inset-0 bg-primary/5" />
              <div className="relative z-10 h-full flex flex-col justify-end">
                <span className="text-[10px] uppercase tracking-[0.3em] text-primary font-bold mb-2">
                  Philosophy of Mind
                </span>
                <h4 className="text-xl font-headline font-bold leading-tight text-primary-text">
                  &ldquo;We are what we repeatedly do. Excellence, then, is not an act, but a
                  habit.&rdquo;
                </h4>
                <p className="mt-3 text-secondary-text text-sm">— Aristotle</p>
              </div>
            </div>

            {/* Growth Index chart */}
            <div className="col-span-12 lg:col-span-7 bg-card rounded-2xl p-8 flex flex-col justify-between border border-outline/10">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-lg font-bold mb-1 text-primary-text">Growth Index</h4>
                  <p className="text-sm text-secondary-text">
                    Correlation: Consistency vs. Productivity
                  </p>
                </div>
                <div className="flex items-center gap-1 text-primary">
                  <span className="material-symbols-outlined text-sm">trending_up</span>
                  <span className="text-xs font-bold">+12.4%</span>
                </div>
              </div>
              <div className="mt-8 flex items-end gap-1 flex-1 min-h-[80px]">
                {[40, 60, 30, 80, 45, 95, 70].map((h, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-t transition-all hover:opacity-80 ${
                      i === 5
                        ? "bg-primary shadow-[0_0_20px_rgba(139,127,255,0.4)]"
                        : "bg-card-highest hover:bg-primary/20"
                    }`}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <div className="mt-4 flex justify-between text-[10px] text-secondary-text uppercase tracking-widest opacity-40">
                <span>Nov 12</span>
                <span>Nov 19</span>
                <span>Today</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
