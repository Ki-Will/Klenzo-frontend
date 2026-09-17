import { forwardRef, type ButtonHTMLAttributes } from "react";
import { clsx } from "clsx";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "success";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: string;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-on-primary hover:brightness-110 active:scale-[0.97] shadow-[var(--c-btn-primary-shadow)]",
  secondary:
    "bg-surface-container-high text-on-surface border border-outline-variant hover:bg-surface-container-highest active:scale-[0.97]",
  ghost:
    "bg-transparent text-on-surface-variant hover:bg-[var(--c-hover-overlay)] active:bg-[var(--c-active-overlay)]",
  danger:
    "bg-error/90 text-white hover:bg-error active:scale-[0.97]",
  success:
    "bg-success/90 text-white hover:bg-success active:scale-[0.97]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-lg",
  md: "h-10 px-5 text-sm gap-2 rounded-xl",
  lg: "h-12 px-6 text-base gap-2.5 rounded-xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      icon,
      iconPosition = "left",
      fullWidth = false,
      className,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(
          "inline-flex items-center justify-center font-semibold transition-all duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "disabled:opacity-50 disabled:pointer-events-none",
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && "w-full",
          className,
        )}
        {...props}
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
        ) : (
          icon && iconPosition === "left" && (
            <span className="material-symbols-outlined text-[18px]">{icon}</span>
          )
        )}
        {children}
        {!loading && icon && iconPosition === "right" && (
          <span className="material-symbols-outlined text-[18px]">{icon}</span>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
