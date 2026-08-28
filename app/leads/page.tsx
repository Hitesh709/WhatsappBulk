"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Lead={id:string;name:string;phone:string;consent:boolean;optedOut:boolean;source?:string|null;createdAt:string};
type Stats={total:number;consented:number;optedOut:number;notConsented:number};
export default function LeadsPage(){
 const [leads,setLeads]=useState<Lead[]>([]),[stats,setStats]=useState<Stats>({total:0,consented:0,optedOut:0,notConsented:0}),[status,setStatus]=useState("all"),[search,setSearch]=useState(""),[loading,setLoading]=useState(false);
 async function load(){setLoading(true);try{const r=await fetch(`/api/leads?status=${status}&search=${encodeURIComponent(search)}`);const d=await r.json();if(r.ok){setLeads(d.leads);setStats(d.stats)}}finally{setLoading(false)}}
 useEffect(()=>{load()},[status]);
 return <main className="shell"><header className="top"><div><div className="brand">Lead Database</div><div className="label">Manage customers and WhatsApp consent</div></div><Link className="btn secondary" href="/">Dashboard</Link></header>
 <section className="stats"><div className="card stat"><div className="label">Total</div><div className="value">{stats.total.toLocaleString()}</div></div><div className="card stat"><div className="label">Consented</div><div className="value">{stats.consented.toLocaleString()}</div></div><div className="card stat"><div className="label">Not consented</div><div className="value">{stats.notConsented.toLocaleString()}</div></div><div className="card stat"><div className="label">Opted out</div><div className="value">{stats.optedOut.toLocaleString()}</div></div></section>
 <section className="card section"><div className="toolbar"><input className="input" value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==='Enter'&&load()} placeholder="Search name or phone"/><select className="input" value={status} onChange={e=>setStatus(e.target.value)}><option value="all">All leads</option><option value="consented">Consented</option><option value="not_consented">Not consented</option><option value="opted_out">Opted out</option></select><button className="btn" onClick={load}>{loading?"Loading…":"Search"}</button></div>
 <table className="table"><thead><tr><th>Name</th><th>Phone</th><th>Consent</th><th>Source</th><th>Created</th></tr></thead><tbody>{leads.map(l=><tr key={l.id}><td>{l.name}</td><td>{l.phone}</td><td>{l.optedOut?"OPTED OUT":l.consent?"CONSENTED":"NOT CONSENTED"}</td><td>{l.source??"—"}</td><td>{new Date(l.createdAt).toLocaleDateString()}</td></tr>)}</tbody></table>{!leads.length&&!loading&&<p className="label">No leads found.</p>}</section></main>
}
