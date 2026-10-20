// app/api/inject/route.ts
import { NextRequest } from "next/server";
import { proxy } from "@/lib/proxy";

//export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  return proxy("/inject", req.nextUrl.searchParams.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: await req.text(), // forward the bare JSON array untouched
  });
}