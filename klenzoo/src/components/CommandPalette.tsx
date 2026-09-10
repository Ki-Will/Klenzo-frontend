"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useKeyboardShortcut } from "@/lib/hooks";

interface CommandItem {
  id: string;
  label: string;
  icon: string;
  href?: string;
  action?: () => void;
  category: string;
}

const COMMANDS: CommandItem[] = [
  { id: "dashboard", label: "Go to Dashboard", icon: "dashboard", href: "/dashboard", category: "Navigation" },
  { id: "wallets", label: "Go to Wallets", icon: "account_balance_wallet", href: "/wallets", category: "Navigation" },
  { id: "expenses", label: "Go to Expenses", icon: "receipt_long", href: "/expenses", category: "Navigation" },
  { id: "transfers", label: "Go to Transfers", icon: "send", href: "/transfers", category: "Navigation" },
  { id: "habits", label: "Go to Habits", icon: "auto_awesome", href: "/habits", category: "Navigation" },
  { id: "productivity", label: "Go to Tasks", icon: "task_alt", href: "/productivity", category: "Navigation" },
  { id: "analytics", label: "Go to Analytics", icon: "insights", href: "/analytics", category: "Navigation" },
  { id: "notifications", label: "Go to Notifications", icon: "notifications", href: "/notifications", category: "Navigation" },
  { id: "profile", label: "Go to Profile", icon: "person", href: "/profile", category: "Navigation" },
  { id: "settings", label: "Go to Settings", icon: "settings", href: "/settings", category: "Navigation" },
  { id: "security", label: "Go to Security", icon: "shield", href: "/security", category: "Navigation" },
  { id: "add-expense", label: "Add Transaction", icon: "add", href: "/expenses/add", category: "Actions" },
  { id: "new-habit", label: "New Habit", icon: "add_circle", href: "/habits", category: "Actions" },
  { id: "new-task", label: "New Task", icon: "add_task", href: "/productivity", category: "Actions" },
  { id: "new-transfer", label: "Send Money", icon: "send", href: "/transfers", category: "Actions" },
];

/**
 * Command palette (Cmd+K) for quick navigation.
 */
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useKeyboardShortcut("k", () => setOpen(true), { meta: true });

  const filtered = COMMANDS.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(query.toLowerCase()) ||
      cmd.category.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      setQuery("");
    }
  }, [open]);

  const executeCommand = (cmd: CommandItem) => {
    if (cmd.href) {
      router.push(cmd.href);
    } else if (cmd.action) {
      cmd.action();
    }
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      executeCommand(filtered[selectedIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] glass-overlay flex items-start justify-center pt-[20vh]"
      onClick={() => setOpen(false)}
    >
      <div
        className="glass-heavy rounded-2xl w-full max-w-lg mx-4 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--c-border)]">
          <span className="material-symbols-outlined text-muted">search</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent text-primary-text placeholder:text-muted focus:outline-none text-sm"
          />
          <kbd className="px-2 py-1 text-[10px] font-mono text-muted bg-card-high rounded">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-muted text-sm">
              No results found
            </div>
          ) : (
            <>
              {Object.entries(
                filtered.reduce(
                  (acc, cmd) => ({
                    ...acc,
                    [cmd.category]: [...(acc[cmd.category] || []), cmd],
                  }),
                  {} as Record<string, CommandItem[]>,
                ),
              ).map(([category, items]) => (
                <div key={category}>
                  <p className="text-[10px] font-bold text-muted uppercase tracking-widest px-3 py-2">
                    {category}
                  </p>
                  {items.map((cmd) => {
                    const idx = filtered.indexOf(cmd);
                    return (
                      <button
                        key={cmd.id}
                        onClick={() => executeCommand(cmd)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors cursor-pointer ${
                          idx === selectedIndex
                            ? "bg-primary/10 text-primary"
                            : "text-primary-text hover:bg-card-high"
                        }`}
                      >
                        <span className="material-symbols-outlined text-lg">
                          {cmd.icon}
                        </span>
                        <span>{cmd.label}</span>
                        {cmd.href && (
                          <span className="ml-auto text-xs text-muted font-mono">
                            {cmd.href}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
