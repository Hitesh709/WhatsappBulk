import crypto from "crypto";
import { cookies } from "next/headers";

const COOKIE = "wb_session";
const MAX_AGE = 60 * 60 * 12;

function secret() {
  return process.env.AUTH_SECRET || process.env.SESSION_SECRET || "";
}

function sign(value: string) {
  return crypto.createHmac("sha256", secret()).update(value).digest("base64url");
}

export function isAuthConfigured() {
  return Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD && secret());
}

export function verifyCredentials(email: string, password: string) {
  const expectedEmail = process.env.ADMIN_EMAIL || "";
  const expectedPassword = process.env.ADMIN_PASSWORD || "";
  return email.trim().toLowerCase() === expectedEmail.trim().toLowerCase() && password === expectedPassword;
}

export function createSession(email: string) {
  if (!secret()) throw new Error("AUTH_SECRET is not configured");
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
  const payload = `${email}|${exp}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySession(value?: string | null) {
  if (!value || !secret()) return false;
  const dot = value.lastIndexOf(".");
  if (dot < 1) return false;
  const payload = value.slice(0, dot);
  const signature = value.slice(dot + 1);
  const expected = sign(payload);
  if (signature.length !== expected.length) return false;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;
  const [email, expText] = payload.split("|");
  return Boolean(email && Number(expText) > Math.floor(Date.now() / 1000));
}

export async function getSession() {
  const jar = await cookies();
  return jar.get(COOKIE)?.value || null;
}

export const sessionCookie = COOKIE;
export const sessionMaxAge = MAX_AGE;
