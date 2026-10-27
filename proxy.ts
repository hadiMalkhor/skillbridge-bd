import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  });

  // 1. Unauthenticated users -> redirect to /login with callbackUrl
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  const role = token.role as string | undefined;

  // 2. Role-based routing checks
  if (pathname.startsWith("/candidate") && role !== "CANDIDATE") {
    return NextResponse.redirect(new URL("/not-allowed", request.url));
  }

  if (pathname.startsWith("/employer") && role !== "EMPLOYER") {
    return NextResponse.redirect(new URL("/not-allowed", request.url));
  }

  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/not-allowed", request.url));
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: ["/candidate/:path*", "/employer/:path*", "/admin/:path*"],
};
