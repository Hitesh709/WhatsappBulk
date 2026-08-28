import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const url = new URL(req.url);
  if (url.searchParams.get("hub.mode") === "subscribe" && url.searchParams.get("hub.verify_token") === process.env.META_LEAD_WEBHOOK_VERIFY_TOKEN) {
    return new Response(url.searchParams.get("hub.challenge") ?? "", { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

export async function POST(req: Request) {
  const payload = await req.json().catch(() => null);
  if (!payload) return NextResponse.json({ ok: false }, { status: 400 });

  // Meta Lead Ads sends a leadgen_id. Fetch the lead details server-side using META_ACCESS_TOKEN.
  // We intentionally default consent to false: a lead must explicitly opt in to WhatsApp marketing.
  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const leadgenId = change.value?.leadgen_id;
      if (!leadgenId) continue;
      const token = process.env.META_ACCESS_TOKEN;
      const graphVersion = process.env.META_GRAPH_VERSION ?? "v23.0";
      if (!token) continue;
      const response = await fetch(`https://graph.facebook.com/${graphVersion}/${encodeURIComponent(leadgenId)}?access_token=${encodeURIComponent(token)}`);
      if (!response.ok) continue;
      const lead = await response.json();
      const fields = Object.fromEntries((lead.field_data ?? []).map((f: {name:string;values?:string[]}) => [f.name, f.values?.[0] ?? ""]));
      const phone = String(fields.phone_number ?? fields.phone ?? "").replace(/\D/g, "");
      if (!phone) continue;
      const name = String(fields.full_name ?? fields.name ?? "").trim() || "Customer";
      await prisma.lead.upsert({ where: { phone }, update: { name, source: "META_LEAD_AD" }, create: { phone, name, source: "META_LEAD_AD", consent: false, optedOut: false } });
    }
  }
  return NextResponse.json({ ok: true });
}
