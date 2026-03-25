import { NextRequest, NextResponse } from "next/server";
import { getBackendURL } from "./utils/utilities";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.BETTER_AUTH_SECRET);

const RBAC_ROLE_DESTINATIONS: Record<string, string> = {
  role_platform_admin: "/admin/dashboard",
  role_org_teacher: "/dashboard/teacher",
  role_org_student: "/dashboard/student",
};

export async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  const backendDomain = getBackendURL();
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://github.githubassets.com https://cdn.jsdelivr.net;
    style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
    img-src 'self' blob: data: https:;
    font-src 'self' data: https://cdn.jsdelivr.net;
    connect-src 'self' https://github.com https://api.github.com ${backendDomain};
    frame-src 'self' https://github.com;
    worker-src 'self' blob:;
  `.replace(/\s{2,}/g, " ");

  const response = NextResponse.next();
  response.headers.set("Content-Security-Policy", cspHeader);

  // Protect dashboard, admin, and exam runtime routes.
  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/tests");

  if (!isProtected) {
    return response;
  }

  const token =
    req.cookies.get("__Secure-better-auth.session_data")?.value ||
    req.cookies.get("better-auth.session_data")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const { payload }: any = await jwtVerify(token, secret);

    const user = payload.user;

    if (!user || !user.id) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (!user.isOnboarded) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    // Role-based routing for dashboard landing page
    // Redirect /dashboard to role-specific page based on globalRoleId
    if (pathname === "/dashboard" && user.globalRoleId) {
      const destination = RBAC_ROLE_DESTINATIONS[user.globalRoleId];
      if (destination) {
        return NextResponse.redirect(new URL(destination, req.url));
      }
    }

    return response;
  } catch (error) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (internal next api)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - YOUR BACKEND PATHS (if you are proxying)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
