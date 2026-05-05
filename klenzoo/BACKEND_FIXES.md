# Backend Fixes Required

This document outlines all known issues observed from the frontend integration, ordered by severity. Fix these to make the Klenzoo frontend work correctly end-to-end.

---

## 🔴 Critical — App is broken without these

### 1. Cookie not set on the frontend origin (login never works)

**Problem:**  
The backend runs on `localhost:3000`. The frontend runs on `localhost:5000`. When the browser calls `POST /backend/auth/login`, Next.js proxies it server-side to `localhost:3000/api/auth/login`. The backend responds with `Set-Cookie: access_token=...` — but this cookie is scoped to the backend origin, not the frontend. The browser never stores it for `localhost:5000`, so every subsequent request from the browser has no cookie, and the middleware always redirects to `/login`.

**Fix:**  
The backend must **not** set a `Domain` attribute on cookies (or set it to the frontend's domain). Since the request arrives via the Next.js proxy, the `Set-Cookie` header is forwarded to the browser as if it came from `localhost:5000`. This works correctly **only if** the cookie has no `Domain` attribute (or `Domain=localhost`) and uses `SameSite=Lax`.

Cookie config the backend must use in development:

```
Set-Cookie: kz_at=<token>; HttpOnly; Path=/; SameSite=Lax; Max-Age=900
Set-Cookie: kz_rt=<token>; HttpOnly; Path=/; SameSite=Lax; Max-Age=604800
```

- No `Domain` attribute — let the browser infer it from the response origin
- No `Secure` flag in development (HTTP only)
- `SameSite=Lax` — not `Strict` (would block the proxy) and not `None` (requires `Secure`)
- `Path=/` for `kz_at` so it's sent on all requests
- Cookie names must be **`kz_at`** and **`kz_rt`** — the middleware (`proxy.ts`) checks for exactly these names

**Currently observed:**  
The login response returns `access_token` in the JSON body but the `Set-Cookie` header is absent or uses the wrong cookie name (`access_token` instead of `kz_at`). The middleware checks `request.cookies.has("access_token") || request.cookies.has("kz_at")` — so either name works, but the cookie must actually be set on the browser.

---

### 2. Login response does not set cookies — only returns tokens in JSON body

**Problem:**  
`POST /api/auth/login` currently returns:
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```
...but does **not** set `Set-Cookie` headers. The frontend relies entirely on httpOnly cookies for auth — it does not store tokens in localStorage or memory.

**Fix:**  
On successful login, set both cookies in the response headers **in addition to** (or instead of) returning them in the body:

```http
HTTP/1.1 200 OK
Set-Cookie: kz_at=eyJ...; HttpOnly; Path=/; SameSite=Lax; Max-Age=900
Set-Cookie: kz_rt=eyJ...; HttpOnly; Path=/; SameSite=Lax; Max-Age=604800
Content-Type: application/json

{ "success": true }
```

The JSON body can still include the tokens for debugging, but the cookies are what the app depends on.

---

### 3. `POST /auth/refresh` must also set a new `kz_at` cookie

**Problem:**  
The refresh endpoint returns `{ "accessToken": "..." }` in the body but doesn't set a new `kz_at` cookie. After a token refresh, the browser still has the old (expired) cookie, so the next request fails again.

**Fix:**  
On successful refresh, set a new `kz_at` cookie with the same attributes as login:

```http
HTTP/1.1 200 OK
Set-Cookie: kz_at=eyJnew...; HttpOnly; Path=/; SameSite=Lax; Max-Age=900
Content-Type: application/json

{ "accessToken": "eyJnew..." }
```

---

### 4. `POST /auth/logout` must clear cookies

**Problem:**  
Logout doesn't clear the `kz_at` / `kz_rt` cookies. After logout, the middleware still sees the old cookie and lets the user through to protected routes.

**Fix:**  
Expire both cookies on logout:

```http
HTTP/1.1 200 OK
Set-Cookie: kz_at=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT
Set-Cookie: kz_rt=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT
Content-Type: application/json

{ "success": true }
```

---

## 🟠 High — Features are broken or missing

### 5. `GET /auth/profile` returns 401 immediately after login

**Problem:**  
Right after `POST /auth/login` sets the cookie, a follow-up `GET /auth/profile` returns 401. This is a race condition — the cookie is set in the `Set-Cookie` response header but the very next request in the same tick doesn't include it yet, or the backend's token validation rejects a freshly-issued token.

**Fix options (pick one):**
- Return the full user profile directly in the login response body so the frontend doesn't need a separate profile call:
  ```json
  {
    "success": true,
    "user": { "id": 1, "email": "...", "name": "...", ... }
  }
  ```
- Or ensure the token issued at login is immediately valid for profile requests (check clock skew, `iat` validation, etc.)

---

### 6. `GET /finance/transactions` — route mismatch

**Problem:**  
The API reference documents the route as `GET /finance/transactions/:userId`, but the frontend calls `GET /finance/transactions` (no userId — the authenticated user is inferred from the cookie). The backend may be returning 404 or an empty array.

**Fix:**  
Support `GET /finance/transactions` without a userId param. Identify the user from the `kz_at` JWT cookie. The userId-in-URL pattern is insecure anyway (any user could request another user's transactions).

---

### 7. `POST /auth/profile` vs `POST /auth/profile/update` — route mismatch

**Problem:**  
The API reference says `POST /auth/profile/update` but the frontend calls `POST /auth/profile`. One of them is wrong.

**Fix:**  
Standardize on `POST /auth/profile` for updates (same path as `GET /auth/profile`, different method). This is the RESTful convention. Update the backend route if it currently uses `/auth/profile/update`.

---

### 8. Missing endpoints the frontend calls

The following endpoints are called by the frontend but may not exist yet:

| Endpoint | Used by |
|---|---|
| `GET /notifications` | Notification polling (every 30s) |
| `POST /notifications/:id/read` | Mark notification read |
| `POST /notifications/read-all` | Mark all read |
| `POST /notifications/:id/dismiss` | Dismiss notification |
| `GET /banners/active` | System banners |
| `GET /insights/dashboard` | Dashboard insights widget |
| `GET /auth/sessions` | Security page |
| `POST /auth/sessions/:id/revoke` | Revoke session |

For endpoints not yet implemented, return an appropriate empty response rather than 404 or 500 — the frontend handles empty arrays gracefully but crashes on unexpected error shapes:

```json
// GET /notifications → 200
[]

// GET /banners/active → 200
[]

// GET /insights/dashboard → 200
[]

// GET /auth/sessions → 200
[]
```

---

## 🟡 Medium — Causes degraded experience

### 9. CORS configuration is too permissive and may conflict with cookies

**Problem:**  
The backend returns `Access-Control-Allow-Origin: *`. This is incompatible with `credentials: "include"` (which the frontend uses for cookie-based auth). Browsers reject credentialed requests when the ACAO header is a wildcard.

**Fix:**  
Set the allowed origin explicitly to the frontend URL:

```
Access-Control-Allow-Origin: http://localhost:5000
Access-Control-Allow-Credentials: true
```

In production, replace with the actual frontend domain. Use an environment variable:

```ts
// NestJS example
app.enableCors({
  origin: process.env.FRONTEND_URL ?? 'http://localhost:5000',
  credentials: true,
});
```

---

### 10. No `GET /finance/analytics/summary` response shape

**Problem:**  
The analytics page calls `GET /finance/analytics/summary` and expects:
```json
{
  "totalSpend": 0,
  "totalIncome": 0,
  "netBalance": 0,
  "change": 0
}
```
If this endpoint returns a different shape or 404, the analytics page will crash.

**Fix:**  
Ensure the endpoint exists and returns at minimum `totalSpend`, `totalIncome`, `netBalance`. The `change` field (month-over-month percentage) is optional but expected — return `0` if not calculated yet.

---

### 11. Rate limiting is too aggressive for development

**Problem:**  
The backend applies rate limits (`X-RateLimit-Limit-short: 10` per second). During development, hot reloads and auth retries can easily hit this, causing 429 errors that look like auth failures.

**Fix:**  
Increase limits in development or add an environment flag to disable rate limiting:

```ts
// Only apply rate limiting in production
if (process.env.NODE_ENV === 'production') {
  app.use(rateLimiter);
}
```

---

## 🟢 Low — Nice to have

### 12. Register should return the user object or auto-login

**Problem:**  
`POST /auth/register` returns `{ "message": "Registration successful" }` with no cookies. The frontend then has to make a separate `POST /auth/login` call. This is two round trips where one would do.

**Fix:**  
Either set auth cookies directly on the register response (auto-login), or return the user profile in the body. This eliminates the register → login → profile three-call sequence that currently causes timing issues.

---

### 13. Consistent error response shape

**Problem:**  
Some endpoints return `{ "message": "..." }` and others return `{ "error": "...", "statusCode": ... }`. The frontend normalizes these but inconsistency makes debugging harder.

**Fix:**  
Standardize all error responses to:
```json
{
  "statusCode": 400,
  "message": "Human-readable description",
  "error": "Bad Request"
}
```
For validation errors, `message` should be an array of strings:
```json
{
  "statusCode": 422,
  "message": ["Email is required", "Password too short"],
  "error": "Unprocessable Entity"
}
```

---

## Summary Table

| # | Issue | Severity | Impact |
|---|---|---|---|
| 1 | Cookie not set on frontend origin | 🔴 Critical | Login never works |
| 2 | Login doesn't set httpOnly cookies | 🔴 Critical | Auth completely broken |
| 3 | Refresh doesn't update `kz_at` cookie | 🔴 Critical | Sessions expire immediately |
| 4 | Logout doesn't clear cookies | 🔴 Critical | Can't log out |
| 5 | Profile 401 right after login | 🟠 High | Broken post-login state |
| 6 | Transactions route mismatch | 🟠 High | Dashboard shows no data |
| 7 | Profile update route mismatch | 🟠 High | Profile edits fail silently |
| 8 | Missing endpoints return 404/500 | 🟠 High | Multiple pages crash |
| 9 | CORS wildcard blocks credentialed requests | 🟡 Medium | Auth fails in some browsers |
| 10 | Analytics summary shape mismatch | 🟡 Medium | Analytics page crashes |
| 11 | Rate limiting too aggressive in dev | 🟡 Medium | Spurious 429 errors |
| 12 | Register requires separate login call | 🟢 Low | Extra round trips, timing bugs |
| 13 | Inconsistent error shapes | 🟢 Low | Harder to debug |
