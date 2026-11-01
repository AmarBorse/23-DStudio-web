import PageHero from "@/components/PageHero";
import { VisualisationSection, ServiceSection, others } from "@/components/ServiceList";
import Footer from "@/components/Footer";
import ChatButton from "@/components/ChatButton";
import Animations from "@/components/Animations";

export const metadata = {
  title: "Our Services — 23D Studio",
  description:
    "Architectural visualisation, architectural walkthroughs and virtual reality tours by 23D Studio, Nashik.",
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        current="services"
        image="/images/services-hero.jpg"
        alt="Aerial render of a garden with a swimming pool, lawn and trees"
        title="Our Services"
        x={249.6}
        y={451.8}
        size={112.66}
        mobileSize={12.6}
      />
      <main>
        <VisualisationSection />
        {others.map((s) => (
          <ServiceSection s={s} key={s.key} />
        ))}
      </main>
      <Footer />
      <ChatButton />
      <Animations />
    </>
  );
}
