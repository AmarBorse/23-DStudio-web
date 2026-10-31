import Image from "next/image";

// "down" = text sits below the timeline, "up" = above it (alternating, as in the design)
const steps = [
  { title: "Understanding the Project", text: "We understand your requirements, drawings, references and design intent.", pos: "down" },
  { title: "Model Preparation", text: "We review the 3D model and prepare the scene for visualisation.", pos: "up" },
  { title: "Visual Development", text: "We work on camera angles, materials, lighting and environment.", pos: "down" },
  { title: "Review & Refinement", text: "We share previews and incorporate feedback.", pos: "up" },
  { title: "Final Delivery", text: "We deliver the completed visuals in the agreed formats.", pos: "down" },
];

export default function Process() {
  return (
    <section className="process" id="process">
      <div className="wrap">
        <div className="proc-our" aria-hidden="true">Our</div>
        <h2 className="proc-title">
          <span className="sr-only">Our </span>PROCESS
        </h2>
        <p className="proc-sub">From Concept to Experience.</p>
        <Image
          className="proc-art"
          src="/images/process-illustration.png"
          alt="Sketch of a team fitting puzzle pieces together"
          width={311}
          height={365}
        />
        <div className="proc-rule" />

        <ol className="timeline">
          {steps.map((s, i) => (
            <li className={`step ${s.pos} s${i + 1}`} key={s.title}>
              <h4>{s.title}</h4>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
