import { NextResponse } from "next/server";
import { sessionCookie } from "@/lib/auth";

export async function POST(req: Request) {
  const response = NextResponse.redirect(new URL("/login", req.url));
  response.cookies.set(sessionCookie, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
  return response;
}
