import Image from "next/image";
import RevealImage from "@/components/RevealImage";
import SplitText from "@/components/SplitText";

const services = [
  {
    title: "Architectural Visualisation",
    text: "We create realistic 3D exterior and interior renders that bring architectural designs to life through detailed materials, lighting, textures and surroundings.",
    image: "/images/service-visualisation.jpg",
    alt: "Exterior render of a modern timber and glass house at dusk",
    ruleFirst: false,
    reveal: true, // white "clay" image that turns colourful on hover
    clay: "/images/service-visualisation-clay.jpg",
  },
  {
    title: "Architectural Walkthroughs",
    text: "Experience spaces through cinematic 3D animations that take viewers through architectural designs with realistic movement, lighting and visual storytelling.",
    image: "/images/service-walkthroughs.jpg",
    alt: "Modern villa with a curved pool at sunset",
    ruleFirst: true, // this row is mirrored in the design: line sits before the title
    reveal: true,
    clay: "/images/service-walkthroughs-clay.jpg",
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
        <div className="vertical" aria-hidden="true" data-parallax="0.25">EXPERIENCE BUILT THROUGH PROJECTS</div>
        <div className="svc-our" aria-hidden="true" data-anim="write">Our</div>
        <h2 className="svc-title">
          <span className="sr-only">Our </span>
          <SplitText text="SERVICES" delay={0.35} />
        </h2>
        <p className="svc-tagline" data-anim="fade-up" style={{ "--d": "0.9s" }}>
          Visualizing <br />Spaces Before <br />They Exist
        </p>

        {services.map((s, i) => (
          <article className={`svc svc-${i + 1}`} key={s.title}>
            <div className="svc-img" data-anim={i === 1 ? "wipe-right" : "wipe-left"}>
              {s.reveal ? (
                <RevealImage src={s.image} alt={s.alt} claySrc={s.clay} sizes="(max-width: 819px) 100vw, 660px" />
              ) : (
                <Image src={s.image} alt={s.alt} fill sizes="(max-width: 819px) 100vw, 660px" />
              )}
              <a className="pill pill-light" href="/work">Explore work&nbsp;<span className="arr">➔</span></a>
            </div>
            <div className="svc-text">
              <div className="svc-head">
                {s.ruleFirst && <span className="rule" data-anim="grow" style={{ "--d": "0.5s" }} />}
                <h3 data-anim="fade-up" style={{ "--d": "0.25s" }}>{s.title}</h3>
                {!s.ruleFirst && <span className="rule" data-anim="grow" style={{ "--d": "0.5s" }} />}
              </div>
              <p data-anim="fade-up" style={{ "--d": "0.4s" }}>{s.text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}