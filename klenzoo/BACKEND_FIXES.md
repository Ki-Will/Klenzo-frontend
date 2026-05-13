# Klenzo Backend Integration Audit

This document provides a comprehensive audit of the Klenzo application architecture and API interactions. It lists all API endpoints, their expected data structures, and outstanding technical tasks required to finalize the backend-frontend integration.

## 1. API Endpoints

### Authentication & Users
| Method | Endpoint | Payload | Returns | Description |
|---|---|---|---|---|
| `POST` | `/auth/register` | `{ email, password }` | `{ message: string }` | Register a new user |
| `POST` | `/auth/login` | `{ email, password }` | `{ accessToken?, refreshToken?, message? }` | Login user |
| `POST` | `/auth/refresh` | None | `{ accessToken: string }` | Refresh JWT access token |
| `POST` | `/auth/forgot-password` | `{ email }` | `{ message: string }` | Request password reset |
| `POST` | `/auth/reset-password` | `{ token, password }` | `{ message: string }` | Reset password |
| `GET`  | `/auth/profile` | None | `UserProfile` | Get current user's profile |
| `POST` | `/auth/profile` | `{ name?, phone? }` | `UserProfile` | Update current user's profile |
| `POST` | `/auth/logout` | None | `{ success: boolean }` | Logout user |
| `GET`  | `/auth/sessions` | None | `Session[]` | Get active user sessions |
| `POST` | `/auth/sessions/:id/revoke`| None | `{ success: boolean }` | Revoke a specific session |

### Finance & Transactions
| Method | Endpoint | Payload | Returns | Description |
|---|---|---|---|---|
| `GET`  | `/finance/transactions` | None | `Transaction[]` | Get all transactions |
| `POST` | `/finance/transactions` | `CreateTransactionDto` | `Transaction` | Create a new transaction |
| `DELETE`| `/finance/transactions/:id` | None | `void` | Delete a transaction |
| `POST` | `/finance/transactions/:id/approve` | None | `Transaction` | Approve a pending split transaction |
| `GET`  | `/finance/analytics/summary`| None | `AnalyticsSummary` | Get spending summary |
| `GET`  | `/finance/analytics/categories`| None | `CategorySplit[]` | Get category breakdown |
| `GET`  | `/finance/accounts` | None | `unknown[]` | Get linked accounts |

### Finance Groups
| Method | Endpoint | Payload | Returns | Description |
|---|---|---|---|---|
| `GET`  | `/finance/groups` | None | `Group[]` | Get user's groups |
| `GET`  | `/finance/groups/:id` | None | `Group` | Get specific group details |
| `POST` | `/finance/groups` | `{ name: string }` | `Group` | Create a new group |
| `POST` | `/finance/groups/:id/members` | `{ email: string }` | `Group` | Add a member to a group |
| `GET`  | `/finance/groups/:id/balances`| None | `GroupBalance[]` | Get balances between members |
| `POST` | `/finance/groups/:id/settle` | `{ fromUserId, toUserId, amount }` | `{ success: boolean }` | Settle a balance |

### Habits
| Method | Endpoint | Payload | Returns | Description |
|---|---|---|---|---|
| `GET`  | `/habits` | None | `Habit[]` | Get user's habits |
| `POST` | `/habits` | `CreateHabitDto` | `Habit` | Create a new habit |
| `POST` | `/habits/:id/complete`| None | `Habit` | Mark habit as complete |
| `PATCH`| `/habits/:id` | `Partial<CreateHabitDto>`| `Habit` | Update habit details |
| `DELETE`| `/habits/:id`| None | `void` | Delete a habit |

### Productivity (Tasks)
| Method | Endpoint | Payload | Returns | Description |
|---|---|---|---|---|
| `GET`  | `/productivity/tasks` | None | `Task[]` | Get user's tasks |
| `POST` | `/productivity/tasks` | `CreateTaskDto` | `Task` | Create a new task |
| `PATCH`| `/productivity/tasks/:id` | `UpdateTaskDto` | `Task` | Update a task |
| `DELETE`| `/productivity/tasks/:id` | None | `void` | Delete a task |

### Notifications
| Method | Endpoint | Payload | Returns | Description |
|---|---|---|---|---|
| `GET`  | `/notifications` | None | `Notification[]` | Get notifications |
| `POST` | `/notifications/:id/read` | None | `void` | Mark specific notification read |
| `POST` | `/notifications/read-all` | None | `void` | Mark all read |
| `POST` | `/notifications/:id/dismiss`| None | `void` | Dismiss a notification |

### Insights & Banners
| Method | Endpoint | Payload | Returns | Description |
|---|---|---|---|---|
| `GET`  | `/insights/dashboard` | None | `DashboardInsight[]`| Get dashboard insights |
| `GET`  | `/insights/finance/trends`| None | `unknown` | Finance trends data |
| `GET`  | `/insights/productivity/trends`| None | `unknown`| Productivity trends |
| `GET`  | `/banners/active` | None | `Banner[]` | Get active system banners |

### Admin
| Method | Endpoint | Payload | Returns | Description |
|---|---|---|---|---|
| `GET`  | `/admin/stats` | None | `PlatformStats` | Platform overview stats |
| `GET`  | `/admin/users` | `?page=&limit=&search=` | `{ users: ManageUser[], total }` | Get users list |
| `POST` | `/admin/users/:id/toggle-active`| `{ active: boolean }`| `{ success: boolean }` | Enable/disable user |
| `DELETE`| `/admin/users/:id` | None | `{ success: boolean }` | Delete a user |
| `GET`  | `/admin/admins` | None | `AdminUser[]` | List admins |
| `POST` | `/admin/admins` | `CreateAdminDto` | `AdminUser` | Create new admin |
| `DELETE`| `/admin/admins/:id`| None | `{ success: boolean }` | Remove an admin |
| `POST` | `/admin/broadcast`| `BroadcastDto` | `Banner` | Create system broadcast |
| `GET`  | `/admin/broadcast`| None | `Banner[]` | List broadcasts |
| `DELETE`| `/admin/broadcast/:id`| None | `{ success: boolean }` | Delete a broadcast |

---

## 2. Expected Data Structures

### Core Models
- **`UserProfile`**: `{ id: number, email: string, isActive: boolean, lastLogin: string, name?: string, phone?: string, avatar?: string }`
- **`Session`**: `{ id: string, device: string, location?: string, lastSeen: string, isCurrent: boolean }`
- **`Transaction`**: `{ id: number, userId: number, amount: number, description?: string, category?: string, transactionType: "expense" | "income", date: string, createdAt: string, groupId?: string, status?: "pending" | "approved", parentTransactionId?: number }`
- **`Group`**: `{ id: string, name: string, members: GroupMember[], netBalance: number, createdAt: string }`
- **`GroupMember`**: `{ id: number, name: string, email: string, avatar?: string }`
- **`GroupBalance`**: `{ userId: number, name: string, balance: number }`
- **`Habit`**: `{ id: number, name: string, description?: string, frequency: "daily" | "weekly", currentStreak: number, longestStreak: number, lastCompletedDate?: string, createdAt: string }`
- **`Task`**: `{ id: number, title: string, description?: string, status: "todo" | "in_progress" | "done" | "cancelled", dueDate?: string, priority: number, createdAt: string }`
- **`Notification`**: `{ id: number | string, title: string, body: string, type?: string, read: boolean, createdAt: string }`
- **`Banner`**: `{ id: number | string, title?: string, message: string, color: string, active: boolean, dismissible: boolean, link?: string, linkText?: string, startDate?: string, endDate?: string, isGlobal?: boolean }`

### DTOs (Data Transfer Objects)
- **`CreateTransactionDto`**: `{ userId, amount, description?, category?, transactionType, date, groupId?, status?, parentTransactionId? }`
- **`CreateHabitDto`**: `{ name, description?, frequency }`
- **`CreateTaskDto`**: `{ title, description?, status, priority, dueDate? }`
- **`UpdateTaskDto`**: `Partial<CreateTaskDto>`

---

## 3. Outstanding Technical Tasks (Backend Integration Fixes)

This section outlines all known issues, missing endpoints, and data inconsistencies observed from the frontend integration (`src/lib/api.ts`). Currently, the frontend is forced to use mocked responses or silent fallbacks for several of these endpoints.

### 3.1 Missing or Broken Auth Endpoints
The frontend falls back to mock objects or ignores errors because these endpoints either 404 or fail:

- **`GET /api/auth/profile`**
  - **Issue:** Fails or returns 401 right after login.
  - **Action:** Ensure this endpoint exists and reliably returns the `UserProfile` format (`id, email, name, isActive, lastLogin, phone, avatar`).
- **`POST /api/auth/logout`**
  - **Issue:** Currently missing or throwing errors.
  - **Action:** Needs to properly clear the `kz_at` and `kz_rt` cookies and invalidate the session.
- **`GET /api/auth/sessions`**
  - **Issue:** Missing.
  - **Action:** Implement to return `Session[]` so users can see their active devices.
- **`POST /api/auth/sessions/:id/revoke`**
  - **Issue:** Missing.
  - **Action:** Implement session invalidation.

### 3.2 Finance & Groups - Mocked Endpoints
Currently, most group operations are mocked entirely in memory on the frontend because the backend endpoints are missing or incomplete.

- **`POST /api/finance/groups`**
  - **Issue:** The frontend is mocking group creation with IDs like `"mock-1"`.
  - **Action:** Implement to create a real group, generate a server-side UUID or ID, and return the `Group` object.
- **`GET /api/finance/groups` & `GET /api/finance/groups/:id`**
  - **Issue:** Fails and falls back to mock groups.
  - **Action:** Implement database retrieval for groups.
- **`POST /api/finance/groups/:id/members`**
  - **Issue:** Fails and falls back to manually pushing to the frontend mock array.
  - **Action:** Implement adding members via email to an existing group.
- **`GET /api/finance/groups/:id/balances`**
  - **Issue:** Unstable response shape (sometimes `{ balances: [...] }`, sometimes an array `[...]`) and falls back to mocks.
  - **Action:** Ensure consistent return of `GroupBalance[]` array.
- **`POST /api/finance/groups/:id/settle`**
  - **Issue:** Falls back to `{ success: true }`.
  - **Action:** Implement balance settlement logic in the backend database.
- **`POST /api/finance/transactions/:id/approve`**
  - **Issue:** Missing endpoint.
  - **Action:** Required for members to approve split expenses created by others. Should update the transaction `status` to `"approved"` and update group balances.
- **`POST /api/finance/transactions`**
  - **Issue:** Does not process `groupId`, `status`, or `parentTransactionId`.
  - **Action:** Backend needs to handle creating group-associated transactions and automatically setting `status: "pending"` for splits involving other users.

### 3.3 Data Type Inconsistencies

- **String instead of Number for Amounts**
  - **Issue:** `GET /api/finance/transactions` (and occasionally group balances) returns `amount` as a string (`"84.20"` instead of `84.20`).
  - **Action:** Update backend serialization to ensure numeric currency fields are returned as JSON Numbers.

### 3.4 Banner Normalization
- **`GET /api/banners/active`**
  - **Issue:** Backend sends a format that doesn't perfectly align with the frontend's `Banner` type (e.g., missing default `active` flags, different color hex vs semantic naming).
  - **Action:** Align the backend's response model to precisely match the frontend's expected properties if possible, or maintain the frontend normalizer function.
