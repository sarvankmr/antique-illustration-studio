import { NextRequest, NextResponse } from "next/server";
import { COLLECTIONS } from "@/lib/catalog";
import { buildPrompt } from "@/lib/prompt";
import { isConfigured, verifySession } from "@/lib/session";
export const runtime = "nodejs";
export const maxDuration = 120;
export async function POST(req: NextRequest) {
  if (!isConfigured()) return NextResponse.json({ error: "Image generation is not configured. Add environment variables on the server." }, { status: 503 });
  if (!verifySession(req)) return NextResponse.json({ error: "Unlock the studio before generating images." }, { status: 401 });
  let body: Record<string,unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({error: "Invalid JSON."},{status:400}); }
  const str = (x: unknown, max = 200) => typeof x === "string" ? x.trim().slice(0, max) : "";
  const collectionId = str(body.collectionId, 80);
  const collection = COLLECTIONS.find(c => c.id === collectionId) || (collectionId.startsWith("custom-") ? {
    id: collectionId, title: "Custom", version: "1.0", singular: "Subject", originLabel: "Native to", accent: "#A8414E", description: "Custom natural-history specimen", baseNumber: 0, icon: "sparkle" as const, presets: []
  } : undefined);
  if (!collection) return NextResponse.json({error:"Unknown collection."},{status:400});
  const commonName = str(body.commonName, 100);
  if (!commonName) return NextResponse.json({error:"Enter a subject name."},{status:400});
  const prompt = buildPrompt(collection, {
    commonName, scientificName: str(body.scientificName, 140), origin: str(body.origin, 250),
    notes: str(body.notes, 1000), appearance: str(body.appearance, 260), colorMode: str(body.colorMode, 20), scale: 60
  });
  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST", headers: { "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-2.6-sunburst", prompt, n:1, size:"1024x1024", quality:"high", output_format:"webp", output_compression:88, background:"opaque" }),
      signal: AbortSignal.timeout(115000)
    });
    const data = await response.json().catch(() => ({})) as { data?: Array<{b64_json?: string}>, error?:{message?:string} };
    if (!response.ok) return NextResponse.json({error:data.error?.message || `Image API error ${response.status}.`},{status:502});
    const encoded = data.data?.[0]?.b64_json;
    if (!encoded) return NextResponse.json({error:"No image data was returned."},{status:502});
    return NextResponse.json({image:`data:image/webp;base64,${encoded}`, prompt}, {headers:{"Cache-Control":"no-store"}});
  } catch (e) {
    return NextResponse.json({error: e instanceof Error ? e.message : "Image generation failed."},{status:502});
  }
}
