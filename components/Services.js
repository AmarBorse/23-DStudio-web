import Image from "next/image";

const services = [
  {
    title: "Architectural Visualisation",
    text: "We create realistic 3D exterior and interior renders that bring architectural designs to life through detailed materials, lighting, textures and surroundings.",
    image: "/images/service-visualisation.jpg",
    alt: "Exterior render of a modern timber and glass house at dusk",
    ruleFirst: false,
  },
  {
    title: "Architectural Walkthroughs",
    text: "Experience spaces through cinematic 3D animations that take viewers through architectural designs with realistic movement, lighting and visual storytelling.",
    image: "/images/service-walkthroughs.jpg",
    alt: "Modern villa with a curved pool at sunset",
    ruleFirst: true, // this row is mirrored in the design: line sits before the title
  },
  {
    title: "Virtual Reality Tours",
    text: "Step inside unbuilt spaces through immersive VR experiences that allow clients to explore layouts, interiors and architectural environments interactively.",
    image: "/images/service-vr.jpg",
    alt: "Woman wearing a VR headset exploring a bright living room",
    ruleFirst: false,
  },
];

export default function Services() {
  return (
    <section className="services" id="services">
      <div className="wrap">
        <div className="vertical" aria-hidden="true">EXPERIENCE BUILT THROUGH PROJECTS</div>
        <div className="svc-our" aria-hidden="true">Our</div>
        <h2 className="svc-title">
          <span className="sr-only">Our </span>SERVICES
        </h2>
        <p className="svc-tagline">
          Visualizing <br />Spaces Before <br />They Exist
        </p>

        {services.map((s, i) => (
          <article className={`svc svc-${i + 1}`} key={s.title}>
            <div className="svc-img">
              <Image src={s.image} alt={s.alt} fill sizes="(max-width: 819px) 100vw, 660px" />
              <a className="pill pill-light" href="#contact">Explore work ➔</a>
            </div>
            <div className="svc-text">
              <div className="svc-head">
                {s.ruleFirst && <span className="rule" />}
                <h3>{s.title}</h3>
                {!s.ruleFirst && <span className="rule" />}
              </div>
              <p>{s.text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
