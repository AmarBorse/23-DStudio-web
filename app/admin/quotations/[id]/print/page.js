import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { quotations } from "@/lib/store";
import QuoteDocument from "@/components/admin/QuoteDocument";
import PrintButton from "@/components/admin/PrintButton";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const q = await quotations.get("id", id).catch(() => null);
  // The browser uses the page title as the PDF file name
  return { title: q ? `Quote ${q.number.replace("/", "-")} - ${q.client_name}` : "Quotation" };
}

export default async function PrintQuote({ params }) {
  await requireAdmin();
  const { id } = await params;
  const q = await quotations.get("id", id);
  if (!q) notFound();
  return (
    <div className="qp">
      <div className="qp-bar">
        <Link href="/admin/quotations" className="pf-back">← All quotations</Link>
        <div className="adm-actions">
          <Link className="adm-btn ghost" href={`/admin/quotations/${q.id}`}>Edit</Link>
          <PrintButton />
        </div>
      </div>
      <p className="adm-muted qp-tip">To save as PDF: press “Print / Save PDF”, then choose <strong>Save as PDF</strong> as the printer.</p>
      <div className="qp-paper"><QuoteDocument q={q} /></div>
    </div>
  );
}
