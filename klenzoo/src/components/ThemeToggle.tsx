"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch — only render after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render a placeholder with same dimensions
    return (
      <div
        className={`theme-toggle-btn ${className}`}
        aria-hidden="true"
        style={{ opacity: 0 }}
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  function toggle() {
    setTheme(isDark ? "light" : "dark");
  }

  return (
    <button
      onClick={toggle}
      className={`theme-toggle-btn ${className}`}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
    >
      <span
        className="material-symbols-outlined text-[20px] leading-none"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        {isDark ? "light_mode" : "dark_mode"}
      </span>
    </button>
  );
}
