import Image from "next/image";
import Link from "next/link";

// TODO: replace "#" with the studio's real profile links
const social = [
  { label: "Facebook", href: "#" },
  { label: "Instagram", href: "#" },
  { label: "Pintrest", href: "#" },
];

const pages = [
  { label: "work", href: "/#services" },
  { label: "Services", href: "/services" },
  { label: "About us", href: "/about" },
  { label: "Contact us", href: "#contact" },
];

export default function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="wrap">
        <Image data-anim="fade-up" className="f-logo" src="/images/logo-white.png" alt="23D Studio" width={320} height={303} />

        <ul className="f-col nav" data-anim="fade-up" style={{ "--d": "0.1s" }}>
          {pages.map((p) => (
            <li key={p.label}><Link href={p.href}>{p.label}</Link></li>
          ))}
        </ul>

        <ul className="f-col social" data-anim="fade-up" style={{ "--d": "0.2s" }}>
          {social.map((s) => (
            <li key={s.label}><a href={s.href} target="_blank" rel="noopener noreferrer">{s.label}</a></li>
          ))}
        </ul>

        {/* TODO: replace with the studio's real email or a contact page */}
        <a className="pill f-cta" href="mailto:hello@23dstudio.com" data-anim="fade-up" style={{ "--d": "0.3s" }}>Start the Project<span className="arr">➔</span></a>

        <h2 className="f-head" data-anim="fade-up" style={{ "--d": "0.2s" }}>Let&apos;s Visualise It Together.</h2>
        <p className="f-text" data-anim="fade-up" style={{ "--d": "0.3s" }}>
          Whether you are an architect, interior designer, builder or developer, let&apos;s bring your next project to life
          through meaningful visual experiences.
        </p>
        <div className="f-rule" />
        <p className="f-copy">© 2026 <span>23D Studio. All Rights Reserved.</span></p>
        <p className="f-credit">Website design &amp; Manege by 23Dbranding</p>
      </div>
    </footer>
  );
}
