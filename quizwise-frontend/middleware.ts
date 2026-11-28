import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const country =
    request.headers.get("x-vercel-ip-country") ||
    request.headers.get("cf-ipcountry") ||
    "TR";
  const city = request.headers.get("x-vercel-ip-city") || "";

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-vercel-ip-country", country);
  if (city) {
    requestHeaders.set("x-vercel-ip-city", city);
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  response.headers.set("x-vocaship-country", country);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|favicon\\.svg|icon\\.svg|apple-touch-icon\\.svg).*)"],
};
