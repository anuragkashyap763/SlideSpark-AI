import { Header } from "./Header";
import { Hero } from "./Hero";
import { Features } from "./Features";
import { DemoPreview } from "./DemoPreview";
import { Pricing } from "./Pricing";
import { Footer } from "./Footer";

export default function Landing() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <Header />
      <Hero />
      <Features />
      <DemoPreview />
      <Pricing />
      <Footer />
    </div>
  );
}
