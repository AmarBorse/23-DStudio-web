import SplitText from "@/components/SplitText";

export default function AboutIntro() {
  return (
    <section className="ab-intro" aria-labelledby="ab-intro-title">
      <div className="wrap">
        <div className="ab-script" aria-hidden="true" data-anim="write">About</div>
        <h2 className="ab-title" id="ab-intro-title">
          <span className="sr-only">About </span>
          <SplitText text="23D STUDIO" delay={0.35} step={0.05} />
        </h2>
        <p className="svc-tagline ab-tagline" data-anim="fade-up" style={{ "--d": "0.9s" }}>
          Visualizing <br />Spaces Before <br />They Exist
        </p>
        <p className="ab-lead" data-anim="fade-up" style={{ "--d": "0.7s" }}>We Visualise Ideas. We Create Experiences.</p>

        <div className="ab-body" data-anim="fade-up" style={{ "--d": "0.85s" }}>
          <p>
            23D Studio is an architectural visualisation studio established in 2022, based in Nashik,<br /> Maharashtra. We
            specialise in transforming architectural concepts into realistic and immersive<br /> visual experiences.
          </p>
          <p>
            Our work focuses on three key areas: architectural visualisation, architectural walkthroughs and<br /> virtual
            reality tours.
          </p>
          <p>
            We collaborate with architects, interior designers, builders and developers to communicate<br /> design concepts
            with greater clarity through carefully crafted visuals.
          </p>
        </div>
      </div>
    </section>
  );
}
