import { requireAdmin } from "@/lib/auth";
import { newOfferDefaults } from "@/lib/offerDefaults";
import OfferForm from "@/components/admin/OfferForm";

export default async function NewOffer({ searchParams }) {
  await requireAdmin();
  // ?type=internship | completion   ·   ?from=<internship offer id> copies the intern's details
  const { type, from } = await searchParams;
  const t = ["internship", "completion"].includes(type) ? type : "job";
  return <OfferForm defaults={await newOfferDefaults(t, from || "")} />;
}
