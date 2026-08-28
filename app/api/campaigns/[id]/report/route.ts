import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const campaign = await prisma.campaign.findUnique({ where: { id }, select: { id: true, name: true, status: true, createdAt: true, startedAt: true, completedAt: true } });
  if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  const groups = await prisma.message.groupBy({ by: ["status"], where: { campaignId: id }, _count: { _all: true } });
  const counts: Record<string, number> = {};
  for (const group of groups) counts[group.status] = group._count._all;
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const pct = (n: number) => total ? Math.round((n / total) * 1000) / 10 : 0;
  return NextResponse.json({ campaign, total, counts, percentages: Object.fromEntries(Object.entries(counts).map(([k, v]) => [k, pct(v)])) });
}
