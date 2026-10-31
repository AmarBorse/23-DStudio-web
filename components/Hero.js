"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const links = [
  { label: "Work", href: "#services" },
  { label: "Services", href: "#services" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export default function Hero() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [floating, setFloating] = useState(false);
  const heroRef = useRef(null);

  // The ↑ button sits in the hero like the design, then floats once you scroll past it
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setFloating(!entry.isIntersecting));
    if (heroRef.current) observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="hero" ref={heroRef}>
      <Image
        className="hero-bg"
        src="/images/hero-bedroom.jpg"
        alt="3D interior render of a bedroom with study desk by 23D Studio"
        fill
        priority
        sizes="100vw"
      />
      <div className="wrap">
        <Image className="watermark" src="/images/hero-watermark.png" alt="" aria-hidden="true" width={1400} height={1320} priority />

        <a href="#top" aria-label="23D Studio home">
          <Image className="nav-logo" src="/images/logo-black.png" alt="23D Studio" width={320} height={302} priority />
        </a>

        <button
          className="menu-btn"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="nav"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span />
        </button>

        <ul className={`nav-links${menuOpen ? " open" : ""}`} id="nav">
          {links.map((l) => (
            <li key={l.label}>
              <a href={l.href} onClick={closeMenu}>{l.label}</a>
            </li>
          ))}
          <li className="m-cta">
            <a className="pill pill-dark" href="#contact" onClick={closeMenu}>Start the Project➔</a>
          </li>
        </ul>

        <a className="pill pill-dark nav-cta" href="#contact">Start the Project➔</a>

        <h1 className="hero-title">VISUALIZING&nbsp; Spaces Before They Exist</h1>
        <a className="pill pill-dark hero-cta" href="#services">Explore our work ➔</a>

        <a className={`to-top${floating ? " floating" : ""}`} href="#top" aria-label="Back to top">
          <svg viewBox="0 0 12 22" fill="none" stroke="#000" strokeWidth="1.4" aria-hidden="true">
            <path d="M6 21V1M1.5 5.5 6 1l4.5 4.5" />
          </svg>
        </a>
      </div>
    </header>
  );
}
