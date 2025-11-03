
// // supabase/functions/generate-slides/index.ts
// import "https://deno.land/x/xhr@0.1.0/mod.ts";
// import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// // ✅ CORS headers
// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Headers":
//     "authorization, x-client-info, apikey, content-type",
//   "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
// };

// // ✅ Initialize Supabase client
// const supabase = createClient(
//   Deno.env.get("SUPABASE_URL")!,
//   Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
// );

// // ✅ Generate placeholder image URLs
// function generatePlaceholderImage(slideTitle: string, index: number): string {
//   const colors = [
//     "4F46E5/ffffff", // Indigo
//     "7C3AED/ffffff", // Purple
//     "DB2777/ffffff", // Pink
//     "DC2626/ffffff", // Red
//     "EA580C/ffffff", // Orange
//     "16A34A/ffffff", // Green
//     "0EA5E9/ffffff", // Sky
//     "8B5CF6/ffffff", // Violet
//   ];
//   const color = colors[index % colors.length];
//   const encodedTitle = encodeURIComponent(slideTitle.slice(0, 30));
//   return `https://via.placeholder.com/1024x768/${color}?text=${encodedTitle}`;
// }

// // ✅ Edge Function entry with streaming and Gemini REST API integration
// serve(async (req) => {
//   if (req.method === "OPTIONS") {
//     return new Response("ok", { headers: corsHeaders });
//   }

//   try {
//     const { prompt, title } = await req.json();
//     if (!prompt) throw new Error("Missing 'prompt'");

//     console.log("📝 Generating presentation for:", prompt);

//     // ✅ Extract user ID from JWT
//     const authHeader = req.headers.get("Authorization");
//     const token = authHeader?.replace("Bearer ", "");
//     let userId = null;
//     if (token) {
//       const { data: { user } } = await supabase.auth.getUser(token);
//       userId = user?.id;
//     }

//     // ✅ Create a streaming response
//     const stream = new TransformStream();
//     const writer = stream.writable.getWriter();
//     const encoder = new TextEncoder();

//     (async () => {
//       try {
//         await writer.write(encoder.encode("🚀 Starting generation...\n"));
//         await writer.write(encoder.encode("🤖 Contacting Gemini AI...\n"));

//         const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
//         if (!GEMINI_API_KEY) {
//           throw new Error("Missing GEMINI_API_KEY in environment.");
//         }

//         // ✅ Build query for Gemini
//         const query = `Create a professional PowerPoint presentation about "${prompt}".

// Requirements:
// - Generate 6-8 slides
// - Each slide must have:
//   * "title": Clear, engaging heading (max 60 characters)
//   * "content": Array of 3-5 concise bullet points
//   * "notes": Speaker notes (optional)
// Output ONLY valid JSON like:
// {
//   "slides": [
//     {
//       "title": "Introduction",
//       "content": ["Point 1", "Point 2"],
//       "notes": "Optional notes"
//     }
//   ]
// }`;

//         // ✅ Call Gemini REST API with ?key= pattern
//         const geminiResponse = await fetch(
//           `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-preview-05-06:generateContent?key=${GEMINI_API_KEY}`,
//           {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//             },
//             body: JSON.stringify({
//               contents: [
//                 {
//                   parts: [{ text: query }],
//                 },
//               ],
//             }),
//           }
//         );

//         if (!geminiResponse.ok) {
//           const errorText = await geminiResponse.text();
//           console.error("Gemini raw:", errorText);
//           throw new Error("Gemini API error: " + geminiResponse.statusText);
//         }

//         const geminiData = await geminiResponse.json();

//         // ✅ Extract raw text
//         const rawText =
//           geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

//         if (!rawText) {
//           console.error("Gemini raw:", geminiData);
//           throw new Error("No slides generated (empty response).");
//         }

//         await writer.write(encoder.encode("⚙️ Processing AI response...\n"));
//         console.log("✅ Received response from Gemini");

//         // ✅ Try to parse slides JSON
//         let parsed;
//         try {
//           const jsonMatch =
//             rawText.match(/```json\s*([\s\S]*?)\s*```/) ||
//             rawText.match(/\{[\s\S]*\}/);
//           if (!jsonMatch) throw new Error("No JSON found in AI response.");
//           const jsonString = jsonMatch[1] || jsonMatch[0];
//           parsed = JSON.parse(jsonString);
//         } catch (err) {
//           console.error("❌ JSON parse error:", err);
//           console.error("Gemini output:", rawText.slice(0, 400));
//           throw new Error("Invalid JSON format from Gemini.");
//         }

//         const slides = parsed.slides || [];
//         if (slides.length === 0) {
//           throw new Error("Gemini returned no slides.");
//         }

//         await writer.write(
//           encoder.encode(`📊 Generated ${slides.length} slides...\n`)
//         );

//         // ✅ Add placeholder images
//         for (let i = 0; i < slides.length; i++) {
//           slides[i].image_url = generatePlaceholderImage(slides[i].title, i);
//           await writer.write(
//             encoder.encode(
//               `🎨 Added image for slide ${i + 1}: ${slides[i].title}\n`
//             )
//           );
//         }

//         // ✅ Save to Supabase
//         await writer.write(encoder.encode("💾 Saving presentation...\n"));

//         const { data, error } = await supabase
//           .from("presentations")
//           .insert([
//             {
//               title: title || prompt.slice(0, 50),
//               slide_data: slides,
//               user_id: userId,
//             },
//           ])
//           .select()
//           .single();

//         if (error) {
//           console.error("❌ Database error:", error);
//           throw new Error("Failed to save presentation.");
//         }

//         console.log("✅ Presentation saved with ID:", data.id);

//         // ✅ Stream final JSON back to client
//         await writer.write(
//           encoder.encode(
//             "\n" +
//               JSON.stringify({
//                 presentation: data,
//                 slides,
//               })
//           )
//         );

//         await writer.close();
//       } catch (err) {
//         console.error("❌ Generation error:", err);
//         await writer.write(
//           encoder.encode(
//             JSON.stringify({
//               error: err.message || "Unknown error",
//             })
//           )
//         );
//         await writer.close();
//       }
//     })();

//     return new Response(stream.readable, {
//       headers: {
//         ...corsHeaders,
//         "Content-Type": "text/plain; charset=utf-8",
//         "Transfer-Encoding": "chunked",
//       },
//     });
//   } catch (err) {
//     console.error("❌ Root error in generate-slides:", err);
//     return new Response(
//       JSON.stringify({ error: err.message || "Unknown error" }),
//       { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
//     );
//   }
// });


















// // supabase/functions/generate-slides/index.ts
// import "https://deno.land/x/xhr@0.1.0/mod.ts";
// import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// // ✅ CORS headers
// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Headers":
//     "authorization, x-client-info, apikey, content-type",
//   "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
// };

// // ✅ Initialize Supabase client
// const supabase = createClient(
//   Deno.env.get("SUPABASE_URL")!,
//   Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
// );

// // ✅ Placeholder image generator (we’ll add GROQ images later)
// function generatePlaceholderImage(slideTitle: string, index: number): string {
//   const colors = [
//     "4F46E5/ffffff", // Indigo
//     "7C3AED/ffffff", // Purple
//     "DB2777/ffffff", // Pink
//     "DC2626/ffffff", // Red
//     "EA580C/ffffff", // Orange
//     "16A34A/ffffff", // Green
//     "0EA5E9/ffffff", // Sky
//     "8B5CF6/ffffff", // Violet
//   ];
//   const color = colors[index % colors.length];
//   const encodedTitle = encodeURIComponent(slideTitle.slice(0, 30));
//   return `https://via.placeholder.com/1024x768/${color}?text=${encodedTitle}`;
// }

// // ✅ Main function
// serve(async (req) => {
//   if (req.method === "OPTIONS") {
//     return new Response("ok", { headers: corsHeaders });
//   }

//   try {
//     const { prompt, title } = await req.json();
//     if (!prompt) throw new Error("Missing 'prompt'");

//     console.log("📝 Generating slides for:", prompt);

//     // ✅ Extract user ID
//     const authHeader = req.headers.get("Authorization");
//     const token = authHeader?.replace("Bearer ", "");
//     let userId = null;
//     if (token) {
//       const { data: { user } } = await supabase.auth.getUser(token);
//       userId = user?.id;
//     }

//     // ✅ Create streaming response
//     const stream = new TransformStream();
//     const writer = stream.writable.getWriter();
//     const encoder = new TextEncoder();

//     (async () => {
//       try {
//         await writer.write(encoder.encode("🚀 Starting GROQ generation...\n"));

//         const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
//         if (!GROQ_API_KEY) throw new Error("Missing GROQ_API_KEY in environment.");

//         // ✅ Query prompt for LLM
//         const llmPrompt = `You are an expert presentation designer.

// Create a professional PowerPoint presentation on the topic: "${prompt}".

// Generate 6-8 structured slides in the following JSON format only:

// {
//   "slides": [
//     {
//       "title": "Slide Title",
//       "content": [
//         "Bullet point 1",
//         "Bullet point 2",
//         "Bullet point 3",
//         "Bullet point 4",
//         "Bullet point 5"
//       ],
//       "notes": "Short speaker notes (optional)"
//     }
//   ]
// }

// Keep it formal, informative, visually descriptive, and engaging.`;

//         await writer.write(encoder.encode("🤖 Contacting GROQ LLM...\n"));

//         // ✅ GROQ API call (using Mixtral model)
//         const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${GROQ_API_KEY}`,
//           },
//           body: JSON.stringify({
//             model: "mixtral-8x7b-32768", // or "llama3-70b-8192" if you prefer
//             messages: [
//               { role: "system", content: "You are a helpful AI slide generator." },
//               { role: "user", content: llmPrompt },
//             ],
//             temperature: 0.7,
//           }),
//         });

//         if (!response.ok) {
//           const err = await response.text();
//           console.error("❌ GROQ error:", err);
//           throw new Error(`GROQ API error: ${response.statusText}`);
//         }

//         const data = await response.json();
//         const rawText = data.choices?.[0]?.message?.content?.trim() || "";

//         if (!rawText) {
//           throw new Error("No response from GROQ model.");
//         }

//         await writer.write(encoder.encode("⚙️ Processing GROQ response...\n"));
//         console.log("✅ Received response from GROQ.");

//         // ✅ Parse AI JSON safely
//         let parsed;
//         try {
//           const jsonMatch =
//             rawText.match(/```json\s*([\s\S]*?)\s*```/) ||
//             rawText.match(/\{[\s\S]*\}/);
//           if (!jsonMatch) throw new Error("No JSON found in response");
//           const jsonString = jsonMatch[1] || jsonMatch[0];
//           parsed = JSON.parse(jsonString);
//         } catch (e) {
//           console.error("❌ JSON parse error:", e);
//           console.error("Raw text snippet:", rawText.slice(0, 300));
//           throw new Error("Invalid JSON structure from GROQ.");
//         }

//         const slides = parsed.slides || [];
//         if (slides.length === 0) throw new Error("No slides generated.");

//         await writer.write(encoder.encode(`📊 Generated ${slides.length} slides\n`));

//         // ✅ Add placeholder images
//         for (let i = 0; i < slides.length; i++) {
//           slides[i].image_url = generatePlaceholderImage(slides[i].title, i);
//           await writer.write(
//             encoder.encode(`🎨 Added image for slide ${i + 1}: ${slides[i].title}\n`)
//           );
//         }

//         // ✅ Save to Supabase
//         await writer.write(encoder.encode("💾 Saving to database...\n"));

//         const { data: saved, error } = await supabase
//           .from("presentations")
//           .insert([
//             {
//               title: title || prompt.slice(0, 50),
//               slide_data: slides,
//               user_id: userId,
//             },
//           ])
//           .select()
//           .single();

//         if (error) throw error;

//         console.log("✅ Saved presentation:", saved.id);

//         // ✅ Return final JSON
//         await writer.write(
//           encoder.encode(
//             "\n" + JSON.stringify({ presentation: saved, slides })
//           )
//         );

//         await writer.close();
//       } catch (err) {
//         console.error("❌ Generation error:", err);
//         await writer.write(
//           encoder.encode(
//             JSON.stringify({ error: err.message || "Unknown error" })
//           )
//         );
//         await writer.close();
//       }
//     })();

//     return new Response(stream.readable, {
//       headers: {
//         ...corsHeaders,
//         "Content-Type": "text/plain; charset=utf-8",
//         "Transfer-Encoding": "chunked",
//       },
//     });
//   } catch (err) {
//     console.error("❌ Root error:", err);
//     return new Response(
//       JSON.stringify({ error: err.message }),
//       {
//         headers: { ...corsHeaders, "Content-Type": "application/json" },
//         status: 500,
//       }
//     );
//   }
// });




















// supabase/functions/generate-slides/index.ts

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// --- CORS CONFIG ---
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

// --- SUPABASE CLIENT ---
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// --- IMAGE PLACEHOLDER GENERATOR ---
function generatePlaceholderImage(slideTitle: string, index: number): string {
  const colors = [
    "4F46E5/ffffff", "7C3AED/ffffff", "DB2777/ffffff",
    "DC2626/ffffff", "EA580C/ffffff", "16A34A/ffffff",
    "0EA5E9/ffffff", "8B5CF6/ffffff"
  ];
  const color = colors[index % colors.length];
  const encodedTitle = encodeURIComponent(slideTitle.slice(0, 40));
  return `https://via.placeholder.com/1024x768/${color}?text=${encodedTitle}`;
}

// --- EDGE FUNCTION ENTRY ---
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { prompt, title } = await req.json();
    if (!prompt) throw new Error("Missing 'prompt'");

    console.log("🧠 Generating slides for:", prompt);

    // --- USER AUTH ---
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    let userId: string | null = null;

    if (token) {
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id;
    }

    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) throw new Error("Missing GROQ_API_KEY in environment.");

    // --- STREAMING SETUP ---
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    const encoder = new TextEncoder();

    (async () => {
      try {
        await writer.write(encoder.encode("🚀 Starting GROQ (GPT-OSS-120B) generation...\n"));

        // --- LLM PROMPT ---
        const systemPrompt = `
You are an expert presentation designer and professional writer.
Create a clear, well-structured, and engaging PowerPoint presentation
on the topic: "${prompt}".

Requirements:
- Generate 6–8 slides
- Each slide should have:
  • title (<= 60 chars)
  • content (array of 3–5 short bullet points)
  • notes (optional speaker notes)
- Return **ONLY JSON** in this format:

{
  "slides": [
    { "title": "Intro", "content": ["Point1","Point2"], "notes": "short note" }
  ]
}

No markdown or text outside JSON.
        `.trim();

        await writer.write(encoder.encode("🤖 Contacting GROQ LLM...\n"));

        // --- GROQ REQUEST ---
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: "openai/gpt-oss-120b", // ✅ using your selected model
            temperature: 0.7,
            messages: [
              { role: "system", content: "You are a helpful AI that outputs clean JSON." },
              { role: "user", content: systemPrompt },
            ],
          }),
        });

        if (!response.ok) {
          const err = await response.text();
          console.error("❌ GROQ API Error:", err);
          throw new Error(`GROQ request failed (${response.status})`);
        }

        const data = await response.json();
        const rawText = data?.choices?.[0]?.message?.content || "";

        await writer.write(encoder.encode("⚙️ Processing GROQ response...\n"));
        console.log("✅ Raw response:", rawText.slice(0, 200));

        // --- PARSE JSON OUTPUT ---
        let parsed;
        try {
          const jsonMatch =
            rawText.match(/```json\s*([\s\S]*?)\s*```/) ||
            rawText.match(/\{[\s\S]*\}/);
          if (!jsonMatch) throw new Error("No JSON found in response.");
          const jsonString = jsonMatch[1] || jsonMatch[0];
          parsed = JSON.parse(jsonString);
        } catch (err) {
          console.error("❌ JSON Parse Error:", err);
          throw new Error("GROQ returned invalid JSON format.");
        }

        const slides = parsed.slides || [];
        if (slides.length === 0) throw new Error("No slides generated.");

        await writer.write(encoder.encode(`📊 Generated ${slides.length} slides...\n`));

        // --- ADD IMAGE PLACEHOLDERS ---
        for (let i = 0; i < slides.length; i++) {
          slides[i].image_url = generatePlaceholderImage(slides[i].title, i);
          await writer.write(
            encoder.encode(`🎨 Slide ${i + 1}: ${slides[i].title}\n`)
          );
        }

        // --- SAVE TO SUPABASE ---
        await writer.write(encoder.encode("💾 Saving presentation...\n"));
        const { data: saved, error } = await supabase
          .from("presentations")
          .insert([
            {
              title: title || prompt.slice(0, 60),
              slide_data: slides,
              user_id: userId,
            },
          ])
          .select()
          .single();

        if (error) throw error;

        await writer.write(
          encoder.encode(
            "\n" + JSON.stringify({ presentation: saved, slides })
          )
        );

        await writer.close();
      } catch (err) {
        console.error("❌ Generation error:", err);
        await writer.write(
          encoder.encode(JSON.stringify({ error: err.message }))
        );
        await writer.close();
      }
    })();

    return new Response(stream.readable, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (err) {
    console.error("❌ Root error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

