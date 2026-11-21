import "server-only";
import { offerLetters } from "@/lib/store";
import { OFFER_DEFAULTS, INTERNSHIP_DEFAULTS } from "@/lib/company";
import { nextOfferNumber, offerType } from "@/lib/offer";
import { todayISO, addDays } from "@/lib/quote";

const addMonthsMinusDay = (iso, months) => {
  const d = new Date(`${iso}T00:00:00`);
  d.setMonth(d.getMonth() + months);
  d.setDate(d.getDate() - 1);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

// Starting values for a new offer letter of either type.
// Signatory and signature are taken from the latest letter.
export async function newOfferDefaults(type = "job") {
  let all = [];
  try {
    all = await offerLetters.list();
  } catch {}
  const last = all[0];
  const today = todayISO();
  const intern = type === "internship";
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
    private_notes: "",
    status: "draft",
    // standard texts of both types, so the form can switch between them
    standard: {
      job: { body: OFFER_DEFAULTS.body },
      internship: { body: INTERNSHIP_DEFAULTS.body, responsibilities: INTERNSHIP_DEFAULTS.duties, terms: INTERNSHIP_DEFAULTS.acceptance },
    },
    numbers: { job: nextOfferNumber(all, "job"), internship: nextOfferNumber(all, "internship") },
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
  return { ...shared, ...(intern ? internship : job), presets: { job, internship } };
}

export { offerType };
