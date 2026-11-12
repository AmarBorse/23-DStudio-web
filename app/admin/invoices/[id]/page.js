import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { invoices } from "@/lib/store";
import { newInvoiceDefaults } from "@/lib/invoiceDefaults";
import InvoiceForm from "@/components/admin/InvoiceForm";
import InvoiceHistory from "@/components/admin/InvoiceHistory";

const norm = (s) => String(s || "").trim().toLowerCase();

export default async function EditInvoice({ params }) {
  await requireAdmin();
  const { id } = await params;
  const [all, defaults] = await Promise.all([invoices.list(), newInvoiceDefaults()]);
  const invoice = all.find((x) => x.id === id);
  if (!invoice) notFound();
  const related = all.filter(
    (x) => x.id !== invoice.id && ((invoice.customer_id && x.customer_id === invoice.customer_id) || (invoice.client_name && norm(x.client_name) === norm(invoice.client_name)))
  );
  return (
    <>
      <InvoiceForm invoice={invoice} defaults={defaults} />
      <InvoiceHistory invoice={invoice} related={related} />
    </>
  );
}
