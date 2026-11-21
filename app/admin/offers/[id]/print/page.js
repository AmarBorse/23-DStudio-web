import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { offerLetters } from "@/lib/store";
import OfferDocument from "@/components/admin/OfferDocument";
import PrintButton from "@/components/admin/PrintButton";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const o = await offerLetters.get("id", id).catch(() => null);
  const kind = { internship: "Internship Offer", completion: "Internship Completion" }[o?.letter_type] || "Offer Letter";
  return { title: o ? `${kind} - ${o.candidate_name} - ${o.position}` : "Offer letter" };
}

export default async function PrintOffer({ params }) {
  await requireAdmin();
  const { id } = await params;
  const o = await offerLetters.get("id", id);
  if (!o) notFound();
  return (
    <div className="qp">
      <div className="qp-bar">
        <Link href="/admin/offers" className="pf-back">← All offer letters</Link>
        <div className="adm-actions">
          <Link className="adm-btn ghost" href={`/admin/offers/${o.id}`}>Edit</Link>
          <PrintButton />
        </div>
      </div>
      <p className="adm-muted qp-tip">To save as PDF: press “Print / Save PDF”, then choose <strong>Save as PDF</strong> as the printer.</p>
      <div className="qp-paper"><OfferDocument o={o} /></div>
    </div>
  );
}
