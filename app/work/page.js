import PageHero from "@/components/PageHero";
import WorkGallery from "@/components/WorkGallery";
import { getCategoriesWithProjects } from "@/lib/content";
import Footer from "@/components/Footer";
import ChatButton from "@/components/ChatButton";
import Animations from "@/components/Animations";

export const metadata = {
  title: "Our Work — 23D Studio",
  description: "Selected architectural visualisation, walkthrough and virtual reality projects by 23D Studio, Nashik.",
};

// Refreshed instantly when a project is saved in the admin; this is a fallback
export const revalidate = 3600;

export default async function WorkPage() {
  const groups = await getCategoriesWithProjects();
  return (
    <>
      <PageHero
        current="work"
        image="/images/work-hero.jpg"
        alt="Render of a waterfront with yachts and high-rise towers under clouds"
        title="Our Work"
        x={298.6}
        y={410.3}
        size={131.74}
        wordSpacing={-0.155}
        mobileSize={16.5}
      />
      <main>
        <WorkGallery groups={groups} />
      </main>
      <Footer />
      <ChatButton />
      <Animations />
    </>
  );
}
