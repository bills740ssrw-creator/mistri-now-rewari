/**
 * Signed demo-mode session cookie.
 *
 * Runs in both Node (server components/actions) and the Next proxy, so it only
 * uses Web Crypto + btoa/atob (both available in Node 24 and modern runtimes).
 * This is used ONLY when the app runs without Supabase; production sessions are
 * encrypted, httpOnly cookies managed by Supabase Auth.
 */

export const DEMO_SESSION_COOKIE = "mn_demo_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

function secret(): string {
  return (
    process.env.DEMO_SESSION_SECRET ??
    process.env.NEXT_PUBLIC_DEMO_SESSION_SECRET ??
    "mistri-now-rewari-insecure-dev-secret"
  );
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(
    value.length + ((4 - (value.length % 4)) % 4),
    "=",
  );
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function hmac(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return toBase64Url(new Uint8Array(signature));
}

export interface DemoSessionPayload {
  uid: string;
  exp: number;
}

export async function signDemoSession(
  userId: string,
  ttlSeconds = SESSION_TTL_SECONDS,
): Promise<string> {
  const payload: DemoSessionPayload = {
    uid: userId,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
  const encoded = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const signature = await hmac(encoded);
  return `${encoded}.${signature}`;
}

export async function verifyDemoSession(
  token: string | undefined | null,
): Promise<DemoSessionPayload | null> {
  if (!token) return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;
  try {
    const expected = await hmac(encoded);
    if (expected.length !== signature.length) return null;
    let mismatch = 0;
    for (let i = 0; i < expected.length; i += 1) {
      mismatch |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
    }
    if (mismatch !== 0) return null;
    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(encoded))) as DemoSessionPayload;
    if (!payload?.uid || typeof payload.exp !== "number") return null;
    if (payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function isDemoMode(): boolean {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") return true;
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "false") return false;
  return !process.env.NEXT_PUBLIC_SUPABASE_URL;
}

export function showDemoBanner(): boolean {
  return isDemoMode() && process.env.NEXT_PUBLIC_SHOW_DEMO_BANNER !== "false";
}
