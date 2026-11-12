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

// Splits the pictures into rows like the design PDF: wide pictures take a full row,
// "half" pictures sit side by side in pairs (their widths follow their shapes, so the heights match).
const isHalf = (im) => im.layout === "half" || (!im.layout && im.w / im.h < 1.45);
function buildRows(images) {
  const rows = [];
  for (let i = 0; i < images.length; i++) {
    const im = images[i];
    const next = images[i + 1];
    if (i > 0 && isHalf(im) && next && isHalf(next)) {
      rows.push([im, next]);
      i++;
    } else rows.push([im]);
  }
  return rows;
}

export default function ProjectDetail({ project }) {
  const images = project.images || [];
  const paragraphs = (project.description || "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const embed = project.link ? videoEmbed(project.link) : null;
  const rows = buildRows(images);
  const flagged = images.findIndex((im) => im.text_after);
  const textAfterImage = images[flagged >= 0 ? flagged : 0];
  const textRow = rows.findIndex((r) => r.includes(textAfterImage));

  const text = (
    <>
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
    </>
  );

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
          <h1 className="pd-title" data-anim="fade-up">{project.title}</h1>

          {rows.map((row, r) => (
            <div key={r}>
              <div
                className={`pd-row${row.length > 1 ? " two" : ""}${r === 0 ? " first" : ""}${r > 0 && r - 1 !== textRow && typeof row[0].gap === "number" ? " gap" : ""}`}
                data-anim={r === 0 ? "wipe-left" : "fade-up"}
                style={r === 0 ? { "--d": "0.15s" } : typeof row[0].gap === "number" ? { "--gap": row[0].gap } : undefined}
              >
                {row.map((img, k) => (
                  <figure key={img.src + k} className="pd-image" style={row.length > 1 ? { flexGrow: img.w / img.h } : undefined}>
                    <Linked href={project.link} label={project.title}>
                      <Image
                        src={img.src}
                        alt={img.alt}
                        width={img.w}
                        height={img.h}
                        sizes={row.length > 1 ? "(max-width: 819px) 50vw, 640px" : "(max-width: 819px) 100vw, 1220px"}
                        priority={r === 0}
                      />
                    </Linked>
                  </figure>
                ))}
              </div>
              {r === textRow && text}
            </div>
          ))}
          {rows.length === 0 && text}
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
