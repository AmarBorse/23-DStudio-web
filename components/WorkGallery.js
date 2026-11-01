"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

// Our Work — one tab bar; each tab shows only its own projects.
// Add or remove projects here. The tab is also kept in the address (/work#walkthroughs) so it can be shared.
const groups = [
  {
    id: "visualisation",
    label: "Architectural Visualisation",
    projects: [
      { title: "Bed room", image: "/images/work-bedroom.jpg", alt: "Interior render of a bedroom with a study desk and warm cove lighting" },
      { title: "Bungalow", image: "/images/work-bungalow.jpg", alt: "Exterior render of a white bungalow with a cantilevered balcony among trees" },
      { title: "012 Bungalow", image: "/images/work-012-bungalow.jpg", alt: "Exterior render of a two-storey bungalow with timber fins and a white car" },
    ],
  },
  {
    id: "walkthroughs",
    label: "Architectural Walkthroughs",
    projects: [
      { title: "Shrinathji old age home by TCL", image: "/images/work-old-age-home.jpg", alt: "Exterior render of the Shrinathji old age home with a landscaped lawn" },
      { title: "Row house project in Malegoan", image: "/images/work-row-house.jpg", alt: "Exterior render of row houses with palm trees in Malegaon" },
    ],
  },
  {
    id: "vr",
    label: "Virtual Reality Tours",
    projects: [{ title: "Town Project.", image: "/images/work-town.jpg", alt: "Aerial render of a riverside township under clouds" }],
  },
];

export default function WorkGallery() {
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
  }, []);

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
          <div className="wk-grid">
            {group.projects.map((p, i) => (
              <figure className="wk-item" key={p.title} style={{ "--i": i }}>
                <div className="wk-img">
                  <Image src={p.image} alt={p.alt} fill sizes="(max-width: 819px) 100vw, 900px" priority={group.id === groups[0].id} />
                </div>
                <figcaption>{p.title}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}