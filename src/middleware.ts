import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

// Protects all /admin/* pages and /api/admin/* routes: only signed-in
// users with role "admin" may pass through. Page requests are redirected
// to /login; API requests get a plain 401 JSON response instead, since a
// fetch() call can't follow an HTML redirect meaningfully.
export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAdmin = token?.role === "admin";

  if (!isAdmin) {
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};