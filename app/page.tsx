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
    <header className="top"><div><div className="brand">WhatsAppBulk</div><div className="label">Campaign manager for consented leads</div></div><span className="badge">COMPLIANCE FIRST</span></header>
    <section className="grid">
      <div className="card"><div className="label">Total leads</div><div className="metric">{s.leads.toLocaleString()}</div></div>
      <div className="card"><div className="label">WhatsApp opted-in</div><div className="metric">{s.optedIn.toLocaleString()}</div></div>
      <div className="card"><div className="label">Campaigns</div><div className="metric">{s.campaigns.toLocaleString()}</div></div>
      <div className="card"><div className="label">Messages sent</div><div className="metric">{s.sent.toLocaleString()}</div></div>
    </section>
    <section className="card section"><h2>Campaign workflow</h2><div className="actions"><button className="btn">Import leads</button><button className="btn secondary">Create campaign</button><button className="btn secondary">Templates</button><button className="btn secondary">Message reports</button></div></section>
    <section className="card section"><h2>Rules built into the platform</h2><table className="table"><tbody>
      <tr><td>WhatsApp consent required</td><td className="ok">ENFORCED</td></tr>
      <tr><td>Opted-out contacts suppressed</td><td className="ok">ENFORCED</td></tr>
      <tr><td>Official Cloud API only</td><td className="ok">ENFORCED</td></tr>
      <tr><td>WhatsApp Web automation</td><td className="warn">NOT USED</td></tr>
    </tbody></table></section>
  </main>;
}
