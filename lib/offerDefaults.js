import "server-only";
import { offerLetters } from "@/lib/store";
import { OFFER_DEFAULTS, INTERNSHIP_DEFAULTS, COMPLETION_DEFAULTS, CERTIFICATE_DEFAULTS, RECOMMENDATION_DEFAULTS } from "@/lib/company";
import { nextOfferNumber, offerType, isAfterInternship } from "@/lib/offer";
import { todayISO, addDays } from "@/lib/quote";

const addMonthsMinusDay = (iso, months) => {
  const d = new Date(`${iso}T00:00:00`);
  d.setMonth(d.getMonth() + months);
  d.setDate(d.getDate() - 1);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

// Starting values for a new letter of any type (job offer, internship offer, internship completion).
// Signatory and signature are taken from the latest letter.
// fromId: an internship offer to copy the intern's details from (for a completion letter).
export async function newOfferDefaults(type = "job", fromId = "") {
  let all = [];
  try {
    all = await offerLetters.list();
  } catch {}
  const last = all[0];
  const today = todayISO();

  // internships start on the 1st of next month by default
  const n = new Date();
  const firstNext = new Date(n.getFullYear(), n.getMonth() + 1, 1);
  const start = new Date(firstNext.getTime() - firstNext.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  const shared = {
    letter_date: today,
    candidate_name: "",
    candidate_address: "",
    candidate_email: "",
    candidate_phone: "",
    greeting_name: "",
    accept_by: addDays(today, OFFER_DEFAULTS.acceptDays),
    accept_days: OFFER_DEFAULTS.acceptDays,
    closing: OFFER_DEFAULTS.closing,
    signatory_name: last?.signatory_name || OFFER_DEFAULTS.signatoryName,
    signatory_title: OFFER_DEFAULTS.signatoryTitle,
    signature: last?.signature || "",
    stamp: all.find((x) => x.stamp)?.stamp || "", // the studio stamp, remembered from the latest letter that has one
    private_notes: "",
    status: "draft",
    // standard texts of both types, so the form can switch between them
    standard: {
      job: { body: OFFER_DEFAULTS.body },
      internship: { body: INTERNSHIP_DEFAULTS.body, responsibilities: INTERNSHIP_DEFAULTS.duties, terms: INTERNSHIP_DEFAULTS.acceptance },
      completion: { body: COMPLETION_DEFAULTS.body, responsibilities: COMPLETION_DEFAULTS.duties },
      certificate: { body: CERTIFICATE_DEFAULTS.body },
      recommendation: { body: RECOMMENDATION_DEFAULTS.body, responsibilities: RECOMMENDATION_DEFAULTS.duties, about: RECOMMENDATION_DEFAULTS.example },
    },
    numbers: {
      job: nextOfferNumber(all, "job"),
      internship: nextOfferNumber(all, "internship"),
      completion: nextOfferNumber(all, "completion"),
      certificate: nextOfferNumber(all, "certificate"),
      recommendation: nextOfferNumber(all, "recommendation"),
    },
    duration_months: INTERNSHIP_DEFAULTS.durationMonths,
  };
  const job = {
    letter_type: "job",
    number: shared.numbers.job,
    position: "",
    start_date: "",
    reporting_to: "",
    work_location: OFFER_DEFAULTS.workLocation,
    salary: "",
    benefits: OFFER_DEFAULTS.benefits,
    body: OFFER_DEFAULTS.body,
    closing: OFFER_DEFAULTS.closing,
    department: "", end_date: "", duration: "", work_mode: "", working_hours: "", notice: "", about: "", responsibilities: "", terms: "",
  };
  const internship = {
    letter_type: "internship",
    number: shared.numbers.internship,
    position: "",
    start_date: start,
    end_date: addMonthsMinusDay(start, INTERNSHIP_DEFAULTS.durationMonths),
    duration: "",
    reporting_to: "",
    work_location: "",
    work_mode: INTERNSHIP_DEFAULTS.workMode,
    working_hours: INTERNSHIP_DEFAULTS.workingHours,
    department: INTERNSHIP_DEFAULTS.department,
    salary: "",
    benefits: "",
    notice: "",
    body: INTERNSHIP_DEFAULTS.body,
    about: "",
    responsibilities: INTERNSHIP_DEFAULTS.duties, // the tasks sentence
    terms: INTERNSHIP_DEFAULTS.acceptance, // the candidate's acceptance statement
    closing: INTERNSHIP_DEFAULTS.closing,
  };
  // completion: dates of an internship that has just ended (the 6 months up to today)
  const ended = addDays(today, -1);
  const back = new Date(`${today}T00:00:00`);
  back.setMonth(back.getMonth() - INTERNSHIP_DEFAULTS.durationMonths);
  const completion = {
    ...internship,
    letter_type: "completion",
    number: shared.numbers.completion,
    start_date: new Date(back.getTime() - back.getTimezoneOffset() * 60000).toISOString().slice(0, 10),
    end_date: ended,
    salary: "",
    working_hours: "",
    work_mode: "",
    body: COMPLETION_DEFAULTS.body,
    responsibilities: COMPLETION_DEFAULTS.duties, // the work-done sentence
    terms: "",
    closing: COMPLETION_DEFAULTS.closing,
  };
  // certificate: same dates as a completion letter, its own short text
  const certificate = { ...completion, letter_type: "certificate", number: shared.numbers.certificate, body: CERTIFICATE_DEFAULTS.body, closing: "" };
  // recommendation letter (LOR): same dates as a completion letter
  const recommendation = {
    ...completion,
    letter_type: "recommendation",
    number: shared.numbers.recommendation,
    body: RECOMMENDATION_DEFAULTS.body,
    responsibilities: RECOMMENDATION_DEFAULTS.duties,
    about: RECOMMENDATION_DEFAULTS.example, // the specific example (paragraph 3)
    greeting_name: RECOMMENDATION_DEFAULTS.salutation,
    pronoun: "",
    closing: RECOMMENDATION_DEFAULTS.closing,
  };
  const presets = { job, internship, completion, certificate, recommendation };
  let result = { ...shared, ...(presets[type] || job), presets };

  // copy the intern's details from their internship offer (or completion letter)
  if (isAfterInternship(type) && fromId) {
    const src = all.find((x) => x.id === fromId);
    if (src) {
      result = {
        ...result,
        candidate_name: src.candidate_name,
        candidate_address: src.candidate_address,
        candidate_email: src.candidate_email,
        candidate_phone: src.candidate_phone,
        greeting_name: type === "recommendation" ? result.greeting_name : src.greeting_name,
        position: src.position,
        department: src.department,
        start_date: src.start_date || result.start_date,
        end_date: src.end_date || result.end_date,
        duration: src.duration,
        reporting_to: src.reporting_to,
        responsibilities: type !== "certificate" ? src.responsibilities || result.responsibilities : result.responsibilities,
        source_id: src.id,
        source_number: src.number,
        source_kind: { completion: "completion letter", certificate: "certificate", recommendation: "recommendation letter" }[src.letter_type] || "internship offer",
      };
      // the letter is dated on (or after) the last day of the internship
      if (src.end_date && src.end_date > result.letter_date) result.letter_date = src.end_date;
    }
  }
  return result;
}

export { offerType };
