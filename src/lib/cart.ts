"use client";
import { CartItem } from "./types";

const KEY = "yoode_cart_v1";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function save(cart: CartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event("yoode-cart-changed"));
}

export function addToCart(item: CartItem) {
  const cart = getCart();
  cart.push(item);
  save(cart);
}

export function removeFromCart(index: number) {
  const cart = getCart();
  cart.splice(index, 1);
  save(cart);
}

export function clearCart() {
  save([]);
}

export function cartCount() {
  return getCart().reduce((s, i) => s + i.qty, 0);
}

export function cartTotal() {
  return getCart().reduce((s, i) => s + i.total, 0);
}
