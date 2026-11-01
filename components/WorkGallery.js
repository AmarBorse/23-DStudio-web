"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

// Our Work — one tab bar; each tab shows only its own projects. Clicking a project opens its link or its page.
// Projects come from the admin (/admin/projects). The tab is kept in the address (/work#walkthroughs).

// A project with a link (YouTube, VR tour, Google Drive…) opens that link straight away in a new tab;
// a project without one opens its own page on this site.
function ProjectLink({ project, children }) {
  if (project.link) {
    return (
      <a href={project.link} className="wk-link" target="_blank" rel="noopener noreferrer" aria-label={`${project.title} (opens in a new tab)`}>
        {children}
      </a>
    );
  }
  return (
    <Link href={`/work/${project.slug}`} className="wk-link">
      {children}
    </Link>
  );
}

export default function WorkGallery({ groups }) {
  const [active, setActive] = useState(groups[0].id);
  const tabRefs = useRef({});

  // Open the tab named in the address, e.g. /work#vr
  useEffect(() => {
    const fromHash = () => {
      const id = window.location.hash.slice(1);
      if (groups.some((g) => g.id === id)) setActive(id);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [groups]);

  const select = (id, focus = false) => {
    setActive(id);
    history.replaceState(null, "", `#${id}`);
    if (focus) tabRefs.current[id]?.focus();
  };

  // Arrow keys move between tabs (standard tab behaviour)
  const onKeyDown = (e) => {
    const i = groups.findIndex((g) => g.id === active);
    let next = null;
    if (e.key === "ArrowRight") next = (i + 1) % groups.length;
    if (e.key === "ArrowLeft") next = (i - 1 + groups.length) % groups.length;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = groups.length - 1;
    if (next !== null) {
      e.preventDefault();
      select(groups[next].id, true);
    }
  };

  const group = groups.find((g) => g.id === active);

  return (
    <section className="wk" id="projects" aria-label="Our projects">
      <div className="wrap">
        <div className="wk-tabs" role="tablist" aria-label="Work categories" onKeyDown={onKeyDown} data-anim="fade-up">
          {groups.map((g) => (
            <button
              key={g.id}
              ref={(el) => (tabRefs.current[g.id] = el)}
              type="button"
              role="tab"
              id={`tab-${g.id}`}
              aria-selected={g.id === active}
              aria-controls="wk-panel"
              tabIndex={g.id === active ? 0 : -1}
              className={`wk-tab wk-tab-${g.id}${g.id === active ? " active" : ""}`}
              onClick={() => select(g.id)}
            >
              {g.label}
            </button>
          ))}
        </div>
        <span className="wk-rule" data-anim="grow" style={{ "--d": "0.15s" }} />

        {/* key makes the panel re-mount, so its fade-in plays on every tab change */}
        <div className={`wk-panel wk-${group.id}`} id="wk-panel" role="tabpanel" aria-labelledby={`tab-${group.id}`} key={group.id}>
          {group.projects.length === 0 && <p className="wk-empty">New projects coming soon.</p>}
          <div className="wk-grid">
            {group.projects.map((p, i) => (
              <figure className="wk-item" key={p.slug} style={{ "--i": i }}>
                <ProjectLink project={p}>
                  <div className="wk-img">
                    <Image src={p.images[0].src} alt={p.images[0].alt} fill sizes="(max-width: 819px) 100vw, 900px" priority={group.id === groups[0].id} />
                    <span className="wk-view" aria-hidden="true">
                      {p.link ? <>Open project ↗</> : <>View project<span className="arr">➔</span></>}
                    </span>
                  </div>
                  <figcaption>{p.title}</figcaption>
                </ProjectLink>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}