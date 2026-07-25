import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
const RESERVED_PREFIXES = [
  "/account",
  "/cart",
  "/catalog",
  "/checkout",
  "/downloads",
  "/favorite",
  "/myfavorites",
  "/login",
  "/register",
  "/orders",
  "/track-orders",
  "/about",
  "/auth",
  "/search",
  "/product",
  "/category",
  "/brand",
  "/api",
  "/_next",
  "/assets",
];

const middleware = async (request: NextRequest) => {
  const { pathname } = request.nextUrl;

  const isReserved =
    pathname === "/" ||
    pathname.includes(".") ||
    RESERVED_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
    );

  if (!isReserved) {
    const redirectPath = pathname.startsWith("/r/")
      ? pathname.substring(3)
      : pathname.substring(1);

    if (redirectPath) {
      const serverApiUrl = process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://backend:4001/api";
      const backendPublicApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001/api";

      try {
        const lookupRes = await fetch(`${serverApiUrl}/r/lookup/${redirectPath}`, {
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });

        if (lookupRes.ok) {
          const data = await lookupRes.json();
          if (data.exists) {
            return NextResponse.redirect(`${backendPublicApiUrl}/r/${redirectPath}`);
          }
        }
      } catch (err) {
        console.error("Middleware redirect lookup failed:", err);
      }
    }
  }

  const customerAccessToken = request.cookies.get("customer_access_token")?.value;
  const customerRefreshToken = request.cookies.get("customer_refresh_token")?.value;

  const requiresCustomerAuth =
    pathname.startsWith("/account") ||
    pathname.startsWith("/favorite") ||
    pathname.startsWith("/track-orders") ||
    pathname.startsWith("/orders");

  if (requiresCustomerAuth) {
    if (!customerAccessToken && !customerRefreshToken) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
};

export default middleware;
