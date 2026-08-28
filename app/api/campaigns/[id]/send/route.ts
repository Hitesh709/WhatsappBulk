import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTemplateMessage } from "@/lib/whatsapp";

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const campaign = await prisma.campaign.findUnique({ where: { id }, include: { messages: { where: { status: "QUEUED" }, include: { lead: true }, take: 100 } } });
  if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });

  let sent = 0, failed = 0;
  for (const message of campaign.messages) {
    if (!message.lead.consent || message.lead.optedOut) {
      await prisma.message.update({ where: { id: message.id }, data: { status: "SUPPRESSED" } });
      continue;
    }
    try {
      const result = await sendTemplateMessage({ to: message.lead.phone, templateName: campaign.templateName, language: campaign.language });
      await prisma.message.update({ where: { id: message.id }, data: { status: "SENT", providerMessageId: result?.messages?.[0]?.id ?? null, sentAt: new Date() } });
      sent++;
    } catch (error) {
      await prisma.message.update({ where: { id: message.id }, data: { status: "FAILED", error: error instanceof Error ? error.message : "Send failed" } });
      failed++;
    }
  }
  return NextResponse.json({ processed: campaign.messages.length, sent, failed });
}
