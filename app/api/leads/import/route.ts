import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function cleanPhone(value: unknown) {
  return String(value ?? "").replace(/[^0-9+]/g, "").replace(/^00/, "+");
}

function bool(value: unknown) {
  return ["true", "yes", "y", "1", "opted-in", "optin"].includes(String(value ?? "").trim().toLowerCase());
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!Array.isArray(body?.leads)) return NextResponse.json({ error: "leads array is required" }, { status: 400 });
    const rows = body.leads.map((r: any) => ({
      name: String(r.name ?? "").trim(),
      phone: cleanPhone(r.phone),
      source: r.source ? String(r.source).trim() : null,
      consent: bool(r.consent),
      consentAt: bool(r.consent) ? new Date() : null,
      optedOut: false
    })).filter((r: any) => r.name && r.phone);
    if (!rows.length) return NextResponse.json({ error: "No valid leads found" }, { status: 400 });
    const result = await prisma.lead.createMany({ data: rows, skipDuplicates: true });
    return NextResponse.json({ imported: result.count, received: rows.length, skipped: rows.length - result.count });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}
