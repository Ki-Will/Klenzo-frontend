import { clsx } from "clsx";

type BadgeVariant = "default" | "primary" | "success" | "warning" | "error" | "info";
type BadgeSize = "sm" | "md";

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: string;
  className?: string;
  children: React.ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-surface-container-high text-on-surface-variant border border-outline-variant",
  primary: "bg-primary/12 text-primary border border-primary/20",
  success: "bg-success/12 text-success border border-success/20",
  warning: "bg-warning/12 text-warning border border-warning/20",
  error: "bg-error/12 text-error border border-error/20",
  info: "bg-secondary/12 text-secondary border border-secondary/20",
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-3 py-1 text-xs",
};

export function Badge({ variant = "default", size = "sm", icon, className, children }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full font-semibold uppercase tracking-wider",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
    >
      {icon && <span className="material-symbols-outlined text-[12px]">{icon}</span>}
      {children}
    </span>
  );
}
