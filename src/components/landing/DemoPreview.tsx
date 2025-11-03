import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, PresentationIcon, MessageSquare } from "lucide-react";

export function DemoPreview() {
  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">
            See SlideSpark AI in action
          </h2>
          <p className="text-lg text-muted-foreground">
            From prompt to professional presentation in seconds
          </p>
        </div>

        <Card className="max-w-5xl mx-auto overflow-hidden bg-card/80 backdrop-blur-sm border-primary/10">
          <Tabs defaultValue="generate" className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b bg-muted/30 h-14 p-0">
              <TabsTrigger value="generate" className="gap-2 h-full rounded-none data-[state=active]:bg-background">
                <MessageSquare className="w-4 h-4" />
                Generate
              </TabsTrigger>
              <TabsTrigger value="edit" className="gap-2 h-full rounded-none data-[state=active]:bg-background">
                <FileText className="w-4 h-4" />
                Edit
              </TabsTrigger>
              <TabsTrigger value="export" className="gap-2 h-full rounded-none data-[state=active]:bg-background">
                <PresentationIcon className="w-4 h-4" />
                Export
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="generate" className="p-8 m-0">
              <div className="space-y-6">
                <div className="bg-muted/50 rounded-lg p-6 border-l-4 border-primary">
                  <p className="text-sm text-muted-foreground mb-2">Your prompt:</p>
                  <p className="text-lg">"Create a 10-slide presentation about climate change solutions"</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="aspect-video bg-gradient-to-br from-primary/20 to-primary-glow/10 rounded-lg border border-primary/20 flex items-center justify-center">
                      <span className="text-sm text-muted-foreground">Slide {i}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="edit" className="p-8 m-0">
              <div className="space-y-6">
                <div className="bg-muted/50 rounded-lg p-6 border-l-4 border-primary">
                  <p className="text-sm text-muted-foreground mb-2">Edit command:</p>
                  <p className="text-lg">"Make slide 2 more focused on renewable energy"</p>
                </div>
                <div className="bg-primary/5 rounded-lg p-6 border border-primary/20">
                  <p className="text-muted-foreground">AI is updating your presentation...</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="export" className="p-8 m-0">
              <div className="space-y-6">
                <div className="bg-muted/50 rounded-lg p-6 text-center">
                  <PresentationIcon className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <p className="text-lg font-semibold mb-2">Ready to export</p>
                  <p className="text-muted-foreground">Download as PowerPoint (.pptx) or continue editing</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </section>
  );
}
