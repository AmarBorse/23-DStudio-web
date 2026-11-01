"use client";

import { useEffect, useRef, useState } from "react";

// Plays several clips one after another in the same spot (1 → 2 → 3 → back to 1).
// The next clip is already loaded underneath, so each change is a quick cross-fade with no blank frame.
// Pauses when scrolled out of view. Visitors who prefer reduced motion see the poster image only.
export default function ClipSequence({ clips, poster, label }) {
  const videos = useRef([]);
  const box = useRef(null);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([e]) => {
        const v = videos.current[current];
        if (!v) return;
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.25 }
    );
    if (box.current) io.observe(box.current);
    return () => io.disconnect();
  }, [current]);

  const onEnded = () => {
    const next = (current + 1) % clips.length;
    const v = videos.current[next];
    if (v) {
      v.currentTime = 0;
      v.play().catch(() => {});
    }
    setCurrent(next);
  };

  return (
    <div className="clips" ref={box} role="img" aria-label={label}>
      {clips.map((src, i) => (
        <video
          key={src}
          ref={(el) => (videos.current[i] = el)}
          className={`clips-video${i === current ? " on" : ""}`}
          src={src}
          poster={i === 0 ? poster : undefined}
          muted
          playsInline
          disablePictureInPicture
          preload={i === current || i === (current + 1) % clips.length ? "auto" : "metadata"}
          onEnded={i === current ? onEnded : undefined}
          aria-hidden="true"
          tabIndex={-1}
        />
      ))}
    </div>
  );
}