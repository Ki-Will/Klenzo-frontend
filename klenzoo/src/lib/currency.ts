/**
 * Klenzoo Currency System
 *
 * Locale-aware currency formatting for East African currencies.
 * RWF, KES, UGX, TZS are first-class — no dollar defaults.
 */

export type CurrencyCode = "RWF" | "KES" | "UGX" | "TZS" | "USD" | "EUR" | "GBP";

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  decimals: number;
  locale: string;
  /** Symbol appears before or after the amount */
  symbolPosition: "before" | "after";
}

const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  RWF: { code: "RWF", symbol: "FRw", name: "Rwandan Franc", decimals: 0, locale: "rw-RW", symbolPosition: "before" },
  KES: { code: "KES", symbol: "KSh", name: "Kenyan Shilling", decimals: 2, locale: "en-KE", symbolPosition: "before" },
  UGX: { code: "UGX", symbol: "USh", name: "Ugandan Shilling", decimals: 0, locale: "en-UG", symbolPosition: "before" },
  TZS: { code: "TZS", symbol: "TSh", name: "Tanzanian Shilling", decimals: 0, locale: "en-TZ", symbolPosition: "before" },
  USD: { code: "USD", symbol: "$", name: "US Dollar", decimals: 2, locale: "en-US", symbolPosition: "before" },
  EUR: { code: "EUR", symbol: "€", name: "Euro", decimals: 2, locale: "de-DE", symbolPosition: "after" },
  GBP: { code: "GBP", symbol: "£", name: "British Pound", decimals: 2, locale: "en-GB", symbolPosition: "before" },
};

export function getCurrencyConfig(code: CurrencyCode): CurrencyConfig {
  return CURRENCIES[code] ?? CURRENCIES.USD;
}

/**
 * Format a number as currency.
 *
 * @param amount   - The raw numeric amount
 * @param currency - ISO currency code (defaults to RWF)
 * @param options  - { compact, showSign, locale }
 */
export function formatCurrency(
  amount: number,
  currency: CurrencyCode = "RWF",
  options?: {
    compact?: boolean;
    showSign?: boolean;
    locale?: string;
  }
): string {
  const config = getCurrencyConfig(currency);
  const { compact = false, showSign = false, locale } = options ?? {};

  // Handle zero
  const abs = Math.abs(amount);
  if (abs === 0 && !showSign) {
    return `${config.symbol}0`;
  }

  // For compact display of large numbers (e.g., "1.2M")
  if (compact && abs >= 1_000_000) {
    const formatted = (abs / 1_000_000).toFixed(1).replace(/\.0$/, "");
    const sign = showSign && amount > 0 ? "+" : amount < 0 ? "-" : "";
    return `${sign}${config.symbol}${formatted}M`;
  }
  if (compact && abs >= 1_000) {
    const formatted = (abs / 1_000).toFixed(1).replace(/\.0$/, "");
    const sign = showSign && amount > 0 ? "+" : amount < 0 ? "-" : "";
    return `${sign}${config.symbol}${formatted}K`;
  }

  // Standard formatting using Intl
  try {
    const formatted = new Intl.NumberFormat(locale ?? config.locale, {
      style: "decimal",
      minimumFractionDigits: config.decimals,
      maximumFractionDigits: config.decimals,
    }).format(abs);

    const sign = showSign && amount > 0 ? "+" : amount < 0 ? "-" : "";

    if (config.symbolPosition === "after") {
      return `${sign}${formatted} ${config.symbol}`;
    }
    return `${sign}${config.symbol}${formatted}`;
  } catch {
    // Fallback if Intl fails
    const formatted = abs.toLocaleString(undefined, {
      minimumFractionDigits: config.decimals,
      maximumFractionDigits: config.decimals,
    });
    const sign = amount < 0 ? "-" : "";
    return `${sign}${config.symbol}${formatted}`;
  }
}

/**
 * Format currency for display in financial figures.
 * Uses monospace-friendly formatting with consistent width.
 */
export function formatFinancialAmount(
  amount: number,
  currency: CurrencyCode = "RWF",
  options?: { showSign?: boolean; compact?: boolean }
): string {
  return formatCurrency(amount, currency, options);
}

/**
 * Parse a currency string back to a number.
 * Handles common formats: "$1,234.56", "FRw 50,000", "KSh1200"
 */
export function parseCurrencyString(value: string): number {
  const cleaned = value.replace(/[^\d.\-]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

export const DEFAULT_CURRENCY: CurrencyCode = "RWF";
