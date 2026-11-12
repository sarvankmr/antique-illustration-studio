import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";
const COOKIE_NAME = "atlas_studio_session";
const duration = 60 * 60 * 24 * 7;
export { COOKIE_NAME };
export const isConfigured = () => Boolean(process.env.OPENAI_API_KEY && process.env.STUDIO_ACCESS_CODE && process.env.SESSION_SECRET);
function key() { return process.env.SESSION_SECRET || ""; }
function sign(value: string) { return createHmac("sha256", key()).update(value).digest("hex"); }
export function createSessionToken() {
  const expiry = Math.floor(Date.now() / 1000) + duration;
  const payload = `v1.${expiry}`;
  return `${payload}.${sign(payload)}`;
}
export function verifySession(req: NextRequest) {
  if (!isConfigured()) return false;
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;
  const [version, expiryStr, signature] = token.split(".");
  if (version !== "v1" || !expiryStr || !signature) return false;
  const expiry = Number(expiryStr);
  if (!Number.isSafeInteger(expiry) || expiry < Math.floor(Date.now() / 1000)) return false;
  const expected = Buffer.from(sign(`v1.${expiryStr}`));
  const provided = Buffer.from(signature);
  return provided.length === expected.length && timingSafeEqual(provided, expected);
}
export function verifyAccessCode(candidate: string) {
  const correct = Buffer.from(process.env.STUDIO_ACCESS_CODE || "");
  const input = Buffer.from(candidate);
  return correct.length > 0 && correct.length === input.length && timingSafeEqual(correct, input);
}
