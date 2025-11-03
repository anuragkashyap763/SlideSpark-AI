import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// const corsHeaders = {
//   'Access-Control-Allow-Origin': '*',
//   'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
// };


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

// Handle preflight requests
if (req.method === "OPTIONS") {
  return new Response("ok", { headers: corsHeaders });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { presentationId, prompt, currentSlides } = await req.json();
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const authHeader = req.headers.get('Authorization')!;
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    console.log('Updating slides for presentation:', presentationId);

    // Call Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Update this presentation based on the request: "${prompt}"

Current slides:
${JSON.stringify(currentSlides, null, 2)}

Return ONLY valid JSON in this exact format with no markdown or additional text:
{
  "slides": [
    {
      "title": "Slide title",
      "content": ["Bullet point 1", "Bullet point 2", "Bullet point 3"],
      "notes": "Speaker notes"
    }
  ]
}

Keep the same number of slides unless explicitly asked to add or remove slides.`
            }]
          }]
        })
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    const generatedText = geminiData.candidates[0].content.parts[0].text;
    
    console.log('Gemini raw response:', generatedText);

    // Parse JSON from response
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }

    const slideData = JSON.parse(jsonMatch[0]);

    // Update database
    const { data: presentation, error: dbError } = await supabase
      .from('presentations')
      .update({
        slide_data: slideData.slides,
        updated_at: new Date().toISOString()
      })
      .eq('id', presentationId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }

    // Save to chat history
    await supabase.from('chat_history').insert([
      { user_id: user.id, presentation_id: presentationId, role: 'user', content: prompt },
      { user_id: user.id, presentation_id: presentationId, role: 'assistant', content: JSON.stringify(slideData.slides) }
    ]);

    console.log('Presentation updated:', presentationId);

    return new Response(
      JSON.stringify({ presentation, slides: slideData.slides }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in update-slides:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
