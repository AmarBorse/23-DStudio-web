import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { invoices } from "@/lib/store";
import { inr, dmy, yearOf, quoteHistory } from "@/lib/quote";
import { INVOICE_STATUSES, invoiceTotals } from "@/lib/invoice";
import { setInvoiceStatus, deleteInvoice, duplicateInvoice } from "@/app/admin/actions";
import ConfirmButton from "@/components/admin/ConfirmButton";
import SubmitButton from "@/components/admin/SubmitButton";
import LinkSpinner from "@/components/admin/LinkSpinner";
import StatusSelect from "@/components/admin/StatusSelect";

const invYear = (r) => yearOf({ quote_date: r.invoice_date, created_at: r.created_at });

export default async function InvoicesAdmin({ searchParams }) {
  await requireAdmin();
  const { saved, status: filter = "all", q: search = "", year = "all" } = await searchParams;
  let rows = [];
  let dbError = false;
  try {
    rows = await invoices.list();
  } catch {
    dbError = true;
  }
  const years = [...new Set(rows.map(invYear).filter(Boolean))].sort().reverse();
  const inYear = rows.filter((r) => year === "all" || invYear(r) === year);
  const term = search.trim().toLowerCase();
  const shown = inYear.filter(
    (r) => (filter === "all" || r.status === filter) && (!term || `${r.number} ${r.customer_id} ${r.client_name} ${r.heading} ${r.quote_number}`.toLowerCase().includes(term))
  );
  const live = inYear.filter((r) => r.status !== "cancelled");
  const totals = live.reduce((a, r) => { const t = invoiceTotals(r); return { total: a.total + t.total, paid: a.paid + t.paid, due: a.due + t.due }; }, { total: 0, paid: 0, due: 0 });
  const groups = [...new Set(shown.map(invYear))].sort().reverse().map((y) => ({ year: y, list: shown.filter((r) => invYear(r) === y) }));
  const href = (y) => {
    const p = new URLSearchParams();
    if (y !== "all") p.set("year", y);
    if (filter !== "all") p.set("status", filter);
    if (search) p.set("q", search);
    const qs = p.toString();
    return `/admin/invoices${qs ? `?${qs}` : ""}`;
  };

  return (
    <>
      <div className="adm-head">
        <h1 className="adm-h1">Invoices</h1>
        <Link className="adm-btn" href="/admin/invoices/new">+ New invoice<LinkSpinner /></Link>
      </div>
      {saved && <p className="adm-ok adm-toast" role="status">Invoice saved.</p>}
      {dbError && <p className="adm-error">Could not load invoices. If this is the first time, run supabase/update-5.sql in the Supabase SQL Editor.</p>}

      {years.length > 0 && (
        <nav className="qa-years" aria-label="Year">
          <Link href={href("all")} className={year === "all" ? "on" : undefined}>All years</Link>
          {years.map((y) => <Link key={y} href={href(y)} className={year === y ? "on" : undefined}>{y}</Link>)}
        </nav>
      )}

      <div className="adm-stats">
        <div className="adm-card adm-stat"><strong>{inr(totals.total)}</strong><span>Invoiced{year !== "all" ? ` in ${year}` : ""}</span></div>
        <div className="adm-card adm-stat"><strong>{inr(totals.paid)}</strong><span>Received</span></div>
        <div className="adm-card adm-stat iv-due-stat"><strong>{inr(totals.due)}</strong><span>Pending</span></div>
      </div>

      <form className="qa-filters" role="search">
        {year !== "all" && <input type="hidden" name="year" value={year} />}
        <input name="q" defaultValue={search} placeholder="Search by number, client, quote or heading…" aria-label="Search invoices" />
        <select name="status" defaultValue={filter} aria-label="Filter by status">
          <option value="all">All statuses</option>
          {INVOICE_STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <button className="adm-btn ghost" type="submit">Filter</button>
      </form>

      {shown.length === 0 && !dbError && <p className="adm-muted">{rows.length ? "No invoices match." : "No invoices yet. Create one here, or from a quotation with “Create invoice”."}</p>}
      {groups.map((g) => (
        <section key={g.year} className="qa-year">
          <h2 className="adm-h2">{g.year} <span className="adm-muted">· {g.list.length} invoice{g.list.length === 1 ? "" : "s"}</span></h2>
          <ul className="adm-list">
            {g.list.map((r) => {
              const t = invoiceTotals(r);
              const last = quoteHistory(r).at(-1);
              return (
                <li key={r.id} className="adm-card adm-row qa-row">
                  <div className="adm-grow">
                    <strong>{r.number}</strong> <span className="adm-muted">· {dmy(r.invoice_date)}{r.quote_number && ` · from quote ${r.quote_number}`}</span>
                    <div>{r.client_name}{r.heading && <span className="adm-muted"> — {r.heading}</span>}</div>
                    <div className="qa-last">
                      {t.due > 0 && r.status !== "cancelled" ? `Balance ${inr(t.due)}` : r.status === "paid" ? `Paid${r.paid_on ? ` on ${dmy(r.paid_on)}` : ""}` : ""}
                      {last && ` · last activity ${new Date(last.at).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric" })}`}
                    </div>
                  </div>
                  <strong className="qa-total">{inr(t.total)}</strong>
                  <StatusSelect id={r.id} status={r.status} action={setInvoiceStatus} options={INVOICE_STATUSES} label="Payment status" />
                  <div className="adm-actions">
                    <Link className="adm-btn ghost" href={`/admin/invoices/${r.id}`}>Edit &amp; history<LinkSpinner /></Link>
                    <Link className="adm-btn ghost" href={`/admin/invoices/${r.id}/print`}>Print / PDF<LinkSpinner /></Link>
                    <form action={duplicateInvoice}><input type="hidden" name="id" value={r.id} /><SubmitButton>Duplicate</SubmitButton></form>
                    <form action={deleteInvoice}><input type="hidden" name="id" value={r.id} /><ConfirmButton message={`Delete invoice ${r.number}? This cannot be undone.`}>Delete</ConfirmButton></form>
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
