import Link from "next/link";

export default function CampaignsPage() {
  return <main className="shell"><header className="top"><div><div className="brand">Campaigns</div><div className="label">Create and manage WhatsApp campaigns</div></div><Link className="btn secondary" href="/">Dashboard</Link></header><section className="card section"><h2>Campaign builder</h2><p>Campaign creation is the next step. It will select only consented, non-opted-out leads and use approved WhatsApp templates.</p><div className="actions"><Link className="btn" href="/import">Import leads first</Link></div></section></main>;
}
