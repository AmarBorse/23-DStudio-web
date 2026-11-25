/* eslint-disable @next/next/no-img-element */
import { COMPANY, LETTERHEAD, OFFER_DEFAULTS, COMPLETION_DEFAULTS, CERTIFICATE_DEFAULTS } from "@/lib/company";
import { letterParagraphs, longDate, firstName, titleName, offerType, fillPlaceholders } from "@/lib/offer";
import { boldParts } from "@/lib/invoice";

const lines = (t) => String(t || "").split("\n").map((s) => s.trim()).filter(Boolean);
// Office address split over two lines like the template
const addressLines = (() => {
  const parts = COMPANY.address.split(",").map((s) => s.trim());
  const half = Math.ceil(parts.length / 2);
  return [parts.slice(0, half).join(", "), parts.slice(half).join(", ")];
})();

const Rich = ({ parts }) => parts.map((p, j) => (p.bold ? <strong key={j}>{p.text}</strong> : <span key={j}>{p.text}</span>));

// Letterhead (Canva "Minimalist Business Letterhead", 794 × 1123 px = A4): grey angled bands top and bottom,
// a faint "STUDIO" watermark along the bottom, the logo on the left and the studio's details on the right.
const LH_ICONS = {
  pin: <path d="M12 21s-6.5-6.2-6.5-11.2a6.5 6.5 0 0 1 13 0C18.5 14.8 12 21 12 21zm0-8.6a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2z" />,
  phone: <path d="M6.6 3.5 9.4 7l-1.7 2.3a12.4 12.4 0 0 0 7 7L17 14.6l3.5 2.8-1.4 3c-.3.6-1 .9-1.6.8C10.7 20.1 3.9 13.3 2.8 6.5c-.1-.6.2-1.3.8-1.6z" />,
  mail: <path d="M3 5.5h18v13H3zm1.5 1.5L12 12.6 19.5 7" />,
  insta: <path d="M7.5 3h9A4.5 4.5 0 0 1 21 7.5v9a4.5 4.5 0 0 1-4.5 4.5h-9A4.5 4.5 0 0 1 3 16.5v-9A4.5 4.5 0 0 1 7.5 3zM12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6zM17.3 6.4v.2" />,
  web: <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 2.4 3.6 5.4 3.6 9s-1.1 6.6-3.6 9c-2.5-2.4-3.6-5.4-3.6-9S9.5 5.4 12 3z" />,
};
const LhIcon = ({ name }) => (
  <svg className="lh-ico" viewBox="0 0 24 24" aria-hidden="true">{LH_ICONS[name]}</svg>
);

const Letterhead = () => (
  <div className="ol-bg lh" aria-hidden="true">
    <svg viewBox="0 0 794 1123" preserveAspectRatio="none">
      <defs>
        <clipPath id="lh-wm"><rect x="-190.06" y="1004.8" width="1079.93" height="352.89" /></clipPath>
      </defs>
      {/* big logo cropped to its "STUDIO" line, very faint, along the bottom */}
      <image href="/images/logo-black.png" x="-353.13" y="253.69" width="1257.59" height="1176.79" opacity="0.05" preserveAspectRatio="none" clipPath="url(#lh-wm)" />
      <g opacity="0.7">
        <path d="M-165.89 1154.4H665.6L623.66 1081.01H-123.95Z" fill="#cccccc" />
        <path d="M-302.09 1154.4H529.39L487.45 1081.01H-260.15Z" fill="#666666" />
        <path d="M-231.23 1143.2H231.24L189.3 1069.81H-189.29Z" fill="#0b0b0b" />
      </g>
      <path d="M126.94 -27.3H958.43L916.49 46.08H168.88Z" fill="#cccccc" />
      <path d="M311.87 -27.3H1143.36L1101.42 46.08H353.81Z" fill="#666666" />
      <path d="M568.85 -27.3H1031.32L989.38 46.08H610.79Z" fill="#0b0b0b" opacity="0.28" />
      <image href="/images/logo-black.png" x="79.37" y="111.72" width="95.12" height="89" preserveAspectRatio="none" />
      <path d="M489.9 141.8H714.33M222.42 183.9H714.33M412.33 237.16H714.33" stroke="#000" strokeWidth="1" fill="none" />
    </svg>
    <div className="lh-name">
      <p className="lh-strong">{LETTERHEAD.name}</p>
      <p className="lh-tag">{LETTERHEAD.tagline}</p>
    </div>
    <div className="lh-row lh-address">
      <LhIcon name="pin" />
      <p>{LETTERHEAD.address.map((l, i) => <span key={i}>{l}</span>)}</p>
    </div>
    <div className="lh-row lh-contacts">
      <span><LhIcon name="phone" />{LETTERHEAD.phone}</span>
      <span><LhIcon name="mail" />{LETTERHEAD.email}</span>
      <span><LhIcon name="insta" />{LETTERHEAD.instagram}</span>
    </div>
    <div className="lh-row lh-web">
      <span><LhIcon name="web" />{LETTERHEAD.website}</span>
    </div>
  </div>
);

// document title, under the letterhead
const Head = ({ title }) => <h1 className="ol-title lh-title">{title}</h1>;

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
  if (type === "recommendation") return <RecommendationLetter o={o} />;
  return <JobLetter o={o} />;
}

// Internship completion: one page — studio and date, "To whom it may concern", certificate text, signature
// (also used for letters of recommendation, with their own title)
function CompletionLetter({ o, title = "INTERNSHIP COMPLETION LETTER", extra = "" }) {
  return (
    <article className={`ol ol-intern ol-done ${extra}`} aria-label={`${title.toLowerCase()} ${o.number || ""}`} style={style}>
      <Letterhead />
      <Head title={title} />
      <StudioAndDate o={o} />
      <p className="ol-concern">{COMPLETION_DEFAULTS.heading}</p>
      <section className="ol-body">
        {letterParagraphs(o).map((parts, i) => <p key={i}><Rich parts={parts} /></p>)}
      </section>
      <Signature o={o} />
    </article>
  );
}

// Letter of recommendation: date, salutation, four paragraphs, then the recommender's name, designation, organisation and contact
function RecommendationLetter({ o }) {
  return (
    <article className="ol ol-intern ol-done ol-lor" aria-label={`Letter of recommendation ${o.number || ""}`} style={style}>
      <Letterhead />
      <Head title="LETTER OF RECOMMENDATION" />
      <StudioAndDate o={o} />
      <section className="ol-body">
        <p className="ol-salute">{o.greeting_name || "To Whom It May Concern,"}</p>
        {letterParagraphs(o).map((parts, i) => <p key={i}><Rich parts={parts} /></p>)}
      </section>
      <div className="ol-sign">
        <p>{o.closing}</p>
        <div className="ol-signature">
          {o.signature && <img src={o.signature} alt="" />}
          {o.stamp && <img className="ol-stamp" src={o.stamp} alt="" />}
        </div>
        <p className="ol-strong">{o.signatory_name}</p>
        {o.signatory_title && <p>{o.signatory_title}</p>}
        <p>{COMPANY.name}</p>
        <p>Email: {COMPANY.email}</p>
        <p>Contact: {COMPANY.phone}</p>
      </div>
    </article>
  );
}

// Job offer: one page, laid out like the Canva "Job Offer Letter" template
function JobLetter({ o }) {
  const greeting = o.greeting_name || firstName(o.candidate_name);
  return (
    <article className="ol" aria-label={`Offer letter ${o.number || ""}`} style={style}>
      <Letterhead />
      <Head title="JOB OFFER LETTER" />
      <StudioAndDate o={o} />
      <To o={o} />
      <section className="ol-body">
        <p>Dear {greeting},</p>
        {letterParagraphs(o).map((parts, i) => <p key={i}><Rich parts={parts} /></p>)}
      </section>
      <footer className="ol-foot">
        <Signature o={o} />
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
      <Letterhead />
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
