"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductThumb from "@/components/ProductThumb";
import { addToCart } from "@/lib/cart";
import { toast } from "@/lib/toast";
import { Product, PRINT_TYPES, priceBreakdown, money, TIERS } from "@/lib/types";

const PALETTE = ["#16181D","#1B5FB8","#2E6B3E","#8A1E1E","#1A2A45","#EDE6D6","#FFFFFF"];
const SIZES = ["S","M","L","XL","XXL","3XL"];

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [color, setColor] = useState("#16181D");
  const [size, setSize] = useState("M");
  const [qty, setQty] = useState(1);
  const [printType, setPrintType] = useState(PRINT_TYPES[0]);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(r => r.json())
      .then((p: Product) => {
        setProduct(p);
        setColor(p.color);
        setQty(p.moq || 1);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <>
      <Header />
      <div style={{ padding: "80px 0", textAlign: "center", color: "var(--ink-soft)" }}>Loading…</div>
      <Footer />
    </>
  );
  if (!product) return (
    <>
      <Header />
      <div style={{ padding: "80px 0", textAlign: "center" }}>Product not found. <Link href="/shop">Back to shop</Link></div>
      <Footer />
    </>
  );

  // Build image list from uploaded images, fallback to imageUrl, fallback to glyph
  const allImages = product.images?.length
    ? product.images.map(i => i.url)
    : product.imageUrl
      ? [product.imageUrl]
      : [];
  const hasRealImages = allImages.length > 0;

  const bd = priceBreakdown(product.price, qty, printType.cost);

  function buyNow() {
    addToCart({
      productId: product!.id,
      name: product!.name,
      color,
      size,
      printType: "Direct Sale",
      qty,
      unitPrice: product!.price,
      total: product!.price * qty,
      logo: null,
      image: product!.image,
    });
    toast("Added to cart! Redirecting…");
    setTimeout(() => router.push("/cart"), 800);
  }

  function addBag() {
    addToCart({
      productId: product!.id,
      name: product!.name,
      color,
      size,
      printType: "Direct Sale",
      qty,
      unitPrice: product!.price,
      total: product!.price * qty,
      logo: null,
      image: product!.image,
    });
    toast("Added to cart");
  }

  return (
    <>
      <Header />
      <main className="container" style={{ padding: "28px 0 60px" }}>
        {/* Breadcrumb */}
        <div style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 24, display: "flex", gap: 6, alignItems: "center" }}>
          <Link href="/">Home</Link> /
          <Link href="/shop">Shop</Link> /
          <span style={{ color: "var(--ink)" }}>{product.name}</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start" }}>

          {/* LEFT — Image Gallery */}
          <div>
            {/* Main image */}
            <div style={{ borderRadius: 18, overflow: "hidden", border: "1px solid var(--line)", aspectRatio: "1", background: hasRealImages ? "#fff" : product.color, marginBottom: 12, position: "relative" }}>
              {hasRealImages ? (
                <img
                  src={allImages[activeImg]}
                  alt={product.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <ProductThumb image={product.image} color={product.color} size={200} />
              )}
              {hasRealImages && allImages.length > 1 && (
                <>
                  <button onClick={() => setActiveImg(i => Math.max(0, i - 1))} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,.9)", border: "1px solid var(--line)", fontSize: 16, cursor: "pointer" }}>‹</button>
                  <button onClick={() => setActiveImg(i => Math.min(allImages.length - 1, i + 1))} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,.9)", border: "1px solid var(--line)", fontSize: 16, cursor: "pointer" }}>›</button>
                </>
              )}
            </div>
            {/* Thumbnails */}
            {hasRealImages && (
              <div style={{ display: "flex", gap: 10 }}>
                {allImages.map((url, i) => (
                  <div key={i} onClick={() => setActiveImg(i)} style={{ width: 72, height: 72, borderRadius: 10, overflow: "hidden", border: `2px solid ${i === activeImg ? "var(--brand)" : "var(--line)"}`, cursor: "pointer", flexShrink: 0 }}>
                    <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT — Product info + actions */}
          <div>
            <div style={{ fontSize: 13, color: "var(--brand)", fontWeight: 600, marginBottom: 6 }}>{product.category}</div>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>{product.name}</h1>

            {/* Rating */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <span style={{ color: "#F5A623", fontSize: 15 }}>{"★".repeat(Math.round(product.rating))}{"☆".repeat(5 - Math.round(product.rating))}</span>
              <span style={{ fontSize: 13, color: "var(--ink-soft)" }}>{product.rating} ({product.reviews} reviews)</span>
            </div>

            {/* Price */}
            <div style={{ fontSize: 32, fontWeight: 800, color: "var(--brand)", marginBottom: 4, fontFamily: "Fraunces,serif" }}>{money(product.price)}<span style={{ fontSize: 14, fontWeight: 500, color: "var(--ink-soft)", marginLeft: 6 }}>per piece</span></div>
            <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginBottom: 18 }}>MOQ: {product.moq} pcs &nbsp;|&nbsp; GST extra</div>

            {/* Tier pricing */}
            <div style={{ background: "var(--brand-tint)", borderRadius: 10, padding: "12px 14px", marginBottom: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "var(--brand-dark)", marginBottom: 8 }}>🛍️ Shop more, Save more</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 6, textAlign: "center" }}>
                {TIERS.map(t => {
                  const unitPrice = Math.round(priceBreakdown(product.price, t.min, 0).total / t.min);
                  const active = qty >= t.min && qty <= t.max;
                  return (
                    <div key={t.label} style={{ background: active ? "var(--brand)" : "#fff", color: active ? "#fff" : "var(--ink)", borderRadius: 8, padding: "6px 4px", border: `1px solid ${active ? "var(--brand)" : "var(--line)"}` }}>
                      <div style={{ fontSize: 10, fontWeight: 600 }}>{t.label}</div>
                      <div style={{ fontSize: 12, fontWeight: 800 }}>{money(unitPrice)}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Color */}
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Color</p>
              <div style={{ display: "flex", gap: 8 }}>
                {PALETTE.map(c => (
                  <div key={c} onClick={() => setColor(c)} style={{ width: 28, height: 28, borderRadius: "50%", background: c, cursor: "pointer", border: `2px solid ${color === c ? "var(--brand)" : "transparent"}`, boxShadow: color === c ? "0 0 0 1px var(--brand)" : "0 0 0 1px var(--line)", outline: c === "#FFFFFF" ? "1px solid var(--line)" : "none" }} />
                ))}
              </div>
            </div>

            {/* Size */}
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Size</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {SIZES.map(s => (
                  <button key={s} onClick={() => setSize(s)} style={{ padding: "8px 14px", borderRadius: 8, border: `1.5px solid ${size === s ? "var(--brand)" : "var(--line)"}`, background: size === s ? "var(--brand-tint)" : "#fff", color: size === s ? "var(--brand-dark)" : "var(--ink)", fontWeight: size === s ? 700 : 500, cursor: "pointer", fontSize: 13 }}>{s}</button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Quantity <span style={{ fontWeight: 400, color: "var(--ink-soft)" }}>(min {product.moq})</span></p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button onClick={() => setQty(q => Math.max(product.moq, q - 1))} style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid var(--line)", background: "#fff", fontSize: 18, cursor: "pointer" }}>−</button>
                <input type="number" value={qty} onChange={e => setQty(Math.max(product.moq, Number(e.target.value) || product.moq))} style={{ width: 70, textAlign: "center", border: "1px solid var(--line)", borderRadius: 8, padding: "8px 0", fontWeight: 700, fontSize: 15 }} />
                <button onClick={() => setQty(q => q + 1)} style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid var(--line)", background: "#fff", fontSize: 18, cursor: "pointer" }}>+</button>
                <span style={{ fontSize: 18, fontWeight: 800, color: "var(--ink)", marginLeft: 8 }}>{money(product.price * qty)}</span>
              </div>
            </div>

            {/* CTA buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Direct buy — no customization */}
              <button onClick={buyNow} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "15px 0", borderRadius: 999, background: "var(--brand)", color: "#fff", border: "none", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
                🛒 Buy Now — {money(product.price * qty)}
              </button>
              <button onClick={addBag} style={{ padding: "14px 0", borderRadius: 999, border: "1.5px solid var(--ink)", background: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
                Add to Cart
              </button>
              {/* Customize route */}
              <Link href={`/customizer?id=${product.id}`} style={{ display: "block", textAlign: "center", padding: "14px 0", borderRadius: 999, border: "1.5px solid var(--brand)", color: "var(--brand)", background: "var(--brand-tint)", fontWeight: 700, fontSize: 15 }}>
                🎨 Customize with Your Logo
              </Link>
            </div>

            {/* Badges */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 20 }}>
              {[["🚚", "Free Shipping", "On orders above ₹999"], ["⏱️", "48hr Approval", "Fast turnaround"], ["✅", "100% Quality", "Checked before dispatch"], ["🔒", "Secure Payment", "Safe & trusted checkout"]].map(([ic, title, sub]) => (
                <div key={String(title)} style={{ display: "flex", gap: 10, padding: 12, border: "1px solid var(--line)", borderRadius: 10 }}>
                  <span style={{ fontSize: 20 }}>{ic}</span>
                  <div><strong style={{ display: "block", fontSize: 12.5 }}>{title}</strong><span style={{ fontSize: 11.5, color: "var(--ink-soft)" }}>{sub}</span></div>
                </div>
              ))}
            </div>

            {/* Description */}
            {product.desc && (
              <div style={{ marginTop: 24, padding: "16px", background: "var(--paper-deep)", borderRadius: 12 }}>
                <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--ink-soft)", margin: 0 }}>{product.desc}</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
