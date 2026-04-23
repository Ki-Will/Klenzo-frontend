"use client";
import Link from "next/link";

interface TopBarProps {
  showClose?: boolean;
}

export default function TopBar({ showClose = false }: TopBarProps) {
  return (
    <header className="bg-neutral-950/80 backdrop-blur-xl fixed top-0 w-full z-50 flex justify-between items-center px-8 h-20">
      <div className="flex items-center gap-4">
        {showClose && (
          <Link
            href="/dashboard"
            className="p-2 hover:bg-neutral-800/50 transition-colors active:scale-95 duration-200 rounded-full text-[#e5e2e1]"
          >
            <span className="material-symbols-outlined">close</span>
          </Link>
        )}
        <Link
          href="/dashboard"
          className="text-2xl font-black text-indigo-500 tracking-tighter font-headline"
        >
          Klenzoo
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <Link
          href="/notifications"
          className="p-2 text-neutral-400 hover:bg-neutral-800/50 transition-colors active:scale-95 duration-200 rounded-full"
        >
          <span className="material-symbols-outlined">notifications</span>
        </Link>
        <Link
          href="/settings"
          className="p-2 text-neutral-400 hover:bg-neutral-800/50 transition-colors active:scale-95 duration-200 rounded-full"
        >
          <span className="material-symbols-outlined">account_circle</span>
        </Link>
      </div>
    </header>
  );
}
