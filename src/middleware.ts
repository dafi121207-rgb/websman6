import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession, SESSION_COOKIE } from "@/lib/session-token";

export const ROUTE_ROLE: Record<string, Array<"ADMIN" | "GURU" | "SISWA">> = {
  siswa: ["SISWA", "GURU", "ADMIN"],
  guru: ["GURU", "ADMIN"],
  admin: ["ADMIN"],
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySession(token);

  // Login allowed for everyone; dashboard routes protected
  const isLoginPage = pathname === "/login";
  const protectedPrefix = ["/dashboard"];

  if (isLoginPage && session) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  if (protectedPrefix.some((p) => pathname.startsWith(p))) {
    if (!session) return handleAuth(req);
    return NextResponse.next();
  }

  // Role-scoped prefixes
  for (const [prefix, roles] of Object.entries(ROUTE_ROLE)) {
    if (pathname.startsWith(`/${prefix}/`) || pathname === `/${prefix}`) {
      if (!session) return handleAuth(req);
      if (!roles.includes(session.role)) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

function handleAuth(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", req.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/dashboard/:path*", "/siswa/:path*", "/guru/:path*", "/admin/:path*", "/login"],
};
