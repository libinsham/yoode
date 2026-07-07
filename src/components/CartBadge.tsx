"use client";
import { useEffect, useState } from "react";
import { cartCount } from "@/lib/cart";

export default function CartBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const update = () => setCount(cartCount());
    update();
    window.addEventListener("yoode-cart-changed", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("yoode-cart-changed", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  return <span className="cart-badge">{count}</span>;
}
