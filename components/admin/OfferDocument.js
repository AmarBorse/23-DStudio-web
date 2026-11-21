/* eslint-disable @next/next/no-img-element */
import { COMPANY, OFFER_DEFAULTS, COMPLETION_DEFAULTS, CERTIFICATE_DEFAULTS } from "@/lib/company";
import { letterParagraphs, longDate, firstName, titleName, offerType, fillPlaceholders } from "@/lib/offer";
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
    <div className="ol-signature">
      {o.signature && <img src={o.signature} alt="" />}
      {o.stamp && <img className="ol-stamp" src={o.stamp} alt="" />}
    </div>
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
  if (type === "certificate") return <Certificate o={o} />;
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

// Internship completion certificate: A4 landscape, brand corners, double frame, name in script, seal and signature
function Certificate({ o }) {
  return (
    <article className="oc" aria-label={`Internship completion certificate ${o.number || ""}`} style={style}>
      <svg className="oc-bg" viewBox="0 0 297 210" preserveAspectRatio="none" aria-hidden="true">
        <image href="/images/logo-black.png" x="103.5" y="57" width="90" height="85" opacity="0.035" preserveAspectRatio="xMidYMid meet" />
        <path d="M0 0 H92 L83 9 H0 Z" fill="var(--ol-a)" />
        <path d="M0 11 H50 L46.5 14.5 H0 Z" fill="var(--ol-b)" />
        <path d="M232 0 H297 V6 H226 Z" fill="var(--ol-b)" />
        <path d="M297 210 H205 L214 201 H297 Z" fill="var(--ol-a)" />
        <path d="M297 199 H247 L250.5 195.5 H297 Z" fill="var(--ol-b)" />
        <path d="M0 210 V204 H71 L65 210 Z" fill="var(--ol-b)" />
        <rect x="13" y="17" width="271" height="176" fill="none" stroke="var(--ol-a)" strokeWidth="0.7" />
        <rect x="15.5" y="19.5" width="266" height="171" fill="none" stroke="var(--ol-b)" strokeWidth="0.35" />
      </svg>

      <div className="oc-in">
        <div className="oc-brand">
          <img src="/images/logo-black.png" alt="23D Studio" />
          <span>TWENTY-THREE D<br />STUDIO</span>
        </div>
        <h1 className="oc-title">{CERTIFICATE_DEFAULTS.title}</h1>
        <p className="oc-sub"><span>{CERTIFICATE_DEFAULTS.subtitle}</span></p>
        <p className="oc-presented">{CERTIFICATE_DEFAULTS.presented}</p>
        <p className={`oc-name${nameSize(o.candidate_name)}`}>{titleName(o.candidate_name)}</p>
        <section className="oc-body">
          {letterParagraphs(o).map((parts, i) => <p key={i}><Rich parts={parts} /></p>)}
        </section>

        <footer className="oc-foot">
          <div className="oc-col">
            <div className="oc-signature"><p className="oc-val">{longDate(o.letter_date)}</p></div>
            <p className="oc-label">Date of issue</p>
            {o.number && <p className="oc-no">Certificate No: {o.number}</p>}
          </div>
          {o.stamp ? <img className="oc-stamp" src={o.stamp} alt="" /> : <Seal />}
          <div className="oc-col">
            <div className="oc-signature">{o.signature && <img src={o.signature} alt="" />}</div>
            <p className="oc-label oc-signer">{o.signatory_name}</p>
            {o.signatory_title && <p className="oc-no">{o.signatory_title}</p>}
            <p className="oc-no">{COMPANY.name}</p>
          </div>
        </footer>
      </div>
    </article>
  );
}

// smaller script for long names so they stay on one line
const nameSize = (n) => {
  const len = String(n || "").trim().length;
  return len > 40 ? " xs" : len > 32 ? " s" : len > 26 ? " m" : "";
};

// round studio seal in the brand colours
const Seal = () => (
  <svg className="oc-seal" viewBox="0 0 100 100" aria-hidden="true">
    <defs>
      <path id="oc-ring" d="M50 50 m-35 0 a35 35 0 1 1 70 0 a35 35 0 1 1 -70 0" />
    </defs>
    <circle cx="50" cy="50" r="48" fill="var(--ol-b)" />
    <circle cx="50" cy="50" r="45" fill="var(--ol-a)" />
    <circle cx="50" cy="50" r="27" fill="none" stroke="#fff" strokeWidth="0.8" strokeDasharray="1.6 1.6" />
    <text fontSize="7.2" fontWeight="700" fill="#fff" style={{ fontFamily: "var(--spartan)" }}>
      <textPath href="#oc-ring" startOffset="0" textLength="216" lengthAdjust="spacing">TWENTY-THREE D STUDIO ★ INTERNSHIP ★</textPath>
    </text>
    <image href="/images/logo-white.png" x="33" y="34" width="34" height="32" preserveAspectRatio="xMidYMid meet" />
  </svg>
);
