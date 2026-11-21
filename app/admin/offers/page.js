import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { offerLetters } from "@/lib/store";
import { dmy, yearOf, quoteHistory } from "@/lib/quote";
import { OFFER_STATUSES, longDate, offerType, isAfterInternship } from "@/lib/offer";
import { setOfferStatus, deleteOffer, duplicateOffer } from "@/app/admin/actions";
import ConfirmButton from "@/components/admin/ConfirmButton";
import SubmitButton from "@/components/admin/SubmitButton";
import LinkSpinner from "@/components/admin/LinkSpinner";
import StatusSelect from "@/components/admin/StatusSelect";

const offerYear = (r) => yearOf({ quote_date: r.letter_date, created_at: r.created_at });

export default async function OffersAdmin({ searchParams }) {
  await requireAdmin();
  const { saved, status: filter = "all", q: search = "", year = "all" } = await searchParams;
  let rows = [];
  let dbError = false;
  try {
    rows = await offerLetters.list();
  } catch {
    dbError = true;
  }
  const years = [...new Set(rows.map(offerYear).filter(Boolean))].sort().reverse();
  const inYear = rows.filter((r) => year === "all" || offerYear(r) === year);
  const term = search.trim().toLowerCase();
  const shown = inYear.filter(
    (r) => (filter === "all" || r.status === filter) && (!term || `${r.number} ${r.candidate_name} ${r.position} ${r.candidate_email}`.toLowerCase().includes(term))
  );
  const count = (s) => inYear.filter((r) => r.status === s).length;
  const groups = [...new Set(shown.map(offerYear))].sort().reverse().map((y) => ({ year: y, list: shown.filter((r) => offerYear(r) === y) }));
  const href = (y) => {
    const p = new URLSearchParams();
    if (y !== "all") p.set("year", y);
    if (filter !== "all") p.set("status", filter);
    if (search) p.set("q", search);
    const qs = p.toString();
    return `/admin/offers${qs ? `?${qs}` : ""}`;
  };

  return (
    <>
      <div className="adm-head">
        <h1 className="adm-h1">Offer letters</h1>
        <div className="adm-actions">
          <Link className="adm-btn ghost" href="/admin/offers/new?type=recommendation">+ LOR<LinkSpinner /></Link>
          <Link className="adm-btn ghost" href="/admin/offers/new?type=certificate">+ Certificate<LinkSpinner /></Link>
          <Link className="adm-btn ghost" href="/admin/offers/new?type=completion">+ Completion letter<LinkSpinner /></Link>
          <Link className="adm-btn ghost" href="/admin/offers/new?type=internship">+ Internship offer<LinkSpinner /></Link>
          <Link className="adm-btn" href="/admin/offers/new">+ Job offer<LinkSpinner /></Link>
        </div>
      </div>
      {saved && <p className="adm-ok adm-toast" role="status">Offer letter saved.</p>}
      {dbError && <p className="adm-error">Could not load offer letters. If this is the first time, run supabase/update-6.sql in the Supabase SQL Editor.</p>}

      {years.length > 0 && (
        <nav className="qa-years" aria-label="Year">
          <Link href={href("all")} className={year === "all" ? "on" : undefined}>All years</Link>
          {years.map((y) => <Link key={y} href={href(y)} className={year === y ? "on" : undefined}>{y}</Link>)}
        </nav>
      )}

      <div className="adm-stats">
        <div className="adm-card adm-stat"><strong>{inYear.length}</strong><span>Offer letters{year !== "all" ? ` in ${year}` : ""}</span></div>
        <div className="adm-card adm-stat"><strong>{count("sent")}</strong><span>Waiting for reply</span></div>
        <div className="adm-card adm-stat"><strong>{count("accepted")}</strong><span>Accepted</span></div>
      </div>

      <form className="qa-filters" role="search">
        {year !== "all" && <input type="hidden" name="year" value={year} />}
        <input name="q" defaultValue={search} placeholder="Search by name, position or reference…" aria-label="Search offer letters" />
        <select name="status" defaultValue={filter} aria-label="Filter by status">
          <option value="all">All statuses</option>
          {OFFER_STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <button className="adm-btn ghost" type="submit">Filter</button>
      </form>

      {shown.length === 0 && !dbError && <p className="adm-muted">{rows.length ? "No offer letters match." : "No offer letters yet. Create the first one."}</p>}
      {groups.map((g) => (
        <section key={g.year} className="qa-year">
          <h2 className="adm-h2">{g.year} <span className="adm-muted">· {g.list.length} letter{g.list.length === 1 ? "" : "s"}</span></h2>
          <ul className="adm-list">
            {g.list.map((r) => {
              const last = quoteHistory(r).at(-1);
              return (
                <li key={r.id} className="adm-card adm-row qa-row ol-row">
                  <div className="adm-grow">
                    <strong>{r.candidate_name}</strong>
                    <span className={`ol-type ${offerType(r)}`}>{{ job: "Job", internship: "Internship", completion: "Completion", certificate: "Certificate", recommendation: "LOR" }[offerType(r)]}</span>{" "}
                    <span className="adm-muted">· {r.number} · {dmy(r.letter_date)}</span>
                    <div>{r.position}{r.salary && !isAfterInternship(offerType(r)) && <span className="adm-muted"> · {offerType(r) === "internship" ? `stipend ${r.salary}` : `${r.salary}/month`}</span>}</div>
                    <div className="qa-last">
                      {r.start_date && (offerType(r) !== "job" ? `${longDate(r.start_date)} – ${longDate(r.end_date)}` : `Joining ${longDate(r.start_date)}`)}
                      {r.accept_by && r.status === "sent" && ` · reply by ${longDate(r.accept_by)}`}
                      {last && ` · last activity ${new Date(last.at).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric" })}`}
                    </div>
                  </div>
                  <StatusSelect id={r.id} status={r.status} action={setOfferStatus} options={OFFER_STATUSES} label="Offer status" />
                  <div className="adm-actions">
                    <Link className="adm-btn ghost" href={`/admin/offers/${r.id}`}>Edit &amp; history<LinkSpinner /></Link>
                    <Link className="adm-btn ghost" href={`/admin/offers/${r.id}/print`}>Print / PDF<LinkSpinner /></Link>
                    {offerType(r) === "internship" && (
                      <Link className="adm-btn ghost" href={`/admin/offers/new?type=completion&from=${r.id}`}>Completion letter<LinkSpinner /></Link>
                    )}
                    {(offerType(r) === "internship" || offerType(r) === "completion") && (
                      <Link className="adm-btn ghost" href={`/admin/offers/new?type=certificate&from=${r.id}`}>Certificate<LinkSpinner /></Link>
                    )}
                    {(offerType(r) === "internship" || offerType(r) === "completion") && (
                      <Link className="adm-btn ghost" href={`/admin/offers/new?type=recommendation&from=${r.id}`}>LOR<LinkSpinner /></Link>
                    )}
                    <form action={duplicateOffer}><input type="hidden" name="id" value={r.id} /><SubmitButton>Use as template</SubmitButton></form>
                    <form action={deleteOffer}><input type="hidden" name="id" value={r.id} /><ConfirmButton message={`Delete the offer letter for ${r.candidate_name}? This cannot be undone.`}>Delete</ConfirmButton></form>
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
