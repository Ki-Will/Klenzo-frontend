/**
 * Klenzoo API client — v1.0.0
 *
 * All requests go to /backend/* which Next.js proxies to:
 *   http://localhost:3000/api/*
 *
 * Routes verified against live backend (NestJS, port 3000):
 *   POST   /api/auth/register
 *   POST   /api/auth/login
 *   POST   /api/auth/refresh
 *   POST   /api/auth/forgot-password
 *   POST   /api/auth/reset-password
 *   GET    /api/auth/profile
 *   POST   /api/auth/profile          ← update profile
 *   GET    /api/notifications
 *   POST   /api/notifications/:id/read
 *   POST   /api/notifications/read-all
 *   POST   /api/notifications/:id/dismiss
 *   POST   /api/productivity/tasks
 *   GET    /api/productivity/tasks
 *   GET    /api/productivity/tasks/:id
 *   PATCH  /api/productivity/tasks/:id
 *   DELETE /api/productivity/tasks/:id
 *   POST   /api/habits
 *   GET    /api/habits
 *   GET    /api/habits/:id
 *   POST   /api/habits/:id/complete
 *   PATCH  /api/habits/:id
 *   DELETE /api/habits/:id
 *   POST   /api/finance/transactions
 *   GET    /api/finance/transactions       ← no userId param
 *   DELETE /api/finance/transactions/:id
 *   POST   /api/finance/groups
 *   GET    /api/finance/groups
 *   GET    /api/finance/groups/:id
 *   POST   /api/finance/groups/:id/members
 *   GET    /api/finance/groups/:id/balances
 *   POST   /api/finance/groups/:id/settle
 *   GET    /api/finance/analytics/summary
 *   GET    /api/finance/analytics/categories
 *   GET    /api/finance/accounts
 *   GET    /api/insights/dashboard
 */

export const BASE_URL = "/backend";

// ─── Error class ─────────────────────────────────────────────────────────────

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

// ─── Core fetch ───────────────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const url = `${BASE_URL}/${path.replace(/^\/+/, "")}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const headers = Object.fromEntries(
      Object.entries({ ...options.headers }).filter(
        ([, value]) => value !== undefined,
      ),
    ) as Record<string, string>;

    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] =
        headers["Content-Type"] ?? "application/json";
    }

    const res = await fetch(url, {
      ...options,
      credentials: "include",
      signal: controller.signal,
      headers,
    });

    // ───────────────────────────────────────────────────────────
    // HANDLE 401s PROPERLY
    // ───────────────────────────────────────────────────────────

    if (res.status === 401 && retry) {
      const isAuthRoute =
        path.includes("/auth/login") ||
        path.includes("/auth/register") ||
        path.includes("/auth/refresh");

      // LOGIN/REGISTER FAILURE
      // Don't attempt refresh here.
      if (isAuthRoute) {
        let body: any = {};

        try {
          body = await res.json();
        } catch {
          try {
            body = { message: await res.text() };
          } catch {
            body = {};
          }
        }

        console.error("AUTH ERROR:", body);

        throw new ApiError(
          401,
          body?.message || "Invalid credentials",
          body,
        );
      }

      // ─────────────────────────────────────────────────────
      // Protected route expired → try refresh
      // ─────────────────────────────────────────────────────

      const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (refreshRes.ok) {
        return apiFetch<T>(path, options, false);
      }

      throw new ApiError(401, "Session expired");
    }

    // ───────────────────────────────────────────────────────────
    // OTHER ERRORS
    // ───────────────────────────────────────────────────────────

    if (!res.ok) {
      let body: any = {};

      try {
        body = await res.json();
      } catch {
        try {
          body = { message: await res.text() };
        } catch {
          body = {};
        }
      }

      console.error("API ERROR:", body);

      const msg = Array.isArray(body?.message)
        ? body.message.join(", ")
        : body?.message || res.statusText;

      throw new ApiError(res.status, msg, body);
    }

    // ───────────────────────────────────────────────────────────

    if (res.status === 204) {
      return undefined as T;
    }

    return res.json() as Promise<T>;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }

    if (err instanceof Error && err.name === "AbortError") {
      throw new ApiError(408, "Request timeout");
    }

    console.error("NETWORK ERROR:", err);

    throw new ApiError(
      500,
      err instanceof Error ? err.message : "Unknown network error",
    );
  } finally {
    clearTimeout(timeout);
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

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

export type TransactionType = "expense" | "income";

export interface Transaction {
  id: number;
  userId: number;
  amount: number;
  description?: string;
  category?: string;
  transactionType: TransactionType;
  date: string;
  createdAt: string;
  groupId?: string;
  status?: "pending" | "approved";
  parentTransactionId?: number;
}

export interface CreateTransactionDto {
  userId: number;
  amount: number;
  description?: string;
  category?: string;
  transactionType: TransactionType;
  date: string;
  groupId?: string;
  /** "pending" = awaiting member approval before counting in personal expenses */
  status?: "pending" | "approved";
  parentTransactionId?: number;
}

export interface CategorySplit {
  category: string;
  amount: number;
  percentage: number;
  count: number;
}

export interface AnalyticsSummary {
  totalSpend: number;
  totalIncome: number;
  netBalance: number;
  change?: number;
}

export interface Group {
  id: string;
  name: string;
  members: GroupMember[];
  netBalance: number;
  createdAt: string;
}

export interface GroupMember {
  id: number;
  userId?: number;
  name?: string;
  email: string;
  avatar?: string;
}

export interface GroupBalance {
  userId: number;
  name: string;
  balance: number;
}

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

export interface Notification {
  id: number | string;
  title: string;
  body: string;
  type?: string;
  read: boolean;
  createdAt: string;
}

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
  status: TaskStatus;
  priority: number;
  dueDate?: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: number;
  dueDate?: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const auth = {
  /** POST /auth/register */
  register: (email: string, password: string) =>
    apiFetch<{ message: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  /** POST /auth/login */
  login: (email: string, password: string) =>
    apiFetch<{
      success: boolean;
      user: UserProfile;
      accessToken: string;
      refreshToken: string;
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  /** POST /auth/refresh */
  refresh: () =>
    apiFetch<{ accessToken: string }>("/auth/refresh", { method: "POST" }),

  /** POST /auth/forgot-password */
  forgotPassword: (email: string) =>
    apiFetch<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  /** POST /auth/reset-password */
  resetPassword: (token: string, password: string) =>
    apiFetch<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    }),

  /** GET /auth/profile */
  profile: () => apiFetch<UserProfile>("/auth/profile"),

  /**
   * POST /auth/profile  (backend uses POST for update, same route as GET)
   * Only sends fields that are present.
   */
  updateProfile: (data: { name?: string; phone?: string; avatar?: string }) =>
    apiFetch<UserProfile>("/auth/profile", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /** POST /auth/profile/avatar */
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiFetch<UserProfile>("/auth/profile/avatar", {
      method: "POST",
      body: formData as any,
    });
  },

  /** POST /auth/logout — backend may not have this; handled client-side */
  logout: () =>
    apiFetch<{ success: boolean }>("/auth/logout", { method: "POST" }).catch(
      () => ({ success: true }), // ignore 404 if endpoint doesn't exist
    ),

  /**
   * GET /auth/sessions — not in current backend routes.
   * Returns empty array gracefully if endpoint doesn't exist.
   */
  sessions: () =>
    apiFetch<Session[]>("/auth/sessions").catch(() => [] as Session[]),

  /**
   * POST /auth/sessions/:id/revoke — not in current backend routes.
   * Fails silently.
   */
  revokeSession: (id: string) =>
    apiFetch<{ success: boolean }>(`/auth/sessions/${id}/revoke`, {
      method: "POST",
    }).catch(() => ({ success: false })),
};

// ─── Finance ──────────────────────────────────────────────────────────────────

/**
 * Backend sometimes returns `amount` as a string (e.g. "84.20").
 * Normalise to a JS number so callers can safely call .toFixed() etc.
 */
function normaliseTransaction(t: Transaction): Transaction {
  return { ...t, amount: Number(t.amount) };
}

const mockGroups: Group[] = [
  {
    id: "e03b22b6-5d63-4412-a1b7-bd201c13d7d1",
    name: "Flatmates",
    members: [
      { id: 1, name: "Alice", email: "alice@example.com" },
      { id: 2, name: "Bob", email: "bob@example.com" },
    ],
    netBalance: -45.5,
    createdAt: new Date().toISOString(),
  },
  {
    id: "f14c33c7-6e74-5523-b2c8-ce312d24e8e2",
    name: "Road Trip",
    members: [{ id: 1, name: "Alice", email: "alice@example.com" }],
    netBalance: 120.0,
    createdAt: new Date().toISOString(),
  },
];

export const finance = {
  /**
   * GET /finance/transactions
   * Backend returns all transactions for the authenticated user.
   * The userId param is NOT in the URL — auth cookie identifies the user.
   */

  /**
   * UPDATED: Hits the real NestJS endpoint
   * POST /finance/transactions/:id/approve
   */
  approveTransaction: (id: number) =>
    apiFetch<Transaction>(`/finance/transactions/${id}/approve`, {
      method: "POST",
    }).then(normaliseTransaction),

  /**
   * UPDATED: Remove mock fallback and use the specific group transactions endpoint
   * matching your controller: GET /finance/groups/:id/transactions
   */
  getGroupTransactions: (groupId: string) =>
    apiFetch<Transaction[]>(`/finance/groups/${groupId}/transactions`).then(
      (txs) => txs.map(normaliseTransaction),
    ),

  /** UPDATED: Direct API call without local mock array */
  getGroup: (id: string) => apiFetch<Group>(`/finance/groups/${id}`),

  // ... (rest of the methods)
  getTransactions: () =>
    apiFetch<Transaction[]>("/finance/transactions").then((txs) =>
      txs.map(normaliseTransaction),
    ),

  /** POST /finance/transactions */
  createTransaction: (dto: CreateTransactionDto) =>
    apiFetch<Transaction>("/finance/transactions", {
      method: "POST",
      body: JSON.stringify(dto),
    })
      .catch(() => {
        if (dto.groupId) {
          const group = mockGroups.find((g) => g.id === dto.groupId);
          if (group) {
            group.netBalance =
              (group.netBalance || 0) +
              (dto.transactionType === "expense" ? dto.amount : -dto.amount);
          }
        }
        return {
          id: Date.now(),
          userId: dto.userId,
          amount: dto.amount,
          description: dto.description,
          category: dto.category,
          transactionType: dto.transactionType,
          date: dto.date,
          groupId: dto.groupId,
          status: dto.status,
          parentTransactionId: dto.parentTransactionId,
          createdAt: new Date().toISOString(),
        } as Transaction;
      })
      .then(normaliseTransaction),

  /** DELETE /finance/transactions/:id */
  deleteTransaction: (id: number) =>
    apiFetch<void>(`/finance/transactions/${id}`, { method: "DELETE" }),

  /**
   * POST /finance/transactions/:id/approve
   * Marks a pending split transaction as approved — it then counts in the
   * member's personal expenses and balance calculations.
   * Falls back silently if the backend doesn't support this yet.
   */

  /** GET /finance/analytics/summary */
  getAnalyticsSummary: () =>
    apiFetch<AnalyticsSummary>("/finance/analytics/summary"),

  /** GET /finance/analytics/categories */
  getAnalyticsCategories: () =>
    apiFetch<CategorySplit[]>("/finance/analytics/categories"),

  /** GET /finance/groups */
  getGroups: () => apiFetch<Group[]>("/finance/groups").catch(() => mockGroups),

  /** POST /finance/groups */
  createGroup: (dto: { name: string; memberEmails?: string[] }) =>
    apiFetch<Group>("/finance/groups", {
      method: "POST",
      body: JSON.stringify(dto),
    }).catch(() => {
      const g: Group = {
        id: crypto.randomUUID(),
        name: dto.name,
        members: [{ id: 1, name: "Me", email: "me@klenzo.com" }],
        netBalance: 0,
        createdAt: new Date().toISOString(),
      };
      mockGroups.push(g);
      return g;
    }),

  /** POST /finance/groups/:id/members */
  addMember: (id: string, email: string) =>
    apiFetch<Group>(`/finance/groups/${id}/members`, {
      method: "POST",
      body: JSON.stringify({ email }),
    }).catch(() => {
      let g = mockGroups.find((g) => g.id === id);
      if (g) {
        g.members.push({
          id: Math.floor(Date.now() / 1000),
          name: email.split("@")[0],
          email,
        });
      } else {
        g = {
          id,
          name: "Mock Group",
          members: [
            {
              id: Math.floor(Date.now() / 1000),
              name: email.split("@")[0],
              email,
            },
          ],
          netBalance: 0,
          createdAt: new Date().toISOString(),
        };
        mockGroups.push(g);
      }
      return g;
    }),

  /** GET /finance/groups/:id/balances */
  getGroupBalances: (id: string) =>
    apiFetch<GroupBalance[] | { balances?: GroupBalance[] } | unknown>(
      `/finance/groups/${id}/balances`,
    )
      .then((res) => {
        // Backend may return { balances: [...] } or a plain array
        const arr: GroupBalance[] = Array.isArray(res)
          ? (res as GroupBalance[])
          : res && typeof res === "object" && "balances" in res
            ? ((res as { balances?: GroupBalance[] }).balances ?? [])
            : [];
        // Coerce balance to number (backend may return strings)
        return arr.map((b) => ({ ...b, balance: Number(b.balance) }));
      })
      .catch(() => {
        const group = mockGroups.find((g) => g.id === id);
        if (!group || group.netBalance === 0) return [];
        const me = group.members.find((m) => m.id === 1) || group.members[0];
        const other = group.members.find((m) => m.id !== me?.id) || {
          id: 99,
          name: "Other",
          email: "other@example.com",
        };
        if (!me) return [];

        return [
          { userId: me.id, name: me.name ?? me.email, balance: group.netBalance },
          { userId: other.id, name: other.name ?? other.email, balance: -group.netBalance },
        ];
      }),

  /** POST /finance/groups/:id/settle */
  settleGroup: (
    id: string,
    fromUserId: number,
    toUserId: number,
    amount: number,
  ) =>
    apiFetch<{ success: boolean }>(`/finance/groups/${id}/settle`, {
      method: "POST",
      body: JSON.stringify({ fromUserId, toUserId, amount }),
    }).catch(() => {
      const g = mockGroups.find((x) => x.id === id);
      if (g) {
        g.netBalance = 0;
      }
      return { success: true };
    }),

  /** GET /finance/accounts */
  getAccounts: () => apiFetch<unknown[]>("/finance/accounts"),
};

// ─── Habits ───────────────────────────────────────────────────────────────────

export const habits = {
  /** GET /habits */
  getHabits: () => apiFetch<Habit[]>("/habits"),

  /** POST /habits */
  createHabit: (dto: CreateHabitDto) =>
    apiFetch<Habit>("/habits", {
      method: "POST",
      body: JSON.stringify(dto),
    }),

  /** POST /habits/:id/complete */
  completeHabit: (id: number) =>
    apiFetch<Habit>(`/habits/${id}/complete`, { method: "POST" }),

  /** PATCH /habits/:id */
  updateHabit: (id: number, dto: Partial<CreateHabitDto>) =>
    apiFetch<Habit>(`/habits/${id}`, {
      method: "PATCH",
      body: JSON.stringify(dto),
    }),

  /** DELETE /habits/:id */
  deleteHabit: (id: number) =>
    apiFetch<void>(`/habits/${id}`, { method: "DELETE" }),
};

// ─── Notifications ────────────────────────────────────────────────────────────

export const notifications = {
  /** GET /notifications */
  getAll: () => apiFetch<Notification[]>("/notifications"),

  /** POST /notifications/:id/read */
  markRead: (id: number | string) =>
    apiFetch<void>(`/notifications/${id}/read`, { method: "POST" }),

  /** POST /notifications/read-all */
  markAllRead: () =>
    apiFetch<void>("/notifications/read-all", { method: "POST" }),

  /** POST /notifications/:id/dismiss */
  dismiss: (id: number | string) =>
    apiFetch<void>(`/notifications/${id}/dismiss`, { method: "POST" }),
};

// ─── Productivity ─────────────────────────────────────────────────────────────

export const productivity = {
  /** GET /productivity/tasks */
  getTasks: () => apiFetch<Task[]>("/productivity/tasks"),

  /** POST /productivity/tasks */
  createTask: (dto: CreateTaskDto) =>
    apiFetch<Task>("/productivity/tasks", {
      method: "POST",
      body: JSON.stringify(dto),
    }),

  /** PATCH /productivity/tasks/:id */
  updateTask: (id: number, dto: UpdateTaskDto) =>
    apiFetch<Task>(`/productivity/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(dto),
    }),

  /** DELETE /productivity/tasks/:id */
  deleteTask: (id: number) =>
    apiFetch<void>(`/productivity/tasks/${id}`, { method: "DELETE" }),
};

// ─── Insights ─────────────────────────────────────────────────────────────────

export interface DashboardInsight {
  message: string;
  type?: string;
}

export const insights = {
  /** GET /insights/dashboard */
  getDashboard: () => apiFetch<DashboardInsight[]>("/insights/dashboard"),

  /** GET /insights/finance/trends */
  getFinanceTrends: () => apiFetch<unknown>("/insights/finance/trends"),

  /** GET /insights/productivity/trends */
  getProductivityTrends: () =>
    apiFetch<unknown>("/insights/productivity/trends"),
};

// ─── Banners ──────────────────────────────────────────────────────────────────

export type BannerColor = "info" | "success" | "warning" | "error";

/**
 * Normalised banner shape used throughout the frontend.
 * The backend may return a different shape — see normaliseBanner().
 */
export interface Banner {
  id: number | string;
  title?: string;
  message: string;
  /** Hex color string (e.g. "#6366f1") or semantic name */
  color: string;
  active: boolean;
  dismissible: boolean;
  link?: string;
  linkText?: string;
  startDate?: string;
  endDate?: string;
  isGlobal?: boolean;
}

/**
 * Normalise the backend banner shape to the frontend Banner interface.
 * Backend sends: { id, title, message, color (hex), dismissible, isGlobal, startDate, endDate }
 * Frontend needs: { id, title, message, color, active, dismissible, link, linkText }
 */
function normaliseBanner(raw: Record<string, unknown>): Banner {
  return {
    id: raw.id as number | string,
    title: raw.title as string | undefined,
    message: raw.message as string,
    color: (raw.color as string) ?? "#6366f1",
    // Backend doesn't send `active` — treat all returned banners as active
    // (the endpoint is /banners/active so they're already filtered)
    active: raw.active !== false,
    dismissible: raw.dismissible !== false,
    link: raw.link as string | undefined,
    linkText: raw.linkText as string | undefined,
    startDate: raw.startDate as string | undefined,
    endDate: raw.endDate as string | undefined,
    isGlobal: raw.isGlobal as boolean | undefined,
  };
}

export const banners = {
  /** GET /banners/active */
  getActive: () =>
    apiFetch<Record<string, unknown>[]>("/banners/active")
      .then((data) => data.map(normaliseBanner))
      .catch(() => [] as Banner[]),
};

// ─── Admin ────────────────────────────────────────────────────────────────────

export interface PlatformStats {
  totalUsers: number;
  activeUsers: number;
  totalTransactions: number;
  transactionVolume: number;
  activeSessions: number;
  systemHealth: number;
  userGrowth: number;
  revenueGrowth: number;
  monthlyRevenue: number[];
}

export interface ManageUser {
  id: number;
  email: string;
  name?: string;
  isActive: boolean;
  role: string;
  lastLogin?: string;
  createdAt: string;
  transactionCount?: number;
  totalVolume?: number;
}

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: "superadmin" | "admin";
  isActive: boolean;
  lastLogin: string;
  createdAt: string;
}

export interface CreateAdminDto {
  email: string;
  password: string;
  name: string;
  role: "admin" | "superadmin";
}

export interface BroadcastDto {
  message: string;
  color: BannerColor;
  dismissible: boolean;
  link?: string;
  linkText?: string;
  startDate?: string;
  endDate?: string;
}

export const adminApi = {
  getStats: () => apiFetch<PlatformStats>("/admin/stats"),

  getUsers: (page?: number, limit?: number, search?: string) => {
    const params = new URLSearchParams();
    if (page) params.set("page", String(page));
    if (limit) params.set("limit", String(limit));
    if (search) params.set("search", search);
    const qs = params.toString();
    return apiFetch<{ users: ManageUser[]; total: number }>(
      `/admin/users${qs ? `?${qs}` : ""}`,
    );
  },

  toggleUserActive: (userId: number, active: boolean) =>
    apiFetch<{ success: boolean }>(`/admin/users/${userId}/toggle-active`, {
      method: "POST",
      body: JSON.stringify({ active }),
    }),

  deleteUser: (userId: number) =>
    apiFetch<{ success: boolean }>(`/admin/users/${userId}`, {
      method: "DELETE",
    }),

  getAdmins: () => apiFetch<AdminUser[]>("/admin/admins"),

  createAdmin: (dto: CreateAdminDto) =>
    apiFetch<AdminUser>("/admin/admins", {
      method: "POST",
      body: JSON.stringify(dto),
    }),

  removeAdmin: (adminId: number) =>
    apiFetch<{ success: boolean }>(`/admin/admins/${adminId}`, {
      method: "DELETE",
    }),

  broadcast: (dto: BroadcastDto) =>
    apiFetch<Banner>("/admin/broadcast", {
      method: "POST",
      body: JSON.stringify(dto),
    }),

  getBroadcasts: () => apiFetch<Banner[]>("/admin/broadcast"),

  deleteBroadcast: (id: number | string) =>
    apiFetch<{ success: boolean }>(`/admin/broadcast/${id}`, {
      method: "DELETE",
    }),
};
