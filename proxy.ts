import { NextRequest, NextResponse } from "next/server";
import { authClient } from "./lib/auth-client";
import { getBackendURL } from "./utils/utilities";

export async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Configure CSP to allow GitHub assets, Monaco Editor, and inline scripts
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

  // Add CSP headers for all routes to allow GitHub OAuth and Monaco Editor
  const response = NextResponse.next();
  response.headers.set("Content-Security-Policy", cspHeader);

  // If it's not a protected route, return with CSP headers
  if (!pathname.startsWith("/dashboard")) {
    return response;
  }

  try {
    const { data: session } = await authClient.getSession({
      fetchOptions: { headers: Object.fromEntries(req.headers) },
    });

    if (!session?.user || !session.user.id) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (session.user.id && (pathname === "/login" || pathname === "/signup")) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (pathname.startsWith("/admin") && !(session.user.role === "ADMIN")) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (!session.user.isOnboarded) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    if (pathname === "/dashboard") {
      if (session.user.role === "TEACHER") {
        return NextResponse.redirect(new URL("/dashboard/teacher", req.url));
      } else if (session.user.role === "STUDENT") {
        return NextResponse.redirect(new URL("/dashboard/student", req.url));
      } else if (session.user.role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }
    }
    // ROLE BASED ACCESS
    if (
      pathname.startsWith("/dashboard/student") &&
      session.user.role != "STUDENT"
    ) {
      return NextResponse.redirect(
        new URL(`/dashboard/${session.user.role}`, req.url)
      );
    }

    if (
      pathname.startsWith("/dashboard/teacher") &&
      session.user.role != "TEACHER"
    ) {
      return NextResponse.redirect(
        new URL(`/dashboard/${session.user.role}`, req.url)
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
