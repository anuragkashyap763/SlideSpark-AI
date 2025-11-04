// // api/generate.ts
// import { NextResponse } from "next/server";

// export const config = {
//   runtime: "edge",
// };

// export default async function handler(req: Request) {
//   try {
//     const { prompt, userId } = await req.json();

//     if (!prompt) {
//       return NextResponse.json({ error: "Prompt required" }, { status: 400 });
//     }

//     const response = await fetch(
//       `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-preview-05-06:generateContent?key=${process.env.GEMINI_API_KEY}`,
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           contents: [
//             {
//               role: "user",
//               parts: [
//                 {
//                   text: `Generate a JSON structure for a professional presentation with title, slides (each with title, bullet points, and optional notes) based on: "${prompt}".`,
//                 },
//               ],
//             },
//           ],
//         }),
//       }
//     );

//     const data = await response.json();

//     const text =
//       data?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
//     const slides = JSON.parse(text);

//     return NextResponse.json({ slides });
//   } catch (error: any) {
//     console.error("Error in /api/generate:", error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }














// api/generate.ts
export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { prompt, userId } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt required" });
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

    return res.status(200).json({ slides });
  } catch (error) {
    console.error("Error in /api/generate:", error);
    return res.status(500).json({ error: error.message });
  }
}

