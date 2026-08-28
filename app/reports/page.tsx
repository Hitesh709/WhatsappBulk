"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

type Campaign={id:string;name:string;status:string};
type Report={total:number;counts:Record<string,number>;percentages:Record<string,number>};
const statuses=["QUEUED","SENT","DELIVERED","READ","FAILED","SUPPRESSED"];
export default function ReportsPage(){
 const [campaigns,setCampaigns]=useState<Campaign[]>([]),[id,setId]=useState(""),[report,setReport]=useState<Report|null>(null),[error,setError]=useState("");
 useEffect(()=>{fetch("/api/campaigns").then(r=>r.json()).then(setCampaigns).catch(()=>setError("Unable to load campaigns"))},[]);
 useEffect(()=>{if(!id){setReport(null);return} setError("");fetch(`/api/campaigns/${id}/report`).then(async r=>{const d=await r.json();if(!r.ok)throw new Error(d.error);return d}).then(setReport).catch(e=>setError(e.message))},[id]);
 return <main className="shell"><header className="top"><div><div className="brand">Message Reports</div><div className="label">Live campaign delivery and engagement</div></div><Link className="btn secondary" href="/">Dashboard</Link></header>
 <section className="card section"><h2>Campaign</h2><select className="input" value={id} onChange={e=>setId(e.target.value)}><option value="">Select campaign</option>{campaigns.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>{error&&<p className="label">{error}</p>}</section>
 {report&&<><section className="stats">{["SENT","DELIVERED","READ","FAILED"].map(s=><div className="card stat" key={s}><div className="label">{s}</div><div className="value">{(report.counts[s]??0).toLocaleString()}</div><div className="label">{report.percentages[s]??0}%</div></div>)}</section><section className="card section"><h2>Campaign breakdown</h2><table className="table"><thead><tr><th>Status</th><th>Messages</th><th>Share</th></tr></thead><tbody>{statuses.map(s=><tr key={s}><td>{s}</td><td>{(report.counts[s]??0).toLocaleString()}</td><td>{report.percentages[s]??0}%</td></tr>)}</tbody></table></section></>}
 </main>
}
