import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { quotations } from "@/lib/store";
import { QUOTE_STATUSES, quoteTotals, inr, dmy } from "@/lib/quote";
import { setQuoteStatus, deleteQuote, duplicateQuote } from "@/app/admin/actions";
import ConfirmButton from "@/components/admin/ConfirmButton";
import SubmitButton from "@/components/admin/SubmitButton";
import LinkSpinner from "@/components/admin/LinkSpinner";
import StatusSelect from "@/components/admin/StatusSelect";

export default async function QuotationsAdmin({ searchParams }) {
  await requireAdmin();
  const { saved, status: filter = "all", q: search = "" } = await searchParams;
  let rows = [];
  let dbError = false;
  try {
    rows = await quotations.list();
  } catch {
    dbError = true;
  }
  const term = search.trim().toLowerCase();
  const shown = rows.filter(
    (r) => (filter === "all" || r.status === filter) && (!term || `${r.number} ${r.client_name} ${r.project_overview}`.toLowerCase().includes(term))
  );
  const sum = (list) => list.reduce((s, r) => s + quoteTotals(r).total, 0);
  const accepted = rows.filter((r) => r.status === "accepted");
  const open = rows.filter((r) => r.status === "sent" || r.status === "draft");

  return (
    <>
      <div className="adm-head">
        <h1 className="adm-h1">Quotations</h1>
        <Link className="adm-btn" href="/admin/quotations/new">+ New quotation<LinkSpinner /></Link>
      </div>
      {saved && <p className="adm-ok adm-toast" role="status">Quotation saved.</p>}
      {dbError && <p className="adm-error">Could not load quotations. If this is the first time, run supabase/update-3.sql in the Supabase SQL Editor.</p>}

      <div className="adm-stats">
        <div className="adm-card adm-stat"><strong>{rows.length}</strong><span>Quotations</span></div>
        <div className="adm-card adm-stat"><strong>{inr(sum(open))}</strong><span>Open (draft + sent)</span></div>
        <div className="adm-card adm-stat"><strong>{inr(sum(accepted))}</strong><span>Accepted</span></div>
      </div>

      <form className="qa-filters" role="search">
        <input name="q" defaultValue={search} placeholder="Search by number, client or project…" aria-label="Search quotations" />
        <select name="status" defaultValue={filter} aria-label="Filter by status">
          <option value="all">All statuses</option>
          {QUOTE_STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <button className="adm-btn ghost" type="submit">Filter</button>
      </form>

      {shown.length === 0 && !dbError && <p className="adm-muted">{rows.length ? "No quotations match." : "No quotations yet. Create the first one."}</p>}
      <ul className="adm-list">
        {shown.map((r) => (
          <li key={r.id} className="adm-card adm-row qa-row">
            <div className="adm-grow">
              <strong>{r.number}</strong> <span className="adm-muted">· {dmy(r.quote_date)}</span>
              <div>{r.client_name}{r.project_overview && <span className="adm-muted"> — {r.project_overview.split("\n")[0]}</span>}</div>
            </div>
            <strong className="qa-total">{inr(quoteTotals(r).total)}</strong>
            <StatusSelect id={r.id} status={r.status} action={setQuoteStatus} />
            <div className="adm-actions">
              <Link className="adm-btn ghost" href={`/admin/quotations/${r.id}`}>Edit<LinkSpinner /></Link>
              <Link className="adm-btn ghost" href={`/admin/quotations/${r.id}/print`}>Print / PDF<LinkSpinner /></Link>
              <form action={duplicateQuote}>
                <input type="hidden" name="id" value={r.id} />
                <SubmitButton>Duplicate</SubmitButton>
              </form>
              <form action={deleteQuote}>
                <input type="hidden" name="id" value={r.id} />
                <ConfirmButton message={`Delete quotation ${r.number}? This cannot be undone.`}>Delete</ConfirmButton>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
