import Link from "next/link";

function status(value: boolean) { return value ? "CONFIGURED" : "NOT CONFIGURED"; }
function cls(value: boolean) { return value ? "ok" : "warn"; }

export default function SettingsPage() {
  const items = [
    ["Database", Boolean(process.env.DATABASE_URL), "DATABASE_URL"],
    ["Admin email", Boolean(process.env.ADMIN_EMAIL), "ADMIN_EMAIL"],
    ["Admin password", Boolean(process.env.ADMIN_PASSWORD), "ADMIN_PASSWORD"],
    ["Session secret", Boolean(process.env.AUTH_SECRET || process.env.SESSION_SECRET), "AUTH_SECRET"],
    ["WhatsApp access token", Boolean(process.env.WHATSAPP_ACCESS_TOKEN), "WHATSAPP_ACCESS_TOKEN"],
    ["WhatsApp phone number ID", Boolean(process.env.WHATSAPP_PHONE_NUMBER_ID), "WHATSAPP_PHONE_NUMBER_ID"],
    ["WhatsApp verify token", Boolean(process.env.WHATSAPP_VERIFY_TOKEN), "WHATSAPP_VERIFY_TOKEN"],
  ] as const;

  return <main className="shell">
    <header className="top"><div><div className="brand">WhatsAppBulk</div><div className="label">V2 configuration</div></div><Link className="btn secondary" href="/">Dashboard</Link></header>
    <section className="card section"><h2>System configuration</h2><p className="hint">Only configuration status is shown. Secret values are never displayed.</p>
      <table className="table"><thead><tr><th>Service</th><th>Environment variable</th><th>Status</th></tr></thead><tbody>{items.map(([name, value, env]) => <tr key={env}><td>{name}</td><td><code>{env}</code></td><td className={cls(value)}>{status(value)}</td></tr>)}</tbody></table>
    </section>
    <section className="card section"><h2>V2 rollout</h2><ul><li>Admin authentication</li><li>Consent-first lead import</li><li>Campaign and template management</li><li>WhatsApp Cloud API integration</li><li>Webhook delivery tracking</li><li>Production queue and scale-up comes after test validation</li></ul></section>
  </main>;
}
