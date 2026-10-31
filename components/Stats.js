const stats = [
  { num: "2022", label: "Studio Established" },
  { num: "30+", label: "Projects" },
  { num: "6+", label: "Years of Collective Experience" },
];

export default function Stats() {
  return (
    <section className="stats" id="about" aria-label="Studio in numbers">
      <div className="wrap">
        {stats.map((s) => (
          <div className="stat" key={s.label}>
            <div className="stat-num">{s.num}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
