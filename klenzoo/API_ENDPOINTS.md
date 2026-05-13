# Klenzo API Endpoints Analysis

This document provides a comprehensive list of the API endpoints used by the Klenzo frontend, along with their expected payloads and returned data types.

## 1. Authentication & Users

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

**Data Models:**
- `UserProfile`: `{ id, email, isActive, lastLogin, name?, phone?, avatar? }`
- `Session`: `{ id, device, location?, lastSeen, isCurrent }`

---

## 2. Finance & Transactions

| Method | Endpoint | Payload | Returns | Description |
|---|---|---|---|---|
| `GET`  | `/finance/transactions` | None | `Transaction[]` | Get all transactions |
| `POST` | `/finance/transactions` | `CreateTransactionDto` | `Transaction` | Create a new transaction |
| `DELETE`| `/finance/transactions/:id` | None | `void` | Delete a transaction |
| `POST` | `/finance/transactions/:id/approve` | None | `Transaction` | Approve a pending split transaction |
| `GET`  | `/finance/analytics/summary`| None | `AnalyticsSummary` | Get spending summary |
| `GET`  | `/finance/analytics/categories`| None | `CategorySplit[]` | Get category breakdown |
| `GET`  | `/finance/accounts` | None | `unknown[]` | Get linked accounts |

**Data Models:**
- `Transaction`: `{ id, userId, amount, description?, category?, transactionType, date, createdAt, groupId?, status?, parentTransactionId? }`
- `CreateTransactionDto`: Same as `Transaction` minus `id`, `createdAt`
- `AnalyticsSummary`: `{ totalSpend, totalIncome, netBalance, change? }`
- `CategorySplit`: `{ category, amount, percentage, count }`

---

## 3. Finance Groups

| Method | Endpoint | Payload | Returns | Description |
|---|---|---|---|---|
| `GET`  | `/finance/groups` | None | `Group[]` | Get user's groups |
| `GET`  | `/finance/groups/:id` | None | `Group` | Get specific group details |
| `POST` | `/finance/groups` | `{ name: string }` | `Group` | Create a new group |
| `POST` | `/finance/groups/:id/members` | `{ email: string }` | `Group` | Add a member to a group |
| `GET`  | `/finance/groups/:id/balances`| None | `GroupBalance[]` | Get balances between members |
| `POST` | `/finance/groups/:id/settle` | `{ fromUserId, toUserId, amount }` | `{ success: boolean }` | Settle a balance |

**Data Models:**
- `Group`: `{ id, name, members: GroupMember[], netBalance, createdAt }`
- `GroupMember`: `{ id, name, email, avatar? }`
- `GroupBalance`: `{ userId, name, balance }`

---

## 4. Habits

| Method | Endpoint | Payload | Returns | Description |
|---|---|---|---|---|
| `GET`  | `/habits` | None | `Habit[]` | Get user's habits |
| `POST` | `/habits` | `CreateHabitDto` | `Habit` | Create a new habit |
| `POST` | `/habits/:id/complete`| None | `Habit` | Mark habit as complete |
| `PATCH`| `/habits/:id` | `Partial<CreateHabitDto>`| `Habit` | Update habit details |
| `DELETE`| `/habits/:id`| None | `void` | Delete a habit |

**Data Models:**
- `Habit`: `{ id, name, description?, frequency, currentStreak, longestStreak, lastCompletedDate?, createdAt }`
- `CreateHabitDto`: `{ name, description?, frequency }`

---

## 5. Productivity (Tasks)

| Method | Endpoint | Payload | Returns | Description |
|---|---|---|---|---|
| `GET`  | `/productivity/tasks` | None | `Task[]` | Get user's tasks |
| `POST` | `/productivity/tasks` | `CreateTaskDto` | `Task` | Create a new task |
| `PATCH`| `/productivity/tasks/:id` | `UpdateTaskDto` | `Task` | Update a task |
| `DELETE`| `/productivity/tasks/:id` | None | `void` | Delete a task |

**Data Models:**
- `Task`: `{ id, title, description?, status, dueDate?, priority, createdAt }`

---

## 6. Notifications

| Method | Endpoint | Payload | Returns | Description |
|---|---|---|---|---|
| `GET`  | `/notifications` | None | `Notification[]` | Get notifications |
| `POST` | `/notifications/:id/read` | None | `void` | Mark specific notification read |
| `POST` | `/notifications/read-all` | None | `void` | Mark all read |
| `POST` | `/notifications/:id/dismiss`| None | `void` | Dismiss a notification |

---

## 7. Insights & Banners

| Method | Endpoint | Payload | Returns | Description |
|---|---|---|---|---|
| `GET`  | `/insights/dashboard` | None | `DashboardInsight[]`| Get dashboard insights |
| `GET`  | `/insights/finance/trends`| None | `unknown` | Finance trends data |
| `GET`  | `/insights/productivity/trends`| None | `unknown`| Productivity trends |
| `GET`  | `/banners/active` | None | `Banner[]` | Get active system banners |

---

## 8. Admin

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
