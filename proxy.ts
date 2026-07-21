import { NextRequest, NextResponse } from "next/server";
import { getBackendURL } from "./utils/utilities";

const RBAC_ROLE_DESTINATIONS: Record<string, string> = {
  role_platform_admin: "/admin/dashboard",
  role_org_teacher: "/dashboard/teacher",
  role_org_student: "/dashboard/student",
};

const DASHBOARD_ROLE_PREFIXES: Record<string, string> = {
  role_platform_admin: "/admin",
  role_org_teacher: "/dashboard/teacher",
  role_org_student: "/dashboard/student",
};

export async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  const backendApiUrl = getBackendURL();
  const backendOrigin = new URL(backendApiUrl).origin;

  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://github.githubassets.com https://cdn.jsdelivr.net;
    style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
    img-src 'self' blob: data: https:;
    font-src 'self' data: https://cdn.jsdelivr.net;
    connect-src 'self' https://github.com https://api.github.com ${backendOrigin};
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

  const sessionUrl = `${backendApiUrl}/auth/get-session`;

  try {
    const sessionRes = await fetch(sessionUrl, {
      headers: { cookie: req.headers.get("cookie") || "" },
    });

    if (!sessionRes.ok) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const sessionData = await sessionRes.json();
    if (!sessionData?.user) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const user = sessionData.user;

    if (!user.isOnboarded) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    const destination = user.globalRoleId
      ? RBAC_ROLE_DESTINATIONS[user.globalRoleId]
      : undefined;
    const allowedPrefix = user.globalRoleId
      ? DASHBOARD_ROLE_PREFIXES[user.globalRoleId]
      : undefined;

    if (
      destination &&
      allowedPrefix &&
      (pathname.startsWith("/admin") ||
        pathname.startsWith("/dashboard/teacher") ||
        pathname.startsWith("/dashboard/student")) &&
      !pathname.startsWith(allowedPrefix)
    ) {
      return NextResponse.redirect(new URL(destination, req.url));
    }

    if (pathname === "/dashboard" && destination) {
      return NextResponse.redirect(new URL(destination, req.url));
    }

    return response;
  } catch {
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
