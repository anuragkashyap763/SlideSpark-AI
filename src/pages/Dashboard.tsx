
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Loader2, Send, Download, LogOut, Sparkles } from "lucide-react";
import { SlidePreview } from "@/components/SlidePreview";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Progress } from "@/components/ui/progress";

interface Slide {
  title: string;
  content: string[];
  notes?: string;
  image_url?: string;
}

interface Presentation {
  id: string;
  title: string;
  slide_data: Slide[];
  file_url: string | null;
  created_at: string;
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [currentPresentation, setCurrentPresentation] =
    useState<Presentation | null>(null);
  const [presentations, setPresentations] = useState<Presentation[]>([]);

  // Streaming progress tracking
  const [progress, setProgress] = useState(0);
  const [streamedText, setStreamedText] = useState("");

  useEffect(() => {
    if (user) loadPresentations();
  }, [user]);

  const loadPresentations = async () => {
    const { data, error } = await supabase
      .from("presentations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading presentations:", error);
    } else {
      setPresentations(data || []);
    }
  };

  // ✅ UPDATED handleGenerate with better streaming parsing
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({ title: "Please enter a prompt", variant: "destructive" });
      return;
    }

    setLoading(true);
    setProgress(10);
    setStreamedText("");

    try {
      // Securely fetch JWT for streaming request
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      if (!token) {
        throw new Error("Not authenticated. Please sign in again.");
      }

      // Call the streaming endpoint directly
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-slides`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt, title: prompt.substring(0, 50) }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Response error:", errorText);
        throw new Error(`Server error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response stream available");
      }

      const decoder = new TextDecoder();
      let fullText = "";
      let lastUpdateTime = Date.now();

      // Stream response chunks
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;

        // Update UI with latest chunk (throttled)
        const now = Date.now();
        if (now - lastUpdateTime > 200) {
          // Update every 200ms max
          const lines = fullText.split("\n");
          const lastLine = lines[lines.length - 2] || lines[lines.length - 1];
          setStreamedText(lastLine.slice(0, 100));
          setProgress((p) => Math.min(90, p + 5));
          lastUpdateTime = now;
        }
      }

      setProgress(95);
      console.log("Full streamed text:", fullText);

      // Parse the final JSON response
      try {
        // The JSON is at the end after all the progress messages
        const jsonMatch = fullText.match(/\{[\s\S]*"presentation"[\s\S]*\}/);

        if (!jsonMatch) {
          console.error("No JSON found in response:", fullText);
          throw new Error("Invalid response format from server");
        }

        const parsed = JSON.parse(jsonMatch[0]);

        if (!parsed.presentation) {
          throw new Error("No presentation data in response");
        }

        setProgress(100);
        setCurrentPresentation(parsed.presentation);

        toast({
          title: "Success! 🎉",
          description: "Your presentation is ready!",
        });

        // Reload presentations list
        await loadPresentations();
      } catch (parseError) {
        console.error("Parse error:", parseError);
        console.error("Attempted to parse:", fullText.slice(-500));

        throw new Error("Failed to parse AI response. Please try again.");
      }
    } catch (error) {
      console.error("Generation error:", error);
      toast({
        title: "Error generating presentation",
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setTimeout(() => {
        setProgress(0);
        setStreamedText("");
      }, 1500);
    }
  };

  // Export handler (unchanged)
  const handleExport = async () => {
    if (!currentPresentation) return;

    setExporting(true);
    try {
      const { data, error } = await supabase.functions.invoke("export-pptx", {
        body: { presentationId: currentPresentation.id },
      });

      if (error) throw error;
      if (!data?.url) throw new Error("No export URL returned.");

      const fileUrl = data.url;
      const fileName = `${currentPresentation.title || "presentation"}.pptx`;

      const response = await fetch(fileUrl);
      const blob = await response.blob();

      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = fileName;
      downloadLink.style.display = "none";

      document.body.appendChild(downloadLink);
      downloadLink.click();

      URL.revokeObjectURL(downloadLink.href);
      document.body.removeChild(downloadLink);

      toast({ title: "Presentation downloaded successfully!" });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Error exporting presentation",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-[#7c3bed]">
              SlideSpark AI
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user?.email}
            </span>
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Section */}
          <div className="space-y-6">
            {/* Generate Card */}
            <Card className="p-6 bg-gradient-to-br from-card to-card/50 shadow-elegant border-primary/10">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Generate Presentation
              </h2>
              <div className="space-y-4">
                <Input
                  placeholder="Describe your presentation... (e.g., 'Climate change impacts and solutions')"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && !loading && handleGenerate()
                  }
                  className="bg-background/50"
                  disabled={loading}
                />
                <Button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-opacity"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Generate Slides
                    </>
                  )}
                </Button>

                {/* Progress bar with streaming feedback */}
                {loading && (
                  <div className="space-y-2">
                    <Progress value={progress} className="h-2" />
                    <p className="text-sm text-muted-foreground truncate animate-pulse">
                      {streamedText || "🚀 Starting generation..."}
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Presentations List */}
            <Card className="p-6 bg-gradient-to-br from-card to-card/50 shadow-elegant border-primary/10">
              <h2 className="text-xl font-semibold mb-4">Your Presentations</h2>
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {presentations.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No presentations yet. Create your first one!
                  </p>
                ) : (
                  presentations.map((pres) => (
                    <button
                      key={pres.id}
                      onClick={() => setCurrentPresentation(pres)}
                      className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                        currentPresentation?.id === pres.id
                          ? "bg-primary text-primary-foreground shadow-glow scale-[1.02]"
                          : "hover:bg-accent hover:scale-[1.01]"
                      }`}
                    >
                      <p className="font-medium truncate">{pres.title}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(pres.created_at).toLocaleDateString()} •{" "}
                        {pres.slide_data?.length || 0} slides
                      </p>
                    </button>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Right Section - Preview */}
          <div className="space-y-6">
            {currentPresentation ? (
              <>
                <Card className="p-4 bg-gradient-to-br from-card to-card/50 shadow-elegant border-primary/10">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h2 className="text-xl font-semibold">
                        {currentPresentation.title}
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        {currentPresentation.slide_data?.length || 0} slides
                      </p>
                    </div>
                    <Button
                      onClick={handleExport}
                      disabled={exporting}
                      className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90"
                    >
                      {exporting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Exporting...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Export PPTX
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
                <SlidePreview slides={currentPresentation.slide_data} />
              </>
            ) : (
              <Card className="p-12 bg-gradient-to-br from-card to-card/50 shadow-elegant border-primary/10">
                <div className="text-center text-muted-foreground">
                  <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">
                    Select a presentation or create a new one to get started
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}













