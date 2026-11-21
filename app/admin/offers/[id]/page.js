import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { offerLetters } from "@/lib/store";
import { newOfferDefaults } from "@/lib/offerDefaults";
import { quoteHistory, dmy } from "@/lib/quote";
import { offerStatusLabel, offerType } from "@/lib/offer";
import OfferForm from "@/components/admin/OfferForm";

const when = (iso) =>
  new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
const TEXT = { created: "Created", edited: "Edited", status: "Status changed" };
const norm = (s) => String(s || "").trim().toLowerCase();

export default async function EditOffer({ params }) {
  await requireAdmin();
  const { id } = await params;
  const all = await offerLetters.list();
  const offer = all.find((x) => x.id === id);
  if (!offer) notFound();
  const defaults = await newOfferDefaults(offerType(offer));
  const others = all.filter((x) => x.id !== offer.id && norm(x.candidate_name) === norm(offer.candidate_name));
  return (
    <>
      <OfferForm offer={offer} defaults={defaults} />
      <div className="qh">
        <section className="adm-card pf-card">
          <h2 className="pf-card-title">History of offer {offer.number}</h2>
          <ol className="qh-timeline">
            {[...quoteHistory(offer)].reverse().map((h, i) => (
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
        {others.length > 0 && (
          <section className="adm-card pf-card">
            <h2 className="pf-card-title">Other offer letters for {offer.candidate_name}</h2>
            <ul className="qh-related">
              {others.map((r) => (
                <li key={r.id}>
                  <Link href={`/admin/offers/${r.id}`}>
                    <strong>{r.number}</strong>
                    <span className="adm-muted">{dmy(r.letter_date)}</span>
                    <span>{r.position}</span>
                    <span className={`qh-status st-${r.status}`}>{offerStatusLabel(r.status)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
