import Link from "next/link";
import { quoteHistory, quoteTotals, inr, dmy, statusLabel } from "@/lib/quote";

const when = (iso) =>
  new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });

const TEXT = {
  created: "Created",
  edited: "Edited",
  status: "Status changed",
  duplicated: "Duplicated",
};

// Timeline of one quotation + the client's other quotations
export default function QuoteHistory({ quote, related }) {
  const entries = [...quoteHistory(quote)].reverse(); // newest first
  return (
    <div className="qh">
      <section className="adm-card pf-card">
        <h2 className="pf-card-title">History of quote {quote.number}</h2>
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
        <h2 className="pf-card-title">
          Other quotes for {quote.client_name || "this client"}
          {quote.customer_id && <span className="adm-muted"> (Customer Id {quote.customer_id})</span>}
        </h2>
        {related.length === 0 ? (
          <p className="adm-muted">No other quotes for this client yet.</p>
        ) : (
          <ul className="qh-related">
            {related.map((r) => (
              <li key={r.id}>
                <Link href={`/admin/quotations/${r.id}`}>
                  <strong>{r.number}</strong>
                  <span className="adm-muted">{dmy(r.quote_date)}</span>
                  <span>{inr(quoteTotals(r).total)}</span>
                  <span className={`qh-status st-${r.status}`}>{statusLabel(r.status)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
