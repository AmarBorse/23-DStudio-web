import SplitText from "@/components/SplitText";

export default function VisionMission() {
  return (
    <section className="vm" aria-label="Our vision and mission">
      <div className="wrap">
        <div className="vm-block vm-vision">
          <div className="vm-our" aria-hidden="true" data-anim="write">Our</div>
          <h2 className="vm-title">
            <span className="sr-only">Our </span>
            <SplitText text="VISION" delay={0.3} />
          </h2>
          <span className="vm-rule" data-anim="grow" style={{ "--d": "0.4s" }} />
          <div className="vm-text" data-anim="fade-up" style={{ "--d": "0.55s" }}>
            <p>
              To become a trusted architectural visualisation studio recognised for creative excellence, realistic<br />{" "}
              representation and innovative visual experiences.
            </p>
            <p>
              We aim to contribute to the future of architectural communication through evolving technologies<br /> and
              thoughtful visual storytelling.
            </p>
          </div>
        </div>

        <div className="vm-block vm-mission">
          <div className="vm-our" aria-hidden="true" data-anim="write">Our</div>
          <h2 className="vm-title">
            <span className="sr-only">Our </span>
            <SplitText text="MISSION" delay={0.3} />
          </h2>
          <span className="vm-rule" data-anim="grow" style={{ "--d": "0.4s" }} />
          <div className="vm-text" data-anim="fade-up" style={{ "--d": "0.55s" }}>
            <p>Our mission is to simplify the way architectural ideas are presented and experienced.</p>
            <p>
              We strive to deliver quality-driven visualisation solutions that help our clients communicate their<br />{" "}
              designs, present their projects and connect with their audiences.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
