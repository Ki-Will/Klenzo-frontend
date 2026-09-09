# Klenzoo — Web Frontend Application

**Klenzoo** is the Next.js 15 App Router web client for the Klenzo financial platform. It features an interactive unified expense & budget manager, split-bill groups, productivity task tracking, habit management, and real-time financial insights.

---

## ⚡ Quick Start (Development)

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.example .env.local

# 3. Start Next.js development server
npm run dev
# App will run at http://localhost:3000
```

---

## 🌐 API Proxy Configuration

The web client proxies all `/backend/*` API requests directly to the backend Nginx Reverse Proxy (`http://localhost/api/*`) via Next.js rewrites defined in `next.config.ts`.

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost/api
```

---

## 🚀 Production Deployment Options

### Option 1: Vercel (Recommended Cloud)
1. Push your repository to GitHub.
2. Connect your repository to Vercel.
3. Configure `NEXT_PUBLIC_API_URL` pointing to your backend Nginx reverse proxy endpoint.
4. Deploy!

### Option 2: Docker Container Build
```bash
# Build production Docker image
docker build -t klenzoo-frontend .

# Run container
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://your-backend-proxy/api klenzoo-frontend
```

---

## 🧪 Testing Suite

### Unit & Component Tests
```bash
npm run test
```

### End-to-End (E2E) Browser Tests
```bash
npx playwright test
```
*(Runs Playwright tests covering Onboarding, Login, Expenses Budget Manager, and Habits).*
