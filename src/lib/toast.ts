"use client";

export function toast(msg: string) {
  if (typeof document === "undefined") return;
  let el = document.querySelector(".toast") as HTMLDivElement | null;
  if (!el) {
    el = document.createElement("div");
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  requestAnimationFrame(() => el!.classList.add("show"));
  window.clearTimeout((el as any)._timer);
  (el as any)._timer = window.setTimeout(() => el!.classList.remove("show"), 2200);
}
