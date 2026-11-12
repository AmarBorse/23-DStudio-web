/* eslint-disable @next/next/no-img-element */
import { COMPANY } from "@/lib/company";
import { invoiceTotals, invoiceLineAmount, slash, dMonY, boldParts } from "@/lib/invoice";

const lines = (t) => String(t || "").split("\n").map((s) => s.trim()).filter(Boolean);
const Rich = ({ text }) => boldParts(text).map((p, i) => (p.bold ? <strong key={i}>{p.text}</strong> : <span key={i}>{p.text}</span>));
const cell = (v) => (v === "" || v === null || v === undefined ? "." : Number(v).toLocaleString("en-IN", { maximumFractionDigits: 2 }));

// The printable invoice (A4), laid out like the studio's reference invoice.
export default function InvoiceDocument({ inv }) {
  const t = invoiceTotals(inv);
  const items = (inv.items || []).filter((it) => it.description);
  return (
    <article className="iv" aria-label={`Invoice ${inv.number || ""}`}>
      <p className="iv-no">NO. {inv.number}</p>
      <img className="iv-logo" src="/images/logo-black.png" alt="23D Studio" />
      <h1 className="iv-title">INVOICE</h1>
      <p className="iv-date"><strong>Date:</strong>&nbsp; {dMonY(inv.invoice_date)}{inv.due_date && <span className="iv-due">&nbsp;&nbsp;·&nbsp;&nbsp;<strong>Due:</strong> {dMonY(inv.due_date)}</span>}</p>

      <section className="iv-parties">
        <div>
          <h2>From:</h2>
          <p className="iv-co-name">{COMPANY.name}</p>
          <p className="iv-small">Office Address:- {COMPANY.address}</p>
          <p className="iv-small">Mail Id:- {COMPANY.email}</p>
          <p className="iv-small">Phone:- {COMPANY.phone}</p>
          <p className="iv-small">Website:- {COMPANY.website}</p>
        </div>
        <div>
          <h2>Billed to:</h2>
          <p className="iv-client">{inv.client_name}</p>
          {lines(inv.client_address).map((l, i) => <p key={i} className="iv-small">{l}</p>)}
          {inv.client_phone && <p className="iv-small">Phone:- {inv.client_phone}</p>}
          {inv.client_email && <p className="iv-small">Mail Id:- {inv.client_email}</p>}
        </div>
      </section>

      <table className="iv-table">
        <thead>
          <tr><th>Item</th><th>Quantity</th><th>Unit Price</th><th>Amount</th></tr>
        </thead>
        <tbody>
          {inv.heading && (
            <tr className="iv-heading"><td colSpan={4}>{inv.heading}</td></tr>
          )}
          {items.map((it, i) => (
            <tr key={i}>
              <td><ul><li>{it.description}</li></ul></td>
              <td>{cell(it.qty)}</td>
              <td>{it.rate === "" || it.rate === null || it.rate === undefined ? "." : slash(it.rate)}</td>
              <td>{it.included ? "Included" : slash(invoiceLineAmount(it))}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <dl className="iv-totals">
        {(t.discount > 0 || inv.gst_enabled) && (<><dt>Subtotal:-</dt><dd>{slash(t.subtotal)}</dd></>)}
        {t.discount > 0 && (<><dt>Discount:-</dt><dd>{slash(t.discount)}</dd></>)}
        {inv.gst_enabled && (<><dt>GST {Number(inv.gst_percent)}%:-</dt><dd>{slash(t.gst)}</dd></>)}
        <dt className="iv-total">Total Fee:-</dt><dd className="iv-total">{slash(t.total)}</dd>
        {t.paid > 0 && inv.status !== "cancelled" && (
          <>
            <dt>Received:-</dt><dd>{slash(t.paid)}</dd>
            <dt className="iv-total">Balance:-</dt><dd className="iv-total">{slash(t.due)}</dd>
          </>
        )}
      </dl>

      {lines(inv.notes).length > 0 && (
        <section className="iv-notes">
          <h2>Note:</h2>
          <ul>{lines(inv.notes).map((l, i) => <li key={i}><Rich text={l} /></li>)}</ul>
        </section>
      )}

      {lines(inv.bank).length > 0 && (
        <section className="iv-bank">
          <h2>Bank Details:</h2>
          <ul>{lines(inv.bank).map((l, i) => <li key={i}><Rich text={l} /></li>)}</ul>
        </section>
      )}

      {inv.status === "paid" && <p className="iv-stamp" aria-label="Paid">PAID</p>}
      {inv.closing && <p className="iv-closing">{inv.closing}</p>}

      <svg className="iv-waves" viewBox="0 0 210 30" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 15 C 30 8, 60 9, 95 14 S 150 24, 210 16 L210 30 L0 30 Z" fill="#ececec" />
        <path d="M58 30 C 95 27, 130 22, 160 14 S 196 2, 210 0 L210 30 Z" fill="#a9a9a9" />
        <path d="M96 30 C 130 28, 160 22, 182 14 S 204 6, 210 5 L210 30 Z" fill="#7a7a7a" />
      </svg>
    </article>
  );
}
