import { showErrorToast } from "@/utils/toastHandler";
import { NextResponse ,NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // // Read cookie
  const sessionCookie = req.cookies.get("auth-session")?.value;
  const roleCookie = req.cookies.get("role-for-middleware")?.value;

  let token = null;

  // // Parse cookie (if it's JSON)
  try {
    if (sessionCookie) {
      const parsed = JSON.parse(sessionCookie);
      token = parsed.access_token;
    }
  } catch (e) {
    showErrorToast("Invalid auth-session cookie",e);
  }

  // Public routes (no login required)
  const publicRoutes = ["/auth/login", "/auth/signup"];

  // Role-based allowed routes
  const roleRoutes: Record<string, string[]> = {
    admin: ["/admin"],
    agent: ["/agent"],
    customer: ["/customer"],
  };

  if (token && publicRoutes.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL(`/${roleCookie}/dashboard`, req.url));
  }

  const protectedRoutes = ["/admin", "/agent", "/customer"];
  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));

  if (!token && isProtected) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

 
  if (token && roleCookie) {
    const allowed = roleRoutes[roleCookie] || [];

    const isAllowed = allowed.some((route) =>
      pathname.startsWith(route)
    );

    if (!isAllowed && isProtected) {
      return NextResponse.redirect(new URL(`/${roleCookie}/dashboard`, req.url));
    }
  }

  return NextResponse.next();
}
export const config = {}