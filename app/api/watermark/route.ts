import sharp from "sharp";
import path from "path";
import fs from "fs/promises";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const imageUrl = searchParams.get("imageUrl");
    if (!imageUrl) throw new Error("imageUrl is required");

    // Fetch original image
    const imageRes = await fetch(imageUrl);
    if (!imageRes.ok) throw new Error(`Failed to fetch image: ${imageRes.status}`);
    const imageBuffer = Buffer.from(await imageRes.arrayBuffer());

    // Load watermark
    const watermarkPath = path.join(process.cwd(), "public", "svgs", "watermark.png");
    await fs.access(watermarkPath);
    const watermarkBuffer = await sharp(watermarkPath)
      .resize({ width: 150, withoutEnlargement: true })
      .toBuffer();

    // Compute position
    const base = sharp(imageBuffer);
    const baseMeta = await base.metadata();
    const watermarkMeta = await sharp(watermarkBuffer).metadata();

  //   const shadowBuffer = await sharp({
  //     create: {
  //       width: watermarkMeta.width!,
  //       height: watermarkMeta.height!,
  //       channels: 4,
  //       background: { r: 0, g: 0, b: 0, alpha: 0.3 } // black with 30% opacity
  //     }
  //   })
  // .png()
  // .toBuffer();

    // const blurredShadow = await sharp(shadowBuffer)
    // .blur(2) // adjust the radius for softness
    // .toBuffer();

    const rightMargin = 40;
    const bottomMargin = 40;
    const left = baseMeta.width! - watermarkMeta.width! - rightMargin;
    const top = baseMeta.height! - watermarkMeta.height! - bottomMargin;

    // Composite
    const output = await sharp(imageBuffer)
      .composite([
        // { input: blurredShadow, left, top },
        { input: watermarkBuffer, left, top }
      ])
      .png()
      .toBuffer();

    return new Response(output, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600"
      }
    });

  } catch (err: any) {
    console.error("Watermark GET error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
