import { NextResponse } from "next/server";
import { createSession, isAuthConfigured, sessionCookie, sessionMaxAge, verifyCredentials } from "@/lib/auth";

export async function POST(req: Request) {
  if (!isAuthConfigured()) {
    return NextResponse.json({ error: "Admin login is not configured. Add ADMIN_EMAIL, ADMIN_PASSWORD and AUTH_SECRET in Netlify environment variables." }, { status: 503 });
  }
  const body = await req.json().catch(() => null);
  const email = String(body?.email || "");
  const password = String(body?.password || "");
  if (!verifyCredentials(email, password)) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

  const response = NextResponse.json({ ok: true });
  response.cookies.set(sessionCookie, createSession(email), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: sessionMaxAge,
  });
  return response;
}
