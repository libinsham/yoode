"use client";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductThumb from "@/components/ProductThumb";
import { money } from "@/lib/types";
import { Product } from "@/lib/types";
import Link from "next/link";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data: Product[]) => setProducts(data))
      .catch(() => {});
  }, []);

  const categories = Array.from(new Map(products.map((p) => [p.category, p])).values());
  const best = [...products].sort((a, b) => b.reviews - a.reviews).slice(0, 6);

  return (
    <>
      <Header />
      <main>

        {/* HERO */}
        <section style={{ padding: "54px 0 70px", overflow: "hidden" }}>
          <div className="container" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "center" }}>
            <div>
              <div className="eyebrow">Custom Merchandise for Every Brand</div>
              <h1 style={{ fontSize: 54, lineHeight: 1.05, fontWeight: 600, margin: "12px 0" }}>
                Design. Customize.<br />
                <span style={{ color: "var(--brand)" }}>Deliver Delight.</span>
              </h1>
              <p style={{ fontSize: 17, color: "var(--ink-soft)", maxWidth: 440, margin: "20px 0 28px", lineHeight: 1.6 }}>
                Premium custom merchandise for your team, events and brand promotions — delivered on time, every time.
              </p>
              <div style={{ display: "flex", gap: 14, marginBottom: 34 }}>
                <Link href="/customizer" className="btn btn-primary">Customize Now &rarr;</Link>
                <Link href="/bulk" className="btn btn-secondary">Get Bulk Quote &rarr;</Link>
              </div>
              <div style={{ display: "flex", gap: 34 }}>
                {[["No Minimum","On select products"],["48Hrs","Design approval"],["Quality","You can trust"],["On-Time","Every time"]].map(([k,v]) => (
                  <div key={k}><strong style={{ display:"block", fontSize:14 }}>{k}</strong><span style={{ fontSize:12.5, color:"var(--ink-soft)" }}>{v}</span></div>
                ))}
              </div>
            </div>
          
          
            <div style={{ position:"relative", height:420, borderRadius:18, background:"linear-gradient(155deg,#1A2A45 0%,#16181D 100%)",
               display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden" }}>
              {products.slice(0,4).map((p,i) => {
                const pos = [
                  { top:36, left:32, width:100, height:100 },
                  { bottom:30, left:120, width:110, height:110 },
                  { top:60, right:46, width:96, height:140 },
                  { bottom:24, right:30, width:90, height:90 },
                ][i];
                const mainImg = p.images?.[0]?.url || p.imageUrl || null;
                return (
                  <div key={p.id} style={{ position:"absolute", ...pos, borderRadius:14, overflow:"hidden", boxShadow:"var(--shadow-lg)" }}>
                    {mainImg
                      ? <img src={mainImg} alt={p.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                      : <ProductThumb image={p.image} color={p.color} size={40} />
                    }
<img
          src={`/images/${img}`}
          alt={img}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />



                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* BADGES */}
        <section className="badges">
          <div className="container" style={{ display:"flex", justifyContent:"space-between", padding:"22px 32px", flexWrap:"wrap", gap:18 }}>
            <div className="badge-item"><div className="ic">&#128230;</div><div><strong>No Minimum</strong><span>On select products</span></div></div>
            <div className="badge-item"><div className="ic">&#8987;</div><div><strong>48Hrs</strong><span>Design approval</span></div></div>
            <div className="badge-item"><div className="ic">&#10003;</div><div><strong>Quality</strong><span>You can trust</span></div></div>
            <div className="badge-item"><div className="ic">&#128666;</div><div><strong>On-Time</strong><span>Every time</span></div></div>
          </div>
        </section>

        {/* CATEGORIES */}
        <section className="section container">
          <div className="section-head">
            <h2 style={{ fontSize:28, fontWeight:600 }}>Explore Our Categories</h2>
            <Link href="/shop" style={{ color:"var(--brand)", fontWeight:600, fontSize:14 }}>View all categories &rarr;</Link>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:14 }}>
            {categories.map((p) => {
              const min = Math.min(...products.filter((x) => x.category === p.category).map((x) => x.price));
              const mainImg = p.images?.[0]?.url || p.imageUrl || null;
              return (
                <Link key={p.category} href={`/shop?cat=${encodeURIComponent(p.category)}`}
                  style={{ textAlign:"center", border:"1px solid var(--line)", borderRadius:18, padding:"18px 10px", background:"#fff", display:"block", transition:".15s" }}>
                  <div style={{ width:56, height:56, borderRadius:12, margin:"0 auto 12px", overflow:"hidden" }}>
                    {mainImg
                      ? <img src={mainImg} alt={p.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                      : <ProductThumb image={p.image} color={p.color} size={36} />
                    }
                  </div>
                  <div style={{ fontSize:13.5, fontWeight:600 }}>{p.category}</div>
                  <div style={{ fontSize:11.5, color:"var(--ink-soft)", marginTop:2 }}>From {money(min)}</div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* PERKS */}
        <section className="section container">
          <div className="perks">
            <div className="perk"><div className="ic">&#128161;</div><div><strong>Easy Customization</strong><span>Upload logo, add text and preview in real time.</span></div></div>
            <div className="perk"><div className="ic">&#128196;</div><div><strong>Transparent Pricing</strong><span>See instant price based on quantity and print type.</span></div></div>
            <div className="perk"><div className="ic">&#128737;</div><div><strong>Premium Quality</strong><span>High quality materials with perfect finishing.</span></div></div>
            <div className="perk"><div className="ic">&#128667;</div><div><strong>Reliable Delivery</strong><span>On-time delivery across India, every time.</span></div></div>
          </div>
        </section>

        {/* BEST SELLERS */}
        <section className="section container">
          <div className="section-head">
            <h2 style={{ fontSize:28, fontWeight:600 }}>Best Sellers</h2>
            <Link href="/shop" style={{ color:"var(--brand)", fontWeight:600, fontSize:14 }}>View all products &rarr;</Link>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:18 }}>
            {best.map((p) => {
              const mainImg = p.images?.[0]?.url || p.imageUrl || null;
              return (
                <div key={p.id} style={{ border:"1px solid var(--line)", borderRadius:18, overflow:"hidden", background:"#fff", display:"flex", flexDirection:"column" }}>
                  <Link href={`/shop/${p.id}`} style={{ display:"block", aspectRatio:"1", overflow:"hidden" }}>
                    {mainImg
                      ? <img src={mainImg} alt={p.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                      : <ProductThumb image={p.image} color={p.color} size={56} />
                    }
                  </Link>
                  <div style={{ padding:14, flex:1, display:"flex", flexDirection:"column", gap:3 }}>
                    <Link href={`/shop/${p.id}`} style={{ fontSize:14, fontWeight:600 }}>{p.name}</Link>
                    <div style={{ fontSize:13, color:"var(--ink-soft)" }}>From <b style={{ color:"var(--ink)" }}>{money(p.price)}</b></div>
                    <div style={{ fontSize:11.5, color:"var(--ink-soft)" }}>MOQ {p.moq} Pcs</div>
                    <div style={{ fontSize:11.5, color:"var(--ink-soft)", marginBottom:4 }}>
                      <span style={{ color:"#F5A623" }}>&#9733;&#9733;&#9733;&#9733;&#9733;</span> {p.rating} ({p.reviews})
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:5 }}>
                      <Link href={`/shop/${p.id}`} style={{ textAlign:"center", padding:"7px 0", borderRadius:8, border:"1.5px solid var(--ink)", fontWeight:600, fontSize:11.5, color:"var(--ink)" }}>Buy Now</Link>
                      <Link href={`/customizer?id=${p.id}`} style={{ textAlign:"center", padding:"7px 0", borderRadius:8, background:"var(--brand)", color:"#fff", fontWeight:600, fontSize:11.5 }}>Customize</Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* TRUSTED BRANDS */}
        <section className="section container" style={{ textAlign:"center" }}>
          <p style={{ fontWeight:700, color:"var(--ink-soft)", marginBottom:26 }}>Trusted by 500+ Brands</p>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:30, opacity:.7, fontWeight:700, fontSize:18, color:"var(--ink-soft)" }}>
            {["Microsoft","Adani","Amazon","Google","Wipro","Zomato","Swiggy","TATA"].map(b => <span key={b}>{b}</span>)}
          </div>
        </section>

        {/* STATS */}
        <section style={{ background:"var(--ink)", color:"#fff" }}>
          <div className="container" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", padding:"46px 32px", gap:24 }}>
            {[["1M+","Products Delivered"],["500+","Corporate Clients"],["4.8/5","Customer Rating"],["99%","On-Time Delivery"]].map(([v,l]) => (
              <div key={l}><strong style={{ fontSize:32, fontFamily:"Fraunces,serif", display:"block", color:"var(--brand)" }}>{v}</strong><span style={{ fontSize:13, color:"#aeb1b8" }}>{l}</span></div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="section container">
          <h2 style={{ textAlign:"center", marginBottom:32, fontSize:28, fontWeight:600 }}>How It Works</h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:16 }}>
            {[["1","Choose Product","Select from wide range of products."],["2","Customize","Upload logo, add text and preview design."],["3","Get Instant Price","Select quantity and see transparent pricing."],["4","Place Order","Review and place order securely."],["5","We Deliver","Quality check and on-time delivery."]].map(([n,t,d]) => (
              <div key={n} style={{ border:"1px solid var(--line)", borderRadius:18, padding:20 }}>
                <div style={{ color:"var(--brand)", fontWeight:700, fontSize:13, marginBottom:10 }}>Step {n}</div>
                <strong style={{ display:"block", fontSize:14.5, marginBottom:4 }}>{t}</strong>
                <span style={{ fontSize:12.5, color:"var(--ink-soft)" }}>{d}</span>
              </div>
            ))}
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
