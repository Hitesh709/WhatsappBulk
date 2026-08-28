"use client";

import { FormEvent, useEffect, useState } from "react";

type Campaign = { id: string; name: string; templateName: string; language: string; status: string; createdAt: string };

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [name, setName] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [language, setLanguage] = useState("en");
  const [notice, setNotice] = useState("");

  async function load() {
    const r = await fetch("/api/campaigns");
    if (r.ok) setCampaigns(await r.json());
  }
  useEffect(() => { load(); }, []);

  async function create(e: FormEvent) {
    e.preventDefault(); setNotice("");
    const r = await fetch("/api/campaigns", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, templateName, language }) });
    const data = await r.json();
    if (!r.ok) return setNotice(data.error || "Could not create campaign");
    setName(""); setTemplateName(""); setNotice("Campaign created successfully."); load();
  }

  return <main className="shell">
    <header className="top"><div><div className="brand">Campaign Builder</div><div className="label">Build campaigns for consented WhatsApp leads</div></div><a className="btn secondary" href="/">Dashboard</a></header>
    <section className="card section"><h2>Create campaign</h2><form className="form" onSubmit={create}>
      <label>Campaign name<input value={name} onChange={e => setName(e.target.value)} placeholder="August customer offer" required /></label>
      <label>Approved template name<input value={templateName} onChange={e => setTemplateName(e.target.value)} placeholder="customer_offer" required /></label>
      <label>Language<select value={language} onChange={e => setLanguage(e.target.value)}><option value="en">English</option><option value="hi">Hindi</option><option value="gu">Gujarati</option></select></label>
      <button className="btn" type="submit">Create campaign</button>
    </form>{notice && <p className="label">{notice}</p>}</section>
    <section className="card section"><h2>Your campaigns</h2>{campaigns.length === 0 ? <p className="label">No campaigns yet.</p> : <table className="table"><thead><tr><th>Name</th><th>Template</th><th>Language</th><th>Status</th></tr></thead><tbody>{campaigns.map(c => <tr key={c.id}><td>{c.name}</td><td>{c.templateName}</td><td>{c.language}</td><td>{c.status}</td></tr>)}</tbody></table>}</section>
  </main>;
}
