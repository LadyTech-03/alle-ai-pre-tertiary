import sharp from "sharp";
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

export async function POST(req: Request) {
  try {
    const { imageUrl, modelName } = await req.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "imageUrl is required" },
        { status: 400 }
      );
    }

    // 1️⃣ Fetch remote image → BUFFER
    const imageRes = await fetch(imageUrl);
    if (!imageRes.ok) {
      throw new Error(`Failed to fetch image: ${imageRes.status}`);
    }

    const imageBuffer = Buffer.from(await imageRes.arrayBuffer());

    // 2️⃣ Load watermark from LOCAL FILESYSTEM
    const watermarkPath = path.join(
      process.cwd(),
      "public",
      "svgs",
      "watermark.png"
    );

    await fs.access(watermarkPath); // fail fast if missing

    const watermarkBuffer = await sharp(watermarkPath)
      .resize({ width: 150, withoutEnlargement: true })
      .toBuffer();

    // Compute position
    const base = sharp(imageBuffer);
    const baseMeta = await base.metadata();
    const watermarkMeta = await sharp(watermarkBuffer).metadata();

    // const shadowBuffer = await sharp({
    //     create: {
    //     width: watermarkMeta.width!,
    //     height: watermarkMeta.height!,
    //     channels: 4,
    //     background: { r: 0, g: 0, b: 0, alpha: 0.3 } // black with 30% opacity
    //     }
    // })
    // .png()
    // .toBuffer();

    // const blurredShadow = await sharp(shadowBuffer)
    // .blur(2) // adjust the radius for softness
    // .toBuffer();

    const rightMargin = 40;
    const bottomMargin = 40;
    const left = baseMeta.width! - watermarkMeta.width! - rightMargin;
    const top = baseMeta.height! - watermarkMeta.height! - bottomMargin;

    // 3️⃣ Composite buffers (NO URLs involved)
    const output = await sharp(imageBuffer)
      .composite([
        // { input: blurredShadow, left, top },
        { input: watermarkBuffer, left, top }
      ])
      .png()
      .toBuffer();

    return new NextResponse(output, {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename=Alle-AI-${modelName}.png`,
      },
    });
  } catch (err: any) {
    console.error("Watermark API error:", err);

    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
