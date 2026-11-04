import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { quotations } from "@/lib/store";
import { QUOTE_STATUSES, quoteTotals, inr, dmy, yearOf, quoteHistory } from "@/lib/quote";
import { setQuoteStatus, deleteQuote, duplicateQuote } from "@/app/admin/actions";
import ConfirmButton from "@/components/admin/ConfirmButton";
import SubmitButton from "@/components/admin/SubmitButton";
import LinkSpinner from "@/components/admin/LinkSpinner";
import StatusSelect from "@/components/admin/StatusSelect";

export default async function QuotationsAdmin({ searchParams }) {
  await requireAdmin();
  const { saved, status: filter = "all", q: search = "", year = "all" } = await searchParams;
  let rows = [];
  let dbError = false;
  try {
    rows = await quotations.list();
  } catch {
    dbError = true;
  }
  const years = [...new Set(rows.map(yearOf).filter(Boolean))].sort().reverse();
  const inYear = rows.filter((r) => year === "all" || yearOf(r) === year);
  const term = search.trim().toLowerCase();
  const shown = inYear.filter(
    (r) =>
      (filter === "all" || r.status === filter) &&
      (!term || `${r.number} ${r.customer_id} ${r.client_name} ${r.project_overview}`.toLowerCase().includes(term))
  );
  const sum = (list) => list.reduce((s, r) => s + quoteTotals(r).total, 0);
  const accepted = inYear.filter((r) => r.status === "accepted");
  const open = inYear.filter((r) => r.status === "sent" || r.status === "draft");
  // group the list by year (newest year first), keeping the newest quotes on top
  const groups = [...new Set(shown.map(yearOf))].sort().reverse().map((y) => ({ year: y, list: shown.filter((r) => yearOf(r) === y) }));
  const href = (y) => {
    const p = new URLSearchParams();
    if (y !== "all") p.set("year", y);
    if (filter !== "all") p.set("status", filter);
    if (search) p.set("q", search);
    const qs = p.toString();
    return `/admin/quotations${qs ? `?${qs}` : ""}`;
  };

  return (
    <>
      <div className="adm-head">
        <h1 className="adm-h1">Quotations</h1>
        <Link className="adm-btn" href="/admin/quotations/new">+ New quotation<LinkSpinner /></Link>
      </div>
      {saved && <p className="adm-ok adm-toast" role="status">Quotation saved.</p>}
      {dbError && <p className="adm-error">Could not load quotations. If this is the first time, run supabase/update-3.sql in the Supabase SQL Editor.</p>}

      {years.length > 0 && (
        <nav className="qa-years" aria-label="Year">
          <Link href={href("all")} className={year === "all" ? "on" : undefined} aria-current={year === "all" ? "page" : undefined}>All years</Link>
          {years.map((y) => (
            <Link key={y} href={href(y)} className={year === y ? "on" : undefined} aria-current={year === y ? "page" : undefined}>{y}</Link>
          ))}
        </nav>
      )}

      <div className="adm-stats">
        <div className="adm-card adm-stat"><strong>{inYear.length}</strong><span>Quotations{year !== "all" ? ` in ${year}` : ""}</span></div>
        <div className="adm-card adm-stat"><strong>{inr(sum(open))}</strong><span>Open (draft + sent)</span></div>
        <div className="adm-card adm-stat"><strong>{inr(sum(accepted))}</strong><span>Accepted</span></div>
      </div>

      <form className="qa-filters" role="search">
        {year !== "all" && <input type="hidden" name="year" value={year} />}
        <input name="q" defaultValue={search} placeholder="Search by number, customer id, client or project…" aria-label="Search quotations" />
        <select name="status" defaultValue={filter} aria-label="Filter by status">
          <option value="all">All statuses</option>
          {QUOTE_STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <button className="adm-btn ghost" type="submit">Filter</button>
      </form>

      {shown.length === 0 && !dbError && <p className="adm-muted">{rows.length ? "No quotations match." : "No quotations yet. Create the first one."}</p>}
      {groups.map((g) => (
        <section key={g.year} className="qa-year">
          <h2 className="adm-h2">
            {g.year} <span className="adm-muted">· {g.list.length} quote{g.list.length === 1 ? "" : "s"} · {inr(sum(g.list))}</span>
          </h2>
          <ul className="adm-list">
            {g.list.map((r) => {
              const last = quoteHistory(r).at(-1);
              return (
                <li key={r.id} className="adm-card adm-row qa-row">
                  <div className="adm-grow">
                    <strong>{r.number}</strong> <span className="adm-muted">· {dmy(r.quote_date)}{r.customer_id && ` · Customer ${r.customer_id}`}</span>
                    <div>{r.client_name}{r.project_overview && <span className="adm-muted"> — {r.project_overview.split("\n")[0]}</span>}</div>
                    {last && (
                      <div className="qa-last">
                        Last activity: {last.action === "status" ? `status ${last.detail}` : last.action === "edited" ? "edited" : last.action === "duplicated" ? "duplicated" : "created"}
                        {" · "}
                        {new Date(last.at).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    )}
                  </div>
                  <strong className="qa-total">{inr(quoteTotals(r).total)}</strong>
                  <StatusSelect id={r.id} status={r.status} action={setQuoteStatus} />
                  <div className="adm-actions">
                    <Link className="adm-btn ghost" href={`/admin/quotations/${r.id}`}>Edit &amp; history<LinkSpinner /></Link>
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
              );
            })}
          </ul>
        </section>
      ))}
    </>
  );
}
