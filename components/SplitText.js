// Splits text into letters so they can animate one after another.
// Screen readers still read the whole word normally.
export default function SplitText({ text, delay = 0, step = 0.06 }) {
  return (
    <>
      <span className="sr-only">{text}</span>
      <span className="split" data-anim="letters" aria-hidden="true">
        {[...text].map((ch, i) => (
          <span className="ch" key={i} style={{ "--d": `${delay + i * step}s` }}>
            {ch === " " ? "\u00a0" : ch}
          </span>
        ))}
      </span>
    </>
  );
}
