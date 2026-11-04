import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { quotations } from "@/lib/store";
import { newQuoteDefaults } from "@/lib/quoteDefaults";
import QuoteForm from "@/components/admin/QuoteForm";

export default async function EditQuote({ params }) {
  await requireAdmin();
  const { id } = await params;
  const quote = await quotations.get("id", id);
  if (!quote) notFound();
  const defaults = await newQuoteDefaults();
  return <QuoteForm quote={quote} defaults={defaults} />;
}
