"use client";
import { useState, useEffect, useCallback } from "react";
import { productivity as productivityApi, type Task, type TaskStatus } from "@/lib/api";

const PRIORITY_LABELS: Record<number, { label: string; color: string; bg: string }> = {
  4: { label: "Critical",  color: "text-[#dad7ff]",  bg: "bg-[#4f46e5]" },
  3: { label: "High",      color: "text-[#c3c0ff]",  bg: "bg-[#4f46e5]/20" },
  2: { label: "Standard",  color: "text-[#c7c4d8]",  bg: "bg-[#353534]" },
  1: { label: "Low",       color: "text-[#918fa1]",  bg: "bg-[#2a2a2a]" },
};

const COLUMNS: { status: TaskStatus; label: string; dot: string; count?: number }[] = [
  { status: "todo",        label: "Todo",        dot: "bg-[#4f46e5]" },
  { status: "in_progress", label: "In Progress", dot: "bg-[#c3c0ff]" },
  { status: "done",        label: "Done",        dot: "bg-[#ffb695]" },
];

// ─── Add Task Modal ───────────────────────────────────────────────────────────
function AddTaskModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (t: Task) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [priority, setPriority] = useState(2);
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      const created = await productivityApi.createTask({
        title,
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      });
      onCreated(created);
      onClose();
    } catch {
      // Fallback: create locally
      const local: Task = {
        id: Date.now(),
        title,
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        createdAt: new Date().toISOString(),
      };
      onCreated(local);
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-md bg-[#1c1b1b] rounded-2xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-[#464555]/20">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-headline font-bold">New Task</h2>
          <button onClick={onClose} className="text-[#c7c4d8] hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#c7c4d8] uppercase tracking-widest">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Design System Overhaul"
              required
              className="w-full bg-[#0e0e0e] border-none rounded-2xl py-4 px-5 text-[#e5e2e1] placeholder:text-[#918fa1]/50 focus:outline-none focus:ring-1 focus:ring-[#c3c0ff] transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#c7c4d8] uppercase tracking-widest">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional details..."
              rows={2}
              className="w-full bg-[#0e0e0e] border-none rounded-2xl py-4 px-5 text-[#e5e2e1] placeholder:text-[#918fa1]/50 focus:outline-none focus:ring-1 focus:ring-[#c3c0ff] transition-all resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#c7c4d8] uppercase tracking-widest">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full bg-[#0e0e0e] border-none rounded-2xl py-4 px-5 text-[#e5e2e1] focus:outline-none focus:ring-1 focus:ring-[#c3c0ff] transition-all"
              >
                <option value="todo">Todo</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#c7c4d8] uppercase tracking-widest">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
                className="w-full bg-[#0e0e0e] border-none rounded-2xl py-4 px-5 text-[#e5e2e1] focus:outline-none focus:ring-1 focus:ring-[#c3c0ff] transition-all"
              >
                <option value={4}>Critical</option>
                <option value={3}>High</option>
                <option value={2}>Standard</option>
                <option value={1}>Low</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#c7c4d8] uppercase tracking-widest">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-[#0e0e0e] border-none rounded-2xl py-4 px-5 text-[#e5e2e1] focus:outline-none focus:ring-1 focus:ring-[#c3c0ff] transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 luminous-gradient text-white font-headline font-bold rounded-full shadow-[0_10px_30px_rgba(79,70,229,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? "Creating…" : "Create Task"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Task Card ────────────────────────────────────────────────────────────────
function TaskCard({
  task,
  onStatusChange,
  onDelete,
}: {
  task: Task;
  onStatusChange: (id: number, status: TaskStatus) => void;
  onDelete: (id: number) => void;
}) {
  const p = PRIORITY_LABELS[task.priority] ?? PRIORITY_LABELS[2];
  const isDone = task.status === "done";
  const isOverdue =
    task.dueDate && !isDone && new Date(task.dueDate) < new Date();

  const nextStatus: Record<TaskStatus, TaskStatus> = {
    todo: "in_progress",
    in_progress: "done",
    done: "todo",
    cancelled: "todo",
  };

  return (
    <div
      className={`bg-[#1c1b1b] p-6 rounded-2xl border transition-all group cursor-pointer relative overflow-hidden ${
        task.status === "in_progress"
          ? "border-[#c3c0ff]/20 shadow-xl shadow-black/40"
          : "border-[#464555]/5 hover:border-[#c3c0ff]/20"
      }`}
    >
      {task.status === "in_progress" && (
        <div className="absolute top-0 left-0 w-1 h-full bg-[#c3c0ff] rounded-l-2xl" />
      )}
      <div className="flex justify-between items-start mb-4">
        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-tighter ${p.bg} ${p.color}`}>
          {p.label}
        </span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onStatusChange(task.id, nextStatus[task.status])}
            className="p-1 hover:text-[#c3c0ff] transition-colors text-[#c7c4d8]"
            title="Advance status"
          >
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1 hover:text-[#ffb4ab] transition-colors text-[#c7c4d8]"
            title="Delete"
          >
            <span className="material-symbols-outlined text-sm">delete</span>
          </button>
        </div>
      </div>

      <h3
        className={`font-bold text-[#e5e2e1] mb-2 leading-tight ${
          isDone ? "line-through opacity-40" : ""
        }`}
      >
        {task.title}
      </h3>

      {task.description && (
        <p className="text-xs text-[#c7c4d8] line-clamp-2 mb-4">{task.description}</p>
      )}

      {task.status === "in_progress" && (
        <div className="w-full bg-[#0e0e0e] h-1.5 rounded-full mb-4">
          <div className="bg-[#c3c0ff] h-full rounded-full w-3/4" />
        </div>
      )}

      <div className="flex items-center justify-between mt-2">
        <div className="w-6 h-6 rounded-full bg-[#353534] flex items-center justify-center text-[10px] font-bold text-[#c7c4d8]">
          U
        </div>
        {task.dueDate && (
          <div
            className={`flex items-center gap-1 text-[10px] font-bold ${
              isOverdue ? "text-[#ffb4ab]" : "text-[#c7c4d8]"
            }`}
          >
            <span className="material-symbols-outlined text-xs">
              {isOverdue ? "alarm" : "calendar_today"}
            </span>
            <span>
              {isOverdue
                ? "Overdue"
                : new Date(task.dueDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
            </span>
          </div>
        )}
        {isDone && (
          <span
            className="material-symbols-outlined text-[#ffb695] text-lg"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ProductivityPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setLoading(true);
    productivityApi
      .getTasks()
      .then((data) => setTasks(data))
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = useCallback(async (id: number, newStatus: TaskStatus) => {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );
    try {
      await productivityApi.updateTask(id, { status: newStatus });
    } catch {/* already updated locally */}
  }, []);

  const handleDelete = useCallback(async (id: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await productivityApi.deleteTask(id);
    } catch {/* already removed locally */}
  }, []);

  const handleCreated = useCallback((t: Task) => {
    setTasks((prev) => [t, ...prev]);
  }, []);

  const done = tasks.filter((t) => t.status === "done").length;
  const total = tasks.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;

  return (
    <>
      {showModal && (
        <AddTaskModal onClose={() => setShowModal(false)} onCreated={handleCreated} />
      )}

      <main className="min-h-screen py-6">
        <div className="px-6 lg:px-12 py-8 flex flex-col gap-12">
          {/* Hero Stats */}
          <section>
            <div className="flex flex-col mb-10">
              <h1 className="text-5xl font-extrabold font-headline tracking-tight text-[#e5e2e1] mb-2">
                Deep Tasks
              </h1>
              <p className="text-[#c7c4d8] max-w-lg">
                Your productivity is at{" "}
                <span className="text-[#c3c0ff] font-bold">{pct}%</span> today. You&apos;ve
                completed {done} tasks across {COLUMNS.length} stages.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  label: "Efficiency Score",
                  value: pct >= 80 ? "A+" : pct >= 60 ? "B" : "C",
                  sub: `${pct}% completion rate`,
                  color: "text-[#c3c0ff]",
                },
                {
                  label: "In Progress",
                  value: String(inProgress),
                  sub: "Active tasks",
                  color: "text-[#e5e2e1]",
                },
                {
                  label: "Today's Focus",
                  value: `${done}/${total}`,
                  sub: `${total - done} remaining`,
                  color: "text-[#e5e2e1]",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-[#1c1b1b] p-8 rounded-2xl border border-[#464555]/5 flex flex-col gap-4 relative overflow-hidden group"
                >
                  <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <span className="material-symbols-outlined text-9xl">trending_up</span>
                  </div>
                  <span className="text-[#c7c4d8] uppercase tracking-widest text-[10px] font-bold">
                    {stat.label}
                  </span>
                  <div className="flex items-end gap-3">
                    <span className={`text-4xl font-headline font-black ${stat.color}`}>
                      {stat.value}
                    </span>
                    <span className="text-sm text-[#c7c4d8]/60 mb-1">{stat.sub}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Kanban Board */}
          <section className="flex flex-col gap-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold font-headline">Kanban Board</h2>
                <span className="px-3 py-1 bg-[#2a2a2a] rounded-full text-xs font-bold text-[#c7c4d8]">
                  {total} tasks
                </span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(true)}
                  className="px-5 py-2.5 rounded-full luminous-gradient text-white text-sm font-bold flex items-center gap-2 active:scale-95 transition-transform shadow-[0_0_20px_rgba(79,70,229,0.3)]"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  New Task
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
              {COLUMNS.map((col) => {
                const colTasks = tasks.filter((t) => t.status === col.status);
                return (
                  <div key={col.status} className="flex flex-col gap-4">
                    {/* Column header */}
                    <div className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${col.dot}`} />
                        <span className="font-bold text-sm text-[#e5e2e1]">{col.label}</span>
                        <span className="text-xs text-[#c7c4d8]/50">{colTasks.length}</span>
                      </div>
                      <button
                        onClick={() => setShowModal(true)}
                        className="text-[#c7c4d8] hover:text-[#c3c0ff] transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">add</span>
                      </button>
                    </div>

                    {/* Cards */}
                    <div
                      className={`flex flex-col gap-4 ${
                        col.status === "done" ? "opacity-60" : ""
                      }`}
                    >
                      {colTasks.length === 0 ? (
                        <div className="border-2 border-dashed border-[#464555]/20 rounded-2xl p-8 text-center text-[#c7c4d8]/40 text-sm">
                          No tasks here
                        </div>
                      ) : (
                        colTasks.map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            onStatusChange={handleStatusChange}
                            onDelete={handleDelete}
                          />
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Activity + Insights */}
          <section className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12">
            {/* Activity chart */}
            <div className="md:col-span-8 bg-[#1c1b1b] rounded-2xl p-8 border border-[#464555]/5 overflow-hidden relative">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold font-headline">Activity Locus</h3>
                  <p className="text-xs text-[#c7c4d8]">
                    Intelligent tracking of peak focus hours
                  </p>
                </div>
                <div className="flex gap-4">
                  <span className="flex items-center gap-2 text-[10px] font-bold text-[#c7c4d8] uppercase">
                    <div className="w-2 h-2 rounded-full bg-[#c3c0ff]" />
                    Deep Work
                  </span>
                  <span className="flex items-center gap-2 text-[10px] font-bold text-[#c7c4d8] uppercase">
                    <div className="w-2 h-2 rounded-full bg-[#413f82]" />
                    Admin
                  </span>
                </div>
              </div>
              <div className="h-48 flex items-end justify-between gap-2 px-4">
                {[50, 65, 85, 75, 65, 80, 35, 50, 100, 75, 50, 25].map((h, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-t-lg transition-colors ${
                      [2, 5, 8].includes(i)
                        ? "bg-[#c3c0ff]/40 shadow-[0_-8px_20px_-2px_rgba(195,192,255,0.2)]"
                        : "bg-[#353534]/20 hover:bg-[#c3c0ff]/20"
                    }`}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>

            {/* Void Insights */}
            <div className="md:col-span-4 bg-[#4f46e5] rounded-2xl p-8 text-[#dad7ff] relative overflow-hidden flex flex-col justify-between">
              <div className="absolute -right-12 -top-12 w-48 h-48 bg-[#c3c0ff] rounded-full opacity-10 blur-3xl" />
              <div className="relative z-10">
                <span
                  className="material-symbols-outlined text-4xl mb-6 block"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  auto_awesome
                </span>
                <h3 className="text-3xl font-black font-headline tracking-tight leading-none mb-4">
                  Void Insights
                </h3>
                <p className="text-[#dad7ff]/80 text-sm leading-relaxed">
                  Based on your current velocity, you&apos;ll complete all{" "}
                  <span className="font-bold text-white">{inProgress} in-progress</span> tasks 2
                  days ahead of schedule.
                </p>
              </div>
              <button className="relative z-10 w-fit mt-8 flex items-center gap-2 font-bold text-xs uppercase tracking-widest hover:gap-4 transition-all group">
                See Intelligence Report
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </section>
        </div>
      </main>

      {/* FAB */}
      <button
        onClick={() => setShowModal(true)}
        className="lg:hidden fixed right-6 bottom-28 w-14 h-14 rounded-full luminous-gradient text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40"
      >
        <span className="material-symbols-outlined text-2xl">add</span>
      </button>
    </>
  );
}
