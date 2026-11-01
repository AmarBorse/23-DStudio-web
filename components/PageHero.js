import Image from "next/image";
import SiteNav from "@/components/SiteNav";
import ToTop from "@/components/ToTop";

// Hero for inner pages (About, Services): one photo, the nav, and a big translucent title.
// x / y / size are the title's position and font size in design pixels (1024px-wide PDF);
// mobileSize is the title size on phones (in vw).
export default function PageHero({ current, image, alt, title, x, y, size, mobileSize }) {
  return (
    <header className="hero page-hero">
      <Image className="hero-img page-hero-img" src={image} alt={alt} fill sizes="100vw" priority />
      <div className="wrap">
        <SiteNav current={current} />
        <h1
          className="page-hero-title"
          data-anim="fade-up"
          style={{ "--d": "0.4s", "--tx": x, "--ty": y, "--ts": size, "--tm": `${mobileSize}vw` }}
        >
          {title}
        </h1>
        <ToTop floatOnly />
      </div>
    </header>
  );
}
