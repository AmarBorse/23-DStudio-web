// Invoice maths and formatting (admin form, list and the printable invoice).
import { historyEntry } from "@/lib/quote";

export const INVOICE_STATUSES = [
  { id: "unpaid", label: "Unpaid" },
  { id: "partly_paid", label: "Partly paid" },
  { id: "paid", label: "Paid" },
  { id: "cancelled", label: "Cancelled" },
];
export const invoiceStatusLabel = (id) => INVOICE_STATUSES.find((s) => s.id === id)?.label || id;

const num = (v) => (v === "" || v === null || v === undefined || !Number.isFinite(Number(v)) ? null : Number(v));

// Amount of one line: "Included" lines are 0; a typed amount wins; otherwise quantity × unit price
export function invoiceLineAmount(it) {
  if (it.included) return 0;
  const typed = num(it.amount);
  if (typed !== null) return typed;
  return (num(it.qty) ?? 0) * (num(it.rate) ?? 0);
}

export function invoiceTotals(inv) {
  const subtotal = (inv.items || []).reduce((s, it) => s + invoiceLineAmount(it), 0);
  const discount = num(inv.discount) ?? 0;
  const taxable = Math.max(0, subtotal - discount);
  const gst = inv.gst_enabled ? Math.round(taxable * (num(inv.gst_percent) ?? 0)) / 100 : 0;
  const total = taxable + gst;
  const paid = inv.status === "paid" ? total : Math.min(total, num(inv.amount_paid) ?? 0);
  return { subtotal, discount, gst, total, paid, due: Math.max(0, total - paid) };
}

// 3,500/-
export const slash = (n) => `${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}/-`;

// 3, Oct, 2026
export const dMonY = (iso) => {
  if (!iso) return "";
  const d = new Date(`${String(iso).slice(0, 10)}T00:00:00`);
  return `${d.getDate()}, ${d.toLocaleString("en-GB", { month: "short" })}, ${d.getFullYear()}`;
};

// Next invoice number like 133/2026 (starts again from 1 every year)
export function nextInvoiceNumber(existing, year = new Date().getFullYear()) {
  const max = existing
    .map((x) => String(x.number || "").match(/^(\d+)\/(\d{4})$/))
    .filter((m) => m && Number(m[2]) === year)
    .reduce((mx, m) => Math.max(mx, Number(m[1])), 0);
  return `${String(max + 1).padStart(3, "0")}/${year}`;
}

// **bold** → [{text, bold}]
export function boldParts(line) {
  return String(line)
    .split(/(\*\*[^*]+\*\*)/)
    .filter(Boolean)
    .map((p) => (p.startsWith("**") && p.endsWith("**") ? { text: p.slice(2, -2), bold: true } : { text: p, bold: false }));
}

export { historyEntry };
