// api/export.ts
import pptxgen from "pptxgenjs";
import { NextResponse } from "next/server";

export const config = {
  runtime: "edge",
};

export default async function handler(req: Request) {
  try {
    const { slides } = await req.json();
    if (!slides) {
      return NextResponse.json({ error: "Slides JSON missing" }, { status: 400 });
    }

    const pres = new pptxgen();

    slides.forEach((slideData: any) => {
      const slide = pres.addSlide();
      slide.addText(slideData.title || "Untitled", {
        x: 1,
        y: 0.5,
        fontSize: 28,
        bold: true,
      });

      if (slideData.content && Array.isArray(slideData.content)) {
        slideData.content.forEach((point: string, i: number) => {
          slide.addText(`• ${point}`, {
            x: 1,
            y: 1 + i * 0.5,
            fontSize: 18,
          });
        });
      }
    });

    const pptx = await pres.write("base64");
    return NextResponse.json({ pptx });
  } catch (error: any) {
    console.error("Error exporting PPTX:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
