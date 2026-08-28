"use client";

import { ChangeEvent, useState } from "react";
import Link from "next/link";

function parseCSV(text: string) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];
  const headers = lines[0].split(",").map(x => x.trim().toLowerCase());
  return lines.slice(1).map(line => {
    const values = line.split(",");
    return Object.fromEntries(headers.map((h, i) => [h, (values[i] ?? "").trim()]));
  });
}

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  async function upload() {
    if (!file) return;
    setBusy(true); setResult(null);
    try {
      const rows = parseCSV(await file.text());
      const res = await fetch("/api/leads/import", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ leads: rows }) });
      setResult(await res.json());
    } catch { setResult({ error: "Upload failed" }); }
    finally { setBusy(false); }
  }

  return <main className="shell">
    <header className="top"><div><div className="brand">Import Leads</div><div className="label">CSV upload for your ad campaign database</div></div><Link className="btn secondary" href="/">Dashboard</Link></header>
    <section className="card section">
      <h2>Upload customer CSV</h2>
      <p className="label">Required columns: <b>name, phone, consent</b>. Optional: source.</p>
      <input type="file" accept=".csv,text/csv" onChange={(e: ChangeEvent<HTMLInputElement>) => setFile(e.target.files?.[0] ?? null)} />
      <div className="actions" style={{marginTop:16}}><button className="btn" disabled={!file || busy} onClick={upload}>{busy ? "Importing…" : "Import leads"}</button></div>
      {result && <pre className="result">{JSON.stringify(result, null, 2)}</pre>}
    </section>
    <section className="card section"><h2>Example CSV</h2><pre className="result">name,phone,consent,source{`\n`}Rahul,+919876543210,true,Facebook Lead Ad{`\n`}Priya,+919812345678,false,Instagram Lead Ad</pre></section>
    <section className="card section"><b>Safety:</b> importing a lead does not make them WhatsApp-marketing eligible. Campaign sending will only target <b>consent=true</b> and <b>optedOut=false</b> contacts.</section>
  </main>;
}
