const COOKIE = "wb_session";
const MAX_AGE = 60 * 60 * 12;

function secret() { return process.env.AUTH_SECRET || process.env.SESSION_SECRET || ""; }
function toBase64Url(bytes: ArrayBuffer | Uint8Array) {
  const data = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = ""; for (const b of data) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function fromBase64Url(value: string) { const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((value.length + 3) % 4); return Uint8Array.from(atob(padded), c => c.charCodeAt(0)); }
async function key() { return crypto.subtle.importKey("raw", new TextEncoder().encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]); }
async function sign(value: string) { return toBase64Url(await crypto.subtle.sign("HMAC", await key(), new TextEncoder().encode(value))); }

export function isAuthConfigured() { return Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD && secret()); }
export function verifyCredentials(email: string, password: string) { return email.trim().toLowerCase() === (process.env.ADMIN_EMAIL || "").trim().toLowerCase() && password === (process.env.ADMIN_PASSWORD || ""); }
export async function createSession(email: string) { if (!secret()) throw new Error("AUTH_SECRET is not configured"); const exp = Math.floor(Date.now() / 1000) + MAX_AGE; const payload = `${email}|${exp}`; return `${payload}.${await sign(payload)}`; }
export async function verifySession(value?: string | null) {
  if (!value || !secret()) return false;
  const dot = value.lastIndexOf("."); if (dot < 1) return false;
  const payload = value.slice(0, dot), signature = value.slice(dot + 1);
  const [email, expText] = payload.split("|"); if (!email || Number(expText) <= Math.floor(Date.now() / 1000)) return false;
  try { return await crypto.subtle.verify("HMAC", await key(), fromBase64Url(signature), new TextEncoder().encode(payload)); } catch { return false; }
}
export const sessionCookie = COOKIE;
export const sessionMaxAge = MAX_AGE;
