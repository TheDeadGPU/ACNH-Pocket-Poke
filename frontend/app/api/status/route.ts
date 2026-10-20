// app/api/status/route.ts
import { NextRequest } from "next/server";
import { proxy } from "@/lib/proxy";

//export const dynamic = "force-dynamic"; // never cache status checks

export function GET(req: NextRequest) {
  return proxy("/status", req.nextUrl.searchParams.toString());
}