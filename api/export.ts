// // api/export.ts
// import pptxgen from "pptxgenjs";
// import { NextResponse } from "next/server";

// export const config = {
//   runtime: "edge",
// };

// export default async function handler(req: Request) {
//   try {
//     const { slides } = await req.json();
//     if (!slides) {
//       return NextResponse.json({ error: "Slides JSON missing" }, { status: 400 });
//     }

//     const pres = new pptxgen();

//     slides.forEach((slideData: any) => {
//       const slide = pres.addSlide();
//       slide.addText(slideData.title || "Untitled", {
//         x: 1,
//         y: 0.5,
//         fontSize: 28,
//         bold: true,
//       });

//       if (slideData.content && Array.isArray(slideData.content)) {
//         slideData.content.forEach((point: string, i: number) => {
//           slide.addText(`• ${point}`, {
//             x: 1,
//             y: 1 + i * 0.5,
//             fontSize: 18,
//           });
//         });
//       }
//     });

//     const pptx = await pres.write("base64");
//     return NextResponse.json({ pptx });
//   } catch (error: any) {
//     console.error("Error exporting PPTX:", error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }



















// api/export.ts
import pptxgen from "pptxgenjs";

export default async function handler(req, res) {
  try {
    // ✅ Allow only POST
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { slides } = req.body;
    if (!slides) {
      return res.status(400).json({ error: "Slides JSON missing" });
    }

    // ✅ Create presentation
    const pres = new pptxgen();

    slides.forEach((slideData) => {
      const slide = pres.addSlide();

      slide.addText(slideData.title || "Untitled", {
        x: 1,
        y: 0.5,
        fontSize: 28,
        bold: true,
      });

      if (slideData.content && Array.isArray(slideData.content)) {
        slideData.content.forEach((point, i) => {
          slide.addText(`• ${point}`, {
            x: 1,
            y: 1 + i * 0.5,
            fontSize: 18,
          });
        });
      }
    });

    // ✅ Generate as base64 file
    const pptx = await pres.write({ outputType: "base64" });

    res.status(200).json({ pptx });
  } catch (error) {
    console.error("❌ Error exporting PPTX:", error);
    res.status(500).json({ error: error.message });
  }
}

