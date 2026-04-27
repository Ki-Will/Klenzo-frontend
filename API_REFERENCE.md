# Klenzo API Reference (v1.0.0)

Comprehensive documentation for all services and endpoints in the Klenzo platform.

## 📡 API Gateway (Base URL: `http://localhost:3000/api`)

All endpoints below a# Klenzo API Reference (v1.0.0)

Comprehensive documentation for all endpoints in the Klenzo platform.

## 📡 Base URL: `http://localhost:3000/api`

All endpoints below are prefixed with `/api`. Global error responses follow the standard format:
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

---

## 🔐 Authentication (`/auth`)

| Endpoint | Method | Auth | Description | Status Codes |
|----------|--------|------|-------------|--------------|
| `/auth/register` | POST | No | Create a new user account | 201, 400 |
| `/auth/login` | POST | No | Authenticate and get JWT tokens | 200, 401 |
| `/auth/refresh` | POST | No | Refresh access token | 200, 401 |
| `/auth/forgot-password` | POST | No | Request password reset email | 200, 404 |
| `/auth/reset-password` | POST | No | Reset password with token | 200, 400 |
| `/auth/profile` | GET | Yes | Get authenticated user data | 200, 401 |
| `/auth/profile` | POST | Yes | Update user profile fields | 200, 400 |

### **POST /auth/register**
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response (201)**:
  ```json
  {
    "message": "User registered",
    "user": { "id": 1, "email": "user@example.com" }
  }
  ```

### **POST /auth/login**
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response (200)**:
  ```json
  {
    "accessToken": "eyJ...",
    "refreshToken": "abcdef..."
  }
  ```

### **POST /auth/refresh**
- **Request Body**: `{ "refreshToken": "string" }`
- **Response (200)**: `{ "accessToken": "eyJ..." }`

### **POST /auth/forgot-password**
- **Request Body**: `{ "email": "string" }`
- **Response (200)**: `{ "message": "Password reset email sent" }`

### **POST /auth/reset-password**
- **Request Body**:
  ```json
  {
    "token": "reset_token_from_email",
    "password": "new_password123"
  }
  ```
- **Response (200)**: `{ "message": "Password has been reset" }`

### **GET /auth/profile**
- **Headers**: `Authorization: Bearer <token>`
- **Response (200)**:
  ```json
  {
    "id": 1,
    "email": "user@example.com",
    "isActive": true,
    "lastLogin": "2024-03-12T..."
  }
  ```

### **POST /auth/profile**
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "avatar": "https://..."
  }
  ```
- **Response (200)**: `{ "message": "Profile updated", "user": { ... } }`

---

## ✅ Productivity (`/productivity/tasks`)

| Endpoint | Method | Auth | Description | Status Codes |
|----------|--------|------|-------------|--------------|
| `/productivity/tasks` | POST | Yes | Create a new task | 201, 400 |
| `/productivity/tasks` | GET | Yes | Get all user tasks | 200 |
| `/productivity/tasks/:id` | GET | Yes | Get a specific task | 200, 404 |
| `/productivity/tasks/:id` | PATCH | Yes | Update a task | 200, 404 |
| `/productivity/tasks/:id` | DELETE | Yes | Delete a task | 200, 404 |

### **POST /productivity/tasks**
- **Request Body**:
  ```json
  {
    "title": "Task Title",
    "description": "Optional description",
    "status": "todo",
    "dueDate": "2024-04-23T...",
    "priority": 1
  }
  ```
- **Response (201)**: `Task Object` (includes `id`, `createdAt`, etc.)

### **GET /productivity/tasks**
- **Response (200)**: `Array of Task Objects`

### **GET /productivity/tasks/:id**
- **URL Parameter**: `id` (Task ID)
- **Response (200)**: `Task Object`

### **PATCH /productivity/tasks/:id**
- **URL Parameter**: `id` (Task ID)
- **Request Body** (all fields optional):
  ```json
  {
    "title": "string",
    "description": "string",
    "status": "todo | in_progress | done | cancelled",
    "dueDate": "iso_date_string",
    "priority": "number"
  }
  ```
- **Response (200)**: `Updated Task Object`

### **DELETE /productivity/tasks/:id**
- **URL Parameter**: `id` (Task ID)
- **Response (200)**: `{ "success": true }`

---

## 🔥 Habits (`/habits`)

| Endpoint | Method | Auth | Description | Status Codes |
|----------|--------|------|-------------|--------------|
| `/habits` | POST | Yes | Create a new habit | 201, 400 |
| `/habits` | GET | Yes | List all user habits | 200 |
| `/habits/:id` | GET | Yes | Get a specific habit | 200, 404 |
| `/habits/:id/stats` | GET | Yes | Get habit statistics | 200, 404 |
| `/habits/:id` | PATCH | Yes | Update a habit | 200, 404 |
| `/habits/:id/complete` | POST | Yes | Log completion | 200, 404 |
| `/habits/:id` | DELETE | Yes | Remove a habit | 200, 404 |

### **POST /habits**
- **Request Body**:
  ```json
  {
    "name": "Exercise",
    "description": "30 mins daily",
    "frequency": "daily"
  }
  ```
- **Response (201)**: `Habit Object` (includes `id`, `currentStreak`, `longestStreak`, etc.)

### **GET /habits**
- **Response (200)**: `Array of Habit Objects`

### **GET /habits/:id**
- **URL Parameter**: `id` (Habit ID)
- **Response (200)**: `Habit Object`

### **GET /habits/:id/stats**
- **URL Parameter**: `id` (Habit ID)
- **Response (200)**:
  ```json
  {
    "id": 1,
    "currentStreak": 5,
    "longestStreak": 10,
    "completionRate": 0.85,
    "totalCompletions": 42
  }
  ```

### **POST /habits/:id/complete**
- **URL Parameter**: `id` (Habit ID)
- **Response (200)**:
  ```json
  {
    "id": 1,
    "currentStreak": 5,
    "longestStreak": 10,
    "lastCompletedDate": "2024-04-23"
  }
  ```

### **PATCH /habits/:id**
- **URL Parameter**: `id` (Habit ID)
- **Request Body** (all fields optional):
  ```json
  {
    "name": "string",
    "description": "string",
    "frequency": "daily | weekly | monthly"
  }
  ```
- **Response (200)**: `Updated Habit Object`

### **DELETE /habits/:id**
- **URL Parameter**: `id` (Habit ID)
- **Response (200)**: `{ "success": true }`

---

## 🔔 Notifications (`/notifications`)

| Endpoint | Method | Auth | Description | Status Codes |
|----------|--------|------|-------------|--------------|
| `/notifications` | GET | Yes | Get notification feed | 200 |
| `/notifications/:id/read` | POST | Yes | Mark one as read | 200, 404 |
| `/notifications/:id/dismiss` | POST | Yes | Dismiss a notification | 200, 404 |
| `/notifications/read-all` | POST | Yes | Mark all as read | 200 |

### **GET /notifications**
- **Response (200)**: `Array of Notification Objects`

### **POST /notifications/:id/read**
- **URL Parameter**: `id` (Notification ID)
- **Response (200)**: `{ "success": true, "notification": { ... } }`

### **POST /notifications/:id/dismiss**
- **URL Parameter**: `id` (Notification ID)
- **Response (200)**: `{ "success": true }`

### **POST /notifications/read-all**
- **Response (200)**: `{ "success": true, "markedCount": 5 }`

---

## 📈 Finance (`/finance`)

| Endpoint | Method | Auth | Description | Status Codes |
|----------|--------|------|-------------|--------------|
| `/finance/transactions` | POST | Yes | Create a new transaction | 201, 400 |
| `/finance/transactions` | GET | Yes | List user's transactions | 200 |
| `/finance/transactions/:id` | DELETE | Yes | Delete a transaction | 200, 404 |
| `/finance/groups` | POST | Yes | Create a new social group | 201, 400 |
| `/finance/groups` | GET | Yes | List user's groups | 200 |
| `/finance/groups/:id` | GET | Yes | Get group details + members | 200, 404 |
| `/finance/groups/:id/members` | POST | Yes | Add member to group by email | 200, 404 |
| `/finance/groups/:id/balances` | GET | Yes | Get "who owes whom" in group | 200, 404 |
| `/finance/groups/:id/settle` | POST | Yes | Record a group settlement | 200, 400 |
| `/finance/budgets` | POST | Yes | Create a budget | 201, 400 |
| `/finance/budgets` | GET | Yes | List user's budgets | 200 |
| `/finance/budgets/:id` | PATCH | Yes | Update a budget | 200, 404 |
| `/finance/budgets/:id` | DELETE | Yes | Delete a budget | 200, 404 |
| `/finance/analytics/summary` | GET | Yes | Get total spending summary | 200 |
| `/finance/analytics/categories` | GET | Yes | Get spending split by categories | 200 |
| `/finance/accounts` | GET | Yes | List user's accounts | 200 |

### **POST /finance/transactions**
- **Request Body**:
  ```json
  {
    "amount": 50.00,
    "description": "Lunch at Cafe",
    "category": "Food",
    "transactionType": "expense",
    "date": "2024-04-23T12:00:00Z",
    "accountId": 1
  }
  ```
- **Response (201)**: `Transaction Object` (includes `id`, `createdAt`, etc.)

### **GET /finance/transactions**
- **Response (200)**: `Array of Transaction Objects`

### **DELETE /finance/transactions/:id**
- **URL Parameter**: `id` (Transaction ID)
- **Response (200)**: `{ "success": true }`

### **POST /finance/groups**
- **Request Body**:
  ```json
  {
    "name": "Roommates",
    "description": "Shared expenses for apartment"
  }
  ```
- **Response (201)**: `Group Object`

### **GET /finance/groups**
- **Response (200)**: `Array of Group Objects`

### **GET /finance/groups/:id**
- **URL Parameter**: `id` (Group ID)
- **Response (200)**: `Group Object with members`

### **POST /finance/groups/:id/members**
- **URL Parameter**: `id` (Group ID)
- **Request Body**: `{ "email": "friend@example.com" }`
- **Response (200)**: `{ "success": true, "member": { ... } }`

### **GET /finance/groups/:id/balances**
- **URL Parameter**: `id` (Group ID)
- **Response (200)**:
  ```json
  {
    "balances": [
      { "userId": 1, "userEmail": "a@example.com", "owed": 50.00 },
      { "userId": 2, "userEmail": "b@example.com", "owed": -50.00 }
    ]
  }
  ```

### **POST /finance/groups/:id/settle**
- **URL Parameter**: `id` (Group ID)
- **Request Body**: `{ "amount": 25.00, "fromUserId": 1, "toUserId": 2 }`
- **Response (200)**: `{ "success": true }`

### **POST /finance/budgets**
- **Request Body**:
  ```json
  {
    "category": "Food",
    "limit": 500.00,
    "period": "monthly",
    "startDate": "2024-04-01"
  }
  ```
- **Response (201)**: `Budget Object`

### **GET /finance/budgets**
- **Response (200)**: `Array of Budget Objects`

### **PATCH /finance/budgets/:id**
- **URL Parameter**: `id` (Budget ID)
- **Request Body** (all fields optional):
  ```json
  {
    "limit": 600.00,
    "category": "Entertainment"
  }
  ```
- **Response (200)**: `Updated Budget Object`

### **DELETE /finance/budgets/:id**
- **URL Parameter**: `id` (Budget ID)
- **Response (200)**: `{ "success": true }`

### **GET /finance/analytics/summary**
- **Response (200)**:
  ```json
  {
    "totalIncome": 5000.00,
    "totalExpenses": 3500.00,
    "netSavings": 1500.00,
    "period": "2024-04"
  }
  ```

### **GET /finance/analytics/categories**
- **Query Parameters**: `?startDate=2024-04-01&endDate=2024-04-30`
- **Response (200)**:
  ```json
  {
    "categories": [
      { "name": "Food", "amount": 800.00, "percentage": 22.8 },
      { "name": "Transport", "amount": 400.00, "percentage": 11.4 }
    ]
  }
  ```

### **GET /finance/accounts**
- **Response (200)**: `Array of Account Objects`

---

## 📊 Insights (`/insights`)

| Endpoint | Method | Auth | Description | Status Codes |
|----------|--------|------|-------------|--------------|
| `/insights/dashboard` | GET | Yes | Get overall dashboard summary | 200 |
| `/insights/productivity/trends` | GET | Yes | Get productivity trends | 200 |
| `/insights/finance/trends` | GET | Yes | Get spending trends | 200 |

### **GET /insights/dashboard**
- **Response (200)**:
  ```json
  {
    "productivity": { "completedTasks": 12, "activeHabits": 3 },
    "finance": { "monthlySpending": 2500.00, "savingsRate": 0.3 },
    "habits": { "currentStreak": 5, "completionRate": 0.85 }
  }
  ```

### **GET /insights/productivity/trends**
- **Query Parameters**: `?days=30` (default: 30, range: 7-365)
- **Response (200)**: `Array of daily productivity metrics`

### **GET /insights/finance/trends**
- **Query Parameters**: `?days=30` (default: 30, range: 7-365)
- **Response (200)**: `Array of daily spending metrics`

---

## 🏗 Infrastructure

### 🛠 Tech Stack
- **Framework**: NestJS (v11)
- **Database**: PostgreSQL (Multi-schema)
- **Cache**: Redis
- **Storage**: MinIO (S3 Compatible)
- **Mail**: Mailpit (Dev SMTP)

### 📦 Database Schemas
All data resides in `klenzo_db` partitioned by:
- `auth`: User security and sessions
- `finance`: Transactional and budget data
- `productivity`: Tasks and goals
- `habit`: Habit tracking and logs
- `public`: Shared/System data

### 🧪 Development Ports
- **API**: 3000
- **PostgreSQL**: 5432
- **Redis**: 6379
- **MinIO**: 9000 (API) / 9001 (Console)
- **Mailpit**: 8025 (Web UI)

---

## 🔒 Authentication

All protected endpoints require a JWT token in the `Authorization` header:
```
Authorization: Bearer <accessToken>
```

Tokens are obtained via `/auth/login` and can be refreshed using `/auth/refresh` with the `refreshToken`.re prefixed with `/api`. Global error responses follow the standard NestJS format: `{ "statusCode": number, "message": string, "error": string }`.

---

### 🔐 Authentication (`/auth`)

| Endpoint | Method | Auth | Description | Status Codes |
|----------|--------|------|-------------|--------------|
| `/auth/register` | POST | No | Create a new user account | 201, 400 |
| `/auth/login` | POST | No | Authenticate and get JWT tokens | 200, 401 |
| `/auth/refresh` | POST | No | Refresh access token | 200, 401 |
| `/auth/forgot-password` | POST | No | Request password reset email | 200, 404 |
| `/auth/reset-password` | POST | No | Reset password with token | 200, 400 |
| `/auth/profile` | GET | Yes | Get authenticated user data | 200, 401 |
| `/auth/profile/update` | POST | Yes | Update user profile fields | 200, 400 |
| `/auth/sessions` | GET | Yes | List active user sessions | 200 |
| `/auth/sessions/:id/revoke` | POST | Yes | Revoke a specific session | 200, 404 |

#### **POST /auth/register**
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response (201)**: `{ "message": "User registered" }`

#### **POST /auth/login**
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response (200)**: 
  ```json
  {
    "accessToken": "eyJ...",
    "refreshToken": "abcdef..."
  }
  ```

#### **POST /auth/refresh**
- **Request Body**: `{ "refreshToken": "string" }`
- **Response (200)**: `{ "accessToken": "eyJ..." }`

#### **POST /auth/forgot-password**
- **Request Body**: `{ "email": "string" }`
- **Response (200)**: `{ "message": "Password reset email sent" }`

#### **POST /auth/reset-password**
- **Request Body**:
  ```json
  {
    "token": "reset_token_from_email",
    "password": "new_password123"
  }
  ```
- **Response (200)**: `{ "message": "Password has been reset" }`

#### **GET /auth/profile**
- **Headers**: `Authorization: Bearer <token>`
- **Response (200)**:
  ```json
  {
    "id": 1,
    "email": "user@example.com",
    "isActive": true,
    "lastLogin": "2024-03-12T..."
  }
  ```

---

### ✅ Productivity (`/productivity`)

| Endpoint | Method | Auth | Description | Status Codes |
|----------|--------|------|-------------|--------------|
| `/productivity/tasks` | POST | Yes | Create a new task | 201, 400 |
| `/productivity/tasks` | GET | Yes | Get all user tasks | 200 |
| `/productivity/tasks/:id/update` | POST | Yes | Update a task | 200, 404 |
| `/productivity/tasks/:id/delete` | POST | Yes | Delete a task | 200, 404 |

#### **POST /productivity/tasks**
- **Request Body**:
  ```json
  {
    "title": "Task Title",
    "description": "Optional description",
    "status": "todo",
    "dueDate": "2024-04-23T...",
    "priority": 1
  }
  ```
- **Response (201)**: `Task Object` (includes `id`, `createdAt`, etc.)

#### **POST /productivity/tasks/:id/update**
- **URL Parameter**: `id` (Task ID)
- **Request Body**:
  ```json
  {
    "title": "string (optional)",
    "description": "string (optional)",
    "status": "todo | in_progress | done | cancelled (optional)",
    "dueDate": "iso_date_string (optional)",
    "priority": "number (optional)"
  }
  ```
- **Response (200)**: `Updated Task Object`

#### **POST /productivity/tasks/:id/delete**
- **URL Parameter**: `id` (Task ID)
- **Response (200)**: `{ "success": true }`

---

### 🔥 Habits (`/habits`)

| Endpoint | Method | Auth | Description | Status Codes |
|----------|--------|------|-------------|--------------|
| `/habits` | POST | Yes | Create a new habit | 201, 400 |
| `/habits` | GET | Yes | List all user habits | 200 |
| `/habits/:id/complete` | POST | Yes | Log completion | 200, 404 |
| `/habits/:id/delete` | POST | Yes | Remove a habit | 200, 404 |

#### **POST /habits**
- **Request Body**:
  ```json
  {
    "name": "Exercise",
    "description": "30 mins daily",
    "frequency": "daily"
  }
  ```
- **Response (201)**: `Habit Object` (includes `id`, `currentStreak`, `longestStreak`, etc.)

#### **GET /habits**
- **Response (200)**: `Array of Habit Objects`

#### **POST /habits/:id/complete**
- **URL Parameter**: `id` (Habit ID)
- **Response (200)**: 
  ```json
  {
    "id": 1,
    "currentStreak": 5,
    "longestStreak": 10,
    "lastCompletedDate": "2024-04-23"
  }
  ```

#### **POST /habits/:id/delete**
- **URL Parameter**: `id` (Habit ID)
- **Response (200)**: `{ "success": true }`

---

### � Notifications (`/notifications`)

| Endpoint | Method | Auth | Description | Status Codes |
|----------|--------|------|-------------|--------------|
| `/notifications` | GET | Yes | Get notification feed | 200 |
| `/notifications/:id/read` | POST | Yes | Mark one as read | 200, 404 |
| `/notifications/:id/dismiss` | POST | Yes | Dismiss a notification | 200, 404 |
| `/notifications/read-all` | POST | Yes | Mark all as read | 200 |

---

### �📈 Finance (`/finance`)

| Endpoint | Method | Auth | Description | Status Codes |
|----------|--------|------|-------------|--------------|
| `/finance/transactions` | POST | Yes | Create a new transaction | 201, 400 |
| `/finance/transactions/:userId` | GET | Yes | List all transactions for a user | 200 |
| `/finance/groups` | POST | Yes | Create a new social group | 201, 400 |
| `/finance/groups` | GET | Yes | List user's groups | 200 |
| `/finance/groups/:id` | GET | Yes | Get group details + members | 200, 404 |
| `/finance/groups/:id/members` | POST | Yes | Add member to group by email | 200, 404 |
| `/finance/groups/:id/balances` | GET | Yes | Get "who owes whom" in group | 200, 404 |
| `/finance/groups/:id/settle` | POST | Yes | Record a group settlement | 200, 400 |
| `/finance/analytics/summary` | GET | Yes | Get total spending summary | 200 |
| `/finance/analytics/categories` | GET | Yes | Get spending split by categories | 200 |
| `/finance/sms/enable` | POST | Yes | Enable SMS parsing automation | 200 |

#### **POST /finance/transactions**
- **Request Body**:
  ```json
  {
    "userId": 1,
    "amount": 50.00,
    "description": "Lunch at Cafe",
    "category": "Food",
    "transactionType": "expense",
    "date": "2024-04-23T12:00:00Z"
  }
  ```
- **Response (201)**: `Transaction Object` (includes `id`, `createdAt`, etc.)

#### **GET /finance/transactions/:userId**
- **URL Parameter**: `userId` (ID of the user)
- **Response (200)**: `Array of Transaction Objects`

---

## 🏗 Microservices & Infrastructure

### Internal Service Discovery (NATS)
Services communicate internally using NATS subject patterns:
- `auth.*`
- `finance.*`
- `productivity.*`
- `habit.*`
- `notification.*`

### 🛠 Tech Stack
- **Framework**: NestJS (v11)
- **Database**: PostgreSQL (Multi-schema)
- **Messaging**: NATS (JetStream enabled)
- **Cache**: Redis
- **Storage**: MinIO (S3 Compatible)
- **Mail**: Mailpit (Dev SMTP)

### 📦 Database Schemas
All data resides in `klenzo_db` partitioned by:
- `auth`: User security and sessions
- `finance`: Transactional and budget data
- `productivity`: Tasks and goals
- `habit`: Habit tracking and logs
- `public`: Shared/System data

## 🧪 Development Ports
- **API Gateway**: 3000
- **Auth Service**: 3001
- **Finance Service**: 3002
- **NATS**: 4222 / 8222 (Management)
- **Postgres**: 5432
- **Redis**: 6379
- **MinIO**: 9000 (API) / 9001 (Console)
- **Mailpit**: 8025 (Web UI)
