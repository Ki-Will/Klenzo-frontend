import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Proxy all /api/* requests to the NestJS backend.
   * This eliminates CORS entirely — the browser only ever talks to
   * localhost:5000 (Next.js), which forwards to localhost:3000 (NestJS)
   * server-side where CORS headers don't apply.
   */
  async rewrites() {
    return [
      {
        // Browser calls /backend/auth/login
        // Next.js forwards to http://localhost:3000/api/auth/login
        source: "/backend/:path*",
        destination: `${process.env.BACKEND_URL ?? "http://localhost:3000"}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
