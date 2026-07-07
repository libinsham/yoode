"use client";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import ProductThumb from "@/components/ProductThumb";
import { getCart, removeFromCart, clearCart } from "@/lib/cart";
import { CartItem, money } from "@/lib/types";

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [placedId, setPlacedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "" });

  useEffect(() => { setCart(getCart()); }, []);

  function remove(i: number) {
    removeFromCart(i);
    setCart(getCart());
  }

  const total = cart.reduce((s, i) => s + i.total, 0);

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerName: form.name, phone: form.phone, address: form.address, items: cart }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (res.ok) {
      clearCart();
      setPlacedId(data.id);
    } else {
      alert(data.error || "Something went wrong placing the order.");
    }
  }

  if (placedId) {
    return (
      <>
        <Header />
        <div className="container" style={{ padding: "80px 0", textAlign: "center", color: "var(--ink-soft)" }}>
          <h2 style={{ marginBottom: 10, color: "var(--ink)" }}>Order placed 🎉</h2>
          <p>Order ID: <b>{placedId}</b><br />We'll reach out at {form.phone} with delivery updates.</p>
          <a className="btn btn-primary" style={{ marginTop: 18, display: "inline-block" }} href="/shop">Continue Shopping →</a>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="container">
        <h1 style={{ paddingTop: 30, fontSize: 28, fontWeight: 600 }}>Your Cart</h1>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 28, padding: "36px 0" }}>
          <div>
            {cart.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0", color: "var(--ink-soft)" }}>
                <p>Your cart is empty.</p>
                <a className="btn btn-primary" href="/shop">Browse Products →</a>
              </div>
            ) : cart.map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 16, border: "1px solid var(--line)", borderRadius: 14, padding: 14, marginBottom: 14, background: "#fff" }}>
                <div style={{ width: 84, height: 84, borderRadius: 10, flexShrink: 0, overflow: "hidden" }}>
                  <ProductThumb image={item.image} color={item.color} size={64} />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: 15, marginBottom: 4 }}>{item.name}</h4>
                  <div style={{ fontSize: 12.5, color: "var(--ink-soft)", display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <span>Color: {item.color}</span><span>Size: {item.size}</span><span>{item.printType}</span><span>Qty: {item.qty}</span>{item.logo && <span>✓ Custom logo</span>}
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 15, marginTop: 6 }}>{money(item.total)}</div>
                  <button onClick={() => remove(i)} style={{ background: "none", border: "none", color: "#A3392F", fontSize: 12.5, fontWeight: 600, cursor: "pointer", marginTop: 8 }}>Remove</button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ border: "1px solid var(--line)", borderRadius: 14, padding: 20, background: "#fff", alignSelf: "start" }}>
            <h3 style={{ marginBottom: 14 }}>Order Summary</h3>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, padding: "7px 0", color: "var(--ink-soft)" }}><span>Items ({cart.length})</span><b style={{ color: "var(--ink)" }}>{money(total)}</b></div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, padding: "7px 0", color: "var(--ink-soft)" }}><span>Shipping</span><b style={{ color: "var(--ink)" }}>Free</b></div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, fontWeight: 800, borderTop: "1px solid var(--line)", paddingTop: 10, marginTop: 6 }}>Total <span className="mono">{money(total)}</span></div>

            {cart.length > 0 && !showForm && (
              <button className="btn btn-primary btn-block" style={{ marginTop: 16 }} onClick={() => setShowForm(true)}>Proceed to Checkout</button>
            )}
            {showForm && (
              <form onSubmit={placeOrder} style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
                <input placeholder="Full name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ padding: 10, border: "1px solid var(--line)", borderRadius: 8 }} />
                <input placeholder="Phone number" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={{ padding: 10, border: "1px solid var(--line)", borderRadius: 8 }} />
                <input placeholder="Delivery address" required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} style={{ padding: 10, border: "1px solid var(--line)", borderRadius: 8 }} />
                <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>{submitting ? "Placing order…" : "Place Order"}</button>
              </form>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
