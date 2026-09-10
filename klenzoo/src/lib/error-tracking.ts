/**
 * Error tracking configuration.
 * Integrates with Sentry for production error monitoring.
 *
 * Setup:
 * 1. Create a Sentry account at https://sentry.io
 * 2. Create a new project and get the DSN
 * 3. Add NEXT_PUBLIC_SENTRY_DSN to .env.local
 * 4. Add NEXT_PUBLIC_SENTRY_ENVIRONMENT to .env.local (development/production)
 */

interface ErrorTrackingConfig {
  dsn: string;
  environment: string;
  tracesSampleRate: number;
  replaysSessionSampleRate: number;
  replaysOnErrorSampleRate: number;
}

const config: ErrorTrackingConfig = {
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "",
  environment:
    process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ||
    process.env.NODE_ENV ||
    "development",
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
};

/**
 * Initialize error tracking.
 * Call this once in the app layout or entry point.
 */
export function initErrorTracking() {
  if (!config.dsn) {
    console.warn(
      "Error tracking not configured. Set NEXT_PUBLIC_SENTRY_DSN in .env.local",
    );
    return;
  }

  // Sentry would be initialized here
  // For now, use a simple console-based error tracker
  if (typeof window !== "undefined") {
    window.addEventListener("error", (event) => {
      reportError(event.error || new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    window.addEventListener("unhandledrejection", (event) => {
      reportError(
        event.reason instanceof Error
          ? event.reason
          : new Error(String(event.reason)),
        { type: "unhandledrejection" },
      );
    });
  }
}

/**
 * Report an error to the tracking service.
 */
export function reportError(
  error: Error,
  context?: Record<string, any>,
) {
  const errorReport = {
    message: error.message,
    stack: error.stack,
    name: error.name,
    timestamp: new Date().toISOString(),
    url: typeof window !== "undefined" ? window.location.href : "server",
    userAgent:
      typeof window !== "undefined" ? navigator.userAgent : "server",
    environment: config.environment,
    ...context,
  };

  // In production, send to Sentry
  if (config.environment === "production" && config.dsn) {
    // Sentry.captureException(error, { extra: context });
    console.error("[ErrorTracking]", JSON.stringify(errorReport));
  } else {
    console.error("[ErrorTracking]", errorReport);
  }
}

/**
 * Set user context for error tracking.
 */
export function setErrorUser(user: {
  id: string;
  email?: string;
  username?: string;
}) {
  // Sentry.setUser(user);
  console.log("[ErrorTracking] User set:", user.id);
}

/**
 * Add breadcrumb for debugging.
 */
export function addBreadcrumb(
  category: string,
  message: string,
  data?: Record<string, any>,
) {
  // Sentry.addBreadcrumb({ category, message, data });
  console.log(`[Breadcrumb] ${category}: ${message}`, data);
}
