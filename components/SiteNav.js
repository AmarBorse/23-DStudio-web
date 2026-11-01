"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

// Top navigation, shared by every page (sits inside the hero's .wrap).
// Page links; "Contact" jumps to the footer, which is on every page.
const links = [
  { label: "Work", href: "/work" },
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "#contact" }, // the footer is on every page
];

export default function SiteNav({ current }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  const onHome = current === "home";

  return (
    <>
      <Link href={onHome ? "#top" : "/"} aria-label="23D Studio home" data-anim="fade-down" style={{ "--d": "0.1s" }}>
        <Image className="nav-logo logo-day" src="/images/logo-black.png" alt="23D Studio" width={320} height={302} priority />
        <Image className="nav-logo logo-night" src="/images/logo-white.png" alt="" aria-hidden="true" width={320} height={303} priority />
      </Link>

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
        {links.map((l, i) => (
          <li key={l.label} data-anim="fade-down" style={{ "--d": `${0.2 + i * 0.08}s` }}>
            <Link href={l.href} onClick={closeMenu} aria-current={current === l.label.toLowerCase() ? "page" : undefined}>
              {l.label}
            </Link>
          </li>
        ))}
        <li className="m-cta">
          <a className="pill pill-dark" href="#contact" onClick={closeMenu}>Start the Project<span className="arr">➔</span></a>
        </li>
      </ul>

      <ThemeToggle />
      <a className="pill pill-dark nav-cta" href="#contact" data-anim="fade-down" style={{ "--d": "0.6s" }}>Start the Project<span className="arr">➔</span></a>
    </>
  );
}