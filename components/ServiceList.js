import Image from "next/image";

// Services page content. Edit text, lists and images here.
// The first service has a photo collage; the others have one wide image above the text.
export const visualisation = {
  number: "01",
  title: "Architectural Visualisation",
  text: [
    "We transform architectural drawings and 3D models into detailed,",
    "photorealistic images that communicate the design, materials,",
    "lighting and overall character of a space.",
  ],
  offer: ["Exterior 3D Rendering", "Interior 3D Rendering", "Residential Visualisation", "Commercial Visualisation", "Architectural Still Images"],
  // className = position in the collage (see .sv-c-* in globals.css)
  images: [
    { className: "sv-c-main", src: "/images/services-vis-main.jpg", alt: "Exterior render of a modern white house reflected in a rainy pond" },
    { className: "sv-c-forest", src: "/images/services-vis-forest.jpg", alt: "Render of a car parked in a sunlit forest" },
    { className: "sv-c-trees", src: "/images/services-vis-trees.jpg", alt: "Render of a modern house seen through dark foliage" },
    { className: "sv-c-car", src: "/images/services-vis-car.jpg", alt: "Render of a car in front of a two-storey modern house at dusk" },
    { className: "sv-c-street", src: "/images/services-vis-street.jpg", alt: "Render of a wet street with cars outside a modern house" },
  ],
};

export const others = [
  {
    key: "walkthrough",
    number: "02",
    title: "Architectural Walkthroughs",
    text: [
      "We create cinematic architectural animations that allow viewers to explore a space through carefully planned camera movements, realistic environments",
      "and detailed visual storytelling.",
    ],
    offer: ["Exterior Walkthroughs", "Interior Walkthroughs", "Residential Project Animations", "Commercial Project Animations"],
    columns: 2,
    image: "/images/services-walkthrough.jpg",
    alt: "Interior render of a bedroom with timber wall panels and a walk-in wardrobe",
  },
  {
    key: "vr",
    number: "03",
    title: "Virtual Reality Tours",
    text: [
      "We develop immersive virtual reality experiences that allow users to step inside architectural spaces and explore them from a first-person",
      "perspective.",
    ],
    offer: ["VR Interior Tours", "VR Exterior Experiences"],
    columns: 1,
    image: "/images/services-vr.jpg",
    alt: "Aerial render of a riverside township under passing clouds",
  },
];

// Keeps the PDF's line breaks on desktop; on phones the lines simply flow.
function Lines({ lines }) {
  return lines.map((l, i) => (
    <span key={i}>
      {l}
      {i < lines.length - 1 && <br />}{" "}
    </span>
  ));
}

function Offer({ items, columns = 1 }) {
  return (
    <>
      <h3 className="sv-offer">What we offer:</h3>
      <ul className={`sv-list${columns === 2 ? " two" : ""}`}>
        {items.map((o) => (
          <li key={o}>{o}</li>
        ))}
      </ul>
    </>
  );
}

export function VisualisationSection() {
  const s = visualisation;
  return (
    <section className="sv sv-vis" aria-labelledby="sv-01">
      <div className="sv-collage">
        {s.images.map((img, i) => (
          <div className={`sv-c ${img.className}`} key={img.src} data-anim={i === 0 ? "wipe-right" : "wipe-left"} style={{ "--d": `${0.1 + i * 0.12}s` }}>
            <Image src={img.src} alt={img.alt} fill sizes="(max-width: 819px) 50vw, 460px" />
          </div>
        ))}
      </div>
      <div className="wrap">
        <h2 className="sv-title" id="sv-01" data-anim="fade-up" style={{ "--d": "0.2s" }}>
          {s.number} – {s.title}
        </h2>
        <div className="sv-text" data-anim="fade-up" style={{ "--d": "0.35s" }}>
          <p><Lines lines={s.text} /></p>
          <Offer items={s.offer} />
        </div>
      </div>
    </section>
  );
}

export function ServiceSection({ s }) {
  return (
    <section className={`sv sv-wide sv-${s.key}`} aria-labelledby={`sv-${s.number}`}>
      <div className="sv-banner" data-anim="wipe-left">
        <Image src={s.image} alt={s.alt} fill sizes="100vw" />
      </div>
      <div className="wrap">
        <h2 className="sv-title" id={`sv-${s.number}`} data-anim="fade-up" style={{ "--d": "0.1s" }}>
          {s.number} – {s.title}
        </h2>
        <div className="sv-text" data-anim="fade-up" style={{ "--d": "0.2s" }}>
          <p><Lines lines={s.text} /></p>
          <Offer items={s.offer} columns={s.columns} />
        </div>
      </div>
    </section>
  );
}
