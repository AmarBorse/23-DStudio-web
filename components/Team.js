import Image from "next/image";
import SplitText from "@/components/SplitText";

// Team members — add, remove or reorder people here.
// Photos are portrait crops (about 3:4) in public/images.
const team = [
  { name: "Gaurav Duse", role: "Founder", photo: "/images/team-gaurav.jpg" },
  { name: "Ritika Yeole", role: "Interior designer", photo: "/images/team-ritika.jpg" },
  { name: "Pratiksha", role: "2d Artist", photo: "/images/team-pratiksha.jpg" },
];

export default function Team() {
  return (
    <section className="team" aria-labelledby="team-title">
      <div className="wrap">
        <div className="team-our" aria-hidden="true" data-anim="write">Our</div>
        <h2 className="team-title" id="team-title">
          <span className="sr-only">Our </span>
          <SplitText text="TEAM" delay={0.3} />
        </h2>
        <span className="team-rule" data-anim="grow" style={{ "--d": "0.4s" }} />
        <ul className="team-list">
          {team.map((m, i) => (
            <li key={m.name} data-anim="fade-up" style={{ "--d": `${0.35 + i * 0.12}s` }}>
              <div className="team-photo">
                <Image src={m.photo} alt={`${m.name}, ${m.role}`} fill sizes="(max-width: 819px) 33vw, 200px" />
              </div>
              <p className="team-name">{m.name}</p>
              <p className="team-role">{m.role}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
