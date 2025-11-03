// api/generate.ts
import { NextResponse } from "next/server";

export const config = {
  runtime: "edge",
};

export default async function handler(req: Request) {
  try {
    const { prompt, userId } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt required" }, { status: 400 });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-preview-05-06:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `Generate a JSON structure for a professional presentation with title, slides (each with title, bullet points, and optional notes) based on: "${prompt}".`,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    const slides = JSON.parse(text);

    return NextResponse.json({ slides });
  } catch (error: any) {
    console.error("Error in /api/generate:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
