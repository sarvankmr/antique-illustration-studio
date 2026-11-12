import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, createSessionToken, isConfigured, verifyAccessCode } from "@/lib/session";
export const runtime = "nodejs";
export async function POST(req: NextRequest) {
  if (!isConfigured()) return NextResponse.json({ error: "Configure OPENAI_API_KEY, STUDIO_ACCESS_CODE and SESSION_SECRET on the server." }, { status: 503 });
  let code = "";
  try { const body = await req.json(); code = String(body.code || ""); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  if (!verifyAccessCode(code)) return NextResponse.json({ error: "Incorrect access code." }, { status: 401 });
  const response = NextResponse.json({ success: true });
  response.cookies.set(COOKIE_NAME, createSessionToken(), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 60*60*24*7 });
  return response;
}
