import { requireAdmin } from "@/lib/auth";
import { newQuoteDefaults } from "@/lib/quoteDefaults";
import QuoteForm from "@/components/admin/QuoteForm";

export default async function NewQuote() {
  await requireAdmin();
  return <QuoteForm defaults={await newQuoteDefaults()} />;
}
