"use client";

import { useEffect, useRef, useState } from "react";

// Plays several clips one after another in the same spot (1 → 2 → 3 → back to 1).
// The next clip is already loaded underneath, so each change is a quick cross-fade with no blank frame.
// Pauses when scrolled out of view; visitors who prefer reduced motion get the poster and a play button.
export default function ClipSequence({ clips, poster, label }) {
  const videos = useRef([]);
  const box = useRef(null);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  // Start / stop with visibility
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) setUserPaused(true);
    const io = new IntersectionObserver(([e]) => {
      const v = videos.current[current];
      if (!v) return;
      if (e.isIntersecting && !userPaused) v.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
      else {
        v.pause();
        setPlaying(false);
      }
    }, { threshold: 0.25 });
    if (box.current) io.observe(box.current);
    return () => io.disconnect();
  }, [current, userPaused]);

  const onEnded = () => {
    const next = (current + 1) % clips.length;
    const v = videos.current[next];
    if (v) {
      v.currentTime = 0;
      v.play().catch(() => {});
    }
    setProgress(0);
    setCurrent(next);
  };

  const toggle = () => {
    const v = videos.current[current];
    if (!v) return;
    if (v.paused) {
      setUserPaused(false);
      v.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      setUserPaused(true);
      v.pause();
      setPlaying(false);
    }
  };

  return (
    <div className="clips" ref={box}>
      {clips.map((src, i) => (
        <video
          key={src}
          ref={(el) => (videos.current[i] = el)}
          className={`clips-video${i === current ? " on" : ""}`}
          src={src}
          poster={i === 0 ? poster : undefined}
          muted
          playsInline
          preload={i === current || i === (current + 1) % clips.length ? "auto" : "metadata"}
          onEnded={i === current ? onEnded : undefined}
          onTimeUpdate={i === current ? (e) => setProgress(e.currentTarget.currentTime / (e.currentTarget.duration || 1)) : undefined}
          aria-hidden={i === current ? undefined : "true"}
          aria-label={i === current ? `${label} — clip ${i + 1} of ${clips.length}` : undefined}
          tabIndex={-1}
        />
      ))}

      <div className="clips-bar" aria-hidden="true">
        {clips.map((src, i) => (
          <span key={src}>
            <i style={{ transform: `scaleX(${i < current ? 1 : i === current ? progress : 0})` }} />
          </span>
        ))}
      </div>

      <button type="button" className="clips-toggle" onClick={toggle} aria-label={playing ? "Pause video" : "Play video"}>
        {playing ? (
          <svg viewBox="0 0 20 20" aria-hidden="true"><rect x="5" y="4" width="3.4" height="12" rx="1" /><rect x="11.6" y="4" width="3.4" height="12" rx="1" /></svg>
        ) : (
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M6 4.2v11.6a.7.7 0 0 0 1.05.6l9.4-5.8a.7.7 0 0 0 0-1.2l-9.4-5.8A.7.7 0 0 0 6 4.2z" /></svg>
        )}
      </button>
    </div>
  );
}
