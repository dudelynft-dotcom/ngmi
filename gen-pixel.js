// Sample generator: CryptoPunk-style PIXEL Pepe heads via fal.ai (FLUX),
// then pixelated with jimp to lock a crisp sprite grid. Saved to assets/.
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const Jimp = require("jimp");

const KEY = process.env.FAL_KEY;
if (!KEY) { console.error("No FAL_KEY in .env"); process.exit(1); }

// Hold the style + framing constant; only the trait line changes per piece.
const STYLE =
  "extreme close-up pixel art head-and-shoulders portrait of the classic smug Pepe the Frog meme face, " +
  "flat green skin, big droopy half-closed eyes with small round pupils looking to the side, " +
  "long wide flat reddish lips in a smug smirk, the head fills the whole frame and is cropped at the shoulders, " +
  "three-quarter view facing slightly left, CryptoPunk NFT sprite aesthetic, very low resolution with big chunky square pixels, " +
  "flat solid colors, no shading, no anti-aliasing, hard pixel edges, solid flat slate blue-grey background, " +
  "no body, no legs, just the head and shoulders";

const PIECES = [
  { name: "px-1-spiky",   trait: "messy spiky black punk hair" },
  { name: "px-4-cap",     trait: "purple snapback baseball cap worn forward" },
  { name: "px-6-cig",     trait: "wild blonde hair and a lit cigarette in the mouth" },
];

async function gen(p) {
  const t0 = Date.now();
  const res = await fetch("https://fal.run/fal-ai/flux/dev", {
    method: "POST",
    headers: { Authorization: "Key " + KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: `${STYLE}, wearing ${p.trait}`,
      image_size: "square_hd", num_images: 1, num_inference_steps: 30,
    }),
  });
  if (!res.ok) { console.error(p.name, "FAILED", res.status, (await res.text()).slice(0, 200)); return; }
  const data = await res.json();
  const url = data.images && data.images[0] && data.images[0].url;
  if (!url) { console.error(p.name, "no url"); return; }
  const buf = Buffer.from(await (await fetch(url)).arrayBuffer());

  // Pixelate: downscale to a small grid (nearest), posterize the palette, upscale (nearest).
  const img = await Jimp.read(buf);
  const GRID = 28;          // coarser sprite resolution (true-punk chunky pixels)
  const OUT = 560;          // display size (GRID * 20)
  img.cover(512, 512)
     .resize(GRID, GRID, Jimp.RESIZE_NEAREST_NEIGHBOR)
     .posterize(12)
     .resize(OUT, OUT, Jimp.RESIZE_NEAREST_NEIGHBOR);
  const out = path.join(__dirname, "assets", `${p.name}.png`);
  await img.writeAsync(out);
  console.log(`OK ${p.name} -> assets/${p.name}.png (${(Date.now()-t0)/1000}s)`);
}

(async () => {
  for (const p of PIECES) {
    try { await gen(p); } catch (e) { console.error(p.name, "ERR", e.message); }
  }
})();
