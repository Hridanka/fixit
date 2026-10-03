import { createFileRoute } from "@tanstack/react-router";
import { FixitProvider } from "@/components/fixit/context";
import { Hero } from "@/components/fixit/Hero";
import { Analyzer } from "@/components/fixit/Analyzer";
import { Features, HowItWorks, CliSection, Footer, Nav } from "@/components/fixit/Sections";
import { ChatPanel } from "@/components/fixit/ChatPanel";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "fixit — AI error finder & fixer for developers" },
      { name: "description", content: "Paste code or an error, pick a language, and fixit finds every bug and returns the complete fixed file with explanations." },
      { property: "og:title", content: "fixit — AI error finder & fixer" },
      { property: "og:description", content: "Find every error and get the complete fixed code in 12 languages." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <FixitProvider>
      <div className="relative min-h-screen overflow-x-hidden">
        <div aria-hidden className="pointer-events-none fixed inset-0 bg-grid" />
        <div aria-hidden className="pointer-events-none fixed inset-0 bg-aurora" />
        <div className="relative">
          <Nav />
          <main>
            <Hero />
            <Analyzer />
            <Features />
            <HowItWorks />
            <CliSection />
          </main>
          <Footer />
        </div>
        <ChatPanel />
      </div>
    </FixitProvider>
  );
}
