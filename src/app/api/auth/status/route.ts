import { NextRequest, NextResponse } from "next/server";
import { isConfigured, verifySession } from "@/lib/session";
export const runtime = "nodejs";
export async function GET(req: NextRequest) {
 return NextResponse.json({ configured: isConfigured(), authenticated: verifySession(req) }, { headers: { "Cache-Control": "no-store" } });
}
