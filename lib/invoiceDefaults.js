import "server-only";
import { invoices, quotations } from "@/lib/store";
import { INVOICE_DEFAULTS } from "@/lib/company";
import { nextInvoiceNumber } from "@/lib/invoice";
import { todayISO } from "@/lib/quote";

// Starting values for a new invoice — optionally copied from a quotation
export async function newInvoiceDefaults(fromQuoteId) {
  let all = [];
  try {
    all = await invoices.list();
  } catch {}
  const base = {
    number: nextInvoiceNumber(all),
    invoice_date: todayISO(),
    due_date: "",
    quote_id: "",
    quote_number: "",
    customer_id: "",
    client_name: "",
    client_address: "",
    client_phone: "",
    client_email: "",
    heading: "",
    items: [],
    discount: 0,
    gst_enabled: false,
    gst_percent: INVOICE_DEFAULTS.gstPercent,
    notes: INVOICE_DEFAULTS.notes.join("\n"),
    bank: INVOICE_DEFAULTS.bank.join("\n"),
    closing: INVOICE_DEFAULTS.closing,
    private_notes: "",
    status: "unpaid",
    amount_paid: 0,
    paid_on: "",
  };
  if (!fromQuoteId) return base;
  const q = await quotations.get("id", fromQuoteId).catch(() => null);
  if (!q) return base;
  return {
    ...base,
    quote_id: q.id,
    quote_number: q.number,
    customer_id: q.customer_id || "",
    client_name: q.client_name || "",
    client_address: q.client_address || "",
    client_phone: q.client_phone || "",
    client_email: q.client_email || "",
    heading: String(q.project_overview || "").split("\n")[0].trim(),
    items: (q.items || []).map((it) => ({ description: it.description, qty: it.qty, rate: it.rate, amount: "", included: false })),
    discount: q.discount || 0,
    gst_enabled: Boolean(q.gst_enabled),
    gst_percent: q.gst_percent ?? INVOICE_DEFAULTS.gstPercent,
  };
}
