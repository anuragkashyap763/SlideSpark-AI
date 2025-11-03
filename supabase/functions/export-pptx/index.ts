// import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
// import PptxGenJS from "https://esm.sh/pptxgenjs@3.12.0";

// // const corsHeaders = {
// //   'Access-Control-Allow-Origin': '*',
// //   'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
// // };

// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
//   "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
// };

// // Handle preflight requests
// if (req.method === "OPTIONS") {
//   return new Response("ok", { headers: corsHeaders });
// }

// serve(async (req) => {
//   if (req.method === 'OPTIONS') {
//     return new Response(null, { headers: corsHeaders });
//   }

//   try {
//     const { presentationId } = await req.json();

//     const authHeader = req.headers.get('Authorization')!;
//     const supabase = createClient(
//       Deno.env.get('SUPABASE_URL') ?? '',
//       Deno.env.get('SUPABASE_ANON_KEY') ?? '',
//       { global: { headers: { Authorization: authHeader } } }
//     );

//     const { data: { user } } = await supabase.auth.getUser();
//     if (!user) {
//       throw new Error('Unauthorized');
//     }

//     // Get presentation data
//     const { data: presentation, error: fetchError } = await supabase
//       .from('presentations')
//       .select('*')
//       .eq('id', presentationId)
//       .eq('user_id', user.id)
//       .single();

//     if (fetchError || !presentation) {
//       throw new Error('Presentation not found');
//     }

//     console.log('Generating PPTX for presentation:', presentationId);

//     // Create PowerPoint
//     const pptx = new PptxGenJS();
//     const slides = presentation.slide_data as Array<{
//       title: string;
//       content: string[];
//       notes?: string;
//     }>;

//     slides.forEach((slideData, index) => {
//       const slide = pptx.addSlide();
      
//       // Add title
//       slide.addText(slideData.title, {
//         x: 0.5,
//         y: 0.5,
//         w: 9,
//         h: 1,
//         fontSize: 32,
//         bold: true,
//         color: '363636'
//       });

//       // Add content
//       if (slideData.content && slideData.content.length > 0) {
//         const bulletText = slideData.content.map(item => ({
//           text: item,
//           options: { bullet: true }
//         }));

//         slide.addText(bulletText, {
//           x: 0.5,
//           y: 2,
//           w: 9,
//           h: 4,
//           fontSize: 18,
//           color: '363636'
//         });
//       }

//       // Add notes
//       if (slideData.notes) {
//         slide.addNotes(slideData.notes);
//       }
//     });

//     // Generate PPTX file
//     const pptxData = await pptx.write({ outputType: 'arraybuffer' });
//     const fileName = `${user.id}/${presentationId}.pptx`;

//     // Upload to Supabase Storage
//     const { error: uploadError } = await supabase.storage
//       .from('presentations')
//       .upload(fileName, pptxData, {
//         contentType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
//         upsert: true
//       });

//     if (uploadError) {
//       console.error('Upload error:', uploadError);
//       throw uploadError;
//     }

//     // Get public URL
//     const { data: urlData } = supabase.storage
//       .from('presentations')
//       .getPublicUrl(fileName);

//     // Update presentation with file URL
//     await supabase
//       .from('presentations')
//       .update({ file_url: urlData.publicUrl })
//       .eq('id', presentationId);

//     console.log('PPTX generated and uploaded:', urlData.publicUrl);

//     return new Response(
//       JSON.stringify({ url: urlData.publicUrl }),
//       { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
//     );

//   } catch (error) {
//     console.error('Error in export-pptx:', error);
//     const message = error instanceof Error ? error.message : 'Unknown error';
//     return new Response(
//       JSON.stringify({ error: message }),
//       { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
//     );
//   }
// });












import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import PPTXGenJS from "https://esm.sh/pptxgenjs@3.10.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

serve(async (req) => {
  // ✅ Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // ✅ Extract user JWT
    const authHeader = req.headers.get("authorization")!;
    const jwt = authHeader?.replace("Bearer ", "");

    // ✅ Verify user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(jwt);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    // ✅ Parse request body
    const { presentationId } = await req.json();
    if (!presentationId) {
      return new Response(JSON.stringify({ error: "Missing presentationId" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // ✅ Fetch presentation
    const { data: presentation, error: fetchError } = await supabase
      .from("presentations")
      .select("*")
      .eq("id", presentationId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !presentation) {
      console.error("Fetch error:", fetchError);
      return new Response(JSON.stringify({ error: "Presentation not found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    // ✅ Generate PPTX
    const pptx = new PPTXGenJS();
    presentation.slide_data.forEach((slide: any) => {
      const slideObj = pptx.addSlide();
      slideObj.addText(slide.title, { x: 1, y: 0.5, fontSize: 24, bold: true });
      slide.content.forEach((line: string, i: number) => {
        slideObj.addText(`• ${line}`, { x: 1, y: 1.2 + i * 0.5, fontSize: 18 });
      });
    });

    // ✅ Save PPTX as base64
    const pptxBase64 = await pptx.write("base64");

    // ✅ Upload to Supabase Storage
    const fileName = `${user.id}/${presentationId}.pptx`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("presentations")
      .upload(fileName, new Blob([Uint8Array.from(atob(pptxBase64), c => c.charCodeAt(0))]), {
        contentType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage.from("presentations").getPublicUrl(fileName);

    // ✅ Return downloadable URL
    return new Response(
      JSON.stringify({ url: publicUrl }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("❌ Error in export-pptx:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal Server Error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
