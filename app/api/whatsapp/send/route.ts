import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTemplateMessage } from "@/lib/whatsapp";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { campaignId: string; leadIds: string[]; templateName: string; language?: string };
    if (!body.campaignId || !body.leadIds?.length || !body.templateName) return NextResponse.json({ error: "campaignId, leadIds and templateName are required" }, { status: 400 });

    const leads = await prisma.lead.findMany({ where: { id: { in: body.leadIds }, consent: true, optedOut: false } });
    const results = [];
    for (const lead of leads) {
      const message = await prisma.message.create({ data: { leadId: lead.id, campaignId: body.campaignId, status: "QUEUED" } });
      try {
        const result = await sendTemplateMessage({ to: lead.phone, templateName: body.templateName, language: body.language || "en" });
        const whatsappId = result?.messages?.[0]?.id;
        await prisma.message.update({ where: { id: message.id }, data: { status: "SENT", whatsappId, sentAt: new Date() } });
        results.push({ leadId: lead.id, status: "SENT", whatsappId });
      } catch (error) {
        await prisma.message.update({ where: { id: message.id }, data: { status: "FAILED", errorMessage: error instanceof Error ? error.message : "Unknown error" } });
        results.push({ leadId: lead.id, status: "FAILED" });
      }
    }
    return NextResponse.json({ requested: body.leadIds.length, eligible: leads.length, results });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid request" }, { status: 500 }); }
}
