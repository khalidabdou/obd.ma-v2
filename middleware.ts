import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

const middleware = async (request: NextRequest) => {
  const { pathname } = request.nextUrl;

  const customerAccessToken = request.cookies.get("customer_access_token")?.value;
  const customerRefreshToken = request.cookies.get("customer_refresh_token")?.value;

  const requiresCustomerAuth =
    pathname.startsWith("/account") ||
    pathname.startsWith("/favorite") ||
    pathname.startsWith("/track-orders");

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
