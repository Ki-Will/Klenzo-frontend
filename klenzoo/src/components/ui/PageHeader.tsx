import { clsx } from "clsx";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
  className?: string;
}

export function PageHeader({ title, description, action, breadcrumbs, className }: PageHeaderProps) {
  return (
    <div className={clsx("mb-8", className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-xs text-on-surface-variant mb-3" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-outline">/</span>}
              {crumb.href ? (
                <a href={crumb.href} className="hover:text-primary transition-colors">{crumb.label}</a>
              ) : (
                <span className="text-on-surface">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-headline font-bold text-2xl md:text-3xl text-on-surface tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-on-surface-variant mt-1">{description}</p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </div>
  );
}
