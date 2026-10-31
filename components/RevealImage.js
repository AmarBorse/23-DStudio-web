"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

/**
 * Shows an image as a white "clay" render; colour spreads out in a circle
 * from wherever the cursor enters, and shrinks back to where it leaves.
 * On touch screens (no hover) the colour reveals by itself when the image scrolls into view.
 *
 * Optional `claySrc`: a real white/clay render of the SAME view. If given, it is used
 * for the white state instead of the automatic CSS filter.
 */
export default function RevealImage({ src, alt, claySrc, sizes }) {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });

  const setFromEvent = (e) => {
    const r = ref.current.getBoundingClientRect();
    setOrigin({
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
    });
  };

  // Touch devices: reveal when mostly on screen, go back to white when scrolled away
  useEffect(() => {
    if (window.matchMedia("(hover: hover)").matches) return;
    const el = ref.current;
    const obs = new IntersectionObserver(
      ([entry]) => {
        setOrigin({ x: 50, y: 50 });
        setOn(entry.intersectionRatio > 0.6);
      },
      { threshold: [0, 0.6, 1] }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal${on ? " is-on" : ""}`}
      style={{ "--rx": `${origin.x}%`, "--ry": `${origin.y}%` }}
      onMouseEnter={(e) => {
        setFromEvent(e);
        setOn(true);
      }}
      onMouseLeave={(e) => {
        setFromEvent(e);
        setOn(false);
      }}
    >
      {claySrc ? (
        <Image className="reveal-clay" src={claySrc} alt="" aria-hidden="true" fill sizes={sizes} />
      ) : (
        <Image className="reveal-clay auto" src={src} alt="" aria-hidden="true" fill sizes={sizes} />
      )}
      <Image className="reveal-colour" src={src} alt={alt} fill sizes={sizes} />
    </div>
  );
}
