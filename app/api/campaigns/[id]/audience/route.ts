import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const campaign = await prisma.campaign.findUnique({ where: { id } });
  if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  const body = await req.json().catch(() => ({}));
  const requested = Array.isArray(body?.leadIds) ? body.leadIds.map(String) : null;
  const leads = await prisma.lead.findMany({ where: { id: requested ? { in: requested } : undefined, consent: true, optedOut: false }, select: { id: true } });
  if (!leads.length) return NextResponse.json({ error: "No opted-in leads available" }, { status: 400 });
  const result = await prisma.message.createMany({ data: leads.map((lead) => ({ leadId: lead.id, campaignId: id, status: "QUEUED" })), skipDuplicates: true });
  return NextResponse.json({ queued: result.count, suppressed: (requested?.length ?? leads.length) - result.count });
}
