import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.API_BASE_URL!;

export async function GET(req: NextRequest) {
  try {
    const authorization = req.headers.get("authorization");

    const res = await fetch(`${BASE_URL}/sqlbranch/d/report`, {
      method: "GET",
      headers: {
        ...(authorization ? { Authorization: authorization } : {}),
      },
      cache: "no-store",
    });

    const data = await res.json();

    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Proxy error /sqlbranch/d/report:", error);

    return NextResponse.json(
      { message: "Failed to fetch report dashboard" },
      { status: 500 }
    );
  }
}