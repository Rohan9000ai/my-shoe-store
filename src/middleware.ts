import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

// --- Rate limiting -----------------------------------------------------
// Simple in-memory fixed-window limiter — fine for a single-server
// deployment. If this app ever runs on multiple server instances or
// serverless functions that don't share memory, swap this Map for a
// shared store like Redis/Upstash so counts stay consistent across them.
const RATE_LIMIT_WINDOW_MS = 60_000;
const GENERAL_API_LIMIT = 60; // most API routes
const ORDER_PLACEMENT_LIMIT = 15; // /api/orders — protects stock/DB writes
const AUTH_LIMIT = 10; // login/register — brute-force / spam signup protection

const requestCounts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(key: string, limit: number): boolean {
  const now = Date.now();
  const entry = requestCounts.get(key);

  if (!entry || now > entry.resetAt) {
    requestCounts.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count += 1;
  return entry.count > limit;
}

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

// --- Secure headers ------------------------------------------------------
// Applied to every response. Next.js merges headers set on the object
// returned from middleware into the final response, even when a later
// route handler generates its own body — so no per-route changes needed.
function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "img-src 'self' data: https://res.cloudinary.com",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://upload-widget.cloudinary.com",
      "style-src 'self' 'unsafe-inline'",
      "connect-src 'self' https://api.cloudinary.com",
      "frame-src https://upload-widget.cloudinary.com",
    ].join("; ")
  );
  return response;
}

const AUTH_SENSITIVE_PREFIXES = ["/api/auth/register", "/api/auth/callback/credentials"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- Rate limiting for API routes ---
  if (pathname.startsWith("/api/")) {
    const ip = getClientIp(request);
    const isAuthSensitive = AUTH_SENSITIVE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
    const isOrderPlacement = pathname.startsWith("/api/orders") && request.method === "POST";

    const limit = isAuthSensitive ? AUTH_LIMIT : isOrderPlacement ? ORDER_PLACEMENT_LIMIT : GENERAL_API_LIMIT;
    const bucket = isAuthSensitive ? "auth" : isOrderPlacement ? "orders" : "api";
    const key = `${ip}:${bucket}`;

    if (isRateLimited(key, limit)) {
      return applySecurityHeaders(
        NextResponse.json(
          { message: "Too many requests. Please try again shortly." },
          { status: 429 }
        )
      );
    }
  }

  // --- Admin auth protection (unchanged from before) ---
  const isAdminPath = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");

  if (isAdminPath) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const isAdmin = token?.role === "admin";

    if (!isAdmin) {
      if (pathname.startsWith("/api/")) {
        return applySecurityHeaders(NextResponse.json({ message: "Unauthorized" }, { status: 401 }));
      }

      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", request.url);
      return applySecurityHeaders(NextResponse.redirect(loginUrl));
    }
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};