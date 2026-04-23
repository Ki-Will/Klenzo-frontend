/**
 * Klenzoo API client — SSR + Cookie-based (Next.js)
 *
 * - Uses HttpOnly cookies (kz_at, kz_rt)
 * - No localStorage / sessionStorage
 * - Works with Next.js middleware + SSR
 * - Automatic refresh on 401
 */

export const BASE_URL = "/backend/";

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

export class ApiError extends Error {
  statusCode: number;
  raw?: unknown;

  constructor(statusCode: number, message: string, raw?: unknown) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.raw = raw;
  }
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  retry = true
): Promise<T> {
  const url = `${BASE_URL}${path.replace(/^\/+/, "")}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

  try {
    const res = await fetch(url, {
      ...options,
      credentials: "include", // 🔥 REQUIRED for cookies
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
console.log("REQUEST:", url, res.status);
    // 🔁 Try refresh on 401
    if (res.status === 401 && retry) {
      const refreshRes = await fetch(`${BASE_URL}auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (refreshRes.ok) {
        return apiFetch<T>(path, options, false);
      }

      // ❌ hard logout
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }

      throw new ApiError(401, "Session expired");
    }

    // ❌ Handle errors
    if (!res.ok) {
      let body: any = {};
      try {
        body = await res.json();
      } catch {
        body.message = await res.text();
      }

      const message = Array.isArray(body.message)
        ? body.message.join(", ")
        : body.message || res.statusText;

      throw new ApiError(res.status, message, body);
    }

    // ✅ No content
    if (res.status === 204) return undefined as T;

    return res.json() as Promise<T>;
  } catch (err: any) {
    if (err.name === "AbortError") {
      throw new ApiError(408, "Request timeout");
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

// ─── Types (fixed inconsistencies) ────────────────────────────────────────────

export interface AuthResponse { success: boolean; }

export interface UserProfile {
  id: number;
  email: string;
  isActive: boolean;
  lastLogin: string;
  name?: string;
  phone?: string;
  avatar?: string;
}

export interface Session {
  id: string;
  device: string;
  location?: string;
  lastSeen: string;
  isCurrent: boolean;
}

export type TransactionType = "income" | "expense";

export interface Transaction {
  id: number;
  userId: number;
  amount: number; // ✅ FIXED (was string)
  description?: string;
  category?: string;
  transactionType: TransactionType;
  date: string;
  createdAt: string;
}

export interface CreateTransactionDto {
  userId: number;
  amount: number;
  description?: string;
  category?: string;
  transactionType: TransactionType;
  date: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const auth = {
  login: (email: string, password: string) =>
    apiFetch<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (email: string, password: string) =>
    apiFetch<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  profile: () => apiFetch<UserProfile>("/auth/profile"),

  logout: () =>
    apiFetch<{ success: boolean }>("/auth/logout", {
      method: "POST",
    }),

  sessions: () => apiFetch<Session[]>("/auth/sessions"),

  revokeSession: (id: string) =>
    apiFetch<{ success: boolean }>(`/auth/sessions/${id}/revoke`, {
      method: "POST",
    }),
};

// ─── Finance ──────────────────────────────────────────────────────────────────

export const finance = {
  createTransaction: (dto: CreateTransactionDto) =>
    apiFetch<Transaction>("/finance/transactions", {
      method: "POST",
      body: JSON.stringify(dto),
    }),

  getTransactions: (userId: number) =>
    apiFetch<Transaction[]>(`/finance/transactions/${userId}`),

  getAnalyticsSummary: () =>
    apiFetch("/finance/analytics/summary"),

  getAnalyticsCategories: () =>
    apiFetch("/finance/analytics/categories"),
};

// ─── Productivity ─────────────────────────────────────────────────────────────

export const productivity = {
  getTasks: () => apiFetch("/productivity/tasks"),

  createTask: (dto: any) =>
    apiFetch("/productivity/tasks", {
      method: "POST",
      body: JSON.stringify(dto),
    }),

  updateTask: (id: number, dto: any) =>
    apiFetch(`/productivity/tasks/${id}/update`, {
      method: "POST",
      body: JSON.stringify(dto),
    }),

  deleteTask: (id: number) =>
    apiFetch(`/productivity/tasks/${id}/delete`, {
      method: "POST",
    }),
};

// ─── Habits ───────────────────────────────────────────────────────────────────

export const habits = {
  getHabits: () => apiFetch("/habits"),

  createHabit: (dto: any) =>
    apiFetch("/habits", {
      method: "POST",
      body: JSON.stringify(dto),
    }),

  completeHabit: (id: number) =>
    apiFetch(`/habits/${id}/complete`, {
      method: "POST",
    }),

  deleteHabit: (id: number) =>
    apiFetch(`/habits/${id}/delete`, {
      method: "POST",
    }),
};

// ─── Notifications ────────────────────────────────────────────────────────────

export const notifications = {
  getAll: () => apiFetch("/notifications"),

  markRead: (id: number | string) =>
    apiFetch(`/notifications/${id}/read`, {
      method: "POST",
    }),

  dismiss: (id: number | string) =>
    apiFetch(`/notifications/${id}/dismiss`, {
      method: "POST",
    }),

  markAllRead: () =>
    apiFetch("/notifications/read-all", {
      method: "POST",
    }),
};