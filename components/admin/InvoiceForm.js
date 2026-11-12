"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { saveInvoice } from "@/app/admin/actions";
import InvoiceDocument from "@/components/admin/InvoiceDocument";
import { INVOICE_STATUSES, invoiceTotals, invoiceLineAmount } from "@/lib/invoice";
import { inr } from "@/lib/quote";

const blankItem = () => ({ description: "", qty: 1, rate: "", amount: "", included: false });

export default function InvoiceForm({ invoice, defaults }) {
  const [state, action, pending] = useActionState(saveInvoice, null);
  const [v, setV] = useState(() => {
    const start = { ...defaults, ...invoice };
    return { ...start, items: start.items?.length ? start.items : [blankItem()] };
  });
  const [showPreview, setShowPreview] = useState(true);

  const set = (k) => (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setV((p) => ({ ...p, [k]: val }));
  };
  const setItem = (i, k, val) => setV((p) => ({ ...p, items: p.items.map((it, j) => (j === i ? { ...it, [k]: val } : it)) }));
  const moveItem = (i, d) =>
    setV((p) => {
      const j = i + d;
      if (j < 0 || j >= p.items.length) return p;
      const items = [...p.items];
      [items[i], items[j]] = [items[j], items[i]];
      return { ...p, items };
    });
  const t = useMemo(() => invoiceTotals(v), [v]);

  return (
    <div className={`qf-wrap${showPreview ? " with-preview" : ""}`}>
      <form action={action} className="pf qf">
        <div className="pf-top">
          <Link href="/admin/invoices" className="pf-back">← All invoices</Link>
          <h1 className="pf-title">{invoice ? `Edit invoice ${invoice.number}` : "New invoice"}</h1>
        </div>
        {invoice && <input type="hidden" name="id" value={invoice.id} />}
        <input type="hidden" name="items" value={JSON.stringify(v.items)} />
        <input type="hidden" name="quote_id" value={v.quote_id || ""} />
        <input type="hidden" name="quote_number" value={v.quote_number || ""} />
        {v.quote_number && <p className="adm-ok">Made from quotation {v.quote_number}. Check the details, then save.</p>}

        <section className="adm-card pf-card">
          <h2 className="pf-card-title">Invoice details</h2>
          <div className="pf-two">
            <F label="Invoice No *"><input name="number" value={v.number} onChange={set("number")} required /></F>
            <F label="Customer Id"><input name="customer_id" value={v.customer_id} onChange={set("customer_id")} /></F>
            <F label="Date *"><input type="date" name="invoice_date" value={v.invoice_date || ""} onChange={set("invoice_date")} required /></F>
            <F label="Due date (optional)"><input type="date" name="due_date" value={v.due_date || ""} onChange={set("due_date")} /></F>
          </div>
        </section>

        <section className="adm-card pf-card">
          <h2 className="pf-card-title">Billed to</h2>
          <div className="pf-two">
            <F label="Name / company *"><input name="client_name" value={v.client_name} onChange={set("client_name")} required /></F>
            <F label="Phone"><input name="client_phone" value={v.client_phone} onChange={set("client_phone")} /></F>
            <F label="Address" hint="Optional. One line per row."><textarea name="client_address" rows={2} value={v.client_address} onChange={set("client_address")} /></F>
            <F label="Email"><input type="email" name="client_email" value={v.client_email} onChange={set("client_email")} /></F>
          </div>
        </section>

        <section className="adm-card pf-card">
          <h2 className="pf-card-title">Items</h2>
          <F label="Heading" hint="Bold line at the top of the table, e.g. “Professional business presentation”.">
            <input name="heading" value={v.heading} onChange={set("heading")} />
          </F>
          <div className="qf-items">
            {v.items.map((it, i) => (
              <div className="qf-row" key={i}>
                <span className="qf-num">{i + 1}</span>
                <textarea aria-label={`Item ${i + 1} description`} rows={2} value={it.description} onChange={(e) => setItem(i, "description", e.target.value)} placeholder="Description, e.g. Business Presentation Design & Development" />
                <div className="qf-nums iv-nums">
                  <label>Qty<input aria-label={`Item ${i + 1} quantity`} type="number" min="0" step="any" value={it.qty} onChange={(e) => setItem(i, "qty", e.target.value)} placeholder="." /></label>
                  <label>Unit price (₹)<input aria-label={`Item ${i + 1} unit price`} type="number" min="0" step="any" value={it.rate} onChange={(e) => setItem(i, "rate", e.target.value)} placeholder="." /></label>
                  <label>Amount (₹)<input aria-label={`Item ${i + 1} amount`} type="number" min="0" step="any" value={it.amount} onChange={(e) => setItem(i, "amount", e.target.value)} placeholder={it.included ? "Included" : String(invoiceLineAmount({ ...it, amount: "" }))} disabled={it.included} /></label>
                  <label className="pf-check iv-incl"><input type="checkbox" checked={Boolean(it.included)} onChange={(e) => setItem(i, "included", e.target.checked)} /> Included</label>
                  <span className="qf-tools">
                    <button type="button" onClick={() => moveItem(i, -1)} disabled={i === 0} aria-label={`Move item ${i + 1} up`}>↑</button>
                    <button type="button" onClick={() => moveItem(i, 1)} disabled={i === v.items.length - 1} aria-label={`Move item ${i + 1} down`}>↓</button>
                    <button type="button" className="x" onClick={() => setV((p) => ({ ...p, items: p.items.length > 1 ? p.items.filter((_, j) => j !== i) : [blankItem()] }))} aria-label={`Remove item ${i + 1}`}>✕</button>
                  </span>
                </div>
              </div>
            ))}
          </div>
          <p className="pf-hint">Amount: leave empty to use quantity × unit price, or type a different amount. Tick “Included” for items with no separate charge.</p>
          <button type="button" className="adm-btn ghost" onClick={() => setV((p) => ({ ...p, items: [...p.items, blankItem()] }))}>+ Add item</button>

          <div className="qf-totals">
            <div><span>Subtotal</span><strong>{inr(t.subtotal)}</strong></div>
            <div><label htmlFor="iv-discount">Discount (₹)</label><input id="iv-discount" type="number" name="discount" min="0" step="any" value={v.discount} onChange={set("discount")} /></div>
            <div className="qf-gst">
              <label className="pf-check qf-gst-check"><input type="checkbox" name="gst_enabled" checked={Boolean(v.gst_enabled)} onChange={set("gst_enabled")} /> Add GST</label>
              <span className="qf-pct"><input type="number" name="gst_percent" min="0" step="any" value={v.gst_percent} onChange={set("gst_percent")} aria-label="GST percent" />%</span>
              <strong>{inr(t.gst)}</strong>
            </div>
            <div className="qf-grand"><span>Total fee</span><strong>{inr(t.total)}</strong></div>
          </div>
        </section>

        <section className="adm-card pf-card">
          <h2 className="pf-card-title">Payment</h2>
          <div className="pf-two">
            <F label="Status">
              <select name="status" value={v.status} onChange={set("status")}>
                {INVOICE_STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </F>
            <F label="Amount received (₹)" hint={v.status === "paid" ? "Marked as paid in full." : `Balance: ${inr(t.due)}`}>
              <input type="number" name="amount_paid" min="0" step="any" value={v.amount_paid} onChange={set("amount_paid")} />
            </F>
            <F label="Payment date"><input type="date" name="paid_on" value={v.paid_on || ""} onChange={set("paid_on")} /></F>
          </div>
        </section>

        <section className="adm-card pf-card">
          <F label="Note" hint="One point per line. Put **two stars** around words to make them bold.">
            <textarea name="notes" rows={6} value={v.notes} onChange={set("notes")} />
          </F>
          <F label="Bank details" hint="One line each.">
            <textarea name="bank" rows={4} value={v.bank} onChange={set("bank")} />
          </F>
          <F label="Closing line"><input name="closing" value={v.closing} onChange={set("closing")} /></F>
          <F label="Private notes" hint="Only for you, not printed.">
            <textarea name="private_notes" rows={2} value={v.private_notes} onChange={set("private_notes")} />
          </F>
        </section>

        {state?.error && <p className="adm-error" role="alert">{state.error}</p>}
        <div className="pf-actions">
          <button type="button" className="adm-btn ghost qf-preview-toggle" onClick={() => setShowPreview((x) => !x)}>{showPreview ? "Hide preview" : "Show preview"}</button>
          <Link className="adm-btn ghost" href="/admin/invoices">Cancel</Link>
          <button className={`adm-btn ghost${pending ? " is-busy" : ""}`} type="submit" name="then" value="print" disabled={pending}>Save &amp; print / PDF</button>
          <button className={`adm-btn pf-save${pending ? " is-busy" : ""}`} type="submit" disabled={pending}>Save invoice</button>
        </div>
      </form>

      {showPreview && (
        <aside className="qf-preview" aria-label="Live preview">
          <p className="adm-muted">Live preview</p>
          <div className="qf-preview-paper"><InvoiceDocument inv={v} /></div>
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
