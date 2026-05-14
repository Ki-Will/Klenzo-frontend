import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/", "/splash", "/login", "/sign-up", "/onboarding"];

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always pass through proxy and static assets
  if (
    pathname.startsWith("/backend/") ||
    pathname.startsWith("/_next/") ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico)$/)
  ) {
    return NextResponse.next();
  }

  // Public routes — no auth needed
  const isPublic = PUBLIC_ROUTES.some((r) =>
    r === "/"
      ? pathname === "/"
      : pathname === r || pathname.startsWith(r + "/"),
  );
  if (isPublic) return NextResponse.next();

  // Auth check — backend sets httpOnly cookie named "access_token"
  // We also check our fallback "kz_at" cookie
  const hasToken =
    request.cookies.has("access_token") || request.cookies.has("kz_at");

  if (!hasToken) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
