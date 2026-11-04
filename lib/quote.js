// Quotation maths and formatting (used by the admin form, the list and the printable quote).

export const QUOTE_STATUSES = [
  { id: "draft", label: "Draft" },
  { id: "sent", label: "Sent" },
  { id: "accepted", label: "Accepted" },
  { id: "rejected", label: "Rejected" },
];

const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
export const lineAmount = (it) => num(it.qty) * num(it.rate);

export function quoteTotals(q) {
  const subtotal = (q.items || []).reduce((s, it) => s + lineAmount(it), 0);
  const gst = q.gst_enabled ? Math.round(subtotal * num(q.gst_percent) / 100 * 100) / 100 : 0;
  const discount = num(q.discount);
  return { subtotal, gst, discount, total: Math.max(0, subtotal + gst - discount) };
}

// ₹7,000 / ₹8,000.50 (Indian digit grouping)
export const inr = (n) =>
  "₹" + Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: Number.isInteger(Number(n || 0)) ? 0 : 2, maximumFractionDigits: 2 });
export const plain = (n) => Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

// 15/10/2026
export const dmy = (iso) => {
  if (!iso) return "";
  const [y, m, d] = String(iso).slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
};

export const todayISO = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};
export const addDays = (iso, days) => {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

// Next quote number like 0121/2026 (counts up from the highest number of the same year)
export function nextQuoteNumber(existing, year = new Date().getFullYear()) {
  const max = existing
    .map((q) => String(q.number || "").match(/^(\d+)\/(\d{4})$/))
    .filter((m) => m && Number(m[2]) === year)
    .reduce((mx, m) => Math.max(mx, Number(m[1])), 0);
  return `${String(max + 1).padStart(4, "0")}/${year}`;
}

// Next customer id: one more than the highest number used so far
export function nextCustomerId(existing) {
  const max = existing.reduce((mx, q) => Math.max(mx, parseInt(q.customer_id, 10) || 0), 0);
  return String(max + 1);
}
