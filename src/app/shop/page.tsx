"use client";
import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductThumb from "@/components/ProductThumb";
import { Product, money } from "@/lib/types";

function ShopInner() {
  const params = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState(params.get("cat") || "All Products");
  const [minP, setMinP] = useState(0);
  const [maxP, setMaxP] = useState(999999);
  const [moqRanges, setMoqRanges] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("popularity");
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/products").then((r) => r.json()).then((data) => { setProducts(data); setLoading(false); });
  }, []);

  const categories = useMemo(() => ["All Products", ...new Set(products.map((p) => p.category))], [products]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (activeCat !== "All Products") list = list.filter((p) => p.category === activeCat);
    list = list.filter((p) => p.price >= minP && p.price <= maxP);
    if (moqRanges.length) {
      list = list.filter((p) => moqRanges.some((r) => {
        const [a, b] = r.split("-").map(Number);
        return p.moq >= a && p.moq <= b;
      }));
    }
    if (query) list = list.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));
    if (sortBy === "price-asc") list.sort((a, b) => a.price - b.price);
    else if (sortBy === "price-desc") list.sort((a, b) => b.price - a.price);
    else if (sortBy === "rating") list.sort((a, b) => b.rating - a.rating);
    else list.sort((a, b) => b.reviews - a.reviews);
    return list;
  }, [products, activeCat, minP, maxP, moqRanges, query, sortBy]);

  function toggleMoq(val: string) {
    setMoqRanges((prev) => prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]);
  }

  function clearFilters() {
    setMinP(0); setMaxP(999999); setMoqRanges([]); setQuery(""); setActiveCat("All Products");
  }

  return (
    <>
      <Header />
      <main className="container">
        <div style={{ paddingTop: 28 }}>
          <h1 style={{ fontSize: 30, fontWeight: 600 }}>Shop Now</h1>
          <p style={{ color: "var(--ink-soft)", marginTop: 6 }}>Explore our wide range of custom merchandise perfect for your brand and team.</p>
        </div>

        <div className="promo" style={{ background: "var(--brand-tint)", borderRadius: 18, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", margin: "20px 0 26px", gap: 20 }}>
          <div>
            <strong style={{ display: "block", fontSize: 15 }}>Bulk Order Benefits</strong>
            <span style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>Best pricing, priority delivery &amp; dedicated support for large orders.</span>
          </div>
          <Link href="/bulk" className="btn btn-secondary btn-sm">Get Bulk Quote →</Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "250px 1fr", gap: 32, paddingBottom: 60 }}>
          <aside>
            <h3 style={{ fontSize: 13, textTransform: "uppercase", color: "var(--ink-soft)", marginBottom: 12 }}>Categories</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", fontSize: 13.5 }}>
              {categories.map((c) => {
                const count = c === "All Products" ? products.length : products.filter((p) => p.category === c).length;
                return (
                  <li key={c} onClick={() => setActiveCat(c)} className={`cat-list-item ${c === activeCat ? "active" : ""}`}
                    style={{ display: "flex", justifyContent: "space-between", padding: "8px 10px", borderRadius: 8, cursor: "pointer",
                      background: c === activeCat ? "var(--brand-tint)" : "transparent", color: c === activeCat ? "var(--brand-dark)" : "var(--ink-soft)", fontWeight: c === activeCat ? 600 : 400 }}>
                    <span>{c}</span><span>{count}</span>
                  </li>
                );
              })}
            </ul>

            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 13, textTransform: "uppercase", color: "var(--ink-soft)", marginBottom: 12 }}>Price Range</h3>
              <div style={{ display: "flex", gap: 8 }}>
                <input type="number" placeholder="₹0" value={minP} onChange={(e) => setMinP(Number(e.target.value) || 0)} style={{ width: "100%", padding: 8, border: "1px solid var(--line)", borderRadius: 8 }} />
                <input type="number" placeholder="₹5000" onChange={(e) => setMaxP(Number(e.target.value) || 999999)} style={{ width: "100%", padding: 8, border: "1px solid var(--line)", borderRadius: 8 }} />
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 13, textTransform: "uppercase", color: "var(--ink-soft)", marginBottom: 12 }}>Minimum Order Quantity</h3>
              {[["0-10","1 – 10"],["10-25","10 – 25"],["25-50","25 – 50"],["50-999","50+"]].map(([val,label]) => (
                <label key={val} style={{ display: "flex", gap: 8, fontSize: 13, marginBottom: 8, color: "var(--ink-soft)" }}>
                  <input type="checkbox" checked={moqRanges.includes(val)} onChange={() => toggleMoq(val)} /> {label}
                </label>
              ))}
            </div>
            <button className="btn btn-secondary btn-sm" style={{ width: "100%" }} onClick={clearFilters}>Clear All</button>
          </aside>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <span style={{ fontSize: 13.5, color: "var(--ink-soft)" }}>{loading ? "Loading…" : `Showing ${filtered.length} of ${products.length} products`}</span>
              <select className="sortsel" value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: "9px 12px", border: "1px solid var(--line)", borderRadius: 8 }}>
                <option value="popularity">Sort: Popularity</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Rating</option>
              </select>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
              {filtered.map((p) => {
                const mainImg = p.images?.[0]?.url || p.imageUrl || null;
                return (
                  <div key={p.id} className="prod-card" style={{ border: "1px solid var(--line)", borderRadius: 18, overflow: "hidden", background: "#fff" }}>
                    <Link href={`/shop/${p.id}`} style={{ display: "block", aspectRatio: "1.1", overflow: "hidden" }}>
                      {mainImg ? (
                        <img src={mainImg} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover", transition: ".2s" }} />
                      ) : (
                        <ProductThumb image={p.image} color={p.color} size={64} />
                      )}
                    </Link>
                    <div style={{ padding: 15 }}>
                      <Link href={`/shop/${p.id}`} style={{ fontSize: 14.5, fontWeight: 600, display: "block", marginBottom: 4 }}>{p.name}</Link>
                      <div style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 2 }}>From <b style={{ color: "var(--ink)" }}>{money(p.price)}</b></div>
                      <div style={{ fontSize: 11.5, color: "var(--ink-soft)", marginBottom: 4 }}>MOQ {p.moq} Pcs</div>
                      <div style={{ fontSize: 11.5, color: "var(--ink-soft)", marginBottom: 10 }}><span style={{ color: "#F5A623" }}>★★★★★</span> {p.rating} ({p.reviews})</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                        <Link href={`/shop/${p.id}`} style={{ display: "block", textAlign: "center", padding: "8px 0", borderRadius: 8, border: "1.5px solid var(--ink)", fontWeight: 600, fontSize: 12.5, color: "var(--ink)" }}>Buy Now</Link>
                        <Link href={`/customizer?id=${p.id}`} style={{ display: "block", textAlign: "center", padding: "8px 0", borderRadius: 8, background: "var(--brand)", color: "#fff", fontWeight: 600, fontSize: 12.5 }}>Customize</Link>
                      </div>
                    </div>
                  </div>
                );
              })}
              {!loading && filtered.length === 0 && (
                <div style={{ padding: "60px 0", textAlign: "center", color: "var(--ink-soft)", gridColumn: "1 / -1" }}>
                  No products match these filters. Try widening your price range.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function ShopPage() {
  return (
    <Suspense>
      <ShopInner />
    </Suspense>
  );
}
