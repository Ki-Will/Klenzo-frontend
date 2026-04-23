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

  // 🔥 Always try to get user (cookie decides auth, not localStorage)
  const refreshUser = useCallback(async () => {
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
      await auth.login(email, password); // 🍪 cookies set by backend
      const user = await auth.profile();

      setState({ user, loading: false, error: null });
    } catch (err: any) {
      setState({
        user: null,
        loading: false,
        error: err?.message || "Login failed",
      });
      throw err;
    }
  }, []);

  // ─── REGISTER ─────────────────────────────────────────────────────────────
  const register = useCallback(async (email: string, password: string) => {
    setState((s) => ({ ...s, loading: true, error: null }));

    try {
      await auth.register(email, password);
      await auth.login(email, password); // auto login after register
      const user = await auth.profile();

      setState({ user, loading: false, error: null });
    } catch (err: any) {
      setState({
        user: null,
        loading: false,
        error: err?.message || "Registration failed",
      });
      throw err;
    }
  }, []);

  // ─── LOGOUT ───────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await auth.logout(); // 🔥 backend clears cookies
    } catch {
      // ignore errors, still clear state
    }

    setState({ user: null, loading: false, error: null });

    // 🔥 force refresh to clear SSR state
    window.location.href = "/login";
  }, []);

  return (
    <AuthContext.Provider
      value={{ ...state, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}