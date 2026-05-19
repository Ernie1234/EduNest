// middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Configuration for easy updates
const ROUTES = {
  auth: ["/"], // Guest-only (Redirect to dashboard if logged in)
  protectedPrefixes: ["/dashboard", "/courses"], // Login required for these and all sub-routes
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("access_token")
  const isAuthenticated = !!token

  // 1. Handle Guest-only routes (Landing/Login)
  if (ROUTES.auth.includes(pathname)) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
    return NextResponse.next()
  }

  // 2. Handle Protected Routes & Sub-routes
  const isProtectedRoute = ROUTES.protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  )

  if (isProtectedRoute && !isAuthenticated) {
    // Optional: Capture the attempted URL to redirect back after login
    const loginUrl = new URL("/", request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
