"use client";

import { useEffect, useRef, useState } from "react";

// ↑ button. It watches the hero it sits in and starts floating once you scroll past it.
// floatOnly: hidden while the hero is on screen (the About design has no button in its hero).
export default function ToTop({ floatOnly = false }) {
  const ref = useRef(null);
  const [floating, setFloating] = useState(false);

  useEffect(() => {
    const hero = ref.current?.closest("header");
    if (!hero) return;
    const observer = new IntersectionObserver(([entry]) => setFloating(!entry.isIntersecting));
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <a
      ref={ref}
      className={`to-top${floating ? " floating" : ""}${floatOnly ? " float-only" : ""}`}
      href="#top"
      aria-label="Back to top"
    >
      <svg viewBox="0 0 12 22" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
        <path d="M6 21V1M1.5 5.5 6 1l4.5 4.5" />
      </svg>
    </a>
  );
}
