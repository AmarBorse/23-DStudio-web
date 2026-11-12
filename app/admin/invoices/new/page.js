import { requireAdmin } from "@/lib/auth";
import { newInvoiceDefaults } from "@/lib/invoiceDefaults";
import InvoiceForm from "@/components/admin/InvoiceForm";

export default async function NewInvoice({ searchParams }) {
  await requireAdmin();
  const { from } = await searchParams; // ?from=<quotation id> copies that quote
  return <InvoiceForm defaults={await newInvoiceDefaults(from)} />;
}
