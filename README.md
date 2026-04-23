# Klenzoo — Premium Finance App

> **"The Intelligent Void"** — A premium, editorial fintech experience for the modern curator.

Built with **Next.js 16**, **TypeScript**, **Tailwind CSS v4**, and the **App Router**. Fully responsive — desktop sidebar + mobile bottom navigation with floating action button.

---

## Tech Stack

### Frontend (this repo)

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Fonts | Manrope (headlines) + Inter (body) via `next/font/google` |
| Icons | Google Material Symbols Outlined |
| Rendering | Static + SSR (App Router) |

### Backend (separate repo)

| Layer | Choice |
|---|---|
| Framework | NestJS v11 (microservices) |
| Database | PostgreSQL (multi-schema: `auth`, `finance`, `productivity`, `habit`, `public`) |
| Messaging | NATS with JetStream |
| Cache | Redis |
| Storage | MinIO (S3-compatible) |
| Mail | Mailpit (dev SMTP) |

---

## Project Structure

```
klenzoo/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout (fonts, metadata, Material Symbols)
│   │   ├── globals.css             # Tailwind v4 @theme tokens (full design system)
│   │   ├── page.tsx                # Root → redirects to /splash
│   │   │
│   │   ├── splash/                 # Splash / loading screen
│   │   ├── login/                  # Login (email + social auth)
│   │   ├── sign-up/                # Sign up (split layout, glassmorphism card)
│   │   ├── onboarding/             # 3-step feature walkthrough
│   │   │
│   │   └── (app)/                  # Authenticated app shell (sidebar + topbar + bottom nav)
│   │       ├── layout.tsx          # Shared app layout
│   │       ├── dashboard/          # Home: balance, chart, insights, transactions
│   │       ├── expenses/
│   │       │   ├── page.tsx        # Transaction list with filters
│   │       │   ├── add/            # Add expense (numpad + category + notes)
│   │       │   └── [id]/           # Expense detail + AI insight
│   │       ├── groups/
│   │       │   ├── page.tsx        # Groups list + net balance
│   │       │   ├── new/            # Create group form
│   │       │   └── [id]/
│   │       │       ├── page.tsx    # Group detail (members + expenses)
│   │       │       └── balance/    # Debt visualization + settle up
│   │       ├── analytics/          # Bar chart, donut chart, monthly variance, AI insights
│   │       ├── settings/           # Profile, security, linked accounts, notifications
│   │       ├── notifications/      # Notification feed (new + earlier)
│   │       ├── profile/            # User profile + editable fields
│   │       ├── security/           # Password, biometrics, sessions, data export
│   │       ├── sms-automation/     # SMS tracking flow visualization
│   │       └── admin/              # Admin dashboard (KPIs, revenue chart, system status)
│   │
│   └── components/
│       ├── SideNav.tsx             # Desktop sidebar (active route highlighting)
│       ├── TopBar.tsx              # Fixed top bar (logo, notifications, profile)
│       └── BottomNav.tsx           # Mobile bottom nav with FAB
```

---

## Implemented Screens

### Auth Flow

| Route | Screen | Description |
|---|---|---|
| `/splash` | Splash Screen | Animated loading screen with CTA |
| `/login` | Login | Email/password + Google/Apple social auth |
| `/sign-up` | Sign Up | Split layout with glassmorphism form card |
| `/onboarding` | Onboarding | 3-step feature walkthrough (SMS, Split Bills, AI) |

### Core App

| Route | Screen | API | Description |
|---|---|---|---|
| `/dashboard` | Dashboard | `GET /finance/transactions/:userId` | Hero balance display, spending velocity SVG chart, AI insight card, recent transactions, vault assets |
| `/expenses` | Expenses | `GET /finance/transactions/:userId` | Searchable transaction list, category filter chips, date-grouped items, insight bento cards |
| `/expenses/add` | Add Expense | `POST /finance/transactions` | Interactive numpad, category grid selector, date picker, notes textarea, gradient CTA |
| `/expenses/[id]` | Expense Detail | `GET /finance/transactions/:userId` | Full transaction info, AI insight, edit/delete actions |
| `/habits` | Habits Tracker | `GET /habits`, `POST /habits/:id/complete`, `POST /habits`, `POST /habits/:id/delete` | Bento grid with featured habit + weekly bar chart, quick toggles, streak tracking, add/complete/delete via live API |
| `/productivity` | Productivity | `GET /productivity/tasks`, `POST /productivity/tasks`, `POST /productivity/tasks/:id/update`, `POST /productivity/tasks/:id/delete` | Kanban board (Todo / In Progress / Done), stats header, activity chart, add/move/delete tasks via live API |
| `/groups` | Groups | — | Net balance card, group cards grid with member avatars, recent activity |
| `/groups/new` | New Group | — | Create group form (name, members, split method) |
| `/groups/[id]` | Group Detail | — | Members grid, shared expense list, settle up CTA |
| `/groups/[id]/balance` | Balance Visualization | — | Debt graph showing who owes whom, settle up flow |
| `/analytics` | Analytics | `GET /finance/transactions/:userId` | Bar chart (spending growth), AI insights card, SVG donut chart (category split), monthly variance table |
| `/settings` | Settings | `GET /auth/profile` | Profile card, security toggles (FaceID/passcode), linked accounts, notification preferences, sign out |
| `/notifications` | Notification Center | — | New + earlier notification feed with icons and timestamps |
| `/profile` | Profile | `GET /auth/profile` | Avatar, membership tier badges, editable personal info fields |
| `/security` | Security | `POST /auth/reset-password` | Password change, biometric toggles, active sessions, data export |
| `/sms-automation` | SMS Automation Flow | — | Step-by-step SMS tracking visualization |
| `/admin` | Admin Dashboard | — | KPI cards, revenue area chart, system status indicators, recent user activity log |

> Routes marked `—` in the API column use mock data. Their backend endpoints are listed in the "Missing Backend Endpoints" section.

---

## Backend API Reference (v1.0.0)

**Base URL:** `http://localhost:3000/api`

All requests that require authentication must include the JWT access token:
```
Authorization: Bearer <access_token>
```

---

### 🔐 Authentication — `/api/auth`

These endpoints are used by `/login`, `/sign-up`, and the token refresh cycle.

| Method | Endpoint | Auth | Screen | Description |
|---|---|---|---|---|
| `POST` | `/auth/register` | No | `/sign-up` | Create a new user account |
| `POST` | `/auth/login` | No | `/login` | Authenticate and receive JWT tokens |
| `POST` | `/auth/refresh` | No | All (token refresh) | Exchange refresh token for a new access token |
| `POST` | `/auth/forgot-password` | No | `/login` | Trigger password reset email |
| `POST` | `/auth/reset-password` | No | `/login` | Reset password using the emailed token |
| `GET` | `/auth/profile` | Yes | `/profile`, `/settings` | Get the currently authenticated user |

#### Register / Login body
```json
{
  "email": "alex@klenzoo.com",
  "password": "min8chars"
}
```

#### Login / Refresh response
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

#### Reset Password body
```json
{
  "token": "uuid-from-email",
  "password": "newPassword123"
}
```

#### `GET /auth/profile` response
```json
{
  "id": 1,
  "email": "alex@klenzoo.com",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

> **Token storage:** Store `accessToken` in memory (or a secure httpOnly cookie). Store `refreshToken` in an httpOnly cookie. Never store either in `localStorage`.

---

### 💰 Finance — `/api/finance`

Used by `/dashboard`, `/expenses`, `/expenses/add`, `/expenses/[id]`, and `/analytics`.

| Method | Endpoint | Auth | Screen | Description |
|---|---|---|---|---|
| `POST` | `/finance/transactions` | Yes | `/expenses/add` | Create a new transaction |
| `GET` | `/finance/transactions/:userId` | Yes | `/expenses`, `/dashboard` | Get all transactions for a user |

#### Create Transaction body
```json
{
  "userId": 1,
  "amount": 124.50,
  "description": "The Gilded Fork",
  "category": "dining",
  "transactionType": "expense",
  "date": "2024-10-24T12:45:00.000Z"
}
```

#### Transaction fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `userId` | `number` | Yes | ID of the authenticated user |
| `amount` | `decimal` | Yes | Always positive; direction set by `transactionType` |
| `description` | `string` | No | Merchant name or note |
| `category` | `string` | No | `dining`, `shopping`, `travel`, `utilities`, `fun`, `other` |
| `transactionType` | `string` | Yes | `income` or `expense` |
| `date` | `string` | Yes | ISO 8601 date string |

#### Get Transactions response
```json
[
  {
    "id": 1,
    "userId": 1,
    "amount": "124.50",
    "description": "The Gilded Fork",
    "category": "dining",
    "transactionType": "expense",
    "date": "2024-10-24T12:45:00.000Z",
    "createdAt": "2024-10-24T12:46:00.000Z"
  }
]
```

> **Dashboard mapping:** Sum all `expense` transactions for "Total Outflow". Sum `income` transactions for balance. Group by `date` for the spending velocity chart. Group by `category` for the analytics donut chart.

---

### ✅ Productivity — `/api/productivity`

Available for future integration. Not currently wired to any screen but the infrastructure is ready.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/productivity/tasks` | Yes | Create a new task |
| `GET` | `/productivity/tasks` | Yes | Get all tasks for the authenticated user |
| `POST` | `/productivity/tasks/:id/update` | Yes | Update an existing task |
| `POST` | `/productivity/tasks/:id/delete` | Yes | Delete a task |

#### Task Schema
```json
{
  "title": "Review monthly budget",
  "description": "Check all categories against targets",
  "status": "todo",
  "dueDate": "2024-11-01T00:00:00.000Z",
  "priority": 1
}
```

| Field | Type | Values |
|---|---|---|
| `status` | `string` | `todo` \| `in_progress` \| `done` \| `cancelled` |
| `priority` | `number` | Default `0`; higher = more urgent |
| `dueDate` | `string` | ISO 8601, optional |

---

### 🔥 Habits — `/api/habits`

Available for future integration. Not currently wired to any screen.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/habits` | Yes | Create a new habit |
| `GET` | `/habits` | Yes | List all habits for the authenticated user |
| `POST` | `/habits/:id/complete` | Yes | Log a completion and update streaks |
| `POST` | `/habits/:id/delete` | Yes | Remove a habit |

#### Habit Schema
```json
{
  "name": "Log daily expenses",
  "description": "Open Klenzoo and review spending",
  "frequency": "daily"
}
```

---

## API Client (`src/lib/api.ts`)

A typed fetch wrapper that handles auth headers, token refresh on 401, and graceful fallback. Import and use directly in any page or component:

```ts
import { habits, productivity, finance, auth } from "@/lib/api";

// Habits
const list   = await habits.getHabits();
const done   = await habits.completeHabit(id);
const newOne = await habits.createHabit({ name, description, frequency });
await habits.deleteHabit(id);

// Productivity
const tasks  = await productivity.getTasks();
const task   = await productivity.createTask({ title, status, priority });
await productivity.updateTask(id, { status: "done" });
await productivity.deleteTask(id);

// Finance
const txns   = await finance.getTransactions(userId);
const tx     = await finance.createTransaction({ userId, amount, transactionType, date });

// Auth
const tokens = await auth.login(email, password);
const me     = await auth.profile();
```

Token storage: `accessToken` in `localStorage` (swap to memory/cookie for production). Automatic refresh via `POST /auth/refresh` on 401.

---



This table shows exactly which API calls each frontend screen needs to make once the mock data is replaced.

| Screen | API Calls Needed |
|---|---|
| `/login` | `POST /auth/login` |
| `/sign-up` | `POST /auth/register` |
| `/dashboard` | `GET /auth/profile`, `GET /finance/transactions/:userId` |
| `/expenses` | `GET /finance/transactions/:userId` |
| `/expenses/add` | `POST /finance/transactions` |
| `/expenses/[id]` | `GET /finance/transactions/:userId` (filter by id client-side, or add `GET /finance/transactions/:userId/:txId` to backend) |
| `/analytics` | `GET /finance/transactions/:userId` (aggregate client-side or add a summary endpoint) |
| `/profile` | `GET /auth/profile` |
| `/settings` | `GET /auth/profile` |
| `/security` | `POST /auth/reset-password`, `POST /auth/forgot-password` |

> **Note:** Groups, notifications, SMS automation, and admin are not yet covered by the current backend API. See the "Missing Endpoints" section below.

---

## Missing Backend Endpoints

The following features are designed in the UI but have no corresponding backend endpoint yet. These need to be added to the NestJS services.

### Groups (social expense splitting)
```
POST   /finance/groups                        Create a group
GET    /finance/groups?userId=:id             List groups for a user
GET    /finance/groups/:id                    Get group detail + members
PATCH  /finance/groups/:id                    Update group name
DELETE /finance/groups/:id                    Delete group
POST   /finance/groups/:id/members            Add member by email
DELETE /finance/groups/:id/members/:userId    Remove member
GET    /finance/groups/:id/balances           Who owes whom
POST   /finance/groups/:id/settle             Record a settlement
POST   /finance/groups/:id/transactions       Add a shared expense to a group
```

### Notifications
```
GET    /notification/list?userId=:id          Paginated notification feed
POST   /notification/:id/read                 Mark one as read
POST   /notification/read-all?userId=:id      Mark all as read
DELETE /notification/:id                      Dismiss
```

> The `notification.*` NATS subject is already defined in the service discovery config — the HTTP gateway layer just needs to be wired up.

### Analytics / Aggregations
```
GET    /finance/analytics/summary?userId=:id&period=monthly|quarterly|yearly
GET    /finance/analytics/categories?userId=:id&from=:date&to=:date
```

These could be computed in the Finance service by aggregating the existing transactions table, avoiding a separate service.

### User Profile Updates
```
PATCH  /auth/profile          { name, phone, avatar }   Update profile fields
DELETE /auth/sessions/:id                               Revoke a session
GET    /auth/sessions                                   List active sessions
```

### SMS Automation
```
POST   /finance/sms/enable    { userId, phoneNumber }   Enable SMS parsing
POST   /finance/sms/parse     { rawSms }                Parse raw SMS → transaction preview
GET    /finance/sms/status?userId=:id                   Check SMS tracking status
```

---

## Infrastructure & Ports

| Service | Port | Notes |
|---|---|---|
| API Gateway (Next.js / NestJS) | `3000` | All `/api/*` requests go here |
| Auth Service | `3001` | Internal only; exposed via gateway |
| Finance Service | `3002` | Internal only; exposed via gateway |
| NATS | `4222` | Messaging bus; `8222` for management UI |
| PostgreSQL | `5432` | Database: `klenzo_db` |
| Redis | `6379` | Session cache, rate limiting |
| MinIO | `9000` | S3-compatible storage (avatars, receipts); `9001` for console |
| Mailpit | `8025` | Dev SMTP web UI (password reset emails) |

### NATS Subject Patterns
Internal microservice communication uses these subjects:
- `auth.*`
- `finance.*`
- `productivity.*`
- `habit.*`
- `notification.*`

### Database Schemas (inside `klenzo_db`)
| Schema | Contains |
|---|---|
| `auth` | Users, sessions, password reset tokens |
| `finance` | Transactions, groups, settlements |
| `productivity` | Tasks, goals |
| `habit` | Habits, completion logs, streaks |
| `public` | Shared/system data |

---

## Environment Variables

Create a `.env.local` file in the `klenzoo/` directory:

```env
# Backend API Gateway
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# JWT — must match the secret used in the NestJS Auth service
NEXTAUTH_SECRET=your-jwt-secret-here
NEXTAUTH_URL=http://localhost:3000

# OAuth (for Google/Apple social login buttons on /login)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
APPLE_CLIENT_ID=
APPLE_CLIENT_SECRET=

# Optional: error tracking / analytics
NEXT_PUBLIC_POSTHOG_KEY=
SENTRY_DSN=
```

---

## Design System

Defined as Tailwind v4 `@theme` tokens in `globals.css`.

### Color Palette (Dark — Klenzoo Obsidian)

| Token | Hex | Usage |
|---|---|---|
| `--color-primary` | `#c3c0ff` | Accent text, icons, highlights |
| `--color-primary-container` | `#4f46e5` | Primary buttons, active states |
| `--color-on-primary-container` | `#dad7ff` | Text on primary buttons |
| `--color-tertiary` | `#ffb695` | Warm accent (icons, labels) |
| `--color-error` | `#ffb4ab` | Debit amounts, error states |
| `--color-surface` | `#131313` | Page background |
| `--color-surface-container-lowest` | `#0e0e0e` | Deepest recessed elements |
| `--color-surface-container-low` | `#1c1b1b` | Cards, list items |
| `--color-surface-container` | `#201f1f` | Mid-level containers |
| `--color-surface-container-high` | `#2a2a2a` | Hover states, elevated cards |
| `--color-surface-container-highest` | `#353534` | Icon backgrounds, chips |
| `--color-on-surface` | `#e5e2e1` | Primary text |
| `--color-on-surface-variant` | `#c7c4d8` | Secondary text, labels |
| `--color-outline-variant` | `#464555` | Ghost borders, dividers |

### Typography
- **Headlines / Display**: Manrope (200–800 weight), tight letter-spacing (`-0.02em`)
- **Body / Labels**: Inter (300–700 weight)
- **Label style**: uppercase + `tracking-widest` for category headers

### Key CSS Utilities
```css
.glass-panel          /* rgba(42,42,42,0.6) + backdrop-blur(40px) */
.luminous-gradient    /* linear-gradient(135deg, #4f46e5 → #c3c0ff) */
.primary-gradient     /* same as luminous-gradient */
.neon-line            /* drop-shadow glow for SVG chart lines */
.glow-line            /* indigo drop-shadow for bar chart highlight */
.no-scrollbar         /* hide scrollbar cross-browser */
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
# → http://localhost:3000

# Build for production
npm run build

# Start production server
npm start

# Lint
npm run lint
```

---

## Route Flow

```
/splash
  └── /login  ←→  /sign-up
        └── /onboarding
              └── /dashboard
                    ├── /expenses
                    │     ├── /expenses/add
                    │     └── /expenses/:id
                    ├── /groups
                    │     ├── /groups/new
                    │     └── /groups/:id
                    │           └── /groups/:id/balance
                    ├── /analytics
                    ├── /settings
                    │     ├── /profile
                    │     └── /security
                    ├── /notifications
                    ├── /sms-automation
                    └── /admin
```

---

## Known Limitations / Next Steps

| Area | Status | What's needed |
|---|---|---|
| Habits & Productivity | ✅ API integrated | Backend must be running at `localhost:3000`; seed data shown as fallback |
| Finance data | Mock data | Wire `/dashboard`, `/expenses`, `/analytics` to `GET /finance/transactions/:userId` |
| Auth | No real auth flow | Implement JWT handling — store `accessToken` in memory, `refreshToken` in httpOnly cookie; add Next.js middleware to protect `(app)` routes |
| Token refresh | Implemented in `api.ts` | Swap `localStorage` for httpOnly cookies in production |
| Charts | Decorative SVG/div placeholders | Replace with Recharts, Chart.js, or Tremor using real transaction data |
| Forms | Uncontrolled inputs (auth pages) | Add React Hook Form + Zod validation on login/sign-up |
| State management | None | Add TanStack Query for server state (caching, refetching, optimistic updates) |
| Real-time | None | Subscribe to NATS `notification.*` events via a WebSocket bridge for live notification badges |
| Groups | UI complete, no backend | Add the group endpoints listed in "Missing Backend Endpoints" to the Finance service |
| Notifications | UI complete, no backend | Wire up the `notification.*` NATS subject to an HTTP endpoint in the gateway |
| Light theme | Design assets exist | `dashboard_light`, `analytics_light`, `expenses_light` designs are in the source folder; tokens are ready in `globals.css` |
| Admin route | Not protected | Add role check in Next.js middleware before deploying |
| SMS parsing | UI complete, no backend | Integrate Twilio (or similar) + an LLM/NLP endpoint in the Finance service |
| Profile updates | Read-only UI | `PATCH /auth/profile` endpoint needs to be added to the Auth service |
