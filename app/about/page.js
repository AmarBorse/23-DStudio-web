import PageHero from "@/components/PageHero";
import AboutIntro from "@/components/AboutIntro";
import VisionMission from "@/components/VisionMission";
import WhoWeWorkWith from "@/components/WhoWeWorkWith";
import Team from "@/components/Team";
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
      <PageHero
        current="about"
        image="/images/about-hero.jpg"
        alt="Architect's desk with a monitor showing a 3D render of a modern building"
        title="About Us"
        x={337.5}
        y={430.9}
        size={131.7}
        mobileSize={15.5}
      />
      <main>
        <AboutIntro />
        <VisionMission />
        <WhoWeWorkWith />
        <Team />
      </main>
      <Footer />
      <ChatButton />
      <Animations />
    </>
  );
}
