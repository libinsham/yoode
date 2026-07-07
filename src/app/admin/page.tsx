"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ProductThumb from "@/components/ProductThumb";
import { Product, Order, ORDER_STATUSES, ORDER_STATUS_COLORS, money } from "@/lib/types";

const IMAGE_OPTIONS = ["tshirt","polo","hoodie","jacket","bottle","mug","backpack","notebook","tote","cap","powerbank","kit"];
const emptyForm = { id:"", name:"", category:"", image:"tshirt", imageUrl:"", images:[] as string[], price:199, moq:25, rating:4.7, reviews:0, color:"#16181D", desc:"" };

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:12 }}>
      <label style={{ fontSize:12.5, fontWeight:600, color:"var(--ink-soft)" }}>{label}</label>
      {children}
    </div>
  );
}

export default function AdminPage() {
  const [panel, setPanel] = useState("dashboard");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [search, setSearch] = useState("");
  const fileRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Order view/edit
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [orderDraft, setOrderDraft] = useState({ status: "Received", customerName: "", phone: "", address: "" });
  const [orderStatusFilter, setOrderStatusFilter] = useState("All");
  const [savingOrder, setSavingOrder] = useState(false);

  async function loadProducts() {
    const r = await fetch("/api/products");
    setProducts(await r.json());
  }
  async function loadOrders() {
    const r = await fetch("/api/orders");
    setOrders(await r.json());
  }

  useEffect(() => { loadProducts(); loadOrders(); }, []);

  function openModal(p?: Product) {
    setForm(p
      ? { ...p, imageUrl: p.imageUrl || "", images: p.images?.map(i => i.url) || [] }
      : { ...emptyForm, images: [] });
    setModalOpen(true);
  }

  async function saveProduct() {
    if (!form.name) { alert("Product name is required"); return; }
    const isEdit = !!form.id;
    try {
      const res = await fetch(isEdit ? `/api/products/${form.id}` : "/api/products", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setModalOpen(false);
        await loadProducts();
      } else {
        let msg = `Failed to save product (status ${res.status}).`;
        try {
          const data = await res.json();
          if (data?.error) msg = data.error;
        } catch {
          // response wasn't JSON — keep the generic status message
        }
        alert(msg);
      }
    } catch (err) {
      alert("Failed to save product — check your connection and try again.");
    }
  }

  async function deleteProduct(id: string) {
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    loadProducts();
  }

  function openOrderModal(o: Order) {
    setActiveOrder(o);
    setOrderDraft({
      status: o.status || "Received",
      customerName: o.customerName,
      phone: o.phone,
      address: o.address,
    });
    setOrderModalOpen(true);
  }

  async function saveOrder() {
    if (!activeOrder) return;
    setSavingOrder(true);
    try {
      const res = await fetch(`/api/orders/${activeOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderDraft),
      });
      if (res.ok) {
        setOrderModalOpen(false);
        await loadOrders();
      } else {
        let msg = `Failed to update order (status ${res.status}).`;
        try {
          const data = await res.json();
          if (data?.error) msg = data.error;
        } catch {}
        alert(msg);
      }
    } catch {
      alert("Failed to update order — check your connection and try again.");
    } finally {
      setSavingOrder(false);
    }
  }

  // Quick status change directly from the table, without opening the modal
  async function quickSetStatus(o: Order, status: string) {
    const res = await fetch(`/api/orders/${o.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) loadOrders();
    else alert("Failed to update order status.");
  }

  function handleImageFile(file: File, slot: number) {
    if (file.size > 3 * 1024 * 1024) { alert("Image must be under 3MB"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      const imgs = [...form.images];
      imgs[slot] = url;
      setForm({ ...form, images: imgs });
    };
    reader.readAsDataURL(file);
  }

  function removeImage(slot: number) {
    const imgs = [...form.images];
    imgs.splice(slot, 1);
    setForm({ ...form, images: imgs });
  }

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  const revenue = orders.reduce((s, o) => s + o.total, 0);
  const filteredOrders = orderStatusFilter === "All" ? orders : orders.filter(o => (o.status || "Received") === orderStatusFilter);
  const receivedCount = orders.filter(o => (o.status || "Received") === "Received").length;

  const navItems = [
    { key:"dashboard", label:"📊 Dashboard" },
    { key:"products",  label:"🛍️ Products"  },
    { key:"orders",    label:"📦 Orders"     },
  ];

  return (
    <div style={{ display:"grid", gridTemplateColumns:"220px 1fr", minHeight:"100vh", fontFamily:"Inter,sans-serif" }}>
      {/* Sidebar */}
      <aside style={{ background:"#16181D", color:"#cfd2d8", padding:"24px 16px", display:"flex", flexDirection:"column" }}>
        <Link href="/" style={{ display:"flex", alignItems:"center", gap:8, color:"#fff", fontWeight:700, fontSize:18, marginBottom:30, textDecoration:"none" }}>
          <span style={{ width:28, height:28, borderRadius:7, background:"#FF6A1A", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800 }}>Y</span>
          Yoode Admin
        </Link>
        <nav style={{ display:"flex", flexDirection:"column", gap:4 }}>
          {navItems.map(n => (
            <button key={n.key} onClick={() => setPanel(n.key)}
              style={{ textAlign:"left", background: panel===n.key ? "rgba(255,255,255,.1)" : "none", border:"none", color: panel===n.key ? "#fff" : "#9da2ab", padding:"11px 12px", borderRadius:8, fontSize:13.5, fontWeight:600, cursor:"pointer" }}>
              {n.label}
            </button>
          ))}
        </nav>
        <div style={{ marginTop:"auto" }}>
          <Link href="/" style={{ fontSize:12.5, color:"#9da2ab" }}>← Back to storefront</Link>
        </div>
      </aside>

      {/* Main */}
      <main style={{ padding:"34px 36px", background:"#FAF9F6" }}>

        {/* DASHBOARD */}
        {panel === "dashboard" && (
          <>
            <h1 style={{ fontSize:24, fontWeight:600, marginBottom:24 }}>Dashboard</h1>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:28 }}>
              {[["Total Products", products.length], ["Total Orders", orders.length], ["New Orders", receivedCount], ["Revenue", "₹"+revenue.toLocaleString("en-IN")]].map(([k,v]) => (
                <div key={String(k)} style={{ background:"#fff", border:"1px solid #E7E4DC", borderRadius:14, padding:18 }}>
                  <span style={{ fontSize:12.5, color:"var(--ink-soft)", display:"block", marginBottom:6 }}>{k}</span>
                  <strong style={{ fontSize:24, fontFamily:"Fraunces,serif" }}>{v}</strong>
                </div>
              ))}
            </div>
            <h3 style={{ marginBottom:12, fontSize:15 }}>Recent Orders</h3>
            <table style={{ width:"100%", borderCollapse:"collapse", background:"#fff", borderRadius:14, overflow:"hidden", border:"1px solid #E7E4DC" }}>
              <thead style={{ background:"#F1EEE6" }}><tr>{["Order ID","Customer","Items","Total","Status","Date"].map(h=><th key={h} style={{ padding:"10px 14px", textAlign:"left", fontSize:12, color:"#54585F", fontWeight:600, textTransform:"uppercase" }}>{h}</th>)}</tr></thead>
              <tbody>
                {orders.slice(0,6).map(o=>(
                  <tr key={o.id} onClick={()=>openOrderModal(o)} style={{ cursor:"pointer" }}>
                    <td style={{ padding:"10px 14px", fontSize:13 }}>{o.id.slice(0,10)}…</td>
                    <td style={{ padding:"10px 14px", fontSize:13 }}>{o.customerName}</td>
                    <td style={{ padding:"10px 14px", fontSize:13 }}>{o.items?.length} item(s)</td>
                    <td style={{ padding:"10px 14px", fontSize:13 }}>₹{o.total?.toLocaleString("en-IN")}</td>
                    <td style={{ padding:"10px 14px", fontSize:13 }}>
                      <span style={{ padding:"3px 10px", borderRadius:999, fontSize:11.5, fontWeight:700, background:(ORDER_STATUS_COLORS[o.status||"Received"]||"#1B5FB8")+"1A", color:ORDER_STATUS_COLORS[o.status||"Received"]||"#1B5FB8" }}>{o.status||"Received"}</span>
                    </td>
                    <td style={{ padding:"10px 14px", fontSize:13 }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {orders.length===0 && <tr><td colSpan={6} style={{ padding:40, textAlign:"center", color:"#54585F" }}>No orders yet.</td></tr>}
              </tbody>
            </table>
          </>
        )}

        {/* PRODUCTS */}
        {panel === "products" && (
          <>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <h1 style={{ fontSize:24, fontWeight:600 }}>Products</h1>
              <button onClick={() => openModal()} style={{ background:"#FF6A1A", color:"#fff", border:"none", borderRadius:999, padding:"10px 22px", fontWeight:600, fontSize:14, cursor:"pointer" }}>+ Add Product</button>
            </div>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products…" style={{ padding:"9px 14px", border:"1px solid #E7E4DC", borderRadius:8, fontSize:13, width:240, marginBottom:16 }} />
            <table style={{ width:"100%", borderCollapse:"collapse", background:"#fff", borderRadius:14, overflow:"hidden", border:"1px solid #E7E4DC" }}>
              <thead style={{ background:"#F1EEE6" }}><tr>{["Product","Category","Price","MOQ","Images",""].map(h=><th key={h} style={{ padding:"10px 14px", textAlign:"left", fontSize:12, color:"#54585F", fontWeight:600, textTransform:"uppercase" }}>{h}</th>)}</tr></thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td style={{ padding:"10px 14px", fontSize:13 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <div style={{ width:36, height:36, borderRadius:8, overflow:"hidden", flexShrink:0 }}>
                          <ProductThumb image={p.image} color={p.color} imageUrl={p.images?.[0]?.url || p.imageUrl} size={22} />
                        </div>
                        {p.name}
                      </div>
                    </td>
                    <td style={{ padding:"10px 14px", fontSize:13 }}>{p.category}</td>
                    <td style={{ padding:"10px 14px", fontSize:13 }}>₹{p.price}</td>
                    <td style={{ padding:"10px 14px", fontSize:13 }}>{p.moq}</td>
                    <td style={{ padding:"10px 14px", fontSize:13 }}>{p.images?.length || 0}/5</td>
                    <td style={{ padding:"10px 14px" }}>
                      <button onClick={()=>openModal(p)} style={{ background:"none", border:"none", color:"#1B5FB8", fontWeight:600, fontSize:12.5, cursor:"pointer", marginRight:8 }}>Edit</button>
                      <button onClick={()=>deleteProduct(p.id)} style={{ background:"none", border:"none", color:"#A3392F", fontWeight:600, fontSize:12.5, cursor:"pointer" }}>Delete</button>
                    </td>
                  </tr>
                ))}
                {filtered.length===0 && <tr><td colSpan={6} style={{ padding:40, textAlign:"center", color:"#54585F" }}>No products found.</td></tr>}
              </tbody>
            </table>
          </>
        )}

        {/* ORDERS */}
        {panel === "orders" && (
          <>
            <h1 style={{ fontSize:24, fontWeight:600, marginBottom:20 }}>Orders</h1>

            <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
              {["All", ...ORDER_STATUSES].map(s => {
                const count = s === "All" ? orders.length : orders.filter(o => (o.status||"Received") === s).length;
                const active = orderStatusFilter === s;
                return (
                  <button key={s} onClick={()=>setOrderStatusFilter(s)}
                    style={{
                      padding:"7px 14px", borderRadius:999, fontSize:12.5, fontWeight:600, cursor:"pointer",
                      border: active ? "1px solid transparent" : "1px solid #E7E4DC",
                      background: active ? (s==="All" ? "#16181D" : (ORDER_STATUS_COLORS[s]||"#16181D")) : "#fff",
                      color: active ? "#fff" : "#54585F",
                    }}>
                    {s} <span style={{ opacity:.75 }}>({count})</span>
                  </button>
                );
              })}
            </div>

            <table style={{ width:"100%", borderCollapse:"collapse", background:"#fff", borderRadius:14, overflow:"hidden", border:"1px solid #E7E4DC" }}>
              <thead style={{ background:"#F1EEE6" }}><tr>{["Order ID","Customer","Phone","Items","Total","Status","Date",""].map(h=><th key={h} style={{ padding:"10px 14px", textAlign:"left", fontSize:12, color:"#54585F", fontWeight:600, textTransform:"uppercase" }}>{h}</th>)}</tr></thead>
              <tbody>
                {filteredOrders.map(o=>(
                  <tr key={o.id}>
                    <td style={{ padding:"10px 14px", fontSize:13 }}>{o.id.slice(0,10)}…</td>
                    <td style={{ padding:"10px 14px", fontSize:13 }}>{o.customerName}</td>
                    <td style={{ padding:"10px 14px", fontSize:13 }}>{o.phone}</td>
                    <td style={{ padding:"10px 14px", fontSize:13 }}>{o.items?.length}</td>
                    <td style={{ padding:"10px 14px", fontSize:13 }}>₹{o.total?.toLocaleString("en-IN")}</td>
                    <td style={{ padding:"10px 14px", fontSize:13 }}>
                      <select
                        value={o.status || "Received"}
                        onChange={e => quickSetStatus(o, e.target.value)}
                        onClick={e => e.stopPropagation()}
                        style={{
                          padding:"4px 8px", borderRadius:999, fontSize:11.5, fontWeight:700, cursor:"pointer",
                          border:"1px solid #E7E4DC",
                          background:(ORDER_STATUS_COLORS[o.status||"Received"]||"#1B5FB8")+"1A",
                          color:ORDER_STATUS_COLORS[o.status||"Received"]||"#1B5FB8",
                        }}>
                        {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td style={{ padding:"10px 14px", fontSize:13 }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding:"10px 14px" }}>
                      <button onClick={()=>openOrderModal(o)} style={{ background:"none", border:"none", color:"#1B5FB8", fontWeight:600, fontSize:12.5, cursor:"pointer" }}>View</button>
                    </td>
                  </tr>
                ))}
                {filteredOrders.length===0 && <tr><td colSpan={8} style={{ padding:40, textAlign:"center", color:"#54585F" }}>No orders found.</td></tr>}
              </tbody>
            </table>
          </>
        )}
      </main>

      {/* MODAL */}
      {modalOpen && (
        <div onClick={()=>setModalOpen(false)} style={{ position:"fixed", inset:0, background:"rgba(22,24,29,.55)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100 }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:"#fff", borderRadius:18, padding:28, width:560, maxHeight:"90vh", overflowY:"auto" }}>
            <h3 style={{ marginBottom:16 }}>{form.id ? "Edit Product" : "Add Product"}</h3>

            <Field label="Product name"><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} style={{ padding:10, border:"1px solid #E7E4DC", borderRadius:8, fontSize:13.5, width:"100%" }} /></Field>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <Field label="Category"><input value={form.category} onChange={e=>setForm({...form,category:e.target.value})} placeholder="e.g. T-Shirts" style={{ padding:10, border:"1px solid #E7E4DC", borderRadius:8, fontSize:13.5 }} /></Field>
              <Field label="Fallback icon style">
                <select value={form.image} onChange={e=>setForm({...form,image:e.target.value})} style={{ padding:10, border:"1px solid #E7E4DC", borderRadius:8, fontSize:13.5 }}>
                  {IMAGE_OPTIONS.map(o=><option key={o} value={o}>{o}</option>)}
                </select>
              </Field>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <Field label="Price (₹)"><input type="number" value={form.price} onChange={e=>setForm({...form,price:Number(e.target.value)})} style={{ padding:10, border:"1px solid #E7E4DC", borderRadius:8, fontSize:13.5 }} /></Field>
              <Field label="MOQ (pcs)"><input type="number" value={form.moq} onChange={e=>setForm({...form,moq:Number(e.target.value)})} style={{ padding:10, border:"1px solid #E7E4DC", borderRadius:8, fontSize:13.5 }} /></Field>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
              <Field label="Rating"><input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={e=>setForm({...form,rating:Number(e.target.value)})} style={{ padding:10, border:"1px solid #E7E4DC", borderRadius:8, fontSize:13.5 }} /></Field>
              <Field label="Reviews"><input type="number" value={form.reviews} onChange={e=>setForm({...form,reviews:Number(e.target.value)})} style={{ padding:10, border:"1px solid #E7E4DC", borderRadius:8, fontSize:13.5 }} /></Field>
              <Field label="Swatch color"><input type="color" value={form.color} onChange={e=>setForm({...form,color:e.target.value})} style={{ padding:4, border:"1px solid #E7E4DC", borderRadius:8, height:42, width:"100%" }} /></Field>
            </div>

            <Field label="Description"><textarea value={form.desc} onChange={e=>setForm({...form,desc:e.target.value})} rows={2} style={{ padding:10, border:"1px solid #E7E4DC", borderRadius:8, fontSize:13.5, width:"100%", resize:"vertical" }} /></Field>

            {/* 5-image upload grid */}
            <Field label={`Product Photos (up to 5) — ${form.images.length}/5 uploaded`}>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:8 }}>
                {[0,1,2,3,4].map(slot => (
                  <div key={slot}>
                    {form.images[slot] ? (
                      <div style={{ position:"relative", aspectRatio:"1", borderRadius:10, overflow:"hidden", border:"1px solid #E7E4DC" }}>
                        <img src={form.images[slot]} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                        <button onClick={()=>removeImage(slot)} style={{ position:"absolute", top:4, right:4, background:"rgba(22,24,29,.7)", border:"none", color:"#fff", borderRadius:"50%", width:20, height:20, fontSize:11, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
                        {slot===0 && <span style={{ position:"absolute", bottom:4, left:4, background:"#FF6A1A", color:"#fff", fontSize:9, fontWeight:700, padding:"2px 6px", borderRadius:999 }}>MAIN</span>}
                      </div>
                    ) : (
                      <div
                        onClick={()=> form.images.length < 5 && fileRefs.current[slot]?.click()}
                        style={{ aspectRatio:"1", borderRadius:10, border:"2px dashed #E7E4DC", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", cursor: form.images.length < 5 ? "pointer" : "not-allowed", background:"#FAF9F6", fontSize:11, color:"#9da2ab", gap:4 }}
                      >
                        <span style={{ fontSize:20 }}>＋</span>
                        <span>{slot===0 ? "Main" : `Photo ${slot+1}`}</span>
                      </div>
                    )}
                    <input
                      type="file" accept="image/*"
                      ref={el => { fileRefs.current[slot] = el; }}
                      style={{ display:"none" }}
                      onChange={e => { const f = e.target.files?.[0]; if(f) handleImageFile(f, slot); e.target.value=""; }}
                    />
                  </div>
                ))}
              </div>
              <p style={{ fontSize:11.5, color:"#9da2ab", marginTop:6 }}>First photo is the main thumbnail. Max 3MB per image. PNG, JPG, WEBP.</p>
            </Field>

            <div style={{ display:"flex", gap:10, marginTop:6 }}>
              <button onClick={()=>setModalOpen(false)} style={{ flex:1, padding:"11px 0", border:"1px solid #E7E4DC", borderRadius:999, fontWeight:600, cursor:"pointer", background:"#fff" }}>Cancel</button>
              <button onClick={saveProduct} style={{ flex:1, padding:"11px 0", border:"none", borderRadius:999, fontWeight:600, cursor:"pointer", background:"#FF6A1A", color:"#fff" }}>Save Product</button>
            </div>
          </div>
        </div>
      )}

      {/* ORDER DETAIL / EDIT MODAL */}
      {orderModalOpen && activeOrder && (
        <div onClick={()=>setOrderModalOpen(false)} style={{ position:"fixed", inset:0, background:"rgba(22,24,29,.55)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100 }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:"#fff", borderRadius:18, padding:28, width:640, maxHeight:"90vh", overflowY:"auto" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
              <div>
                <h3 style={{ marginBottom:4 }}>Order #{activeOrder.id.slice(0,10)}…</h3>
                <span style={{ fontSize:12.5, color:"#9da2ab" }}>Placed {new Date(activeOrder.createdAt).toLocaleString()}</span>
              </div>
              <span style={{ padding:"5px 12px", borderRadius:999, fontSize:12, fontWeight:700, background:(ORDER_STATUS_COLORS[activeOrder.status||"Received"]||"#1B5FB8")+"1A", color:ORDER_STATUS_COLORS[activeOrder.status||"Received"]||"#1B5FB8" }}>
                {activeOrder.status || "Received"}
              </span>
            </div>

            <Field label="Order status">
              <select value={orderDraft.status} onChange={e=>setOrderDraft({...orderDraft, status:e.target.value})} style={{ padding:10, border:"1px solid #E7E4DC", borderRadius:8, fontSize:13.5 }}>
                {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <Field label="Customer name"><input value={orderDraft.customerName} onChange={e=>setOrderDraft({...orderDraft, customerName:e.target.value})} style={{ padding:10, border:"1px solid #E7E4DC", borderRadius:8, fontSize:13.5 }} /></Field>
              <Field label="Phone"><input value={orderDraft.phone} onChange={e=>setOrderDraft({...orderDraft, phone:e.target.value})} style={{ padding:10, border:"1px solid #E7E4DC", borderRadius:8, fontSize:13.5 }} /></Field>
            </div>
            <Field label="Shipping address"><textarea value={orderDraft.address} onChange={e=>setOrderDraft({...orderDraft, address:e.target.value})} rows={2} style={{ padding:10, border:"1px solid #E7E4DC", borderRadius:8, fontSize:13.5, width:"100%", resize:"vertical" }} /></Field>

            <div style={{ marginTop:6, marginBottom:6, fontSize:12.5, fontWeight:600, color:"var(--ink-soft)" }}>
              Items ({activeOrder.items?.length || 0})
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:16 }}>
              {activeOrder.items?.map(it => (
                <div key={it.id} style={{ display:"flex", gap:12, border:"1px solid #E7E4DC", borderRadius:12, padding:10 }}>
                  <div style={{ width:56, height:56, borderRadius:8, overflow:"hidden", flexShrink:0, position:"relative" }}>
                    <ProductThumb image={it.image} color={it.color} size={40} rounded={false} />
                    {it.logo && (
                      <img src={it.logo} alt="logo" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"contain", padding:10 }} />
                    )}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13.5, fontWeight:600 }}>{it.name}</div>
                    <div style={{ fontSize:12, color:"#54585F" }}>
                      {it.printType} · Size {it.size} · Qty {it.qty} · {money(it.unitPrice)} each
                    </div>
                  </div>
                  <div style={{ fontSize:13.5, fontWeight:700, alignSelf:"center" }}>{money(it.total)}</div>
                </div>
              ))}
            </div>

            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", borderTop:"1px solid #E7E4DC", paddingTop:14, marginBottom:16 }}>
              <span style={{ fontSize:14, fontWeight:600 }}>Order total</span>
              <span style={{ fontSize:18, fontWeight:700, fontFamily:"Fraunces,serif" }}>{money(activeOrder.total)}</span>
            </div>

            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>setOrderModalOpen(false)} style={{ flex:1, padding:"11px 0", border:"1px solid #E7E4DC", borderRadius:999, fontWeight:600, cursor:"pointer", background:"#fff" }}>Close</button>
              <button onClick={saveOrder} disabled={savingOrder} style={{ flex:1, padding:"11px 0", border:"none", borderRadius:999, fontWeight:600, cursor: savingOrder ? "default" : "pointer", background:"#FF6A1A", color:"#fff", opacity: savingOrder ? 0.7 : 1 }}>
                {savingOrder ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
