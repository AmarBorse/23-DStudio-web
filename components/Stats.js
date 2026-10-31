import SplitText from "@/components/SplitText";

const stats = [
  { num: "2022", label: "Studio Established" },
  { num: "30+", label: "Projects" },
  { num: "6+", label: "Years of Collective Experience" },
];

export default function Stats() {
  return (
    <section className="stats" id="about" aria-label="Studio in numbers">
      <div className="wrap">
        {stats.map((s, i) => (
          <div className="stat" key={s.label}>
            <div className="stat-num">
              <SplitText text={s.num} delay={0.15 + i * 0.18} step={0.08} />
            </div>
            <div className="stat-label" data-anim="fade-up" style={{ "--d": `${0.45 + i * 0.18}s` }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
