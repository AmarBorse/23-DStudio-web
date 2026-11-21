import { requireAdmin } from "@/lib/auth";
import { newOfferDefaults } from "@/lib/offerDefaults";
import OfferForm from "@/components/admin/OfferForm";
import { OFFER_TYPE_IDS } from "@/lib/offer";

export default async function NewOffer({ searchParams }) {
  await requireAdmin();
  // ?type=internship | completion | certificate   ·   ?from=<internship offer id> copies the intern's details
  const { type, from } = await searchParams;
  const t = OFFER_TYPE_IDS.includes(type) ? type : "job";
  return <OfferForm defaults={await newOfferDefaults(t, from || "")} />;
}
