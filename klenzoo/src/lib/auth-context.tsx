"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { auth, type UserProfile } from "./api";

interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  /**
   * Try to load the current user from the backend.
   * If the cookie is valid the backend returns the profile.
   * If not (401) we just set user = null — no redirect here.
   */
  const refreshUser = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const user = await auth.profile();
      setState({ user, loading: false, error: null });
    } catch {
      setState({ user: null, loading: false, error: null });
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // ─── LOGIN ────────────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      // Backend sets httpOnly cookies on successful login
      await auth.login(email, password);
      let user: UserProfile | null = null;
      try {
        user = await auth.profile();
      } catch {
        // Profile fetch failed but login succeeded — proceed anyway
      }
      setState({ user, loading: false, error: null });
    } catch (err: unknown) {
      const msg =
        err instanceof Error && err.message !== "Session expired"
          ? err.message
          : "Invalid credentials";
      setState({ user: null, loading: false, error: msg });
      throw new Error(msg);
    }
  }, []);

  // ─── REGISTER ─────────────────────────────────────────────────────────────
  const register = useCallback(async (email: string, password: string) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      await auth.register(email, password);
      // Auto-login after registration
      await auth.login(email, password);
      // Fetch profile — retry once if the first attempt fails (cookie timing)
      let user: UserProfile | null = null;
      try {
        user = await auth.profile();
      } catch {
        // Wait briefly for the cookie to propagate, then retry
        await new Promise((r) => setTimeout(r, 300));
        try {
          user = await auth.profile();
        } catch {
          // Still failed — proceed with null; refreshUser will fix it on next render
        }
      }
      setState({ user, loading: false, error: null });
    } catch (err: unknown) {
      const msg =
        err instanceof Error && err.message !== "Session expired"
          ? err.message
          : "Registration failed. Please try again.";
      setState({ user: null, loading: false, error: msg });
      throw new Error(msg);
    }
  }, []);

  // ─── LOGOUT ───────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await auth.logout(); // backend clears httpOnly cookies
    } catch {
      // Ignore — still clear local state
    }
    setState({ user: null, loading: false, error: null });
    window.location.href = "/login";
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
