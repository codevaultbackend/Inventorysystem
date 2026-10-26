import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.API_BASE_URL!;

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ location: string }> }
) {
  try {
    const { location } = await context.params;
    const authorization = req.headers.get("authorization");

    const res = await fetch(
      `${BASE_URL}/sqlbranch/location/${encodeURIComponent(location)}`,
      {
        method: "GET",
        headers: {
          ...(authorization ? { Authorization: authorization } : {}),
        },
        cache: "no-store",
      }
    );

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Proxy error /location/[location]:", error);
    return NextResponse.json(
      { message: "Failed to fetch location data" },
      { status: 500 }
    );
  }
}