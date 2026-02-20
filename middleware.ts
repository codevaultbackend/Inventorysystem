import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const role = req.cookies.get("role")?.value;

  const pathname = req.nextUrl.pathname;

  /* ================= NOT LOGGED IN ================= */
  if (!token) {
    return NextResponse.redirect(new URL("/Login", req.url));
  }

  /* ================= ROLE BASED ACCESS ================= */
  const roleAccess: Record<string, string[]> = {
    super_admin: ["/super-admin"],
    admin: ["/admin"],
    hr_admin: ["/hr-admin"],
    stock_manager: ["/stock-manager"],
    sales_manager: ["/sales-manager"],
    purchase_manager: ["/purchase-manager"],
    finance: ["/finance"],
  };

  const allowedRoutes = roleAccess[role || ""];

  if (!allowedRoutes) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  const isAllowed = allowedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (!isAllowed) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.next();
}

/* ================= PROTECTED ROUTES ================= */
export const config = {
  matcher: [
    "/super-admin/:path*",
    "/admin/:path*",
    "/hr-admin/:path*",
    "/stock-manager/:path*",
    "/sales-manager/:path*",
    "/purchase-manager/:path*",
    "/finance/:path*",
  ],
};
