import Image from "next/image";

// Our Work — projects grouped by service. Add or remove projects here.
// Each group shows the same tab bar with its own tab highlighted; the tabs jump between groups.
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

function Tabs({ active }) {
  return (
    <nav className="wk-tabs" aria-label="Work categories">
      <ul>
        {groups.map((g) => (
          <li key={g.id} className={`wk-tab-${g.id}`}>
            <a href={`#${g.id}`} className={g.id === active ? "active" : undefined} aria-current={g.id === active ? "true" : undefined}>
              {g.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function WorkGallery() {
  return groups.map((g) => (
    <section className={`wk wk-${g.id}`} id={g.id} key={g.id} aria-label={g.label}>
      <div className="wrap">
        <div data-anim="fade-up">
          <Tabs active={g.id} />
        </div>
        <span className="wk-rule" data-anim="grow" style={{ "--d": "0.15s" }} />
        <div className="wk-grid">
          {g.projects.map((p, i) => (
            <figure className="wk-item" key={p.title} data-anim="fade-up" style={{ "--d": `${0.2 + i * 0.12}s` }}>
              <div className="wk-img">
                <Image src={p.image} alt={p.alt} fill sizes="(max-width: 819px) 100vw, 900px" />
              </div>
              <figcaption>{p.title}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  ));
}
