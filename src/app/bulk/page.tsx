"use client";
import { useState } from "react";
import Header from "@/components/Header";

export default function BulkPage() {
  const [sent, setSent] = useState(false);
  return (
    <>
      <Header />
      <main className="container" style={{ maxWidth: 640, margin: "0 auto", padding: "50px 0" }}>
        <h1 style={{ fontSize: 30, fontWeight: 600, marginBottom: 8 }}>Get a Bulk Quote</h1>
        <p style={{ color: "var(--ink-soft)", marginBottom: 28 }}>Best pricing, priority delivery &amp; dedicated support for orders of 50 pieces or more.</p>
        {sent ? (
          <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 16, padding: 26, textAlign: "center" }}>
            <h3 style={{ marginBottom: 8 }}>Thanks — request sent!</h3>
            <p style={{ color: "var(--ink-soft)", fontSize: 14 }}>Our team will reach out shortly with pricing.</p>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} style={{ display: "grid", gap: 14, background: "#fff", border: "1px solid var(--line)", borderRadius: 16, padding: 26 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <input placeholder="Company name" required style={{ padding: 11, border: "1px solid var(--line)", borderRadius: 8 }} />
              <input placeholder="Contact person" required style={{ padding: 11, border: "1px solid var(--line)", borderRadius: 8 }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <input placeholder="Email" type="email" required style={{ padding: 11, border: "1px solid var(--line)", borderRadius: 8 }} />
              <input placeholder="Phone number" required style={{ padding: 11, border: "1px solid var(--line)", borderRadius: 8 }} />
            </div>
            <select required style={{ padding: 11, border: "1px solid var(--line)", borderRadius: 8 }}>
              <option value="">What do you need?</option>
              <option>T-Shirts</option><option>Hoodies</option><option>Drinkware</option><option>Welcome Kits</option><option>Mixed Order</option>
            </select>
            <input placeholder="Estimated quantity (e.g. 200)" type="number" style={{ padding: 11, border: "1px solid var(--line)", borderRadius: 8 }} />
            <textarea placeholder="Anything else we should know?" rows={3} style={{ padding: 11, border: "1px solid var(--line)", borderRadius: 8, fontFamily: "inherit" }} />
            <button className="btn btn-primary" type="submit">Request Quote →</button>
          </form>
        )}
      </main>
    </>
  );
}
