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

// ─── Types ──────────────────────────────────────────────────────────────────────

export interface AuthResponse {
  accessToken?: string;
  refreshToken?: string;
  message?: string;
  success?: boolean;
}

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

// ─── Finance Types ──────────────────────────────────────────────────────────────

export type TransactionType = "income" | "expense";

export interface Transaction {
  id: number;
  userId: number;
  amount: number;
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

export interface CategorySplit {
  category: string;
  amount: number;
  percentage: number;
  count?: number;
}

export interface GroupMember {
  id: number;
  email: string;
  name?: string;
  avatar?: string;
}

export interface Group {
  id: string | number;
  name: string;
  members: GroupMember[];
  netBalance?: number;
  createdAt?: string;
}

export interface GroupBalance {
  userId: number;
  userOwes: number;
  userIsOwed: number;
  settlements?: Array<{
    fromUserId: number;
    toUserId: number;
    amount: number;
  }>;
}

// ─── Productivity Types ─────────────────────────────────────────────────────────

export type TaskStatus = "todo" | "in_progress" | "done" | "cancelled";

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate?: string;
  priority: number;
  createdAt: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  status?: TaskStatus;
  dueDate?: string;
  priority?: number;
}

// ─── Habit Types ────────────────────────────────────────────────────────────────

export type HabitFrequency = "daily" | "weekly";

export interface Habit {
  id: number;
  name: string;
  description?: string;
  frequency: HabitFrequency;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate?: string;
  createdAt: string;
}

export interface CreateHabitDto {
  name: string;
  description?: string;
  frequency: HabitFrequency;
}

// ─── Notification Types ─────────────────────────────────────────────────────────

export type NotificationType = "group" | "spending" | "security" | "ai" | "warning" | string;

export interface Notification {
  id: number | string;
  title: string;
  body: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  password: string;
}

export interface UpdateProfileDto {
  name?: string;
  phone?: string;
}

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

  refresh: (refreshToken: string) =>
    apiFetch<{ accessToken: string }>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }),

  forgotPassword: (email: string) =>
    apiFetch<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, password: string) =>
    apiFetch<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    }),

  profile: () => apiFetch<UserProfile>("/auth/profile"),

  updateProfile: (dto: UpdateProfileDto) =>
    apiFetch<UserProfile>("/auth/profile/update", {
      method: "POST",
      body: JSON.stringify(dto),
    }),

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

export interface CreateGroupDto {
  name: string;
  description?: string;
}

export interface AddGroupMemberDto {
  email: string;
}

export interface SettleGroupDto {
  fromUserId: number;
  toUserId: number;
  amount: number;
}

export const finance = {
  // Transactions
  createTransaction: (dto: CreateTransactionDto) =>
    apiFetch<Transaction>("/finance/transactions", {
      method: "POST",
      body: JSON.stringify(dto),
    }),

  getTransactions: (userId: number) =>
    apiFetch<Transaction[]>(`/finance/transactions/${userId}`),

  // Groups
  createGroup: (dto: CreateGroupDto) =>
    apiFetch<Group>("/finance/groups", {
      method: "POST",
      body: JSON.stringify(dto),
    }),

  getGroups: () =>
    apiFetch<Group[]>("/finance/groups"),

  getGroup: (id: string | number) =>
    apiFetch<Group>(`/finance/groups/${id}`),

  addGroupMember: (id: string | number, email: string) =>
    apiFetch<Group>(`/finance/groups/${id}/members`, {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  getGroupBalances: (id: string | number) =>
    apiFetch<GroupBalance>(`/finance/groups/${id}/balances`),

  settleGroup: (id: string | number, dto: SettleGroupDto) =>
    apiFetch<{ success: boolean }>(`/finance/groups/${id}/settle`, {
      method: "POST",
      body: JSON.stringify(dto),
    }),

  // Analytics
  getAnalyticsSummary: () =>
    apiFetch("/finance/analytics/summary"),

  getAnalyticsCategories: () =>
    apiFetch<CategorySplit[]>("/finance/analytics/categories"),

  // SMS Automation
  enableSms: () =>
    apiFetch<{ success: boolean }>("/finance/sms/enable", {
      method: "POST",
    }),
};

// ─── Productivity ─────────────────────────────────────────────────────────────

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  dueDate?: string;
  priority?: number;
}

export const productivity = {
  getTasks: () => apiFetch<Task[]>("/productivity/tasks"),

  createTask: (dto: CreateTaskDto) =>
    apiFetch<Task>("/productivity/tasks", {
      method: "POST",
      body: JSON.stringify(dto),
    }),

  updateTask: (id: number, dto: UpdateTaskDto) =>
    apiFetch<Task>(`/productivity/tasks/${id}/update`, {
      method: "POST",
      body: JSON.stringify(dto),
    }),

  deleteTask: (id: number) =>
    apiFetch<{ success: boolean }>(`/productivity/tasks/${id}/delete`, {
      method: "POST",
    }),
};

// ─── Habits ───────────────────────────────────────────────────────────────────

export interface CompleteHabitResponse {
  id: number;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string;
}

export const habits = {
  getHabits: () => apiFetch<Habit[]>("/habits"),

  createHabit: (dto: CreateHabitDto) =>
    apiFetch<Habit>("/habits", {
      method: "POST",
      body: JSON.stringify(dto),
    }),

  completeHabit: (id: number) =>
    apiFetch<CompleteHabitResponse>(`/habits/${id}/complete`, {
      method: "POST",
    }),

  deleteHabit: (id: number) =>
    apiFetch<{ success: boolean }>(`/habits/${id}/delete`, {
      method: "POST",
    }),
};

// ─── Notifications ────────────────────────────────────────────────────────────

export const notifications = {
  getAll: () => apiFetch<Notification[]>("/notifications"),

  markRead: (id: number | string) =>
    apiFetch<{ success: boolean }>(`/notifications/${id}/read`, {
      method: "POST",
    }),

  dismiss: (id: number | string) =>
    apiFetch<{ success: boolean }>(`/notifications/${id}/dismiss`, {
      method: "POST",
    }),

  markAllRead: () =>
    apiFetch<{ success: boolean }>("/notifications/read-all", {
      method: "POST",
    }),
};
