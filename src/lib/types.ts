export type ProductImage = {
  id: string;
  url: string;
  order: number;
};

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  moq: number;
  rating: number;
  reviews: number;
  color: string;
  image: string;
  imageUrl?: string | null;
  images?: ProductImage[];
  desc: string;
};

export type CartItem = {
  productId: string;
  name: string;
  color: string;
  size: string;
  printType: string;
  qty: number;
  unitPrice: number;
  total: number;
  logo: string | null;
  image: string;
};

export type OrderItem = {
  id: string;
  productId: string;
  name: string;
  color: string;
  size: string;
  printType: string;
  qty: number;
  unitPrice: number;
  total: number;
  logo: string | null;
  image: string;
};

export type Order = {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
};

export const ORDER_STATUSES = ["Received", "Processing", "Shipped", "Delivered", "Cancelled"] as const;

export const ORDER_STATUS_COLORS: Record<string, string> = {
  Received: "#1B5FB8",
  Processing: "#B87D1B",
  Shipped: "#6C3EF5",
  Delivered: "#2E6B3E",
  Cancelled: "#A3392F",
};

export function money(n: number) {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

export function bulkDiscountRate(qty: number) {
  if (qty >= 500) return 0.12;
  if (qty >= 200) return 0.08;
  if (qty >= 100) return 0.05;
  if (qty >= 50) return 0.03;
  return 0;
}

export const TIERS = [
  { min: 1,   max: 24,    label: "1-24"  },
  { min: 25,  max: 49,    label: "25-49" },
  { min: 50,  max: 99,    label: "50-99" },
  { min: 100, max: 199,   label: "100+"  },
  { min: 200, max: 99999, label: "200+"  },
];

export const PRINT_TYPES = [
  { key: "Embroidery", label: "Embroidery", sub: "Premium & Durable", cost: 500 },
  { key: "DTF Printing", label: "DTF Printing", sub: "Vibrant & Detailed", cost: 300 },
  { key: "Screen Print", label: "Screen Print", sub: "Cost Effective", cost: 150 },
  { key: "Sublimation", label: "Sublimation", sub: "Full Color Prints", cost: 350 },
];

// Quantity-tier pricing, the same pattern as yourPrint.in's mug page
// (1-5 / 6-10 / 11-20 / 21+) — each tier gets a small per-unit discount.
export function qtyTiers(basePrice: number) {
  return [
    { label: "1-5", min: 1, max: 5, unitPrice: basePrice },
    { label: "6-10", min: 6, max: 10, unitPrice: Math.round(basePrice * 0.98) },
    { label: "11-20", min: 11, max: 20, unitPrice: Math.round(basePrice * 0.96) },
    { label: "21+", min: 21, max: Infinity, unitPrice: Math.round(basePrice * 0.94) },
  ];
}

export function unitPriceForQty(basePrice: number, qty: number) {
  const tiers = qtyTiers(basePrice);
  const tier = tiers.find((t) => qty >= t.min && qty <= t.max) || tiers[tiers.length - 1];
  return tier.unitPrice;
}

export function priceBreakdown(basePrice: number, qty: number, setupCost: number) {
  const unitPrice = unitPriceForQty(basePrice, qty);
  const subtotal = unitPrice * qty;
  const savings = Math.round((basePrice - unitPrice) * qty);
  const gstBase = subtotal + setupCost;
  const gst = Math.round(gstBase * 0.18);
  const total = gstBase + gst;
  return { unitPrice, subtotal, savings, setupCost, gst, total };
}
