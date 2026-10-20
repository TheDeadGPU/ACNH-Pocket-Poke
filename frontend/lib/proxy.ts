import { NextResponse } from "next/server";

// Server-only (no NEXT_PUBLIC_ prefix), so it never reaches the browser.
const UPSTREAM = process.env.POCKET_POKE_URL ?? "http://localhost:8000";

export async function proxy(path: string, search: string, init: RequestInit = {}) {
  try {
    const upstream = await fetch(`${UPSTREAM}${path}?${search}`, {
      ...init,
      cache: "no-store",
      signal: AbortSignal.timeout(12_000), // under the page's 15s client cap
    });
    return new NextResponse(await upstream.text(), {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "application/json",
      },
    });
  } catch {
    // FastAPI is down, unreachable, or too slow. Use the same {detail} shape
    // FastAPI uses so the client's errorMessage() handles it.
    return NextResponse.json(
      { detail: "Pocket Poke API is unreachable" },
      { status: 502 },
    );
  }
}