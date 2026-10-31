import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import Services from "@/components/Services";
import Process from "@/components/Process";
import Footer from "@/components/Footer";
import ChatButton from "@/components/ChatButton";

export default function Home() {
  return (
    <>
      <Hero />
      <main>
        <Stats />
        <Services />
        <Process />
      </main>
      <Footer />
      <ChatButton />
    </>
  );
}
