import Image from "next/image";
import SplitText from "@/components/SplitText";

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
        <div className="proc-our" aria-hidden="true" data-anim="write">Our</div>
        <h2 className="proc-title">
          <span className="sr-only">Our </span>
          <SplitText text="PROCESS" delay={0.35} />
        </h2>
        <p className="proc-sub" data-anim="fade-up" style={{ "--d": "0.7s" }}>From Concept to Experience.</p>
        <div className="proc-art-wrap" data-anim="fade-up" style={{ "--d": "0.3s" }}>
          <Image
            className="proc-art"
            src="/images/process-illustration.png"
            alt="Sketch of a team fitting puzzle pieces together"
            width={311}
            height={365}
          />
        </div>
        <div className="proc-rule" data-anim="grow" style={{ "--d": "0.5s" }} />

        <ol className="timeline" data-anim="draw">
          {steps.map((s, i) => (
            <li className={`step ${s.pos} s${i + 1}`} key={s.title} data-anim="fade-up" style={{ "--d": `${0.25 + i * 0.28}s` }}>
              <h4>{s.title}</h4>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
