import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Animated gradient orb */}
      <div className="absolute right-0 top-0 w-[800px] h-[800px] opacity-30">
        <div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-primary via-primary-glow to-transparent blur-3xl animate-pulse"
          style={{ animationDuration: "4s" }}
        />
      </div>

      <div className="container relative z-10 px-4 mx-auto">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">
              AI-Powered Presentation Generator
            </span>
          </div>

          {/* <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            Create Stunning Presentations
            <br />
            <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              in Seconds with AI
            </span>
          </h1> */}

          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            Create Stunning Presentations
            <br />
            <span className="bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
              in Seconds with AI
            </span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform your ideas into professional slide decks instantly.
            Powered by advanced AI to save you time and deliver exceptional
            results.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button
              size="lg"
              className="group relative overflow-hidden"
              onClick={() => navigate("/auth")}
            >
              <span className="relative z-10 flex items-center gap-2">
                Try it Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() =>
                document
                  .getElementById("features")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              See Features
            </Button>
          </div>

          <div className="pt-8 flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full bg-primary animate-pulse"
                style={{ animationDelay: "0.5s" }}
              />
              <span>Free forever plan</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
