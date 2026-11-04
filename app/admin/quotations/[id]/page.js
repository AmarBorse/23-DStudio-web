import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { quotations } from "@/lib/store";
import { newQuoteDefaults } from "@/lib/quoteDefaults";
import QuoteForm from "@/components/admin/QuoteForm";
import QuoteHistory from "@/components/admin/QuoteHistory";

const norm = (s) => String(s || "").trim().toLowerCase();

export default async function EditQuote({ params }) {
  await requireAdmin();
  const { id } = await params;
  const [all, defaults] = await Promise.all([quotations.list(), newQuoteDefaults()]);
  const quote = all.find((q) => q.id === id);
  if (!quote) notFound();
  // same client = same Customer Id, or the same contact name
  const related = all.filter(
    (q) => q.id !== quote.id && ((quote.customer_id && q.customer_id === quote.customer_id) || (quote.client_name && norm(q.client_name) === norm(quote.client_name)))
  );
  return (
    <>
      <QuoteForm quote={quote} defaults={defaults} />
      <QuoteHistory quote={quote} related={related} />
    </>
  );
}
