import PageHero from "@/components/PageHero";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import ChatButton from "@/components/ChatButton";
import Animations from "@/components/Animations";

export const metadata = {
  title: "Contact Us — 23D Studio",
  description: "Get in touch with 23D Studio, Nashik, for architectural renders, walkthroughs and virtual reality tours.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        current="contact"
        image="/images/contact-hero.jpg"
        alt="Architectural model of a modern house on a desk with drawings and material samples"
        title="Contact Us"
        x={354.4}
        y={433.5}
        size={110.7}
        mobileSize={15}
      />
      <main>
        <ContactSection />
      </main>
      <Footer />
      <ChatButton />
      <Animations />
    </>
  );
}
