import Image from "next/image";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import ToTop from "@/components/ToTop";

// YouTube / Vimeo links become an embedded player; any other link becomes a button
function videoEmbed(link) {
  try {
    const u = new URL(link);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return `https://www.youtube-nocookie.com/embed/${u.pathname.slice(1)}`;
    if (host.endsWith("youtube.com")) {
      const id = u.searchParams.get("v") || u.pathname.split("/").filter(Boolean).pop();
      if (id) return `https://www.youtube-nocookie.com/embed/${id}`;
    }
    if (host.endsWith("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean).find((x) => /^\d+$/.test(x));
      if (id) return `https://player.vimeo.com/video/${id}`;
    }
  } catch {}
  return null;
}

// When the project has a link (YouTube, VR tour, Google Drive…), its photos open that link in a new tab
function Linked({ href, label, children }) {
  if (!href) return children;
  return (
    <a className="pd-img-link" href={href} target="_blank" rel="noopener noreferrer" aria-label={`Open ${label} (opens in a new tab)`}>
      {children}
      <span className="pd-img-hint" aria-hidden="true">Open project ↗</span>
    </a>
  );
}

export default function ProjectDetail({ project }) {
  const [cover, ...gallery] = project.images;
  const paragraphs = (project.description || "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const embed = project.link ? videoEmbed(project.link) : null;
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
            <Linked href={project.link} label={project.title}>
              <Image src={cover.src} alt={cover.alt} width={cover.w} height={cover.h} sizes="(max-width: 819px) 100vw, 1220px" priority />
            </Linked>
          </div>

          {paragraphs.length > 0 && (
            <div className="pd-text" data-anim="fade-up">
              {paragraphs.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          )}

          {project.link && !embed && (
            <p className="pd-link" data-anim="fade-up">
              <a className="pill pill-dark" href={project.link} target="_blank" rel="noopener noreferrer">
                View project<span className="arr">➔</span>
              </a>
            </p>
          )}
          {embed && (
            <div className="pd-video" data-anim="fade-up">
              <iframe src={embed} title={`${project.title} — video`} loading="lazy" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
            </div>
          )}

          {gallery.map((img) => (
            <div className="pd-image" key={img.src} data-anim="fade-up">
              <Linked href={project.link} label={project.title}>
                <Image src={img.src} alt={img.alt} width={img.w} height={img.h} sizes="(max-width: 819px) 100vw, 1220px" />
              </Linked>
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