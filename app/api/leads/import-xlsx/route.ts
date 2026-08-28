import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
function clean(v: unknown) { return String(v ?? "").trim(); }
function phone(v: unknown) { return clean(v).replace(/\D/g, ""); }
function yes(v: unknown) { return ["true","yes","y","1","opted_in","consented"].includes(clean(v).toLowerCase()); }

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Excel file is required" }, { status: 400 });
  const workbook = XLSX.read(Buffer.from(await file.arrayBuffer()), { type: "buffer", cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) return NextResponse.json({ error: "Workbook has no sheets" }, { status: 400 });
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
  let imported = 0, skipped = 0;
  for (const row of rows) {
    const normalized = Object.fromEntries(Object.entries(row).map(([k,v]) => [k.toLowerCase().trim(), v]));
    const p = phone(normalized.phone ?? normalized.mobile ?? normalized.whatsapp ?? normalized["phone number"]);
    if (!p) { skipped++; continue; }
    const consent = yes(normalized.consent ?? normalized["whatsapp consent"] ?? normalized.opted_in);
    await prisma.lead.upsert({ where: { phone: p }, update: { name: clean(normalized.name ?? normalized.full_name ?? normalized.customer_name) || "Customer", source: clean(normalized.source) || "XLSX_IMPORT" }, create: { phone: p, name: clean(normalized.name ?? normalized.full_name ?? normalized.customer_name) || "Customer", source: clean(normalized.source) || "XLSX_IMPORT", consent, consentAt: consent ? new Date() : null, optedOut: false } });
    imported++;
  }
  return NextResponse.json({ imported, skipped, sheet: workbook.SheetNames[0], rows: rows.length });
}
