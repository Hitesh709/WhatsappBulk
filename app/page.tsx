import Link from "next/link";
import { prisma } from "@/lib/prisma";

async function stats() {
  try {
    const [leads, optedIn, campaigns, sent] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { consent: true, optedOut: false } }),
      prisma.campaign.count(),
      prisma.message.count({ where: { status: { in: ["SENT", "DELIVERED", "READ"] } } })
    ]);
    return { leads, optedIn, campaigns, sent };
  } catch { return { leads: 0, optedIn: 0, campaigns: 0, sent: 0 }; }
}

export default async function Home() {
  const s = await stats();
  return <main className="shell">
    <header className="top"><div><div className="brand">WhatsAppBulk <span className="version">V2</span></div><div className="label">Campaign manager for consented leads</div></div><div className="actions"><span className="badge">COMPLIANCE FIRST</span><Link className="btn secondary" href="/settings">Settings</Link><form action="/api/auth/logout" method="post"><button className="btn secondary" type="submit">Sign out</button></form></div></header>
    <section className="grid">
      <div className="card"><div className="label">Total leads</div><div className="metric">{s.leads.toLocaleString()}</div></div>
      <div className="card"><div className="label">WhatsApp opted-in</div><div className="metric">{s.optedIn.toLocaleString()}</div></div>
      <div className="card"><div className="label">Campaigns</div><div className="metric">{s.campaigns.toLocaleString()}</div></div>
      <div className="card"><div className="label">Messages sent</div><div className="metric">{s.sent.toLocaleString()}</div></div>
    </section>
    <section className="card section"><h2>Campaign workflow</h2><div className="actions"><Link className="btn" href="/import">Import leads</Link><Link className="btn secondary" href="/campaigns">Create campaign</Link><Link className="btn secondary" href="/templates">Templates</Link><Link className="btn secondary" href="/reports">Message reports</Link></div></section>
    <section className="card section"><h2>V2 rollout</h2><div className="grid miniGrid"><div><strong>01</strong><div>Admin login</div><span className="ok">ENABLED</span></div><div><strong>02</strong><div>Lead import & consent</div><span className="ok">READY</span></div><div><strong>03</strong><div>Campaigns & templates</div><span className="ok">READY</span></div><div><strong>04</strong><div>WhatsApp Cloud API</div><span className="warn">CONFIGURE</span></div></div></section>
    <section className="card section"><h2>Rules built into the platform</h2><table className="table"><tbody><tr><td>WhatsApp consent required</td><td className="ok">ENFORCED</td></tr><tr><td>Opted-out contacts suppressed</td><td className="ok">ENFORCED</td></tr><tr><td>Official Cloud API only</td><td className="ok">ENFORCED</td></tr><tr><td>WhatsApp Web automation</td><td className="warn">NOT USED</td></tr></tbody></table></section>
  </main>;
}
