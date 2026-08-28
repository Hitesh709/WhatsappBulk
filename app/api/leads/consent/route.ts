import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const phone = String(body?.phone ?? "").replace(/\D/g, "");
  const consent = body?.consent === true;
  if (!phone || !consent) return NextResponse.json({ error: "Explicit WhatsApp consent is required" }, { status: 400 });
  const lead = await prisma.lead.update({ where: { phone }, data: { consent: true, consentAt: new Date(), optedOut: false } });
  return NextResponse.json({ ok: true, leadId: lead.id });
}
