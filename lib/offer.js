// Offer letters: statuses, numbering, dates and the letter text.
import { COMPANY } from "@/lib/company";
import { boldParts } from "@/lib/invoice";

export const OFFER_STATUSES = [
  { id: "draft", label: "Draft" },
  { id: "sent", label: "Sent" },
  { id: "accepted", label: "Accepted" },
  { id: "declined", label: "Declined" },
  { id: "withdrawn", label: "Withdrawn" },
];
export const offerStatusLabel = (id) => OFFER_STATUSES.find((s) => s.id === id)?.label || id;

// 24 August 2026
export const longDate = (iso) => {
  if (!iso) return "";
  const d = new Date(`${String(iso).slice(0, 10)}T00:00:00`);
  return `${d.getDate()} ${d.toLocaleString("en-GB", { month: "long" })} ${d.getFullYear()}`;
};

export const OFFER_TYPES = [
  { id: "job", label: "Job offer", prefix: "OL" },
  { id: "internship", label: "Internship offer", prefix: "IN" },
  { id: "completion", label: "Internship completion", prefix: "IC" },
  { id: "certificate", label: "Completion certificate", prefix: "CC" },
  { id: "recommendation", label: "Recommendation (LOR)", prefix: "LR" },
];
export const OFFER_TYPE_IDS = OFFER_TYPES.map((t) => t.id);
export const offerType = (o) => (OFFER_TYPE_IDS.includes(o?.letter_type) ? o.letter_type : "job");
// completion letters and certificates are issued after the internship
export const isAfterInternship = (type) => type === "completion" || type === "certificate" || type === "recommendation";
export const offerTypeLabel = (o) => OFFER_TYPES.find((t) => t.id === offerType(o)).label;

// OL/001/2026 (job) or IN/001/2026 (internship) — each starts again from 1 every year
export function nextOfferNumber(existing, type = "job", year = new Date().getFullYear()) {
  const prefix = OFFER_TYPES.find((t) => t.id === type)?.prefix || "OL";
  const re = new RegExp(`^${prefix}\\/(\\d+)\\/(\\d{4})$`);
  const max = existing
    .map((x) => String(x.number || "").match(re))
    .filter((m) => m && Number(m[2]) === year)
    .reduce((mx, m) => Math.max(mx, Number(m[1])), 0);
  return `${prefix}/${String(max + 1).padStart(3, "0")}/${year}`;
}

// 01 Dec 2026
export const shortDate = (iso) => {
  if (!iso) return "";
  const d = new Date(`${String(iso).slice(0, 10)}T00:00:00`);
  return `${String(d.getDate()).padStart(2, "0")} ${d.toLocaleString("en-GB", { month: "short" })} ${d.getFullYear()}`;
};

// "3 months" for 1 Dec 2026 → 28 Feb 2027 (end date counted as a working day)
export function durationText(startIso, endIso) {
  if (!startIso || !endIso) return "";
  const a = new Date(`${startIso}T00:00:00`);
  const b = new Date(`${endIso}T00:00:00`);
  if (b < a) return "";
  b.setDate(b.getDate() + 1);
  let months = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
  const anchor = new Date(a);
  anchor.setMonth(a.getMonth() + months);
  if (anchor > b) {
    months -= 1;
    anchor.setMonth(a.getMonth() + months);
  }
  const days = Math.round((b - anchor) / 864e5);
  const part = (n, w) => (n ? `${n} ${w}${n === 1 ? "" : "s"}` : "");
  if (!months) return part(Math.round(days / 7) || 1, "week");
  return [part(months, "month"), part(days, "day")].filter(Boolean).join(" and ");
}

// "AMAR SANJEEV BORSE" -> "Amar" (all-caps names read badly mid-sentence)
// "AMAR SANJEEV BORSE" -> "Amar Sanjeev Borse" (for the name on the certificate)
export const titleName = (name) => {
  const s = String(name || "").trim().replace(/\s+/g, " ");
  return s === s.toUpperCase() ? s.toLowerCase().replace(/(^|[\s.'-])(\p{L})/gu, (m, a, b) => a + b.toUpperCase()) : s;
};

export const firstName = (name) => {
  const w = String(name || "").trim().split(/\s+/)[0] || "";
  return w === w.toUpperCase() && w.length > 1 ? w[0] + w.slice(1).toLowerCase() : w;
};

// Placeholders that can be used in the letter text
export const PLACEHOLDERS = {
  name: "candidate’s full name",
  first_name: "candidate’s first name",
  position: "position",
  company: "studio name",
  start_date: "joining date",
  reporting_to: "reports to",
  location: "work location",
  salary: "monthly salary",
  benefits: "benefits",
  accept_by: "accept-by date",
};

// Placeholders for completion letters
export const COMPLETION_PLACEHOLDERS = {
  name: "intern’s full name",
  first_name: "intern’s first name",
  a: "a / an (before the position)",
  position: "position",
  company: "studio name",
  department: "department",
  start_date: "start date",
  end_date: "end date",
  duration: "duration",
  duties: "work done",
  reporting_to: "supervisor",
};

// Placeholders for recommendation letters (LOR)
export const RECOMMENDATION_PLACEHOLDERS = {
  name: "intern’s full name",
  first_name: "intern’s first name",
  a: "a / an (before the position)",
  position: "position",
  company: "studio name",
  department: "department",
  start_date: "start date",
  end_date: "end date",
  duration: "duration",
  duties: "work done",
  example: "specific example",
  he_she: "she / he",
  He_She: "She / He",
  his_her: "her / his",
  His_Her: "Her / His",
  him_her: "her / him",
  signatory: "your name",
};

// How the intern is referred to in a letter of recommendation
export const PRONOUNS = [
  { id: "she", label: "She / her" },
  { id: "he", label: "He / him" },
  { id: "", label: "First name only (no he / she)" },
];
function pronounValues(o) {
  const n = firstName(o.candidate_name) || "the intern";
  const p = o.pronoun === "she" ? ["she", "her", "her"] : o.pronoun === "he" ? ["he", "his", "him"] : [n, `${n}’s`, n];
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  return { he_she: p[0], He_She: cap(p[0]), his_her: p[1], His_Her: cap(p[1]), him_her: p[2] };
}

// Placeholders for completion certificates
export const CERTIFICATE_PLACEHOLDERS = {
  first_name: "intern’s first name",
  a: "a / an (before the position)",
  position: "position",
  company: "studio name",
  department: "department",
  start_date: "start date",
  end_date: "end date",
  duration: "duration",
};

// Placeholders for internship letters
export const INTERNSHIP_PLACEHOLDERS = {
  name: "candidate’s full name",
  first_name: "candidate’s first name",
  position: "position",
  company: "studio name",
  department: "department",
  start_date: "start date",
  end_date: "end date",
  duration: "duration",
  stipend: "stipend",
  working_hours: "working hours",
  location: "work mode",
  duties: "tasks sentence",
  reporting_to: "supervisor",
  email: "studio email",
  accept_by: "accept-by date",
};

// "a" or "an" before the position: an HR Executive Intern, an Interior Design Intern, a 3D Visualiser Intern
export function article(position) {
  const w = String(position || "").trim().split(/\s+/)[0] || "";
  if (!w) return "a";
  // abbreviations are read letter by letter: an HR…, an MBA…, a UX…
  if (w.length > 1 && w === w.toUpperCase() && /^[A-Z]/.test(w)) return /^[AEFHILMNORSX]/.test(w) ? "an" : "a";
  if (/^(uni|use|usu|uti|eu|one|once)/i.test(w)) return "a";
  if (/^(hour|honest|honou?r|heir)/i.test(w)) return "an";
  if (/^8|^11|^18/.test(w)) return "an";
  return /^[aeiou]/i.test(w) ? "an" : "a";
}

// dates and phone numbers never break over two lines
const keep = (s) => String(s || "").replace(/ /g, "\u00a0");

export function fillPlaceholders(text, o) {
  const values = {
    name: o.candidate_name,
    first_name: firstName(o.candidate_name),
    position: o.position,
    a: article(o.position),
    company: COMPANY.name,
    start_date: keep(longDate(o.start_date)),
    reporting_to: o.reporting_to,
    location: o.work_location,
    salary: o.salary,
    benefits: o.benefits,
    accept_by: keep(longDate(o.accept_by)),
    department: o.department,
    end_date: keep(longDate(o.end_date)),
    duration: o.duration || durationText(o.start_date, o.end_date),
    stipend: o.salary,
    notice: o.notice,
    working_hours: o.working_hours,
    duties: o.responsibilities,
    email: COMPANY.email,
    phone: keep(COMPANY.phone),
    signatory: o.signatory_name,
    ...pronounValues(o),
  };
  // the LOR's specific example can use placeholders too
  values.example = String(o.about || "").replace(/\{(\w+)\}/g, (m, k) => (k in values ? values[k] || m : m));
  if (offerType(o) !== "job") values.location = o.work_mode;
  let t = String(text || "");
  // no department entered: drop "in the {department} department" instead of printing the placeholder
  if (!o.department) t = t.replace(/\s+in (the|our) \{department\} department/g, "");
  return t.replace(/\{(\w+)\}/g, (m, k) => (k in values ? values[k] || `{${k}}` : m));
}

// letter text → paragraphs of {text, bold} pieces
export const letterParagraphs = (o) =>
  fillPlaceholders(o.body, o)
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean)
    .map(boldParts);

// Terms text → [{type:"h"|"li"|"p", parts}] (internship letters)
export const termBlocks = (o) =>
  fillPlaceholders(o.terms, o)
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) =>
      l.startsWith("## ") ? { type: "h", parts: boldParts(l.slice(3)) } : l.startsWith("- ") ? { type: "li", parts: boldParts(l.slice(2)) } : { type: "p", parts: boldParts(l) }
    );
