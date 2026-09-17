import { type HTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outlined" | "interactive";
  padding?: "none" | "sm" | "md" | "lg";
  noBorder?: boolean;
}

const variantClasses = {
  default: "bg-[var(--c-card)] border border-[var(--c-border)]",
  elevated: "bg-[var(--c-card)] border border-[var(--c-border)] shadow-lg",
  outlined: "bg-transparent border border-outline-variant",
  interactive:
    "bg-[var(--c-card)] border border-[var(--c-border)] hover:border-primary/20 hover:shadow-md transition-all duration-200 cursor-pointer",
};

const paddingClasses = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "default", padding = "md", noBorder = false, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          "rounded-2xl",
          variantClasses[variant],
          paddingClasses[padding],
          noBorder && "border-0",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = "Card";

/* ── Card sub-components ────────────────────────────────────── */

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx("flex items-center justify-between mb-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={clsx("font-headline font-bold text-lg text-on-surface", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={clsx("text-sm text-on-surface-variant", className)} {...props}>
      {children}
    </p>
  );
}
