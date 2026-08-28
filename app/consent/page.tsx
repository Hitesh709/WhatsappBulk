"use client";

import { FormEvent, useState } from "react";

export default function ConsentPage() {
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault(); setError("");
    if (!consent) return setError("Please confirm that you agree to receive WhatsApp messages.");
    const r = await fetch("/api/leads/consent", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone, consent: true }) });
    const data = await r.json();
    if (!r.ok) return setError(data.error || "We could not save your consent. Please check the number.");
    setDone(true);
  }

  return <main className="shell" style={{maxWidth:620,margin:"0 auto"}}><section className="card section" style={{marginTop:80}}>
    <div className="brand">WhatsApp Updates</div>
    {done ? <><h1>You're subscribed</h1><p className="label">Thank you. You can now receive WhatsApp updates and offers from us. You can opt out at any time.</p></> : <><h1>Stay connected with us</h1><p className="label">Enter your WhatsApp number and choose whether you want to receive updates, offers and important customer messages.</p><form className="form" onSubmit={submit}>
      <label>WhatsApp mobile number<input type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="919876543210" required /></label>
      <label style={{display:"flex",gap:10,alignItems:"flex-start"}}><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} required style={{marginTop:4}}/><span>I agree to receive WhatsApp messages, including customer updates, offers and promotions. I understand I can opt out at any time.</span></label>
      <button className="btn" type="submit">Subscribe on WhatsApp</button>
    </form>{error&&<p className="label">{error}</p>}</>}
  </section></main>;
}
