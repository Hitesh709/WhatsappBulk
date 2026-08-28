import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  if (mode === "subscribe" && token && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    return new Response(challenge ?? "", { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

export async function POST(req: Request) {
  const payload = await req.json().catch(() => null);
  if (!payload) return NextResponse.json({ ok: false }, { status: 400 });

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value ?? {};

      for (const status of value.statuses ?? []) {
        const message = await prisma.message.findFirst({ where: { whatsappId: status.id } });
        if (!message) continue;
        const now = new Date(status.timestamp ? Number(status.timestamp) * 1000 : Date.now());
        const update: Record<string, unknown> = {};
        if (status.status === "sent") update.status = "SENT";
        if (status.status === "delivered") { update.status = "DELIVERED"; update.deliveredAt = now; }
        if (status.status === "read") { update.status = "READ"; update.readAt = now; }
        if (status.status === "failed") { update.status = "FAILED"; update.errorCode = status.errors?.[0]?.code ? String(status.errors[0].code) : null; update.errorMessage = status.errors?.[0]?.title ?? null; }
        if (Object.keys(update).length) await prisma.message.update({ where: { id: message.id }, data: update });
      }

      for (const incoming of value.messages ?? []) {
        const phone = incoming.from;
        if (!phone) continue;
        await prisma.lead.updateMany({ where: { phone }, data: { optedOut: false } });
        await prisma.message.updateMany({ where: { lead: { phone } }, data: { repliedAt: new Date() } });
      }
    }
  }
  return NextResponse.json({ ok: true });
}
