import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const status = url.searchParams.get("status") ?? "all";
  const search = url.searchParams.get("search")?.trim() ?? "";
  const where: any = {};
  if (status === "consented") where.consent = true;
  if (status === "not_consented") where.consent = false;
  if (status === "opted_out") where.optedOut = true;
  if (search) where.OR = [{ name: { contains: search, mode: "insensitive" } }, { phone: { contains: search } }];
  const [leads,total,consented,optedOut] = await Promise.all([
    prisma.lead.findMany({ where, orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.lead.count(), prisma.lead.count({ where: { consent: true, optedOut: false } }), prisma.lead.count({ where: { optedOut: true } })
  ]);
  return NextResponse.json({ leads, stats: { total, consented, optedOut, notConsented: total - consented - optedOut } });
}
