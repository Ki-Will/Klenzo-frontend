import { type HTMLAttributes } from "react";
import { clsx } from "clsx";

interface StatProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon?: string;
  compact?: boolean;
}

/**
 * Stat display for financial metrics.
 * Uses tabular-nums for consistent digit widths.
 */
export function Stat({
  label,
  value,
  change,
  changeType = "neutral",
  icon,
  compact = false,
  className,
  ...props
}: StatProps) {
  return (
    <div className={clsx("flex flex-col", compact ? "gap-1" : "gap-2", className)} {...props}>
      <div className="flex items-center gap-2">
        {icon && (
          <span className="material-symbols-outlined text-on-surface-variant text-[18px]">
            {icon}
          </span>
        )}
        <span className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">
          {label}
        </span>
      </div>
      <div className="font-headline font-bold text-on-surface tabular-nums tracking-tight" style={{ fontVariantNumeric: "tabular-nums" }}>
        {compact ? (
          <span className="text-xl">{value}</span>
        ) : (
          <span className="text-2xl md:text-3xl">{value}</span>
        )}
      </div>
      {change && (
        <div className="flex items-center gap-1 text-xs font-medium">
          <span
            className={clsx(
              changeType === "positive" && "text-success",
              changeType === "negative" && "text-error",
              changeType === "neutral" && "text-on-surface-variant",
            )}
          >
            {changeType === "positive" && "↑ "}
            {changeType === "negative" && "↓ "}
            {change}
          </span>
        </div>
      )}
    </div>
  );
}
