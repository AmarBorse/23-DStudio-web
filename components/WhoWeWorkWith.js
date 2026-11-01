import SplitText from "@/components/SplitText";

// Client types — edit this list to change the bullet points
const clients = [
  "Architects and architectural firms",
  "Interior designers and design studios",
  "Real estate developers and builders",
  "Construction companies",
  "Property marketing teams",
  "Commercial and residential project developers",
];

const titleLines = ["WHO", "WE", "WORK", "WITH"];

export default function WhoWeWorkWith() {
  return (
    <section className="who" aria-labelledby="who-title">
      <div className="wrap">
        <div className="who-plan" aria-hidden="true" data-anim="fade" style={{ "--d": "0.2s" }} />
        <h2 className="who-title" id="who-title">
          {titleLines.map((w, i) => (
            <span className="who-line" key={w}>
              <SplitText text={w} delay={0.15 + i * 0.18} step={0.06} />
            </span>
          ))}
        </h2>
        <p className="who-sub" data-anim="fade-up" style={{ "--d": "0.8s" }}>
          We work with professionals and<br /> businesses across the architectural and<br /> construction industry.
        </p>
        <span className="who-divider" data-anim="grow" style={{ "--d": "0.3s" }} />
        <ul className="who-list">
          {clients.map((c, i) => (
            <li key={c} data-anim="fade-up" style={{ "--d": `${0.35 + i * 0.1}s` }}>{c}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
