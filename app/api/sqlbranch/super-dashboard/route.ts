import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.API_BASE_URL!;

export async function GET(req: NextRequest) {
  try {
    const authorization = req.headers.get("authorization");
    const url = `${BASE_URL}/sqlbranch/super-dashboard`;

    console.log("Proxy request to:", url);

    const res = await fetch(url, {
      method: "GET",
      headers: {
        ...(authorization ? { Authorization: authorization } : {}),
      },
      cache: "no-store",
    });

    const contentType = res.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    }

    const text = await res.text();

    return new NextResponse(text, {
      status: res.status,
      headers: {
        "Content-Type": contentType || "text/plain",
      },
    });
  } catch (error) {
    console.error("Proxy error /super-dashboard:", error);

    return NextResponse.json(
      {
        message: "Failed to fetch super dashboard",
      },
      { status: 500 }
    );
  }
}