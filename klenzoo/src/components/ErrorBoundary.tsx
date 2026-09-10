"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * React Error Boundary.
 * Catches JavaScript errors anywhere in the child component tree.
 * Prevents one component crash from killing the entire app.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // Log to error tracking service
    console.error("ErrorBoundary caught:", error, errorInfo);

    // Report to Sentry/error tracking if available
    if (typeof window !== "undefined" && (window as any).__SENTRY__) {
      (window as any).__SENTRY__.captureException(error, {
        extra: { componentStack: errorInfo.componentStack },
      });
    }

    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="glass-panel rounded-2xl p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 glass-badge rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl text-error">
                error
              </span>
            </div>
            <h2 className="text-xl font-headline font-bold text-primary-text mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-secondary-text mb-6">
              An unexpected error occurred. Please try again.
            </p>
            <button
              onClick={this.handleReset}
              className="glass-btn-primary px-6 py-3 text-white font-bold text-sm cursor-pointer"
            >
              Try Again
            </button>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="text-xs text-muted cursor-pointer">
                  Error Details
                </summary>
                <pre className="mt-2 text-xs text-error overflow-auto max-h-40 p-3 bg-card-deep rounded-lg">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Page-level error boundary wrapper.
 */
export function PageErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="glass-panel rounded-2xl p-8 max-w-md w-full text-center">
            <span className="material-symbols-outlined text-6xl text-error mb-4 block">
              crash
            </span>
            <h1 className="text-2xl font-headline font-bold mb-2">
              Page Error
            </h1>
            <p className="text-secondary-text mb-6">
              This page encountered an error. Navigate back or try again.
            </p>
            <a
              href="/dashboard"
              className="glass-btn-primary inline-block px-6 py-3 text-white font-bold text-sm"
            >
              Go to Dashboard
            </a>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
