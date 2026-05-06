import { NextRequest, NextResponse } from "next/server";

const DASHBOARD_PREFIX = "/dashboard";
const LOGIN_PATH = "/dashboard/login";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth-token")?.value;

  const isDashboardPath =
    pathname.startsWith(DASHBOARD_PREFIX) && pathname !== LOGIN_PATH;
  const isLoginPath = pathname === LOGIN_PATH;

  // Belum login → redirect ke login
  if (isDashboardPath && !token) {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  }

  // Sudah login → redirect ke overview
  if (isLoginPath && token) {
    return NextResponse.redirect(new URL("/dashboard/overview", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};