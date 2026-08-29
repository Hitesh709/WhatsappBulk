"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError("");
    try {
      const r = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Login failed");
      router.push("/"); router.refresh();
    } catch (err) { setError(err instanceof Error ? err.message : "Login failed"); }
    finally { setBusy(false); }
  }

  return <main className="authShell">
    <form className="authCard" onSubmit={submit}>
      <div className="brand">WhatsAppBulk</div>
      <div className="label">V2 Admin Portal</div>
      <h1>Sign in</h1>
      <label>Email<input value={email} onChange={e => setEmail(e.target.value)} type="email" autoComplete="username" required /></label>
      <label>Password<input value={password} onChange={e => setPassword(e.target.value)} type="password" autoComplete="current-password" required /></label>
      {error && <div className="error">{error}</div>}
      <button className="btn" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
      <p className="hint">Admin access only. Configure credentials in Netlify environment variables.</p>
    </form>
  </main>;
}
