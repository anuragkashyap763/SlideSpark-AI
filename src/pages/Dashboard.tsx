// import { useState, useEffect } from 'react';
// import { useAuth } from '@/hooks/useAuth';
// import { supabase } from '@/integrations/supabase/client';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Card } from '@/components/ui/card';
// import { toast } from '@/hooks/use-toast';
// import { Loader2, Send, Download, LogOut, Sparkles } from 'lucide-react';
// import { SlidePreview } from '@/components/SlidePreview';
// import { ThemeToggle } from '@/components/ThemeToggle';

// interface Slide {
//   title: string;
//   content: string[];
//   notes?: string;
// }

// interface Presentation {
//   id: string;
//   title: string;
//   slide_data: Slide[];
//   file_url: string | null;
//   created_at: string;
// }

// export default function Dashboard() {
//   const { user, signOut } = useAuth();
//   const [prompt, setPrompt] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [exporting, setExporting] = useState(false);
//   const [currentPresentation, setCurrentPresentation] = useState<Presentation | null>(null);
//   const [presentations, setPresentations] = useState<Presentation[]>([]);

//   useEffect(() => {
//     if (user) {
//       loadPresentations();
//     }
//   }, [user]);

//   const loadPresentations = async () => {
//     const { data, error } = await supabase
//       .from('presentations')
//       .select('*')
//       .order('created_at', { ascending: false });

//     if (error) {
//       console.error('Error loading presentations:', error);
//     } else {
//       setPresentations(data || []);
//     }
//   };

//   const handleGenerate = async () => {
//     if (!prompt.trim()) {
//       toast({ title: 'Please enter a prompt', variant: 'destructive' });
//       return;
//     }

//     setLoading(true);
//     try {
//       const { data, error } = await supabase.functions.invoke('generate-slides', {
//         body: { prompt, title: prompt.substring(0, 50) }
//       });

//       if (error) throw error;

//       setCurrentPresentation(data.presentation);
//       toast({ title: 'Presentation generated successfully!' });
//       loadPresentations();
//     } catch (error) {
//       console.error('Error:', error);
//       toast({
//         title: 'Error generating presentation',
//         description: error instanceof Error ? error.message : 'Unknown error',
//         variant: 'destructive'
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleExport = async () => {
//     if (!currentPresentation) return;

//     setExporting(true);
//     try {
//       const { data, error } = await supabase.functions.invoke('export-pptx', {
//         body: { presentationId: currentPresentation.id }
//       });

//       if (error) throw error;

//       window.open(data.url, '_blank');
//       toast({ title: 'Presentation exported successfully!' });
//     } catch (error) {
//       console.error('Error:', error);
//       toast({
//         title: 'Error exporting presentation',
//         description: error instanceof Error ? error.message : 'Unknown error',
//         variant: 'destructive'
//       });
//     } finally {
//       setExporting(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-background">
//       <header className="border-b backdrop-blur-sm bg-background/80 sticky top-0 z-50">
//         <div className="container mx-auto px-4 py-4 flex justify-between items-center">
//           <div className="flex items-center gap-2">
//             <Sparkles className="w-6 h-6 text-primary" />
//             <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
//               AI Slide Generator
//             </h1>
//           </div>
//           <div className="flex items-center gap-3">
//             <span className="text-sm text-muted-foreground hidden sm:inline">{user?.email}</span>
//             <ThemeToggle />
//             <Button variant="outline" size="sm" onClick={signOut}>
//               <LogOut className="w-4 h-4 mr-2" />
//               Sign Out
//             </Button>
//           </div>
//         </div>
//       </header>

//       <main className="container mx-auto px-4 py-8 max-w-7xl">
//         <div className="grid lg:grid-cols-2 gap-8">
//           <div className="space-y-6">
//             <Card className="p-6 bg-gradient-to-br from-card to-card/50 shadow-elegant border-primary/10">
//               <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
//                 <Sparkles className="w-5 h-5 text-primary" />
//                 Generate Presentation
//               </h2>
//               <div className="space-y-4">
//                 <Input
//                   placeholder="Describe your presentation... (e.g., 'Create a presentation about climate change')"
//                   value={prompt}
//                   onChange={(e) => setPrompt(e.target.value)}
//                   onKeyPress={(e) => e.key === 'Enter' && !loading && handleGenerate()}
//                   className="bg-background/50"
//                 />
//                 <Button 
//                   onClick={handleGenerate} 
//                   disabled={loading} 
//                   className="w-full bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-opacity"
//                 >
//                   {loading ? (
//                     <>
//                       <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                       Generating...
//                     </>
//                   ) : (
//                     <>
//                       <Send className="w-4 h-4 mr-2" />
//                       Generate Slides
//                     </>
//                   )}
//                 </Button>
//               </div>
//             </Card>

//             <Card className="p-6 bg-gradient-to-br from-card to-card/50 shadow-elegant border-primary/10">
//               <h2 className="text-xl font-semibold mb-4">Your Presentations</h2>
//               <div className="space-y-2 max-h-[500px] overflow-y-auto">
//                 {presentations.length === 0 ? (
//                   <p className="text-center text-muted-foreground py-8">
//                     No presentations yet. Create your first one!
//                   </p>
//                 ) : (
//                   presentations.map((pres) => (
//                     <button
//                       key={pres.id}
//                       onClick={() => setCurrentPresentation(pres)}
//                       className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
//                         currentPresentation?.id === pres.id
//                           ? 'bg-primary text-primary-foreground shadow-glow scale-[1.02]'
//                           : 'hover:bg-accent hover:scale-[1.01]'
//                       }`}
//                     >
//                       <p className="font-medium truncate">{pres.title}</p>
//                       <p className="text-xs opacity-70 mt-1">
//                         {new Date(pres.created_at).toLocaleDateString()}
//                       </p>
//                     </button>
//                   ))
//                 )}
//               </div>
//             </Card>
//           </div>

//           <div className="space-y-6">
//             {currentPresentation ? (
//               <>
//                 <Card className="p-4 bg-gradient-to-br from-card to-card/50 shadow-elegant border-primary/10">
//                   <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//                     <h2 className="text-xl font-semibold">{currentPresentation.title}</h2>
//                     <Button 
//                       onClick={handleExport} 
//                       disabled={exporting}
//                       className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90"
//                     >
//                       {exporting ? (
//                         <>
//                           <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                           Exporting...
//                         </>
//                       ) : (
//                         <>
//                           <Download className="w-4 h-4 mr-2" />
//                           Export PPTX
//                         </>
//                       )}
//                     </Button>
//                   </div>
//                 </Card>
//                 <SlidePreview slides={currentPresentation.slide_data} />
//               </>
//             ) : (
//               <Card className="p-12 bg-gradient-to-br from-card to-card/50 shadow-elegant border-primary/10">
//                 <div className="text-center text-muted-foreground">
//                   <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-50" />
//                   <p className="text-lg">Select a presentation or create a new one to get started</p>
//                 </div>
//               </Card>
//             )}
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }























// import React, { useEffect, useState } from "react";
// import { createClient } from "@supabase/supabase-js";
// import pptxgen from "pptxgenjs";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Card } from "@/components/ui/card";
// import { Progress } from "@/components/ui/progress";
// import { useAuth } from "@/hooks/useAuth";

// const supabase = createClient(
//   import.meta.env.VITE_SUPABASE_URL!,
//   import.meta.env.VITE_SUPABASE_ANON_KEY!
// );

// export default function Dashboard() {
//   const { user, signOut } = useAuth();

//   const [prompt, setPrompt] = useState("");
//   const [slides, setSlides] = useState<any[]>([]);
//   const [presentations, setPresentations] = useState<any[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [progress, setProgress] = useState(0);

//   // ✅ Fetch existing presentations from Supabase
//   useEffect(() => {
//     const fetchPresentations = async () => {
//       if (!user) return;
//       const { data, error } = await supabase
//         .from("presentations")
//         .select("*")
//         .eq("user_id", user.id)
//         .order("created_at", { ascending: false });

//       if (!error && data) setPresentations(data);
//     };
//     fetchPresentations();
//   }, [user]);

//   // ✅ Generate slides via Supabase Function
//   const handleGenerate = async () => {
//     if (!prompt.trim()) return alert("Please enter a topic for your presentation.");
//     setLoading(true);
//     setProgress(0);

//     try {
//       // fake progress animation
//       const interval = setInterval(() => setProgress((p) => Math.min(p + 10, 90)), 400);

//       const res = await fetch(
//         `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-slides`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${user?.access_token || ""}`,
//           },
//           body: JSON.stringify({ prompt }),
//         }
//       );

//       clearInterval(interval);
//       setProgress(100);

//       if (!res.ok) throw new Error("Failed to generate slides");

//       const data = await res.json();
//       const generatedSlides = data.slides || [];
//       setSlides(generatedSlides);

//       // ✅ Save to Supabase presentations table
//       const { data: inserted, error } = await supabase
//         .from("presentations")
//         .insert([
//           {
//             user_id: user.id,
//             title: prompt,
//             slide_data: generatedSlides,
//           },
//         ])
//         .select();

//       if (error) console.error("Insert error:", error);
//       else setPresentations((prev) => [inserted[0], ...prev]);
//     } catch (err: any) {
//       console.error("Error generating slides:", err);
//       alert("Error generating slides. Check console for details.");
//     } finally {
//       setLoading(false);
//       setProgress(0);
//     }
//   };

//   // ✅ Download PPTX
//   const downloadPPT = () => {
//     const pptx = new pptxgen();
//     slides.forEach((slideData) => {
//       const slide = pptx.addSlide();
//       slide.addText(slideData.title, { x: 1, y: 0.5, fontSize: 24, bold: true });
//       slide.addText(slideData.content.join("\n"), { x: 1, y: 1.2, fontSize: 18 });
//     });
//     pptx.writeFile({ fileName: `${prompt || "Presentation"}.pptx` });
//   };

//   return (
//     <div className="min-h-screen p-6 bg-background text-foreground transition-colors">
//       {/* Header */}
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold">AI Slide Generator</h1>
//         <div className="flex items-center gap-4">
//           <span>{user?.email}</span>
//           <Button variant="destructive" onClick={signOut}>Sign Out</Button>
//         </div>
//       </div>

//       <div className="grid md:grid-cols-2 gap-6">
//         {/* Left Side – Generate Section */}
//         <Card className="p-5 space-y-3">
//           <h2 className="text-xl font-semibold">Generate Presentation</h2>
//           <Input
//             value={prompt}
//             onChange={(e) => setPrompt(e.target.value)}
//             placeholder="Describe your presentation topic..."
//           />
//           <Button onClick={handleGenerate} disabled={loading}>
//             {loading ? "Generating..." : "Generate Slides"}
//           </Button>
//           {loading && <Progress value={progress} />}
//         </Card>

//         {/* Right Side – Current Slide Preview */}
//         <Card className="p-5 overflow-y-auto">
//           {slides.length === 0 ? (
//             <p className="text-muted-foreground text-center">
//               Select or generate a presentation to get started.
//             </p>
//           ) : (
//             <div className="space-y-4 animate-fade-in">
//               {slides.map((slide, i) => (
//                 <div
//                   key={i}
//                   className="p-4 border rounded-lg bg-card/30 hover:bg-card transition"
//                 >
//                   <h3 className="font-bold text-lg mb-2">{slide.title}</h3>
//                   <ul className="list-disc pl-6 space-y-1">
//                     {slide.content.map((point: string, j: number) => (
//                       <li key={j}>{point}</li>
//                     ))}
//                   </ul>
//                 </div>
//               ))}
//               <Button onClick={downloadPPT} className="mt-3">
//                 Download PPT
//               </Button>
//             </div>
//           )}
//         </Card>
//       </div>

//       {/* Bottom Section – User's Saved Presentations */}
//       <div className="mt-8">
//         <h2 className="text-xl font-semibold mb-4">Your Presentations</h2>
//         {presentations.length === 0 ? (
//           <p className="text-muted-foreground">
//             No presentations yet. Create your first one!
//           </p>
//         ) : (
//           <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
//             {presentations.map((p) => (
//               <Card
//                 key={p.id}
//                 className="p-4 cursor-pointer hover:border-primary transition"
//                 onClick={() => setSlides(p.slide_data)}
//               >
//                 <h3 className="font-bold">{p.title}</h3>
//                 <p className="text-xs text-muted-foreground mt-1">
//                   {new Date(p.created_at).toLocaleString()}
//                 </p>
//               </Card>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }














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

  // ✅ Load presentations for current user
  useEffect(() => {
    if (user) loadPresentations();
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

  // ✅ Generate slides via Edge Function
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({ title: 'Please enter a prompt', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      // ✅ Securely invoke Supabase Function (includes JWT automatically)
      const { data, error } = await supabase.functions.invoke('generate-slides', {
        body: { prompt, title: prompt.substring(0, 50) },
      });

      if (error) throw error;

      if (!data || !data.presentation) {
        throw new Error('No presentation data returned from server.');
      }

      setCurrentPresentation(data.presentation);
      toast({ title: 'Presentation generated successfully!' });
      loadPresentations();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error generating presentation',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Export slides to PPTX via Edge Function
  const handleExport = async () => {
    if (!currentPresentation) return;

    setExporting(true);
    try {
      const { data, error } = await supabase.functions.invoke('export-pptx', {
        body: { presentationId: currentPresentation.id },
      });

      if (error) throw error;
      if (!data?.url) throw new Error('No export URL returned.');

      window.open(data.url, '_blank');
      toast({ title: 'Presentation exported successfully!' });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error exporting presentation',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
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
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              AI Slide Generator
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
            {/* Generate */}
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

          {/* Right Section */}
          <div className="space-y-6">
            {currentPresentation ? (
              <>
                {/* Current Presentation Header */}
                <Card className="p-4 bg-gradient-to-br from-card to-card/50 shadow-elegant border-primary/10">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-xl font-semibold">
                      {currentPresentation.title}
                    </h2>
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

                {/* Slide Preview */}
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



