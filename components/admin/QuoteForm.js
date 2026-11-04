"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { saveQuote } from "@/app/admin/actions";
import QuoteDocument from "@/components/admin/QuoteDocument";
import { QUOTE_STATUSES, quoteTotals, lineAmount, inr, addDays } from "@/lib/quote";

const blankItem = () => ({ description: "", qty: 1, unit: "Nos.", rate: "" });

export default function QuoteForm({ quote, defaults }) {
  const [state, action, pending] = useActionState(saveQuote, null);
  const [q, setQ] = useState(() => ({
    ...defaults,
    ...quote,
    items: quote?.items?.length ? quote.items : [blankItem()],
  }));
  const [validTouched, setValidTouched] = useState(Boolean(quote));
  const [showPreview, setShowPreview] = useState(true);

  const set = (k) => (e) => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setQ((p) => {
      const next = { ...p, [k]: v };
      if (k === "quote_date" && !validTouched && v) next.valid_till = addDays(v, defaults.valid_days);
      return next;
    });
  };
  const setItem = (i, k, v) => setQ((p) => ({ ...p, items: p.items.map((it, j) => (j === i ? { ...it, [k]: v } : it)) }));
  const moveItem = (i, d) =>
    setQ((p) => {
      const j = i + d;
      if (j < 0 || j >= p.items.length) return p;
      const items = [...p.items];
      [items[i], items[j]] = [items[j], items[i]];
      return { ...p, items };
    });

  const totals = useMemo(() => quoteTotals(q), [q]);

  return (
    <div className={`qf-wrap${showPreview ? " with-preview" : ""}`}>
      <form action={action} className="pf qf">
        <div className="pf-top">
          <Link href="/admin/quotations" className="pf-back">← All quotations</Link>
          <h1 className="pf-title">{quote ? `Edit quote ${quote.number}` : "New quotation"}</h1>
        </div>
        {quote && <input type="hidden" name="id" value={quote.id} />}
        <input type="hidden" name="items" value={JSON.stringify(q.items)} />

        <section className="adm-card pf-card">
          <h2 className="pf-card-title">Quote details</h2>
          <div className="pf-two">
            <F label="Quote No *"><input name="number" value={q.number} onChange={set("number")} required /></F>
            <F label="Customer Id"><input name="customer_id" value={q.customer_id} onChange={set("customer_id")} /></F>
            <F label="Date *"><input type="date" name="quote_date" value={q.quote_date || ""} onChange={set("quote_date")} required /></F>
            <F label="Valid till"><input type="date" name="valid_till" value={q.valid_till || ""} onChange={(e) => { setValidTouched(true); set("valid_till")(e); }} /></F>
            <F label="Status">
              <select name="status" value={q.status} onChange={set("status")}>
                {QUOTE_STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </F>
          </div>
          <F label="Project overview" hint="One line per row, e.g. “Detailed Furniture & Interior Working Drawings”, then “3BHK Residential Apartment”.">
            <textarea name="project_overview" rows={3} value={q.project_overview} onChange={set("project_overview")} />
          </F>
        </section>

        <section className="adm-card pf-card">
          <h2 className="pf-card-title">Prepared for (client)</h2>
          <div className="pf-two">
            <F label="Contact person *"><input name="client_name" value={q.client_name} onChange={set("client_name")} required /></F>
            <F label="Phone"><input name="client_phone" value={q.client_phone} onChange={set("client_phone")} /></F>
            <F label="Address"><input name="client_address" value={q.client_address} onChange={set("client_address")} placeholder="e.g. Nashik, Maharashtra." /></F>
            <F label="Email"><input type="email" name="client_email" value={q.client_email} onChange={set("client_email")} /></F>
          </div>
          <h2 className="pf-card-title">Prepared by</h2>
          <div className="pf-two">
            <F label="Name"><input name="prepared_by_name" value={q.prepared_by_name} onChange={set("prepared_by_name")} /></F>
            <F label="Phone"><input name="prepared_by_phone" value={q.prepared_by_phone} onChange={set("prepared_by_phone")} /></F>
          </div>
        </section>

        <section className="adm-card pf-card">
          <h2 className="pf-card-title">Items</h2>
          <div className="qf-items">
            {q.items.map((it, i) => (
              <div className="qf-row" key={i}>
                <span className="qf-num">{i + 1}</span>
                <textarea aria-label={`Item ${i + 1} description`} rows={2} value={it.description} onChange={(e) => setItem(i, "description", e.target.value)} placeholder="Description, e.g. Plumbing Layout (typical all floor)" />
                <div className="qf-nums">
                  <label>Qty<input aria-label={`Item ${i + 1} quantity`} type="number" min="0" step="any" value={it.qty} onChange={(e) => setItem(i, "qty", e.target.value)} /></label>
                  <label>Unit<input aria-label={`Item ${i + 1} unit`} value={it.unit} onChange={(e) => setItem(i, "unit", e.target.value)} list="qf-units" /></label>
                  <label>Rate (₹)<input aria-label={`Item ${i + 1} rate`} type="number" min="0" step="any" value={it.rate} onChange={(e) => setItem(i, "rate", e.target.value)} /></label>
                  <span className="qf-amount"><small>Amount</small>{inr(lineAmount(it))}</span>
                  <span className="qf-tools">
                    <button type="button" onClick={() => moveItem(i, -1)} disabled={i === 0} aria-label={`Move item ${i + 1} up`}>↑</button>
                    <button type="button" onClick={() => moveItem(i, 1)} disabled={i === q.items.length - 1} aria-label={`Move item ${i + 1} down`}>↓</button>
                    <button type="button" className="x" onClick={() => setQ((p) => ({ ...p, items: p.items.length > 1 ? p.items.filter((_, j) => j !== i) : [blankItem()] }))} aria-label={`Remove item ${i + 1}`}>✕</button>
                  </span>
                </div>
              </div>
            ))}
            <datalist id="qf-units"><option value="Nos." /><option value="No." /><option value="Sq.ft" /><option value="Floor" /><option value="Lump sum" /></datalist>
          </div>
          <button type="button" className="adm-btn ghost" onClick={() => setQ((p) => ({ ...p, items: [...p.items, blankItem()] }))}>+ Add item</button>

          <div className="qf-totals">
            <div><span>Subtotal</span><strong>{inr(totals.subtotal)}</strong></div>
            <div className="qf-gst">
              <label className="pf-check qf-gst-check"><input type="checkbox" name="gst_enabled" checked={Boolean(q.gst_enabled)} onChange={set("gst_enabled")} /> Add GST</label>
              <span className="qf-pct"><input type="number" name="gst_percent" min="0" step="any" value={q.gst_percent} onChange={set("gst_percent")} aria-label="GST percent" />%</span>
              <strong>{inr(totals.gst)}</strong>
            </div>
            <div><label htmlFor="qf-discount">Discount (₹)</label><input id="qf-discount" type="number" name="discount" min="0" step="any" value={q.discount} onChange={set("discount")} /></div>
            <div className="qf-grand"><span>Total cost</span><strong>{inr(totals.total)}</strong></div>
          </div>
        </section>

        <section className="adm-card pf-card">
          <F label="Terms & conditions" hint="One point per line.">
            <textarea name="terms" rows={6} value={q.terms} onChange={set("terms")} />
          </F>
          <F label="Closing line"><input name="closing" value={q.closing} onChange={set("closing")} /></F>
          <F label="Private notes" hint="Only for you, not printed on the quote.">
            <textarea name="notes" rows={2} value={q.notes} onChange={set("notes")} />
          </F>
        </section>

        {state?.error && <p className="adm-error" role="alert">{state.error}</p>}
        <div className="pf-actions">
          <button type="button" className="adm-btn ghost qf-preview-toggle" onClick={() => setShowPreview((v) => !v)}>{showPreview ? "Hide preview" : "Show preview"}</button>
          <Link className="adm-btn ghost" href="/admin/quotations">Cancel</Link>
          <button className={`adm-btn ghost${pending ? " is-busy" : ""}`} type="submit" name="then" value="print" disabled={pending}>Save &amp; print / PDF</button>
          <button className={`adm-btn pf-save${pending ? " is-busy" : ""}`} type="submit" disabled={pending}>Save quotation</button>
        </div>
      </form>

      {showPreview && (
        <aside className="qf-preview" aria-label="Live preview">
          <p className="adm-muted">Live preview</p>
          <div className="qf-preview-paper"><QuoteDocument q={q} /></div>
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
