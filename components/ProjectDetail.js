import Image from "next/image";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import ToTop from "@/components/ToTop";

export default function ProjectDetail({ project }) {
  const [cover, ...gallery] = project.images;
  return (
    <>
      <header className="hero pd-head">
        <div className="wrap">
          <SiteNav current="work" />
          <ToTop floatOnly />
        </div>
      </header>

      <main className="pd">
        <div className="wrap">
          <nav className="pd-crumbs" aria-label="Breadcrumb" data-anim="fade-up">
            <Link href="/work">Work</Link>
            <span aria-hidden="true">/</span>
            <Link href={`/work#${project.category.id}`}>{project.category.label}</Link>
          </nav>
          <h1 className="pd-title" data-anim="fade-up" style={{ "--d": "0.1s" }}>{project.title}</h1>

          <div className="pd-cover" data-anim="wipe-left" style={{ "--d": "0.2s" }}>
            <Image src={cover.src} alt={cover.alt} width={cover.w} height={cover.h} sizes="(max-width: 819px) 100vw, 1220px" priority />
          </div>

          {project.description.length > 0 && (
            <div className="pd-text" data-anim="fade-up">
              {project.description.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          )}

          {gallery.map((img) => (
            <div className="pd-image" key={img.src} data-anim="fade-up">
              <Image src={img.src} alt={img.alt} width={img.w} height={img.h} sizes="(max-width: 819px) 100vw, 1220px" />
            </div>
          ))}

        </div>
      </main>

      <section className="pd-cta" aria-labelledby="pd-cta-title">
        <Image className="pd-cta-bg" src="/images/work-hero.jpg" alt="" fill sizes="100vw" />
        <div className="wrap">
          <h2 className="pd-cta-title" id="pd-cta-title" data-anim="fade-up">Have a project in mind?</h2>
          <Link className="pill pd-cta-btn" href="/contact" data-anim="fade-up" style={{ "--d": "0.15s" }}>
            Start the Project<span className="arr">➔</span>
          </Link>
        </div>
      </section>
    </>
  );
}