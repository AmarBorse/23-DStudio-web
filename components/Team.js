import Image from "next/image";
import SplitText from "@/components/SplitText";

// Team members come from the admin (/admin/team).
export default function Team({ team }) {
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
            <li key={m.id || m.name} data-anim="fade-up" style={{ "--d": `${0.35 + i * 0.12}s` }}>
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
