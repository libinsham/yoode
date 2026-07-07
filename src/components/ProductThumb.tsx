const GLYPHS: Record<string, string> = {
  tshirt: `<path d="M8 6l6-2 6 2 4 4-3 4-2-1v13H10V13l-2 1-3-4z"/>`,
  polo: `<path d="M9 5l-1 .5L7 9l3 2 1-2v15h8V9l1 2 3-2-1-3.5L18 5l-2 2h-4z"/>`,
  hoodie: `<path d="M8 8L5 10l1 5 2-1v11h12V14l2 1 1-5-3-2-3-2H11z"/><circle cx="12" cy="9" r="2"/>`,
  jacket: `<path d="M8 8L5 10l1 5 2-1v11h12V14l2 1 1-5-3-2-3-2H11z"/><line x1="12" y1="9" x2="12" y2="25" stroke-width="1"/>`,
  bottle: `<rect x="9" y="3" width="6" height="3"/><path d="M8 7h8v17a2 2 0 01-2 2h-4a2 2 0 01-2-2z"/>`,
  mug: `<path d="M6 8h12v11a3 3 0 01-3 3H9a3 3 0 01-3-3z"/><path d="M18 11h2a3 3 0 010 6h-2"/>`,
  backpack: `<rect x="6" y="9" width="12" height="15" rx="3"/><path d="M9 9V6a3 3 0 016 0v3"/><rect x="9" y="13" width="6" height="4"/>`,
  notebook: `<rect x="6" y="4" width="13" height="20" rx="1.5"/><line x1="6" y1="4" x2="6" y2="24" stroke-width="2"/><line x1="10" y1="9" x2="16" y2="9"/><line x1="10" y1="13" x2="16" y2="13"/>`,
  tote: `<path d="M7 9h14l-1 14H8z"/><path d="M10 9V6a2 2 0 014 0v3M14 9V6a2 2 0 014 0v3"/>`,
  cap: `<path d="M4 16a8 8 0 0116 0"/><path d="M4 16h18l-2 2H6z"/><circle cx="12" cy="9" r="1"/>`,
  powerbank: `<rect x="7" y="4" width="10" height="20" rx="2"/><path d="M13 9l-2 4h2l-2 4"/>`,
  kit: `<rect x="4" y="9" width="16" height="13" rx="1"/><path d="M4 13h16"/><path d="M9 9V6h6v3"/>`,
};

export function isLight(hex: string) {
  const c = (hex || "").replace("#", "");
  if (c.length !== 6) return false;
  const r = parseInt(c.slice(0, 2), 16),
    g = parseInt(c.slice(2, 4), 16),
    b = parseInt(c.slice(4, 6), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b > 175;
}

export default function ProductThumb({
  image,
  color,
  size = 64,
  rounded = true,
  imageUrl,
}: {
  image: string;
  color: string;
  size?: number;
  rounded?: boolean;
  imageUrl?: string | null;
}) {
  if (imageUrl) {
    return (
      <div style={{ width: "100%", height: "100%", borderRadius: rounded ? "inherit" : 0, overflow: "hidden", background: "#fff" }}>
        <img src={imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
    );
  }
  const path = GLYPHS[image] || GLYPHS.tshirt;
  const light = isLight(color);
  return (
    <div
      style={{
        background: color,
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: rounded ? "inherit" : 0,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 28"
        fill="none"
        stroke={light ? "#16181D" : "#fff"}
        strokeWidth={1.4}
        strokeLinejoin="round"
        strokeLinecap="round"
        dangerouslySetInnerHTML={{ __html: path }}
      />
    </div>
  );
}
