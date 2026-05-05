import type { NextConfig } from "next";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:3000";

const nextConfig: NextConfig = {
  /**
   * Proxy /backend/* → NestJS at http://localhost:3000/api/*
   * Browser calls /backend/auth/login
   * Next.js forwards to http://localhost:3000/api/auth/login
   * No CORS — same origin from the browser's perspective.
   */
  async rewrites() {
    return [
      {
        source: "/backend/:path*",
        destination: `${BACKEND}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
