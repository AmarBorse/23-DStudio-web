import { requireAdmin } from "@/lib/auth";
import { newOfferDefaults } from "@/lib/offerDefaults";
import OfferForm from "@/components/admin/OfferForm";

export default async function NewOffer({ searchParams }) {
  await requireAdmin();
  const { type } = await searchParams; // ?type=internship
  return <OfferForm defaults={await newOfferDefaults(type === "internship" ? "internship" : "job")} />;
}
