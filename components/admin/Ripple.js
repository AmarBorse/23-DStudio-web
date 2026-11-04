"use client";

import { useEffect } from "react";

// Click ripple on admin buttons and menu links (skipped for reduced motion)
export default function Ripple() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const onDown = (e) => {
      const el = e.target.closest(".adm-btn, .adm-nav a, .adm-stat, .adm-row-link");
      if (!el || el.disabled) return;
      const r = el.getBoundingClientRect();
      const size = Math.max(r.width, r.height) * 2;
      const dot = document.createElement("span");
      dot.className = "adm-ripple";
      dot.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left - size / 2}px;top:${e.clientY - r.top - size / 2}px`;
      el.appendChild(dot);
      dot.addEventListener("animationend", () => dot.remove());
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, []);
  return null;
}
