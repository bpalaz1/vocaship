import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const countryCode = (
    req.headers.get("x-vercel-ip-country") ||
    req.headers.get("cf-ipcountry") ||
    "TR"
  )
    .trim()
    .toUpperCase();
  const city = decodeURIComponent((req.headers.get("x-vercel-ip-city") || "").trim());

  return NextResponse.json(
    {
      country_code: countryCode || "TR",
      city,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
