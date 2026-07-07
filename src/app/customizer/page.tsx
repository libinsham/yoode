"use client";
import { useEffect, useMemo, useState, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import ProductThumb, { isLight } from "@/components/ProductThumb";
import ProductViewer3D, { Viewer3DHandle } from "@/components/ProductViewer3D";
import { Product, money, PRINT_TYPES, qtyTiers, priceBreakdown } from "@/lib/types";
import { addToCart } from "@/lib/cart";

const PALETTE = ["#16181D", "#1B5FB8", "#2E6B3E", "#8A1E1E", "#1A2A45", "#EDE6D6", "#FFFFFF"];
const SIZES = ["S", "M", "L", "XL", "XXL", "3XL"];
const PLACEMENTS: Record<string, { x: number; y: number }> = {
  "left-chest":   { x: 34, y: 30 },
  "right-chest":  { x: 58, y: 30 },
  "center-chest": { x: 50, y: 34 },
  "back-center":  { x: 50, y: 40 },
  "center":       { x: 50, y: 50 },
  "bottom":       { x: 50, y: 72 },
};

// Products with a true rotating 3D preview available — everything else
// falls back to the fast 2D mockup overlay.
const SHAPE_3D: Record<string, "mug" | "bottle" | "tshirt"> = {
  mug: "mug",
  bottle: "bottle",
  tshirt: "tshirt",
  polo: "tshirt",
};

function CustomizerInner() {
  const params = useSearchParams();
  const id = params.get("id");
  const [products, setProducts] = useState<Product[]>([]);
  const [product, setProduct] = useState<Product | null>(null);

  const [viewMode, setViewMode] = useState<"2d" | "3d">("2d");
  const [tab, setTab] = useState<"logo" | "text" | "placement">("logo");
  const [selectedColor, setSelectedColor] = useState("#16181D");
  const [printType, setPrintType] = useState(PRINT_TYPES[0]);
  const [selectedSize, setSelectedSize] = useState("M");
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [logoScale, setLogoScale] = useState(60);
  const [placement, setPlacement] = useState("left-chest");
  const [customText, setCustomText] = useState("");
  const [qty, setQty] = useState(50);
  const fileRef = useRef<HTMLInputElement>(null);
  const viewer3DRef = useRef<Viewer3DHandle>(null);
  const design2DRef = useRef<HTMLDivElement>(null);

  // Draggable logo position (% of canvas)
  const [logoPos, setLogoPos] = useState({ x: 50, y: 32 });
  const isDragging = useRef(false);
  const dragStart = useRef({ mx: 0, my: 0, lx: 0, ly: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => {
        if (!r.ok) throw new Error(`API returned ${r.status}`);
        return r.json();
      })
      .then((data: Product[]) => {
        setProducts(data);
        const found = (id && data.find((p) => p.id === id)) || data[0];
        if (found) {
          setProduct(found);
          setSelectedColor(found.color);
          setQty(Math.max(found.moq, 50));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load products:", err);
        setFetchError(err.message || "Failed to load products");
        setLoading(false);
      });
  }, [id]);

  const has3D = product ? Object.keys(SHAPE_3D).includes(product.image) : false;

  const breakdown = useMemo(() => {
    if (!product) return null;
    return priceBreakdown(product.price, qty, printType.cost);
  }, [product, qty, printType]);

  const tiers = useMemo(() => (product ? qtyTiers(product.price) : []), [product]);

  useEffect(() => {
    const p = PLACEMENTS[placement];
    if (p) setLogoPos({ x: p.x, y: p.y });
  }, [placement]);

  // Whenever we switch into 3D mode, the viewer has just mounted (or is
  // already mounted) and its ref is available — bake the current design
  // onto it now, instead of trying to do it from the button click itself
  // (at click time, if we were in 2D mode, the viewer didn't exist yet).
  useEffect(() => {
    if (viewMode === "3d") {
      bakeDesignTo3D();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  function handleFile(file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setLogoDataUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleAddToCart() {
    if (!product || !breakdown) return;
    addToCart({
      productId: product.id,
      name: product.name,
      color: selectedColor,
      size: selectedSize,
      printType: printType.key,
      qty,
      unitPrice: Math.round(breakdown.total / qty),
      total: breakdown.total,
      logo: logoDataUrl,
      image: product.image,
    });
    alert("Added to cart!");
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="container" style={{ padding: 60, textAlign: "center", color: "var(--ink-soft)" }}>Loading product…</div>
      </>
    );
  }

  if (fetchError) {
    return (
      <>
        <Header />
        <div className="container" style={{ padding: 60, textAlign: "center" }}>
          <p style={{ color: "#A3392F", fontWeight: 600, marginBottom: 8 }}>Couldn't load products.</p>
          <p style={{ color: "var(--ink-soft)", fontSize: 13.5 }}>{fetchError}</p>
          <p style={{ color: "var(--ink-soft)", fontSize: 13.5, marginTop: 10 }}>
            Check your terminal — the dev server or database may not be running.
          </p>
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header />
        <div className="container" style={{ padding: 60, textAlign: "center" }}>
          <p style={{ fontWeight: 600, marginBottom: 8 }}>No products found.</p>
          <p style={{ color: "var(--ink-soft)", fontSize: 13.5, marginBottom: 18 }}>
            Your database is empty. Run the seed script, then refresh this page.
          </p>
          <code style={{ background: "var(--paper-deep)", padding: "8px 14px", borderRadius: 8, fontSize: 13 }}>npm run db:seed</code>
        </div>
      </>
    );
  }

  const light = isLight(selectedColor);
  const mainImg = product.images?.[0]?.url || product.imageUrl || null;
  // Bake the current 2D design into a texture and apply to 3D shirt
  function bakeDesignTo3D() {
    if (!viewer3DRef.current || !product) return;
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d")!;

    // Base fabric color
    ctx.fillStyle = selectedColor;
    ctx.fillRect(0, 0, 1024, 1024);

    // Subtle fabric grain
    for (let i = 0; i < 6000; i++) {
      ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.025})`;
      ctx.fillRect(Math.random() * 1024, Math.random() * 1024, 2, 2);
    }

    // Draw logo at designed position (convert % coords to canvas px)
    if (logoDataUrl) {
      const img = new Image();
      img.src = logoDataUrl;
      const logoW = (logoSizePct / 100) * 620;
      const logoH = logoW;
      const cx = (logoPos.x / 100) * 1024 - logoW / 2;
      const cy = ((100 - logoPos.y) / 100) * 1024 - logoH / 2;
      ctx.drawImage(img, cx, cy, logoW, logoH);
    }

    // Draw custom text
    if (customText) {
      const textY = ((100 - 75) / 100) * 1024;
      ctx.font = "bold 52px Inter, sans-serif";
      ctx.fillStyle = isLight(selectedColor) ? "#16181D" : "#ffffff";
      ctx.textAlign = "center";
      ctx.fillText(customText, 512, textY);
    }

    viewer3DRef.current.applyDesign(canvas.toDataURL());
  }

  function onLogoDragStart(e: React.PointerEvent) {
    e.preventDefault();
    isDragging.current = true;
    dragStart.current = { mx: e.clientX, my: e.clientY, lx: logoPos.x, ly: logoPos.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onLogoDragMove(e: React.PointerEvent) {
    if (!isDragging.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const dx = ((e.clientX - dragStart.current.mx) / rect.width) * 100;
    const dy = ((e.clientY - dragStart.current.my) / rect.height) * 100;
    setLogoPos({
      x: Math.max(5, Math.min(95, dragStart.current.lx + dx)),
      y: Math.max(5, Math.min(95, dragStart.current.ly + dy)),
    });
  }

  function onLogoDragEnd() { isDragging.current = false; }

  const logoSizePct = 18 + logoScale * 0.4;

  return (
    <>
      <Header />
      <div className="container" style={{ display: "grid", gridTemplateColumns: "300px 1fr 320px", gap: 0, padding: "24px 0" }}>
        {/* LEFT TOOLS */}
        <section style={{ paddingRight: 20, borderRight: "1px solid var(--line)" }}>
          <div className="tool-tabs" style={{ display: "flex", border: "1px solid var(--line)", borderRadius: 10, overflow: "hidden", marginBottom: 18 }}>
            {(["logo", "text", "placement"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} style={{ flex: 1, background: tab === t ? "var(--brand-tint)" : "#fff", color: tab === t ? "var(--brand-dark)" : "var(--ink-soft)", border: "none", borderRight: "1px solid var(--line)", padding: "10px 4px", fontSize: 11.5, fontWeight: 600 }}>
                {t === "logo" ? "Add Logo" : t === "text" ? "Add Text" : "Placement"}
              </button>
            ))}
          </div>

          {tab === "logo" && (
            <div>
              <div onClick={() => fileRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
                style={{ border: "2px dashed var(--line)", borderRadius: 12, padding: "28px 14px", textAlign: "center", cursor: "pointer", background: "#fff" }}>
                <p style={{ fontSize: 13, color: "var(--ink-soft)" }}>Click to upload or drag and drop<br /><small>PNG, JPG, SVG (max 10MB)</small></p>
                <span className="btn btn-secondary btn-sm">Browse Files</span>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleFile(e.target.files?.[0] || null)} />
              </div>
              {logoDataUrl && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, border: "1px solid var(--line)", borderRadius: 10, padding: 10, marginTop: 12, fontSize: 12.5 }}>
                  <span>🖼️</span><span style={{ flex: 1 }}>Logo uploaded</span><span style={{ color: "var(--success)" }}>✓</span>
                </div>
              )}
              <h4 style={{ fontSize: 13, margin: "18px 0 10px" }}>Logo Size</h4>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input type="range" min={20} max={100} value={logoScale} onChange={(e) => setLogoScale(Number(e.target.value))} style={{ flex: 1 }} />
                <span className="mono">{logoScale}%</span>
              </div>
            </div>
          )}

          {tab === "text" && (
            <div>
              <h4 style={{ fontSize: 13, margin: "0 0 10px" }}>Add Text (Optional)</h4>
              <input type="text" placeholder="Enter text" value={customText} onChange={(e) => setCustomText(e.target.value)} style={{ width: "100%", padding: 10, border: "1px solid var(--line)", borderRadius: 8, fontSize: 13 }} />
            </div>
          )}

          {tab === "placement" && (
            <div>
              <h4 style={{ fontSize: 13, margin: "0 0 10px" }}>Logo Placement</h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                {Object.keys(PLACEMENTS).map((p) => (
                  <div key={p} onClick={() => setPlacement(p)}
                    style={{ border: "1px solid var(--line)", borderRadius: 10, padding: "10px 4px", textAlign: "center", fontSize: 11, fontWeight: 600, cursor: "pointer",
                      background: placement === p ? "var(--brand-tint)" : "#fff", color: placement === p ? "var(--brand-dark)" : "var(--ink-soft)", borderColor: placement === p ? "var(--brand)" : "var(--line)" }}>
                    {p.replace("-", " ")}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* MIDDLE PREVIEW */}
        <section style={{ padding: "0 20px", borderRight: "1px solid var(--line)" }}>
          {has3D && (
            <div style={{ display:"flex", gap:8, margin:"16px 0 12px" }}>
              <button className={viewMode === "2d" ? "active" : ""} onClick={() => setViewMode("2d")} style={{ flex:1, padding:"9px 0", border:"1px solid var(--line)", borderRadius:8, fontWeight:600, fontSize:12.5, background: viewMode==="2d"?"var(--ink)":"#fff", color: viewMode==="2d"?"#fff":"var(--ink)", cursor:"pointer" }}>✏️ 2D Editor</button>
              <button onClick={() => setViewMode("3d")} style={{ flex:1, padding:"9px 0", border:"none", borderRadius:8, fontWeight:700, fontSize:12.5, background:"var(--brand)", color:"#fff", cursor:"pointer" }}>🔄 Preview in 3D</button>
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: 20 }}>
            {viewMode === "3d" && has3D ? (
              <>
                <div className="viewer3d-stage">
                  <ProductViewer3D ref={viewer3DRef} shape={SHAPE_3D[product.image]} color={selectedColor} />
                </div>
                <div className="drag-hint">🖱️ Drag to rotate &nbsp;|&nbsp; Your design is applied to the shirt</div>
              </>
            ) : (
              <>
              <div
                ref={canvasRef}
                style={{ width: 340, height: 420, borderRadius: 18, position: "relative", boxShadow: "var(--shadow-lg)", overflow: "hidden", background: selectedColor, display: "flex", alignItems: "center", justifyContent: "center" }}
                onPointerMove={onLogoDragMove}
                onPointerUp={onLogoDragEnd}
              >
                {mainImg ? (
                  <div style={{ position: "absolute", inset: 0 }}>
                    <ProductThumb image={product.image} color={selectedColor} imageUrl={mainImg} size={220} rounded={false} />
                  </div>
                ) : (
                  <div style={{ position: "absolute", inset: 0, opacity: light ? 0.12 : 0.22, filter: light ? "invert(1)" : "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ProductThumb image={product.image} color="#ffffff" size={220} rounded={false} />
                  </div>
                )}

                {/* Draggable logo layer */}
                <div
                  onPointerDown={onLogoDragStart}
                  style={{
                    position: "absolute",
                    left: `${logoPos.x}%`,
                    top: `${logoPos.y}%`,
                    transform: "translate(-50%, -50%)",
                    width: `${logoSizePct}%`,
                    height: `${logoSizePct}%`,
                    cursor: "grab",
                    userSelect: "none",
                    touchAction: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {logoDataUrl ? (
                    <>
                      {/* Dashed border while dragging */}
                      <div style={{ position: "absolute", inset: 0, border: `2px dashed ${light ? "rgba(0,0,0,.3)" : "rgba(255,255,255,.5)"}`, borderRadius: 4, pointerEvents: "none" }} />
                      <img src={logoDataUrl} alt="Uploaded logo" draggable={false} style={{ width: "100%", height: "100%", objectFit: "contain", pointerEvents: "none" }} />
                      {/* Drag handle hint */}
                      <div style={{ position: "absolute", bottom: -18, left: "50%", transform: "translateX(-50%)", fontSize: 10, color: light ? "rgba(0,0,0,.4)" : "rgba(255,255,255,.6)", whiteSpace: "nowrap", pointerEvents: "none" }}>✥ drag to move</div>
                    </>
                  ) : (
                    <div style={{ border: `2px dashed ${light ? "rgba(0,0,0,.3)" : "rgba(255,255,255,.5)"}`, color: light ? "rgba(0,0,0,.45)" : "rgba(255,255,255,.85)", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 6, width: "100%", height: "100%", borderRadius: 4 }}>
                      YOUR<br />LOGO
                    </div>
                  )}
                </div>

                {customText && (
                  <div style={{ position: "absolute", bottom: "14%", left: "50%", transform: "translateX(-50%)", fontWeight: 700, color: light ? "#16181D" : "#fff", pointerEvents: "none" }}>{customText}</div>
                )}
              </div>
              {/* Controls below canvas */}
              <div style={{ display: "flex", gap: 10, marginTop: 12, width: 340 }}>
                <button
                  onClick={() => setLogoPos(PLACEMENTS["left-chest"])}
                  style={{ flex: 1, padding: "8px 0", border: "1px solid var(--line)", borderRadius: 8, background: "#fff", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}
                >
                  ↺ Reset position
                </button>
                {logoDataUrl && (
                  <button
                    onClick={() => setLogoDataUrl(null)}
                    style={{ flex: 1, padding: "8px 0", border: "1px solid var(--line)", borderRadius: 8, background: "#fff", fontSize: 12.5, fontWeight: 600, color: "#A3392F", cursor: "pointer" }}
                  >
                    ✕ Remove logo
                  </button>
                )}
              </div>
              <p style={{ fontSize: 11.5, color: "var(--ink-soft)", textAlign: "center", marginTop: 6, width: 340 }}>
                🖱️ Drag your logo anywhere on the canvas
              </p>
              </>
            )}
          </div>
        </section>

        {/* RIGHT: product config + price */}
        <aside style={{ paddingLeft: 20 }}>
          <div className="summary-card" style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 14, padding: 18, marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, marginBottom: 6 }}>{product.name}</h3>
            <div style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>{product.category} · {printType.label}</div>
          </div>

          <div className="summary-card" style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 14, padding: 18, marginBottom: 16 }}>
            <h4 style={{ fontSize: 13, marginBottom: 10 }}>Print Type</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {PRINT_TYPES.map((pt) => (
                <div key={pt.key} onClick={() => setPrintType(pt)}
                  style={{ border: `1px solid ${printType.key === pt.key ? "var(--brand)" : "var(--line)"}`, background: printType.key === pt.key ? "var(--brand-tint)" : "#fff", borderRadius: 10, padding: "10px 8px", fontSize: 12, fontWeight: 600, cursor: "pointer", color: printType.key === pt.key ? "var(--brand-dark)" : "var(--ink)" }}>
                  {pt.label}<br /><small style={{ fontWeight: 400 }}>{pt.sub}</small>
                </div>
              ))}
            </div>
          </div>

          <div className="summary-card" style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 14, padding: 18, marginBottom: 16 }}>
            <h4 style={{ fontSize: 13, marginBottom: 10 }}>Color</h4>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
              {PALETTE.map((c) => (
                <div key={c} onClick={() => setSelectedColor(c)}
                  style={{ width: 26, height: 26, borderRadius: "50%", cursor: "pointer", background: c, border: "2px solid #fff",
                    boxShadow: selectedColor === c ? "0 0 0 2px var(--brand)" : "0 0 0 1px var(--line)" }} />
              ))}
            </div>
            <h4 style={{ fontSize: 13, marginBottom: 10 }}>Size</h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 6 }}>
              {SIZES.map((s) => (
                <div key={s} onClick={() => setSelectedSize(s)}
                  style={{ border: `1px solid ${selectedSize === s ? "var(--brand)" : "var(--line)"}`, background: selectedSize === s ? "var(--brand-tint)" : "#fff", borderRadius: 8, padding: "8px 0", textAlign: "center", fontSize: 12.5, fontWeight: 600, cursor: "pointer", color: selectedSize === s ? "var(--brand-dark)" : "var(--ink)" }}>
                  {s}
                </div>
              ))}
            </div>
          </div>

          <div className="summary-card" style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 14, padding: 18, marginBottom: 16 }}>
            <h4 style={{ fontSize: 13, marginBottom: 10 }}>Quantity</h4>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <button onClick={() => setQty(Math.max(product.moq, qty - 10))} style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid var(--line)", background: "#fff", fontWeight: 700 }}>−</button>
              <input type="number" value={qty} onChange={(e) => setQty(Math.max(product.moq, Number(e.target.value) || product.moq))} style={{ width: 60, textAlign: "center", border: "1px solid var(--line)", borderRadius: 8, padding: 6, fontWeight: 700 }} />
              <button onClick={() => setQty(qty + 10)} style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid var(--line)", background: "#fff", fontWeight: 700 }}>+</button>
              <span style={{ fontSize: 12, color: "var(--ink-soft)" }}>MOQ {product.moq} pcs</span>
            </div>

            <table style={{ width: "100%", fontSize: 12, marginBottom: 12, borderCollapse: "collapse" }}>
              <thead><tr style={{ color: "var(--ink-soft)" }}>{tiers.map((t) => <th key={t.label} style={{ textAlign: "center", fontWeight: 600, paddingBottom: 4 }}>{t.label}</th>)}</tr></thead>
              <tbody><tr>{tiers.map((t) => (
                <td key={t.label} style={{ textAlign: "center", fontWeight: 700, padding: "6px 0", borderTop: "1px solid var(--line)", background: qty >= t.min && qty <= t.max ? "var(--brand-tint)" : "transparent", borderRadius: 6, color: qty >= t.min && qty <= t.max ? "var(--brand-dark)" : "var(--ink)" }}>
                  {money(t.unitPrice)}
                </td>
              ))}</tr></tbody>
            </table>

            {breakdown && (
              <>
                <div className="price-break" style={{ borderTop: "1px dashed var(--line)", paddingTop: 8 }}>
                  <div className="sumrow" style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--ink-soft)", padding: "4px 0" }}><span>Unit price × {qty}</span><b style={{ color: "var(--ink)" }}>{money(breakdown.subtotal)}</b></div>
                  {breakdown.savings > 0 && <div className="sumrow" style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--success)", padding: "4px 0" }}><span>Quantity savings</span><b>-{money(breakdown.savings)}</b></div>}
                  <div className="sumrow" style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--ink-soft)", padding: "4px 0" }}><span>{printType.label} Setup</span><b style={{ color: "var(--ink)" }}>{money(breakdown.setupCost)}</b></div>
                  <div className="sumrow" style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--ink-soft)", padding: "4px 0" }}><span>GST (18%)</span><b style={{ color: "var(--ink)" }}>{money(breakdown.gst)}</b></div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, fontWeight: 800, borderTop: "1px solid var(--line)", marginTop: 8, paddingTop: 10 }}>
                  Total <span className="mono" style={{ color: "var(--brand)" }}>{money(breakdown.total)}</span>
                </div>
              </>
            )}
          </div>

          <button className="btn btn-primary btn-block" onClick={handleAddToCart}>Add to Cart</button>
        </aside>
      </div>
    </>
  );
}

export default function CustomizerPage() {
  return (
    <Suspense>
      <CustomizerInner />
    </Suspense>
  );
}
