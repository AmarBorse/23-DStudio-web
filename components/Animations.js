"use client";

import { useEffect } from "react";

/**
 * Scroll animations for the whole page.
 * Any element with a data-anim="..." attribute animates in when it scrolls into view
 * (the styles for each animation are at the bottom of app/globals.css).
 * It marks them with a data-in attribute (not a class, so React re-renders can't remove it).
 * Elements with data-parallax move slightly slower than the page while scrolling.
 */
export default function Animations() {
  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains("anim")) return; // reduced-motion visitors: everything is simply visible

    const els = document.querySelectorAll("[data-anim]");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.setAttribute("data-in", "");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -6% 0px" }
    );
    // Clipped elements (wipes / writing) have no visible area yet, so watch their parent instead
    const clipped = new Map();
    const ioParent = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (clipped.get(e.target) || []).forEach((el) => el.setAttribute("data-in", ""));
            ioParent.unobserve(e.target);
          }
        });
      },
      { threshold: 0, rootMargin: "0px 0px -18% 0px" }
    );
    els.forEach((el) => {
      const type = el.dataset.anim || "";
      if (type.startsWith("wipe") || type === "write") {
        const parent = el.parentElement;
        if (!clipped.has(parent)) clipped.set(parent, []);
        clipped.get(parent).push(el);
        ioParent.observe(parent);
      } else {
        io.observe(el);
      }
    });

    // parallax
    const par = [...document.querySelectorAll("[data-parallax]")];
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const vh = window.innerHeight;
        par.forEach((el) => {
          const r = el.parentElement.getBoundingClientRect();
          const progress = (vh - r.top) / (vh + r.height); // 0 → 1 while the section passes
          const speed = parseFloat(el.dataset.parallax) || 0.15;
          el.style.setProperty("--py", `${(progress - 0.5) * speed * -400}px`);
        });
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      io.disconnect();
      ioParent.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return null;
}