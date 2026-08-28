import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) return new Response(challenge || "", { status: 200 });
  return new Response("Forbidden", { status: 403 });
}

export async function POST(request: Request) {
  const payload = await request.json();
  try {
    for (const entry of payload.entry || []) for (const change of entry.changes || []) {
      for (const status of change.value?.statuses || []) {
        const update: Record<string, Date> = {};
        if (status.status === "delivered") update.deliveredAt = new Date();
        if (status.status === "read") update.readAt = new Date();
        if (Object.keys(update).length) await prisma.message.updateMany({ where: { whatsappId: status.id }, data: { ...update, status: status.status.toUpperCase() } });
      }
      for (const message of change.value?.messages || []) {
        const from = message.from;
        if (from) await prisma.lead.updateMany({ where: { phone: from }, data: { updatedAt: new Date() } });
      }
    }
  } catch (error) { console.error("WhatsApp webhook error", error); }
  return NextResponse.json({ received: true });
}
