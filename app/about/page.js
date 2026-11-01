import AboutHero from "@/components/AboutHero";
import AboutIntro from "@/components/AboutIntro";
import VisionMission from "@/components/VisionMission";
import WhoWeWorkWith from "@/components/WhoWeWorkWith";
import Footer from "@/components/Footer";
import ChatButton from "@/components/ChatButton";
import Animations from "@/components/Animations";

export const metadata = {
  title: "About Us — 23D Studio",
  description:
    "23D Studio is an architectural visualisation studio established in 2022, based in Nashik, Maharashtra, creating renders, walkthroughs and virtual reality tours.",
};

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <main>
        <AboutIntro />
        <VisionMission />
        <WhoWeWorkWith />
      </main>
      <Footer />
      <ChatButton />
      <Animations />
    </>
  );
}
