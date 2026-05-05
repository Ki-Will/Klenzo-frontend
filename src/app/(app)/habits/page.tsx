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

// ─── Add Habit Modal ──────────────────────────────────────────────────────────
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError("");
    try {
      const created = await habitsApi.createHabit({ name, description, frequency });
      onCreated(created);
      onClose();
    } catch (err: unknown) {
      // Fallback: create locally so UI still works without backend
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-md bg-[#1c1b1b] rounded-2xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-[#464555]/20">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-headline font-bold">New Habit</h2>
          <button onClick={onClose} className="text-[#c7c4d8] hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#c7c4d8] uppercase tracking-widest">
              Habit Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Morning Meditation"
              required
              className="w-full bg-[#0e0e0e] border-none rounded-2xl py-4 px-5 text-[#e5e2e1] placeholder:text-[#918fa1]/50 focus:outline-none focus:ring-1 focus:ring-[#c3c0ff] transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#c7c4d8] uppercase tracking-widest">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. 20 minutes every morning"
              className="w-full bg-[#0e0e0e] border-none rounded-2xl py-4 px-5 text-[#e5e2e1] placeholder:text-[#918fa1]/50 focus:outline-none focus:ring-1 focus:ring-[#c3c0ff] transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#c7c4d8] uppercase tracking-widest">
              Frequency
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(["daily", "weekly"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFrequency(f)}
                  className={`py-3 rounded-2xl text-sm font-bold capitalize transition-all ${
                    frequency === f
                      ? "bg-[#4f46e5]/20 border border-[#4f46e5]/40 text-[#c3c0ff]"
                      : "bg-[#0e0e0e] text-[#c7c4d8] hover:bg-[#2a2a2a]"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-[#ffb4ab] text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 luminous-gradient text-white font-headline font-bold rounded-full shadow-[0_10px_30px_rgba(79,70,229,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? "Creating…" : "Create Habit"}
          </button>
        </form>
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
              <h1 className="font-headline text-5xl lg:text-6xl font-extrabold tracking-tighter text-[#e5e2e1] mb-2">
                Morning{" "}
                <span
                  className="font-headline"
                  style={{
                    background: "linear-gradient(135deg, #4f46e5 0%, #c3c0ff 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Flow.
                </span>
              </h1>
              <p className="text-[#c7c4d8] text-lg font-light">
                Your current streak is{" "}
                <span className="text-[#c3c0ff] font-bold">{featured?.currentStreak ?? 0} days</span>.
                Consistency is the silent engine of growth.
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-widest text-[#c3c0ff] font-bold mb-1">
                Daily Completion
              </p>
              <p className="text-4xl font-headline font-black">{completionPct}%</p>
            </div>
          </section>

          {/* Bento Grid */}
          <div className="grid grid-cols-12 gap-6">
            {/* Featured habit — large card */}
            {featured && (
              <div className="col-span-12 lg:col-span-8 bg-[#1c1b1b] rounded-2xl p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#4f46e5]/5 rounded-full blur-3xl -mr-24 -mt-24 group-hover:bg-[#4f46e5]/10 transition-all duration-700" />
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-12 flex-wrap gap-4">
                    <div className="flex gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-[#353534] flex items-center justify-center text-[#c3c0ff]">
                        <span
                          className="material-symbols-outlined text-3xl"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          {HABIT_ICONS[featured.name] ?? "star"}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-2xl font-headline font-bold">{featured.name}</h3>
                        <p className="text-[#c7c4d8]/60">{featured.description}</p>
                      </div>
                    </div>
                    <div className="bg-[#353534] px-4 py-2 rounded-full">
                      <span className="text-[#c3c0ff] font-bold">
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
                          className="flex-1 bg-[#353534] rounded-t-xl relative group/bar"
                        >
                          {h !== "0%" && (
                            <div
                              className={`absolute bottom-0 w-full rounded-t-xl ${
                                h === "100%"
                                  ? "bg-[#4f46e5] shadow-[0_-10px_20px_rgba(79,70,229,0.3)]"
                                  : "bg-[#4f46e5]/40"
                              }`}
                              style={{ height: h }}
                            />
                          )}
                          <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-[#c7c4d8] opacity-0 group-hover/bar:opacity-100 transition-opacity">
                            {day}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#c7c4d8]">
                        {featured.lastCompletedDate
                          ? `Last: ${new Date(featured.lastCompletedDate).toLocaleDateString("en-US", { weekday: "short", hour: "2-digit", minute: "2-digit" })}`
                          : "Not completed yet"}
                      </span>
                      <button
                        onClick={() => handleComplete(featured.id)}
                        disabled={isCompletedToday(featured) || completing === featured.id}
                        className="px-8 py-3 bg-[#4f46e5] rounded-full text-[#dad7ff] font-bold hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="bg-[#1c1b1b] rounded-2xl p-6 border-l-4 border-[#c3c0ff] hover:bg-[#2a2a2a] transition-colors group cursor-pointer"
                >
                  <div className="flex justify-between items-center mb-4">
                    <span
                      className="material-symbols-outlined text-[#c3c0ff]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {HABIT_ICONS[habit.name] ?? "star"}
                    </span>
                    <span className="text-xs font-bold px-2 py-1 bg-[#c3c0ff]/10 text-[#c3c0ff] rounded-xl">
                      {habit.currentStreak} day streak
                    </span>
                  </div>
                  <h4 className="text-xl font-bold mb-1">{habit.name}</h4>
                  <p className="text-[#c7c4d8] text-sm mb-4">{habit.description}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-1">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 w-8 rounded-full ${
                            i < Math.min(habit.currentStreak, 4)
                              ? "bg-[#c3c0ff]"
                              : "bg-[#353534]"
                          }`}
                        />
                      ))}
                    </div>
                    <button
                      onClick={() => handleComplete(habit.id)}
                      disabled={isCompletedToday(habit) || completing === habit.id}
                      className={`h-8 w-8 rounded-full border flex items-center justify-center transition-all ${
                        isCompletedToday(habit)
                          ? "bg-[#4f46e5] border-[#4f46e5] text-white"
                          : "border-[#464555] text-[#c7c4d8] group-hover:bg-[#4f46e5] group-hover:border-[#4f46e5] group-hover:text-white"
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">check</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Toggles */}
            <div className="col-span-12 bg-[#0e0e0e] rounded-2xl p-8">
              <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
                <h3 className="text-2xl font-headline font-bold">Quick Toggles</h3>
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
                            ? "bg-[#4f46e5] border-[#4f46e5] text-white"
                            : "border-[#4f46e5] text-[#4f46e5] hover:bg-[#4f46e5] hover:text-white cursor-pointer"
                        }`}
                      >
                        <span className="material-symbols-outlined">
                          {HABIT_ICONS[habit.name] ?? "star"}
                        </span>
                      </button>
                      <div className="flex-grow min-w-0">
                        <p className="font-bold truncate">{habit.name}</p>
                        <p className="text-xs text-[#c7c4d8]/60">{habit.description}</p>
                      </div>
                      <button
                        onClick={() => handleDelete(habit.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-[#ffb4ab] hover:text-[#ff6b6b] p-1"
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
            <div className="col-span-12 lg:col-span-5 bg-[#1c1b1b] rounded-2xl p-8 relative overflow-hidden h-[280px]">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/30 to-transparent" />
              <div className="relative z-10 h-full flex flex-col justify-end">
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#c3c0ff] font-bold mb-2">
                  Philosophy of Mind
                </span>
                <h4 className="text-xl font-headline font-bold leading-tight">
                  &ldquo;We are what we repeatedly do. Excellence, then, is not an act, but a
                  habit.&rdquo;
                </h4>
                <p className="mt-3 text-[#c7c4d8] text-sm">— Aristotle</p>
              </div>
            </div>

            {/* Growth Index chart */}
            <div className="col-span-12 lg:col-span-7 bg-[#1c1b1b] rounded-2xl p-8 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-lg font-bold mb-1">Growth Index</h4>
                  <p className="text-sm text-[#c7c4d8]">
                    Correlation: Consistency vs. Productivity
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[#c3c0ff]">
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
                        ? "bg-[#c3c0ff] shadow-[0_0_20px_rgba(195,192,255,0.4)]"
                        : "bg-[#353534] hover:bg-[#4f46e5]/20"
                    }`}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <div className="mt-4 flex justify-between text-[10px] text-[#c7c4d8] uppercase tracking-widest opacity-40">
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
