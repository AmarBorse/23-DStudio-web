"use client";

import { useEffect, useState } from "react";

// Day / night switch. The chosen theme is saved in the visitor's browser.
// The initial theme is set before the page paints by the small script in app/layout.js (no flash).
export default function ThemeToggle() {
  const [night, setNight] = useState(false);

  useEffect(() => {
    setNight(document.documentElement.dataset.theme === "dark");
  }, []);

  const toggle = () => {
    const next = !night;
    const root = document.documentElement;
    root.classList.add("theme-anim");
    root.dataset.theme = next ? "dark" : "light";
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
    setNight(next);
    setTimeout(() => root.classList.remove("theme-anim"), 600);
  };

  return (
    <button
      className={`theme-toggle${night ? " is-night" : ""}`}
      data-anim="fade-down"
      style={{ "--d": "0.52s" }}
      onClick={toggle}
      aria-label={night ? "Switch to day mode" : "Switch to night mode"}
      title={night ? "Day mode" : "Night mode"}
    >
      {/* sun */}
      <svg className="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="4.2" />
        <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" />
      </svg>
      {/* moon */}
      <svg className="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 14.6A8.3 8.3 0 0 1 9.4 4a8.3 8.3 0 1 0 10.6 10.6Z" />
      </svg>
    </button>
  );
}
