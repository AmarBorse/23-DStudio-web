"use client";

import { useActionState, useRef, useState } from "react";
import Link from "next/link";
import { saveOffer } from "@/app/admin/actions";
import OfferDocument from "@/components/admin/OfferDocument";
import { OFFER_STATUSES, OFFER_TYPES, PLACEHOLDERS, INTERNSHIP_PLACEHOLDERS, COMPLETION_PLACEHOLDERS, CERTIFICATE_PLACEHOLDERS, RECOMMENDATION_PLACEHOLDERS, PRONOUNS, firstName, durationText, offerType } from "@/lib/offer";
import { addDays } from "@/lib/quote";
import { uploadImage } from "@/components/admin/upload";

// last day of an internship that lasts `months` whole months from `startIso`
function endAfterMonths(startIso, months) {
  const d = new Date(`${startIso}T00:00:00`);
  d.setMonth(d.getMonth() + months);
  d.setDate(d.getDate() - 1);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

export default function OfferForm({ offer, defaults }) {
  const [state, action, pending] = useActionState(saveOffer, null);
  const [o, setO] = useState(() => ({ ...defaults, ...offer, letter_type: offerType(offer || defaults) }));
  const intern = o.letter_type === "internship";
  const cert = o.letter_type === "certificate";
  const lor = o.letter_type === "recommendation";
  const done = o.letter_type === "completion" || cert || lor; // issued after the internship
  const std = defaults.standard[o.letter_type];
  const NAMES = { job: "offer letter", internship: "internship offer", completion: "completion letter", certificate: "certificate", recommendation: "recommendation letter" };
  // fields each type shows; the rest are sent as hidden inputs so nothing is lost when saving
  const SHOWN = {
    job: ["position", "start_date", "reporting_to", "work_location", "salary", "accept_by", "benefits", "greeting_name", "candidate_address", "candidate_email", "candidate_phone"],
    internship: ["position", "department", "start_date", "end_date", "duration", "work_mode", "working_hours", "reporting_to", "salary", "accept_by", "responsibilities", "terms", "greeting_name", "candidate_address", "candidate_email", "candidate_phone"],
    completion: ["position", "department", "start_date", "end_date", "duration", "reporting_to", "responsibilities"],
    certificate: ["position", "department", "start_date", "end_date", "duration"],
    recommendation: ["position", "department", "start_date", "end_date", "duration", "responsibilities", "about", "greeting_name"],
  }[o.letter_type];
  const ALL = ["position", "department", "start_date", "end_date", "duration", "work_mode", "working_hours", "work_location", "reporting_to", "salary", "accept_by", "benefits", "responsibilities", "notice", "about", "terms", "greeting_name", "candidate_address", "candidate_email", "candidate_phone"];
  const hidden = ALL.filter((k) => !SHOWN.includes(k));

  // switch between a job offer and an internship offer
  const switchType = (type) => {
    if (type === o.letter_type) return;
    const edited = o.body !== std.body;
    if (edited && !confirm("Switching replaces the letter text with the standard text for this type. Continue?")) return;
    setO((p) => ({
      ...p,
      ...defaults.presets[type],
      // keep what was already typed about the candidate and the role
      candidate_name: p.candidate_name,
      candidate_address: p.candidate_address,
      candidate_email: p.candidate_email,
      candidate_phone: p.candidate_phone,
      greeting_name: p.greeting_name,
      position: p.position,
      reporting_to: p.reporting_to,
      salary: p.salary,
      number: offer && offerType(offer) === type ? offer.number : defaults.numbers[type],
    }));
  };
  const [acceptTouched, setAcceptTouched] = useState(Boolean(offer));
  const [showPreview, setShowPreview] = useState(true);
  const [sigBusy, setSigBusy] = useState(false);
  const [sigErr, setSigErr] = useState("");
  const bodyRef = useRef(null);
  const termsRef = useRef(null);
  const sigInput = useRef(null);
  const stampInput = useRef(null);

  const set = (k) => (e) => {
    const v = e.target.value;
    setO((p) => {
      const next = { ...p, [k]: v };
      if (k === "letter_date" && !acceptTouched && v) next.accept_by = addDays(v, defaults.accept_days);
      // keep the internship length when the start date moves
      if (k === "start_date" && v && p.start_date && p.end_date) {
        const months = durationText(p.start_date, p.end_date).match(/^(\d+) months?$/);
        if (months) next.end_date = endAfterMonths(v, Number(months[1])); // e.g. 1 Nov → 30 Apr for 6 months
        else next.end_date = addDays(v, Math.round((new Date(p.end_date) - new Date(p.start_date)) / 864e5));
      }
      return next;
    });
  };

  // click a {placeholder} to put it where the cursor is in the letter text
  const insert = (key, field = "body") => {
    const el = (field === "terms" ? termsRef : bodyRef).current;
    const tag = `{${key}}`;
    if (!el) return;
    const text = o[field] || "";
    const start = el.selectionStart ?? text.length;
    const end = el.selectionEnd ?? start;
    const value = text.slice(0, start) + tag + text.slice(end);
    setO((p) => ({ ...p, [field]: value }));
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(start + tag.length, start + tag.length); });
  };

  const pickImage = async (f, field = "signature") => {
    if (!f) return;
    setSigErr("");
    setSigBusy(true);
    try {
      const img = await uploadImage(f);
      setO((p) => ({ ...p, [field]: img.src }));
    } catch (e) {
      setSigErr(e.message);
    } finally {
      setSigBusy(false);
    }
  };

  return (
    <div className={`qf-wrap${showPreview ? " with-preview" : ""}`}>
      <form action={action} className="pf qf">
        <div className="pf-top">
          <Link href="/admin/offers" className="pf-back">← All offer letters</Link>
          <h1 className="pf-title">{offer ? `Edit ${NAMES[o.letter_type]} ${offer.number}` : `New ${NAMES[o.letter_type]}`}</h1>
        </div>
        {offer && <input type="hidden" name="id" value={offer.id} />}
        <input type="hidden" name="signature" value={o.signature || ""} />
        <input type="hidden" name="stamp" value={o.stamp || ""} />
        {!lor && <input type="hidden" name="pronoun" value={o.pronoun || ""} />}
        <input type="hidden" name="letter_type" value={o.letter_type} />

        <section className="adm-card pf-card">
          <h2 className="pf-card-title">Type of letter</h2>
          <div className="ol-switch" role="group" aria-label="Type of letter">
            {OFFER_TYPES.map((t) => (
              <button key={t.id} type="button" className={o.letter_type === t.id ? "on" : undefined} aria-pressed={o.letter_type === t.id} onClick={() => switchType(t.id)}>
                {t.label}
              </button>
            ))}
          </div>
          <p className="pf-hint">
            {lor
              ? "One page letter of recommendation (LOR), written by the signatory: “To whom it may concern”, the recommendation and contact details for verification."
              : cert
              ? "A4 landscape certificate: the intern’s name in large script, the internship details, date of issue, certificate number and your signature."
              : done
              ? "One page, issued after the internship: “To whom it may concern”, the certificate text and your signature."
              : intern
                ? "One page: date, candidate, offer letter, your signature, and an acceptance box for the candidate to sign."
                : "One page, like the Canva Job Offer Letter template."}
          </p>
          {o.source_number && <p className="adm-ok">Details copied from {o.source_kind || "internship offer"} {o.source_number}. Check the dates before saving.</p>}
          <input type="hidden" name="source_number" value={o.source_number || ""} />
          <input type="hidden" name="source_kind" value={o.source_kind || ""} />
        </section>

        <section className="adm-card pf-card">
          <h2 className="pf-card-title">Letter details</h2>
          <div className="pf-two">
            <F label={cert ? "Certificate No *" : "Reference No *"}><input name="number" value={o.number} onChange={set("number")} required /></F>
            <F label={cert ? "Date of issue *" : "Date *"}><input type="date" name="letter_date" value={o.letter_date || ""} onChange={set("letter_date")} required /></F>
            <F label="Status">
              <select name="status" value={o.status} onChange={set("status")}>
                {OFFER_STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </F>
          </div>
        </section>

        <section className="adm-card pf-card">
          <h2 className="pf-card-title">{done ? "Intern" : "Candidate (To)"}</h2>
          {lor ? (
            <div className="pf-two">
              <F label="Full name *"><input name="candidate_name" value={o.candidate_name} onChange={set("candidate_name")} required /></F>
              <F label="Salutation" hint="e.g. “To Whom It May Concern,” or “Dear Hiring Manager,”.">
                <input name="greeting_name" value={o.greeting_name} onChange={set("greeting_name")} placeholder="To Whom It May Concern," />
              </F>
              <F label="Refer to the intern as" hint="Used for she / he, her / his in the letter.">
                <select name="pronoun" value={o.pronoun || ""} onChange={set("pronoun")}>
                  {PRONOUNS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
                </select>
              </F>
            </div>
          ) : done ? (
            <F label="Full name *"><input name="candidate_name" value={o.candidate_name} onChange={set("candidate_name")} required /></F>
          ) : (
            <div className="pf-two">
              <F label="Full name *"><input name="candidate_name" value={o.candidate_name} onChange={set("candidate_name")} required /></F>
              <F label="“Dear …” name" hint="Leave empty to use the first name.">
                <input name="greeting_name" value={o.greeting_name} onChange={set("greeting_name")} placeholder={firstName(o.candidate_name)} />
              </F>
              <F label="Address" hint="One line per row."><textarea name="candidate_address" rows={2} value={o.candidate_address} onChange={set("candidate_address")} /></F>
              <div className="pf-field">
                <F label="Email"><input type="email" name="candidate_email" value={o.candidate_email} onChange={set("candidate_email")} /></F>
                <F label="Phone"><input name="candidate_phone" value={o.candidate_phone} onChange={set("candidate_phone")} /></F>
              </div>
            </div>
          )}
        </section>

        {done ? (
          <section className="adm-card pf-card">
            <h2 className="pf-card-title">Internship completed</h2>
            <div className="pf-two">
              <F label="Position *"><input name="position" value={o.position} onChange={set("position")} placeholder="e.g. HR Executive Intern" required /></F>
              <F label="Department"><input name="department" value={o.department} onChange={set("department")} /></F>
              <F label="Start date *"><input type="date" name="start_date" value={o.start_date || ""} onChange={set("start_date")} required /></F>
              <F label="End date *"><input type="date" name="end_date" value={o.end_date || ""} onChange={set("end_date")} required /></F>
              <F label="Duration" hint="Leave empty to work it out from the dates.">
                <input name="duration" value={o.duration} onChange={set("duration")} placeholder={durationText(o.start_date, o.end_date) || "e.g. 6 months"} />
              </F>
              {!cert && !lor && <F label="Supervisor"><input name="reporting_to" value={o.reporting_to} onChange={set("reporting_to")} placeholder="e.g. Gaurav Duse" /></F>}
            </div>
            {!cert && (
              <F label="Work done (used in the letter)" hint={lor ? "Completes the sentence “She / He assisted our team with …”." : "Completes the sentence “During the internship, {first_name} assisted the team with …”."}>
                <textarea name="responsibilities" rows={3} value={o.responsibilities} onChange={set("responsibilities")} />
              </F>
            )}
            {lor && (
              <F label="Specific example" hint="One or two real examples of the intern’s work or achievements, printed at the end of paragraph 2. Edit this for every intern.">
                <textarea name="about" rows={3} value={o.about} onChange={set("about")} />
              </F>
            )}
          </section>
        ) : !intern ? (
          <section className="adm-card pf-card">
            <h2 className="pf-card-title">Job details</h2>
            <div className="pf-two">
              <F label="Position *"><input name="position" value={o.position} onChange={set("position")} placeholder="e.g. 3D Visualiser" required /></F>
              <F label="Joining date"><input type="date" name="start_date" value={o.start_date || ""} onChange={set("start_date")} /></F>
              <F label="Reports to"><input name="reporting_to" value={o.reporting_to} onChange={set("reporting_to")} placeholder="e.g. Gaurav Duse" /></F>
              <F label="Work location"><input name="work_location" value={o.work_location} onChange={set("work_location")} /></F>
              <F label="Monthly salary"><input name="salary" value={o.salary} onChange={set("salary")} placeholder="e.g. ₹25,000" /></F>
              <F label="Accept by"><input type="date" name="accept_by" value={o.accept_by || ""} onChange={(e) => { setAcceptTouched(true); set("accept_by")(e); }} /></F>
            </div>
            <F label="Benefits"><input name="benefits" value={o.benefits} onChange={set("benefits")} /></F>
          </section>
        ) : (
          <section className="adm-card pf-card">
            <h2 className="pf-card-title">Internship details</h2>
            <div className="pf-two">
              <F label="Position *"><input name="position" value={o.position} onChange={set("position")} placeholder="e.g. HR Executive Intern" required /></F>
              <F label="Department"><input name="department" value={o.department} onChange={set("department")} /></F>
              <F label="Start date"><input type="date" name="start_date" value={o.start_date || ""} onChange={set("start_date")} /></F>
              <F label="End date"><input type="date" name="end_date" value={o.end_date || ""} onChange={set("end_date")} /></F>
              <F label="Duration" hint="Leave empty to work it out from the dates.">
                <input name="duration" value={o.duration} onChange={set("duration")} placeholder={durationText(o.start_date, o.end_date) || "e.g. 3 months"} />
              </F>
              <F label="Work mode / location"><input name="work_mode" value={o.work_mode} onChange={set("work_mode")} /></F>
              <F label="Working hours"><input name="working_hours" value={o.working_hours} onChange={set("working_hours")} /></F>
              <F label="Reports to"><input name="reporting_to" value={o.reporting_to} onChange={set("reporting_to")} placeholder="e.g. Gaurav Duse" /></F>
              <F label="Monthly stipend"><input name="salary" value={o.salary} onChange={set("salary")} placeholder="e.g. ₹15,000" /></F>
              <F label="Accept by"><input type="date" name="accept_by" value={o.accept_by || ""} onChange={(e) => { setAcceptTouched(true); set("accept_by")(e); }} /></F>
            </div>
            <F label="Tasks (used in the letter)" hint="Completes the sentence “…you will support our {department} team with tasks such as …”.">
              <textarea name="responsibilities" rows={3} value={o.responsibilities} onChange={set("responsibilities")} />
            </F>
          </section>
        )}
        {/* keep the other types' fields when saving */}
        {hidden.map((k) => <input key={k} type="hidden" name={k} value={o[k] || ""} />)}

        <section className="adm-card pf-card">
          <F label={cert ? "Certificate text" : "Letter text"} hint={`${cert ? "Printed under the name. " : ""}Leave an empty line between paragraphs. **two stars** make words bold. Click a field to insert it where the cursor is:`}>
            <span className="ol-help">
              {Object.entries(lor ? RECOMMENDATION_PLACEHOLDERS : cert ? CERTIFICATE_PLACEHOLDERS : done ? COMPLETION_PLACEHOLDERS : intern ? INTERNSHIP_PLACEHOLDERS : PLACEHOLDERS).map(([k, label]) => (
                <code key={k} role="button" tabIndex={0} title={label} onClick={() => insert(k, "body")} onKeyDown={(e) => e.key === "Enter" && insert(k, "body")}>{`{${k}}`}</code>
              ))}
            </span>
            <textarea ref={bodyRef} name="body" rows={intern || lor ? 14 : cert ? 6 : done ? 10 : 11} value={o.body} onChange={set("body")} />
          </F>
          <button type="button" className="adm-btn ghost" onClick={() => confirm("Replace this text with the standard text?") && setO((p) => ({ ...p, body: std.body }))}>Reset to standard text</button>
        </section>

        {intern && (
          <section className="adm-card pf-card">
            <F label="Acceptance statement" hint="Printed in the acceptance box at the bottom, above the candidate’s signature and date.">
              <textarea ref={termsRef} name="terms" rows={3} value={o.terms} onChange={set("terms")} />
            </F>
            <button type="button" className="adm-btn ghost" onClick={() => confirm("Replace the acceptance statement with the standard one?") && setO((p) => ({ ...p, terms: std.terms }))}>Reset to standard statement</button>
          </section>
        )}

        <section className="adm-card pf-card">
          <h2 className="pf-card-title">Signed by</h2>
          <div className="pf-two">
            {cert ? <input type="hidden" name="closing" value={o.closing || ""} /> : <F label="Closing"><input name="closing" value={o.closing} onChange={set("closing")} /></F>}
            <F label="Name"><input name="signatory_name" value={o.signatory_name} onChange={set("signatory_name")} /></F>
            <F label={lor ? "Designation (optional)" : "Title (optional)"} hint={lor ? "Printed under your name, as in the usual LOR format. Leave empty to print only the name." : "Leave empty to print only the name."}><input name="signatory_title" value={o.signatory_title} onChange={set("signatory_title")} /></F>
          </div>
          <F label="Signature (optional)" hint="Photo or scan of the signature on white paper. It is remembered for the next letter.">
            <div className="ol-sig-box">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {o.signature && <img src={o.signature} alt="Signature" />}
              <button type="button" className={`adm-btn ghost${sigBusy ? " is-busy" : ""}`} onClick={() => sigInput.current?.click()} disabled={sigBusy}>{o.signature ? "Replace" : "Upload signature"}</button>
              {o.signature && <button type="button" className="adm-btn ghost" onClick={() => setO((p) => ({ ...p, signature: "" }))}>Remove</button>}
              <input ref={sigInput} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => { pickImage(e.target.files[0], "signature"); e.target.value = ""; }} />
            </div>
          </F>
          <F label="Studio stamp (optional)" hint={cert ? "Photo or scan of the rubber stamp on white paper (PNG with a clear background looks best). Printed in the middle instead of the round 23D seal. Remembered for the next letter." : "Photo or scan of the rubber stamp on white paper (PNG with a clear background looks best). Printed next to the signature. Remembered for the next letter."}>
            <div className="ol-sig-box">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {o.stamp && <img src={o.stamp} alt="Stamp" />}
              <button type="button" className={`adm-btn ghost${sigBusy ? " is-busy" : ""}`} onClick={() => stampInput.current?.click()} disabled={sigBusy}>{o.stamp ? "Replace" : "Upload stamp"}</button>
              {o.stamp && <button type="button" className="adm-btn ghost" onClick={() => setO((p) => ({ ...p, stamp: "" }))}>Remove</button>}
              <input ref={stampInput} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => { pickImage(e.target.files[0], "stamp"); e.target.value = ""; }} />
            </div>
          </F>
          {sigErr && <p className="adm-error" role="alert">{sigErr}</p>}
          <F label="Private notes" hint="Only for you, not printed.">
            <textarea name="private_notes" rows={2} value={o.private_notes} onChange={set("private_notes")} />
          </F>
        </section>

        {state?.error && <p className="adm-error" role="alert">{state.error}</p>}
        <div className="pf-actions">
          <button type="button" className="adm-btn ghost qf-preview-toggle" onClick={() => setShowPreview((x) => !x)}>{showPreview ? "Hide preview" : "Show preview"}</button>
          <Link className="adm-btn ghost" href="/admin/offers">Cancel</Link>
          <button className={`adm-btn ghost${pending ? " is-busy" : ""}`} type="submit" name="then" value="print" disabled={pending || sigBusy}>Save &amp; print / PDF</button>
          <button className={`adm-btn pf-save${pending ? " is-busy" : ""}`} type="submit" disabled={pending || sigBusy}>Save {NAMES[o.letter_type]}</button>
        </div>
      </form>

      {showPreview && (
        <aside className="qf-preview" aria-label="Live preview">
          <p className="adm-muted">Live preview</p>
          <div className="qf-preview-paper"><OfferDocument o={o} /></div>
        </aside>
      )}
    </div>
  );
}

function F({ label, hint, children }) {
  return (
    <div className="pf-field">
      <span className="pf-label">{label}</span>
      {hint && <span className="pf-hint">{hint}</span>}
      {children}
    </div>
  );
}
