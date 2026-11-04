/* eslint-disable @next/next/no-img-element */
import { COMPANY } from "@/lib/company";
import { quoteTotals, lineAmount, inr, plain, dmy } from "@/lib/quote";

// The printable quotation (A4), laid out like the studio's reference quote.
// Used for the live preview in the form and for the print / PDF page.
export default function QuoteDocument({ q }) {
  const t = quoteTotals(q);
  const terms = String(q.terms || "").split("\n").map((s) => s.trim()).filter(Boolean);
  const overview = String(q.project_overview || "").split("\n").map((s) => s.trim()).filter(Boolean);
  const addressLines = String(q.client_address || "").split("\n").map((s) => s.trim()).filter(Boolean);

  return (
    <article className="qd" aria-label={`Quotation ${q.number || ""}`}>
      <header className="qd-head">
        <div className="qd-company">
          <img className="qd-logo" src="/images/logo-black.png" alt="23D Studio" />
          <p className="qd-co-name">{COMPANY.name}</p>
          <p>Office Address:- {COMPANY.address}</p>
          <p>Mail Id:- {COMPANY.email}</p>
          <p>Phone:- {COMPANY.phone}</p>
          <p>Website:- {COMPANY.website}</p>
        </div>
        <div className="qd-meta">
          <h1 className="qd-title">QUOTE</h1>
          <dl>
            <dt>Date:-</dt><dd>{dmy(q.quote_date)}</dd>
            <dt>Quote No:-</dt><dd>{q.number}</dd>
            {q.customer_id && (<><dt>Customer Id:-</dt><dd>{q.customer_id}</dd></>)}
            {q.valid_till && (<><dt>Valid Till:-</dt><dd>{dmy(q.valid_till)}</dd></>)}
          </dl>
          {overview.length > 0 && (
            <section className="qd-overview">
              <h2 className="qd-label">Project Overview</h2>
              {overview.map((l, i) => <p key={i}>{l}</p>)}
            </section>
          )}
        </div>
      </header>

      <section className="qd-people">
        {(q.prepared_by_name || q.prepared_by_phone) && (
          <div>
            <h2 className="qd-label">Prepared by</h2>
            {q.prepared_by_name && <p>{q.prepared_by_name}</p>}
            {q.prepared_by_phone && <p>Phone:- {q.prepared_by_phone}</p>}
          </div>
        )}
        <div>
          <h2 className="qd-label">Prepared For</h2>
          <p>Contact Person:- {q.client_name}</p>
          {addressLines.length > 0 && <p>Address:- {addressLines.join(", ")}</p>}
          {q.client_phone && <p>Phone:- {q.client_phone}</p>}
          {q.client_email && <p>Email:- {q.client_email}</p>}
        </div>
      </section>

      <table className="qd-table">
        <thead>
          <tr><th>DESCRIPTION</th><th>Quantity</th><th>Rate</th><th>AMOUNT</th></tr>
        </thead>
        <tbody>
          {(q.items || []).filter((it) => it.description).map((it, i) => (
            <tr key={i}>
              <td><ul><li>{it.description}</li></ul></td>
              <td>{plain(it.qty)} {it.unit}</td>
              <td>{inr(it.rate)}</td>
              <td>{inr(lineAmount(it))}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <section className="qd-bottom">
        <div className="qd-terms">
          {terms.length > 0 && (
            <>
              <h2 className="qd-label">Terms &amp; Conditions</h2>
              <ul>{terms.map((l, i) => <li key={i}>{l}</li>)}</ul>
            </>
          )}
        </div>
        <dl className="qd-totals">
          <dt>Subtotal</dt><dd>{inr(t.subtotal)}</dd>
          <dt className={q.gst_enabled ? "" : "off"}>+{plain(q.gst_percent)}% GST</dt>
          <dd className={q.gst_enabled ? "" : "off"}>{q.gst_enabled ? inr(t.gst) : "0.00"}</dd>
          <dt>Discount:-</dt><dd>{t.discount ? `${plain(t.discount)}/-` : "0/-"}</dd>
          <dt className="qd-total">TOTAL COST</dt><dd className="qd-total">₹ {plain(t.total)}/-</dd>
        </dl>
      </section>

      {q.closing && <p className="qd-closing">{q.closing}</p>}
    </article>
  );
}
