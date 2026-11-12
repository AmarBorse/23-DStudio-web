import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { invoices } from "@/lib/store";
import InvoiceDocument from "@/components/admin/InvoiceDocument";
import PrintButton from "@/components/admin/PrintButton";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const inv = await invoices.get("id", id).catch(() => null);
  return { title: inv ? `Invoice ${inv.number.replace("/", "-")} - ${inv.client_name}` : "Invoice" };
}

export default async function PrintInvoice({ params }) {
  await requireAdmin();
  const { id } = await params;
  const inv = await invoices.get("id", id);
  if (!inv) notFound();
  return (
    <div className="qp">
      <div className="qp-bar">
        <Link href="/admin/invoices" className="pf-back">← All invoices</Link>
        <div className="adm-actions">
          <Link className="adm-btn ghost" href={`/admin/invoices/${inv.id}`}>Edit</Link>
          <PrintButton />
        </div>
      </div>
      <p className="adm-muted qp-tip">To save as PDF: press “Print / Save PDF”, then choose <strong>Save as PDF</strong> as the printer.</p>
      <div className="qp-paper"><InvoiceDocument inv={inv} /></div>
    </div>
  );
}
