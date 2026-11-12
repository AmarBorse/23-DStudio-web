import Link from "next/link";
import { quoteHistory, dmy } from "@/lib/quote";
import { invoiceTotals, invoiceStatusLabel } from "@/lib/invoice";
import { inr } from "@/lib/quote";

const when = (iso) =>
  new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
const TEXT = { created: "Created", edited: "Edited", status: "Status changed", duplicated: "Duplicated" };

export default function InvoiceHistory({ invoice, related }) {
  const entries = [...quoteHistory(invoice)].reverse();
  const t = invoiceTotals(invoice);
  return (
    <div className="qh">
      <section className="adm-card pf-card">
        <h2 className="pf-card-title">History of invoice {invoice.number}</h2>
        <p className="adm-muted">
          Total {inr(t.total)} · received {inr(t.paid)} · balance {inr(t.due)}
          {invoice.quote_id && (
            <> · from quote <Link href={`/admin/quotations/${invoice.quote_id}`}>{invoice.quote_number}</Link></>
          )}
        </p>
        <ol className="qh-timeline">
          {entries.map((h, i) => (
            <li key={i} className={`qh-ev-${h.action}`}>
              <span className="qh-dot" aria-hidden="true" />
              <div>
                <strong>{TEXT[h.action] || h.action}</strong>
                {h.detail && <span className="qh-detail">{h.action === "edited" ? `: ${h.detail}` : ` — ${h.detail}`}</span>}
                <time dateTime={h.at}>{when(h.at)}</time>
              </div>
            </li>
          ))}
        </ol>
      </section>
      <section className="adm-card pf-card">
        <h2 className="pf-card-title">Other invoices for {invoice.client_name || "this client"}</h2>
        {related.length === 0 ? (
          <p className="adm-muted">No other invoices for this client yet.</p>
        ) : (
          <ul className="qh-related">
            {related.map((r) => (
              <li key={r.id}>
                <Link href={`/admin/invoices/${r.id}`}>
                  <strong>{r.number}</strong>
                  <span className="adm-muted">{dmy(r.invoice_date)}</span>
                  <span>{inr(invoiceTotals(r).total)}</span>
                  <span className={`qh-status st-${r.status}`}>{invoiceStatusLabel(r.status)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
