"use client";

import { useEffect, useState } from "react";

// Number that counts up from 0 when the dashboard opens
export default function CountUp({ to, ms = 700 }) {
  const [n, setN] = useState(to);
  useEffect(() => {
    if (!to || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf;
    const start = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - start) / ms);
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    setN(0);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, ms]);
  return <span aria-label={String(to)}>{n}</span>;
}
