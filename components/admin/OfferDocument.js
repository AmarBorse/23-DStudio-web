/* eslint-disable @next/next/no-img-element */
import { COMPANY, OFFER_DEFAULTS, COMPLETION_DEFAULTS } from "@/lib/company";
import { letterParagraphs, longDate, firstName, offerType, fillPlaceholders } from "@/lib/offer";
import { boldParts } from "@/lib/invoice";

const lines = (t) => String(t || "").split("\n").map((s) => s.trim()).filter(Boolean);
// Office address split over two lines like the template
const addressLines = (() => {
  const parts = COMPANY.address.split(",").map((s) => s.trim());
  const half = Math.ceil(parts.length / 2);
  return [parts.slice(0, half).join(", "), parts.slice(half).join(", ")];
})();

const Icon = ({ d }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d={d} /></svg>
);
const PIN = "M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.6A2.6 2.6 0 1 1 12 6.4a2.6 2.6 0 0 1 0 5.2z";
const PHONE = "M3 8.5C3 5 6.6 3 12 3s9 2 9 5.5v1.2a1 1 0 0 1-1.2 1l-3.1-.6a1 1 0 0 1-.8-1V7.6C14.6 7 13.3 6.8 12 6.8s-2.6.2-3.9.8v1.5a1 1 0 0 1-.8 1l-3.1.6A1 1 0 0 1 3 9.7zM6 13h12l2 7H4z";
const MAIL = "M2 6.5A1.5 1.5 0 0 1 3.5 5h17A1.5 1.5 0 0 1 22 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 2 17.5zm2.2.5 7.8 6 7.8-6z";

const Rich = ({ parts }) => parts.map((p, j) => (p.bold ? <strong key={j}>{p.text}</strong> : <span key={j}>{p.text}</span>));

// corner shapes + soft background swirl
const Background = () => (
  <svg className="ol-bg" viewBox="0 0 210 297" preserveAspectRatio="none" aria-hidden="true">
    {/* 23D Studio logo as a faint watermark in the middle of the page */}
    <image href="/images/logo-black.png" x="47" y="96" width="116" height="109.5" opacity="0.05" preserveAspectRatio="xMidYMid meet" />
    <path d="M0 0 H57 L52 5.6 H0 Z" fill="var(--ol-b)" />
    <path d="M95 0 H210 V10.6 H104 Z" fill="var(--ol-a)" />
    <path d="M0 297 V286.4 H106 L115 297 Z" fill="var(--ol-a)" />
    <path d="M150 297 L155 291.4 H210 V297 Z" fill="var(--ol-b)" />
  </svg>
);

const Head = ({ title }) => (
  <>
    <header className="ol-head">
      <div className="ol-brand">
        <img src="/images/logo-black.png" alt="23D Studio" />
        <span>TWENTY-THREE D<br />STUDIO</span>
      </div>
      <h1 className="ol-title">{title}</h1>
    </header>
    <hr className="ol-rule" />
  </>
);

const Contact = () => (
  <ul className="ol-contact">
    <li><Icon d={PIN} />{addressLines[1] || COMPANY.address}</li>
    <li><Icon d={PHONE} />{COMPANY.phone}</li>
    <li><Icon d={MAIL} />{COMPANY.email}</li>
  </ul>
);

const StudioAndDate = ({ o }) => (
  <section className="ol-top">
    <div>
      <p className="ol-strong">{COMPANY.name}</p>
      {addressLines.map((l, i) => <p key={i}>{l}</p>)}
      <p>{COMPANY.phone}</p>
      <p>{COMPANY.email}</p>
    </div>
    <div className="ol-date">
      <p>{longDate(o.letter_date)}</p>
      {o.number && <p className="ol-ref">Ref: {o.number}</p>}
    </div>
  </section>
);

const To = ({ o }) => (
  <section className="ol-to">
    <p>To:</p>
    <p className="ol-strong">{o.candidate_name}</p>
    {lines(o.candidate_address).map((l, i) => <p key={i}>{l}</p>)}
  </section>
);

const Signature = ({ o }) => (
  <div className="ol-sign">
    <p>{o.closing}</p>
    <div className="ol-signature">{o.signature && <img src={o.signature} alt="" />}</div>
    <p className="ol-strong">{o.signatory_name}</p>
    {o.signatory_title && <p>{o.signatory_title}</p>}
    <p>{COMPANY.name}</p>
  </div>
);

const style = { "--ol-a": OFFER_DEFAULTS.accent, "--ol-b": OFFER_DEFAULTS.accent2 };

export default function OfferDocument({ o }) {
  const type = offerType(o);
  if (type === "internship") return <InternshipLetter o={o} />;
  if (type === "completion") return <CompletionLetter o={o} />;
  return <JobLetter o={o} />;
}

// Internship completion: one page — studio and date, "To whom it may concern", certificate text, signature
function CompletionLetter({ o }) {
  return (
    <article className="ol ol-intern ol-done" aria-label={`Internship completion letter ${o.number || ""}`} style={style}>
      <Background />
      <Head title="INTERNSHIP COMPLETION LETTER" />
      <StudioAndDate o={o} />
      <p className="ol-concern">{COMPLETION_DEFAULTS.heading}</p>
      <section className="ol-body">
        {letterParagraphs(o).map((parts, i) => <p key={i}><Rich parts={parts} /></p>)}
      </section>
      <Signature o={o} />
      <div className="ol-contact-row"><Contact /></div>
    </article>
  );
}

// Job offer: one page, laid out like the Canva "Job Offer Letter" template
function JobLetter({ o }) {
  const greeting = o.greeting_name || firstName(o.candidate_name);
  return (
    <article className="ol" aria-label={`Offer letter ${o.number || ""}`} style={style}>
      <Background />
      <Head title="JOB OFFER LETTER" />
      <StudioAndDate o={o} />
      <To o={o} />
      <section className="ol-body">
        <p>Dear {greeting},</p>
        {letterParagraphs(o).map((parts, i) => <p key={i}><Rich parts={parts} /></p>)}
      </section>
      <footer className="ol-foot">
        <Signature o={o} />
        <Contact />
      </footer>
    </article>
  );
}

// Internship offer: one page — date, candidate, letter, studio signature, then the candidate's acceptance
function InternshipLetter({ o }) {
  const greeting = o.greeting_name || firstName(o.candidate_name);
  const acceptance = boldParts(fillPlaceholders(o.terms || "", o).replace(/\s*\n\s*/g, " ").trim());
  return (
    <article className="ol ol-intern" aria-label={`Internship offer letter ${o.number || ""}`} style={style}>
      <Background />
      <Head title="INTERNSHIP OFFER LETTER" />
      <StudioAndDate o={o} />
      <To o={o} />
      <section className="ol-body">
        <p>Dear {greeting},</p>
        {letterParagraphs(o).map((parts, i) => <p key={i}><Rich parts={parts} /></p>)}
      </section>
      <Signature o={o} />
      <section className="ol-accept-box">
        <p className="ol-strong">Acceptance:</p>
        <p><Rich parts={acceptance} /></p>
        <div className="ol-accept-lines">
          <p>Signature: <span className="ol-blank" /></p>
          <p>Date: <span className="ol-blank short" /></p>
        </div>
      </section>
      <div className="ol-contact-row"><Contact /></div>
    </article>
  );
}
