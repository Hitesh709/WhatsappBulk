import { NextRequest, NextResponse } from "next/server";
import { verifySession, sessionCookie } from "@/lib/auth";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const publicPath = path === "/login" || path.startsWith("/consent") || path.startsWith("/api/auth/") || path.startsWith("/api/leads/consent") || path.startsWith("/api/webhooks/") || path.startsWith("/api/whatsapp/webhook") || path.startsWith("/api/meta/leads/webhook");
  if (publicPath) return NextResponse.next();

  const session = request.cookies.get(sessionCookie)?.value;
  if (verifySession(session)) return NextResponse.next();

  if (path.startsWith("/api/")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
