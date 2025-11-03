// // import "https://deno.land/x/xhr@0.1.0/mod.ts";
// // import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// // import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// // // const corsHeaders = {
// // //   'Access-Control-Allow-Origin': '*',
// // //   'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
// // // };

// // const corsHeaders = {
// //   "Access-Control-Allow-Origin": "*",
// //   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
// //   "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
// // };

// // // Handle preflight requests
// // if (req.method === "OPTIONS") {
// //   return new Response("ok", { headers: corsHeaders });
// // }

// // serve(async (req) => {
// //   if (req.method === 'OPTIONS') {
// //     return new Response(null, { headers: corsHeaders });
// //   }

// //   try {
// //     const { prompt, title } = await req.json();
// //     const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

// //     if (!GEMINI_API_KEY) {
// //       throw new Error('GEMINI_API_KEY not configured');
// //     }

// //     const authHeader = req.headers.get('Authorization')!;
// //     const supabase = createClient(
// //       Deno.env.get('SUPABASE_URL') ?? '',
// //       Deno.env.get('SUPABASE_ANON_KEY') ?? '',
// //       { global: { headers: { Authorization: authHeader } } }
// //     );

// //     const { data: { user } } = await supabase.auth.getUser();
// //     if (!user) {
// //       throw new Error('Unauthorized');
// //     }

// //     console.log('Generating slides for prompt:', prompt);

// //     // Call Gemini API
// //     const geminiResponse = await fetch(
// //       `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
// //       {
// //         method: 'POST',
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify({
// //           contents: [{
// //             parts: [{
// //               text: `Generate a professional presentation with 5-7 slides based on this prompt: "${prompt}".

// // Return ONLY valid JSON in this exact format with no markdown or additional text:
// // {
// //   "slides": [
// //     {
// //       "title": "Slide title",
// //       "content": ["Bullet point 1", "Bullet point 2", "Bullet point 3"],
// //       "notes": "Speaker notes"
// //     }
// //   ]
// // }

// // Make the first slide a title slide, followed by content slides, and end with a conclusion/thank you slide.`
// //             }]
// //           }]
// //         })
// //       }
// //     );

// //     if (!geminiResponse.ok) {
// //       const errorText = await geminiResponse.text();
// //       console.error('Gemini API error:', errorText);
// //       throw new Error(`Gemini API error: ${geminiResponse.status}`);
// //     }

// //     const geminiData = await geminiResponse.json();
// //     const generatedText = geminiData.candidates[0].content.parts[0].text;

// //     console.log('Gemini raw response:', generatedText);

// //     // Parse JSON from response
// //     const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
// //     if (!jsonMatch) {
// //       throw new Error('No valid JSON found in response');
// //     }

// //     const slideData = JSON.parse(jsonMatch[0]);

// //     // Save to database
// //     const { data: presentation, error: dbError } = await supabase
// //       .from('presentations')
// //       .insert({
// //         user_id: user.id,
// //         title: title || 'Untitled Presentation',
// //         prompt,
// //         slide_data: slideData.slides
// //       })
// //       .select()
// //       .single();

// //     if (dbError) {
// //       console.error('Database error:', dbError);
// //       throw dbError;
// //     }

// //     // Save to chat history
// //     await supabase.from('chat_history').insert([
// //       { user_id: user.id, presentation_id: presentation.id, role: 'user', content: prompt },
// //       { user_id: user.id, presentation_id: presentation.id, role: 'assistant', content: JSON.stringify(slideData.slides) }
// //     ]);

// //     console.log('Presentation created:', presentation.id);

// //     return new Response(
// //       JSON.stringify({ presentation, slides: slideData.slides }),
// //       { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
// //     );

// //   } catch (error) {
// //     console.error('Error in generate-slides:', error);
// //     const message = error instanceof Error ? error.message : 'Unknown error';
// //     return new Response(
// //       JSON.stringify({ error: message }),
// //       { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
// //     );
// //   }
// // });

// // import "https://deno.land/x/xhr@0.1.0/mod.ts";
// // import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// // import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// // const corsHeaders = {
// //   "Access-Control-Allow-Origin": "*",
// //   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
// //   "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
// // };

// // serve(async (req) => {
// //   // ✅ Step 1: Handle preflight request
// //   if (req.method === "OPTIONS") {
// //     return new Response("ok", { headers: corsHeaders });
// //   }

// //   try {
// //     // ✅ Step 2: Extract JSON body
// //     const { prompt } = await req.json();

// //     if (!prompt) {
// //       return new Response(JSON.stringify({ error: "Missing prompt" }), {
// //         headers: { ...corsHeaders, "Content-Type": "application/json" },
// //         status: 400,
// //       });
// //     }

// //     // ✅ Step 3: (Optional) Call Gemini/OpenAI or use mock data for now
// //     const slides = [
// //       { title: "Introduction", content: ["Overview", "Objective"] },
// //       { title: "Main Points", content: ["Key Concept 1", "Key Concept 2"] },
// //       { title: "Conclusion", content: ["Summary", "Next Steps"] },
// //     ];

// //     // ✅ Step 4: Return response
// //     return new Response(JSON.stringify({ slides }), {
// //       headers: { ...corsHeaders, "Content-Type": "application/json" },
// //       status: 200,
// //     });
// //   } catch (err) {
// //     console.error("Error in generate-slides:", err);
// //     return new Response(JSON.stringify({ error: err.message }), {
// //       headers: { ...corsHeaders, "Content-Type": "application/json" },
// //       status: 500,
// //     });
// //   }
// // });

// import "https://deno.land/x/xhr@0.1.0/mod.ts";
// import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
//   "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
// };

// serve(async (req) => {
//   if (req.method === "OPTIONS") {
//     return new Response("ok", { headers: corsHeaders });
//   }

//   try {
//     const supabase = createClient(
//       Deno.env.get("SUPABASE_URL")!,
//       Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
//     );

//     const { prompt, title } = await req.json();
//     if (!prompt) {
//       return new Response(JSON.stringify({ error: "Prompt is required" }), {
//         headers: { ...corsHeaders, "Content-Type": "application/json" },
//         status: 400,
//       });
//     }

//     // ✅ 1. Generate fake slides for demo (you can replace this with AI later)
//     const slides = [
//       { title: `${title || "Introduction"}`, content: ["Overview of topic", "Importance", "Agenda"] },
//       { title: "Key Insights", content: ["Point 1", "Point 2", "Point 3"] },
//       { title: "Conclusion", content: ["Summary", "Future outlook", "Next steps"] },
//     ];

//     // ✅ 2. Insert into presentations table
//     const { data: inserted, error: insertError } = await supabase
//       .from("presentations")
//       .insert([
//         {
//           title: title || prompt.substring(0, 50),
//           slide_data: slides,
//           file_url: null,
//         },
//       ])
//       .select()
//       .single();

//     if (insertError) throw insertError;

//     // ✅ 3. Return the presentation object in expected format
//     return new Response(
//       JSON.stringify({ presentation: inserted }),
//       {
//         headers: { ...corsHeaders, "Content-Type": "application/json" },
//         status: 200,
//       }
//     );
//   } catch (error) {
//     console.error("Error in generate-slides:", error);
//     return new Response(
//       JSON.stringify({ error: error.message || "Unknown error" }),
//       {
//         headers: { ...corsHeaders, "Content-Type": "application/json" },
//         status: 500,
//       }
//     );
//   }
// });

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 🔹 Create client using service role
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 🔹 Extract JWT from Authorization header
    const authHeader = req.headers.get("authorization")!;
    const jwt = authHeader.replace("Bearer ", "");

    // Get user info from JWT
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(jwt);

    if (userError || !user) {
      console.error("User fetch error:", userError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    // 🔹 Get prompt and title from request
    const { prompt, title } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // 🔹 Generate placeholder slides
    const slides = [
      {
        title: title || "Introduction",
        content: ["Overview", "Objective", "Agenda"],
      },
      { title: "Key Points", content: ["Point 1", "Point 2", "Point 3"] },
      { title: "Conclusion", content: ["Summary", "Next Steps"] },
    ];

    // 🔹 Insert into presentations table with user_id
    const { data: inserted, error: insertError } = await supabase
      .from("presentations")
      .insert([
        {
          user_id: user.id, // ✅ required by your schema
          title: title || prompt.substring(0, 50),
          slide_data: slides,
          file_url: null,
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error("Insert Error:", insertError);
      throw insertError;
    }

    // 🔹 Return response in expected format
    return new Response(JSON.stringify({ presentation: inserted }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("❌ Error in generate-slides:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal Server Error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
