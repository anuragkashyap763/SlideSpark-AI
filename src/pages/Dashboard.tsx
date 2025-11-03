import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Loader2, Send, Download, LogOut, Sparkles } from 'lucide-react';
import { SlidePreview } from '@/components/SlidePreview';
import { ThemeToggle } from '@/components/ThemeToggle';

interface Slide {
  title: string;
  content: string[];
  notes?: string;
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
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [currentPresentation, setCurrentPresentation] = useState<Presentation | null>(null);
  const [presentations, setPresentations] = useState<Presentation[]>([]);

  useEffect(() => {
    if (user) {
      loadPresentations();
    }
  }, [user]);

  const loadPresentations = async () => {
    const { data, error } = await supabase
      .from('presentations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading presentations:', error);
    } else {
      setPresentations(data || []);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({ title: 'Please enter a prompt', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-slides', {
        body: { prompt, title: prompt.substring(0, 50) }
      });

      if (error) throw error;

      setCurrentPresentation(data.presentation);
      toast({ title: 'Presentation generated successfully!' });
      loadPresentations();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error generating presentation',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!currentPresentation) return;

    setExporting(true);
    try {
      const { data, error } = await supabase.functions.invoke('export-pptx', {
        body: { presentationId: currentPresentation.id }
      });

      if (error) throw error;

      window.open(data.url, '_blank');
      toast({ title: 'Presentation exported successfully!' });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error exporting presentation',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              AI Slide Generator
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">{user?.email}</span>
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card className="p-6 bg-gradient-to-br from-card to-card/50 shadow-elegant border-primary/10">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Generate Presentation
              </h2>
              <div className="space-y-4">
                <Input
                  placeholder="Describe your presentation... (e.g., 'Create a presentation about climate change')"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !loading && handleGenerate()}
                  className="bg-background/50"
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
              </div>
            </Card>

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
                          ? 'bg-primary text-primary-foreground shadow-glow scale-[1.02]'
                          : 'hover:bg-accent hover:scale-[1.01]'
                      }`}
                    >
                      <p className="font-medium truncate">{pres.title}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(pres.created_at).toLocaleDateString()}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            {currentPresentation ? (
              <>
                <Card className="p-4 bg-gradient-to-br from-card to-card/50 shadow-elegant border-primary/10">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-xl font-semibold">{currentPresentation.title}</h2>
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
                  <p className="text-lg">Select a presentation or create a new one to get started</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

















// import React, { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Card, CardContent } from "@/components/ui/card";
// import { Progress } from "@/components/ui/progress";
// import { useAuth } from "@/hooks/useAuth";
// import { Download } from "lucide-react";

// export default function Dashboard() {
//   const { user } = useAuth();
//   const [prompt, setPrompt] = useState("");
//   const [slides, setSlides] = useState<any[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [progress, setProgress] = useState(0);
//   const [error, setError] = useState<string | null>(null);
//   const [pptBase64, setPptBase64] = useState<string | null>(null);

//   // 🔹 Function to call /api/generate
//   const generateSlides = async () => {
//     if (!prompt.trim()) return;
//     setLoading(true);
//     setError(null);
//     setSlides([]);
//     setPptBase64(null);
//     setProgress(0);

//     try {
//       // 1️⃣ Start a progress stream (simulate live generation)
//       const eventSource = new EventSource("/api/progress");
//       eventSource.onmessage = (e) => setProgress(Number(e.data));
//       eventSource.onerror = () => eventSource.close();

//       // 2️⃣ Send prompt to Gemini backend
//       const res = await fetch("/api/generate", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ prompt, userId: user?.id }),
//       });

//       if (!res.ok) throw new Error("Failed to generate slides");
//       const data = await res.json();
//       setSlides(data.slides || []);

//       eventSource.close();
//       setProgress(100);
//     } catch (err: any) {
//       console.error("Error generating slides:", err);
//       setError(err.message || "Something went wrong");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // 🔹 Function to export generated slides as PPTX
//   const exportPPT = async () => {
//     try {
//       setLoading(true);
//       const res = await fetch("/api/export", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ slides }),
//       });

//       if (!res.ok) throw new Error("Failed to export PPT");
//       const { pptx } = await res.json();

//       // Convert Base64 string → downloadable PPTX
//       const link = document.createElement("a");
//       link.href = `data:application/vnd.openxmlformats-officedocument.presentationml.presentation;base64,${pptx}`;
//       link.download = `SlideSpark-${Date.now()}.pptx`;
//       link.click();
//     } catch (err: any) {
//       console.error(err);
//       setError("Failed to export PPTX");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-background text-foreground flex flex-col items-center p-8 animate-fade-in">
//       <Card className="w-full max-w-2xl shadow-xl p-6 bg-card/80 backdrop-blur-md">
//         <CardContent>
//           <h1 className="text-2xl font-bold mb-4 text-center">🎨 SlideSpark AI</h1>
//           <p className="text-sm text-muted-foreground mb-4 text-center">
//             Generate professional AI-powered presentations instantly.
//           </p>

//           <div className="flex gap-2 mb-4">
//             <Input
//               placeholder="Enter your topic or idea..."
//               value={prompt}
//               onChange={(e) => setPrompt(e.target.value)}
//               disabled={loading}
//             />
//             <Button onClick={generateSlides} disabled={loading || !prompt.trim()}>
//               {loading ? "Generating..." : "Generate"}
//             </Button>
//           </div>

//           {progress > 0 && (
//             <div className="w-full mb-4">
//               <Progress value={progress} />
//               <p className="text-xs text-muted-foreground mt-1">Progress: {progress}%</p>
//             </div>
//           )}

//           {error && (
//             <p className="text-red-500 text-sm text-center mb-2">{error}</p>
//           )}

//           {slides.length > 0 && (
//             <div className="mt-4 space-y-4">
//               {slides.map((slide, i) => (
//                 <Card key={i} className="border border-border bg-muted/40 p-3">
//                   <h3 className="font-semibold">{slide.title || `Slide ${i + 1}`}</h3>
//                   <ul className="list-disc pl-6 text-sm text-muted-foreground">
//                     {slide.content?.map((point: string, j: number) => (
//                       <li key={j}>{point}</li>
//                     ))}
//                   </ul>
//                 </Card>
//               ))}

//               <div className="text-center mt-6">
//                 <Button onClick={exportPPT} disabled={loading}>
//                   <Download className="w-4 h-4 mr-2" /> Download PPTX
//                 </Button>
//               </div>
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }





















// import React, { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Card, CardContent } from "@/components/ui/card";
// import { Progress } from "@/components/ui/progress";
// import { useAuth } from "@/hooks/useAuth";
// import { supabase } from "@/integrations/supabase/client";
// import { Download, RefreshCw, Clock } from "lucide-react";

// export default function Dashboard() {
//   const { user } = useAuth();
//   const [prompt, setPrompt] = useState("");
//   const [slides, setSlides] = useState<any[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [progress, setProgress] = useState(0);
//   const [error, setError] = useState<string | null>(null);
//   const [history, setHistory] = useState<any[]>([]);

//   useEffect(() => {
//     if (user?.id) fetchHistory();
//   }, [user]);

//   // ✅ Fetch saved presentations
//   const fetchHistory = async () => {
//     try {
//       const session = await supabase.auth.getSession();
//       const token = session.data.session?.access_token;

//       const res = await fetch(`/api/history`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       if (!res.ok) throw new Error("Failed to fetch history");
//       const { data } = await res.json();
//       setHistory(data || []);
//     } catch (err: any) {
//       console.error("Error fetching history:", err);
//     }
//   };

//   // ✅ Generate slides with Gemini API
//   const generateSlides = async () => {
//     if (!prompt.trim()) return;
//     setLoading(true);
//     setError(null);
//     setSlides([]);
//     setProgress(0);

//     try {
//       const eventSource = new EventSource("/api/progress");
//       eventSource.onmessage = (e) => setProgress(Number(e.data));
//       eventSource.onerror = () => eventSource.close();

//       const session = await supabase.auth.getSession();
//       const token = session.data.session?.access_token;

//       const res = await fetch("/api/generate", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ prompt, userId: user?.id }),
//       });

//       if (!res.ok) throw new Error("Failed to generate slides");
//       const data = await res.json();
//       const generatedSlides = data.slides || [];
//       setSlides(generatedSlides);

//       // Save to Supabase securely
//       await fetch("/api/history", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           title: prompt,
//           slides: generatedSlides,
//         }),
//       });

//       fetchHistory();
//       eventSource.close();
//       setProgress(100);
//     } catch (err: any) {
//       console.error("Error generating slides:", err);
//       setError(err.message || "Something went wrong");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const exportPPT = async (slidesToExport = slides) => {
//     try {
//       setLoading(true);
//       const res = await fetch("/api/export", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ slides: slidesToExport }),
//       });
//       if (!res.ok) throw new Error("Failed to export PPT");
//       const { pptx } = await res.json();

//       const link = document.createElement("a");
//       link.href = `data:application/vnd.openxmlformats-officedocument.presentationml.presentation;base64,${pptx}`;
//       link.download = `SlideSpark-${Date.now()}.pptx`;
//       link.click();
//     } catch (err: any) {
//       console.error(err);
//       setError("Failed to export PPTX");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadFromHistory = (item: any) => {
//     setPrompt(item.title);
//     setSlides(item.slides_json || []);
//   };

//   return (
//     <div className="min-h-screen bg-background text-foreground flex flex-col items-center p-8 animate-fade-in">
//       <Card className="w-full max-w-3xl shadow-xl p-6 bg-card/80 backdrop-blur-md">
//         <CardContent>
//           <h1 className="text-3xl font-bold mb-4 text-center text-primary">
//             🎨 SlideSpark AI
//           </h1>

//           <div className="flex gap-2 mb-4">
//             <Input
//               placeholder="Enter your topic or idea..."
//               value={prompt}
//               onChange={(e) => setPrompt(e.target.value)}
//               disabled={loading}
//             />
//             <Button onClick={generateSlides} disabled={loading || !prompt.trim()}>
//               {loading ? (
//                 <>
//                   <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Generating...
//                 </>
//               ) : (
//                 "Generate"
//               )}
//             </Button>
//           </div>

//           {progress > 0 && (
//             <div className="w-full mb-4">
//               <Progress value={progress} />
//               <p className="text-xs text-muted-foreground mt-1 text-center">
//                 Progress: {progress}%
//               </p>
//             </div>
//           )}

//           {error && <p className="text-red-500 text-sm text-center mb-2">{error}</p>}

//           {slides.length > 0 && (
//             <div className="mt-4 space-y-4">
//               {slides.map((slide, i) => (
//                 <Card key={i} className="border border-border bg-muted/40 p-3">
//                   <h3 className="font-semibold">{slide.title || `Slide ${i + 1}`}</h3>
//                   <ul className="list-disc pl-6 text-sm text-muted-foreground">
//                     {slide.content?.map((point: string, j: number) => (
//                       <li key={j}>{point}</li>
//                     ))}
//                   </ul>
//                 </Card>
//               ))}

//               <div className="text-center mt-6">
//                 <Button onClick={() => exportPPT(slides)} disabled={loading}>
//                   <Download className="w-4 h-4 mr-2" /> Download PPTX
//                 </Button>
//               </div>
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {history.length > 0 && (
//         <Card className="w-full max-w-3xl mt-10 p-6 bg-card/70">
//           <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
//             <Clock className="w-5 h-5 text-primary" /> My Presentations
//           </h2>
//           <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
//             {history.map((item, i) => (
//               <div
//                 key={i}
//                 className="border border-border rounded-lg p-3 cursor-pointer hover:bg-muted/40 transition"
//                 onClick={() => loadFromHistory(item)}
//               >
//                 <h3 className="font-medium truncate">{item.title}</h3>
//                 <p className="text-xs text-muted-foreground">
//                   {new Date(item.created_at).toLocaleString()}
//                 </p>
//                 <div className="flex gap-2 mt-2">
//                   <Button
//                     size="sm"
//                     variant="secondary"
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       exportPPT(item.slides_json);
//                     }}
//                   >
//                     <Download className="w-3 h-3 mr-1" /> Download
//                   </Button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </Card>
//       )}
//     </div>
//   );
// }
