"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import ThemeToggle from "@/components/ThemeToggle";

const links = [
  { label: "Work", href: "#services" },
  { label: "Services", href: "#services" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

// Hero slides — add, remove or reorder images here.
// "mirror" flips the image horizontally (the bedroom render is shown mirrored in the design).
const slides = [
  { src: "/images/hero-bedroom.jpg", alt: "3D interior render of a bedroom with study desk", mirror: true },
  { src: "/images/hero-bathrooms.jpg", alt: "3D render of two luxury bathroom vanities" },
  { src: "/images/hero-campus.jpg", alt: "3D exterior render of an institutional building with a terracotta jaali facade" },
  { src: "/images/hero-apartments.jpg", alt: "3D night render of a residential apartment tower with shops" },
];

const INTERVAL = 5000; // time each slide stays, in milliseconds
const SPEED = 900; // slide animation length, in milliseconds

export default function Hero() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [floating, setFloating] = useState(false);
  const [index, setIndex] = useState(0); // 0..slides.length (last = copy of first, for seamless looping)
  const [animate, setAnimate] = useState(true);
  const heroRef = useRef(null);
  const touchX = useRef(null);
  const count = slides.length;

  // The ↑ button sits in the hero like the design, then floats once you scroll past it
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setFloating(!entry.isIntersecting));
    if (heroRef.current) observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, []);

  const next = useCallback(() => {
    setAnimate(true);
    setIndex((i) => Math.min(i + 1, count));
  }, [count]);

  const prev = useCallback(() => {
    setIndex((i) => {
      if (i > 0) {
        setAnimate(true);
        return i - 1;
      }
      // at the first slide: jump to the copy at the end without animating, then slide back
      setAnimate(false);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          setAnimate(true);
          setIndex(count - 1);
        })
      );
      return count;
    });
  }, [count]);

  const goTo = (i) => {
    setAnimate(true);
    setIndex(i);
  };

  // Auto-scroll (skips while the tab is hidden; off if the visitor prefers reduced motion)
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      if (!document.hidden) next();
    }, INTERVAL);
    return () => clearInterval(id);
  }, [next, index]);

  // After sliding onto the copy of the first slide, silently jump back to the real first slide
  const onTransitionEnd = () => {
    if (index === count) {
      setAnimate(false);
      setIndex(0);
    }
  };

  const onTouchStart = (e) => (touchX.current = e.touches[0].clientX);
  const onTouchEnd = (e) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (dx < -50) next();
    if (dx > 50) prev();
    touchX.current = null;
  };

  const closeMenu = () => setMenuOpen(false);
  const active = index % count;

  return (
    <header
      className="hero"
      ref={heroRef}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      aria-roledescription="carousel"
      aria-label="Featured work"
    >
      <div
        className="hero-track"
        style={{
          transform: `translateX(-${index * 100}%)`,
          transition: animate ? `transform ${SPEED}ms cubic-bezier(.65,0,.35,1)` : "none",
        }}
        onTransitionEnd={onTransitionEnd}
      >
        {[...slides, slides[0]].map((s, i) => (
          <div
            className="hero-slide"
            key={i}
            aria-hidden={i % count !== active || i === count}
            aria-roledescription="slide"
            aria-label={`${(i % count) + 1} of ${count}`}
          >
            <Image
              className={`hero-img${s.mirror ? " mirror" : ""}`}
              src={s.src}
              alt={s.alt}
              fill
              sizes="100vw"
              priority={i === 0}
              loading={i === 0 ? undefined : "eager"}
            />
          </div>
        ))}
      </div>

      <div className="wrap">
        <a href="#top" aria-label="23D Studio home">
          <Image className="nav-logo logo-day" src="/images/logo-black.png" alt="23D Studio" width={320} height={302} priority />
          <Image className="nav-logo logo-night" src="/images/logo-white.png" alt="" aria-hidden="true" width={320} height={303} priority />
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

        <ThemeToggle />
        <a className="pill pill-dark nav-cta" href="#contact">Start the Project➔</a>

        <a className={`to-top${floating ? " floating" : ""}`} href="#top" aria-label="Back to top">
          <svg viewBox="0 0 12 22" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
            <path d="M6 21V1M1.5 5.5 6 1l4.5 4.5" />
          </svg>
        </a>
      </div>

      <div className="hero-dots">
        {slides.map((s, i) => (
          <button
            key={s.src}
            className={i === active ? "active" : ""}
            aria-label={`Show slide ${i + 1}`}
            aria-current={i === active}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
    </header>
  );
}