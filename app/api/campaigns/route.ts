import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const campaigns = await prisma.campaign.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(campaigns);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body?.name ?? "").trim();
    const templateName = String(body?.templateName ?? "").trim();
    const language = String(body?.language ?? "en").trim() || "en";
    if (!name || !templateName) return NextResponse.json({ error: "name and templateName are required" }, { status: 400 });
    const campaign = await prisma.campaign.create({ data: { name, templateName, language, status: "DRAFT" } });
    return NextResponse.json(campaign, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to create campaign" }, { status: 500 });
  }
}
