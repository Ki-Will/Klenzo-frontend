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

  const login = useCallback(async (email: string, password: string) => {
    setState((s) => ({ ...s, loading: true, error: null }));

    try {
      const result = await auth.login(email, password);
      setState({
        user: result.user,
        loading: false,
        error: null,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid credentials";

      setState({
        user: null,
        loading: false,
        error: msg,
      });

      throw new Error(msg);
    }
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    setState((s) => ({ ...s, loading: true, error: null }));

    try {
      await auth.register(email, password);
      const result = await auth.login(email, password);
      setState({ user: result.user, loading: false, error: null });
    } catch (err: unknown) {
      const msg =
        err instanceof Error && err.message !== "Session expired"
          ? err.message
          : "Registration failed. Please try again.";
      setState({ user: null, loading: false, error: msg });
      throw new Error(msg);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await auth.logout();
    } catch {
      // Still clear local state if the backend logout endpoint is unavailable.
    }
    setState({ user: null, loading: false, error: null });
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

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
