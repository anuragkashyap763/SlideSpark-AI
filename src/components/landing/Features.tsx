import { Sparkles, Zap, Download, Wand2, Palette, Brain } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Generation",
    description: "Advanced AI creates professional presentations from simple prompts in seconds."
  },
  {
    icon: Wand2,
    title: "Smart Editing",
    description: "Refine and update your slides with natural language commands."
  },
  {
    icon: Palette,
    title: "Beautiful Designs",
    description: "Professionally designed templates that make your content shine."
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Generate complete presentations in under 30 seconds."
  },
  {
    icon: Download,
    title: "Export Anywhere",
    description: "Download as PowerPoint or share directly with your team."
  },
  {
    icon: Sparkles,
    title: "Always Improving",
    description: "Continuous AI updates ensure you get the best results."
  }
];

export function Features() {
  return (
    <section id="features" className="py-24 relative">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">
            Everything you need to create
            <span className="block bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              amazing presentations
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Powerful features designed to make presentation creation effortless
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-card/50 backdrop-blur-sm border-primary/10"
              style={{
                animation: `fade-in 0.5s ease-out ${index * 0.1}s both`
              }}
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
