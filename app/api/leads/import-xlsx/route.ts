import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";
export const runtime="nodejs";
const clean=(v:unknown)=>String(v??"").trim();
const norm=(v:string)=>v.toLowerCase().replace(/[^a-z0-9]/g,"");
const phone=(v:unknown)=>clean(v).replace(/\D/g,"");
const yes=(v:unknown)=>["true","yes","y","1","optedin","consented"].includes(norm(clean(v)));
const aliases={name:["name","fullname","customername","customer"],phone:["phone","phonenumber","mobile","mobileno","mobilenumber","whatsapp","whatsappnumber","contactnumber"],consent:["consent","whatsappconsent","whatsappoptin","optin","optedin","marketingconsent"],source:["source","leadsource","campaign","utm_source"]};
function find(row:Record<string,unknown>, keys:string[]){const entries=Object.entries(row);for(const key of keys){const hit=entries.find(([k])=>norm(k)===key);if(hit)return hit[1]}return ""}
export async function POST(req:Request){const form=await req.formData();const file=form.get("file");if(!(file instanceof File))return NextResponse.json({error:"Excel file is required"},{status:400});const wb=XLSX.read(Buffer.from(await file.arrayBuffer()),{type:"buffer",cellDates:true});const sheet=wb.Sheets[wb.SheetNames[0]];if(!sheet)return NextResponse.json({error:"Workbook has no sheets"},{status:400});const rows=XLSX.utils.sheet_to_json<Record<string,unknown>>(sheet,{defval:""});let imported=0,skipped=0;for(const row of rows){const p=phone(find(row,aliases.phone));if(!p){skipped++;continue}const consent=yes(find(row,aliases.consent));const name=clean(find(row,aliases.name))||"Customer";const source=clean(find(row,aliases.source))||"XLSX_IMPORT";await prisma.lead.upsert({where:{phone:p},update:{name,source},create:{phone:p,name,source,consent,consentAt:consent?new Date():null,optedOut:false}});imported++}return NextResponse.json({imported,skipped,rows:rows.length,sheet:wb.SheetNames[0]})}
