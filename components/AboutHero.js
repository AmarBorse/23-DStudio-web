import Image from "next/image";
import SiteNav from "@/components/SiteNav";
import ToTop from "@/components/ToTop";

export default function AboutHero() {
  return (
    <header className="hero about-hero">
      <Image
        className="hero-img about-hero-img"
        src="/images/about-hero.jpg"
        alt="Architect's desk with a monitor showing a 3D render of a modern building"
        fill
        sizes="100vw"
        priority
      />
      <div className="wrap">
        <SiteNav current="about" />
        <h1 className="about-hero-title" data-anim="fade-up" style={{ "--d": "0.4s" }}>About Us</h1>
        <ToTop floatOnly />
      </div>
    </header>
  );
}
