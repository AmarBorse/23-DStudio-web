import "server-only";
import { quotations } from "@/lib/store";
import { QUOTE_DEFAULTS } from "@/lib/company";
import { nextQuoteNumber, nextCustomerId, todayISO, addDays } from "@/lib/quote";

// Starting values for a new quotation
export async function newQuoteDefaults() {
  let all = [];
  try {
    all = await quotations.list();
  } catch {}
  const today = todayISO();
  return {
    number: nextQuoteNumber(all),
    customer_id: nextCustomerId(all),
    quote_date: today,
    valid_till: addDays(today, QUOTE_DEFAULTS.validDays),
    valid_days: QUOTE_DEFAULTS.validDays,
    client_name: "",
    client_address: "",
    client_phone: "",
    client_email: "",
    prepared_by_name: QUOTE_DEFAULTS.preparedByName,
    prepared_by_phone: QUOTE_DEFAULTS.preparedByPhone,
    project_overview: "",
    gst_enabled: false,
    gst_percent: QUOTE_DEFAULTS.gstPercent,
    discount: 0,
    terms: QUOTE_DEFAULTS.terms.join("\n"),
    closing: QUOTE_DEFAULTS.closing,
    notes: "",
    status: "draft",
  };
}
