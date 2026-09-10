"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { t, type Locale, LOCALES, DEFAULT_LOCALE } from "@/lib/i18n";
import { useLocalStorage } from "@/lib/hooks";

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useLocalStorage<Locale>(
    "klenzo-locale",
    DEFAULT_LOCALE,
  );

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof document !== "undefined") {
      document.documentElement.lang = newLocale;
    }
  };

  const translate = (key: string, params?: Record<string, string | number>) =>
    t(key, locale, params);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t: translate }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale must be used within LocaleProvider");
  return context;
}

/**
 * Locale switcher component.
 */
export function LocaleSwitcher() {
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);

  const current = LOCALES.find((l) => l.code === locale) || LOCALES[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="glass-card flex items-center gap-2 px-3 py-2 text-sm cursor-pointer"
      >
        <span>{current.flag}</span>
        <span className="text-xs font-semibold">{current.code.toUpperCase()}</span>
        <span className="material-symbols-outlined text-xs">expand_more</span>
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 glass-heavy rounded-xl p-1 z-50 min-w-[120px]">
          {LOCALES.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                setLocale(l.code);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                locale === l.code
                  ? "bg-primary/10 text-primary"
                  : "text-primary-text hover:bg-card-high"
              }`}
            >
              <span>{l.flag}</span>
              <span>{l.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
