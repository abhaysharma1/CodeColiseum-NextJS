import { NextRequest, NextResponse } from "next/server";
import { getBackendURL } from "./utils/utilities";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.BETTER_AUTH_SECRET);

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

    // Admin route protection
    if (pathname.startsWith("/admin") && user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Root dashboard redirect by role
    if (pathname === "/dashboard") {
      if (user.role === "TEACHER") {
        return NextResponse.redirect(new URL("/dashboard/teacher", req.url));
      } else if (user.role === "STUDENT") {
        return NextResponse.redirect(new URL("/dashboard/student", req.url));
      } else if (user.role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }
    }

    // Role-based access for /dashboard/student
    if (pathname.startsWith("/dashboard/student") && user.role !== "STUDENT") {
      return NextResponse.redirect(
        new URL(`/dashboard/${user.role.toLowerCase()}`, req.url)
      );
    }

    // Role-based access for /dashboard/teacher
    if (pathname.startsWith("/dashboard/teacher") && user.role !== "TEACHER") {
      return NextResponse.redirect(
        new URL(`/dashboard/${user.role.toLowerCase()}`, req.url)
      );
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
