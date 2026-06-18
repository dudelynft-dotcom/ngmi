// One-off: generate 3 sample "rugged Pepe" pieces via fal.ai (FLUX), saved to assets/.
require("dotenv").config();
const fs = require("fs");
const path = require("path");

const KEY = process.env.FAL_KEY;
if (!KEY) { console.error("No FAL_KEY in .env"); process.exit(1); }

const STYLE =
  "hand-drawn flat 2D cartoon illustration, bold black ink outlines, thick confident hand-drawn linework, " +
  "limited flat color palette, screen-print / risograph poster aesthetic with subtle halftone grain, cel shaded, " +
  "no gradients, no 3d render, not photorealistic, indie comic sticker art, drawn by a human illustrator, " +
  "off-white paper background";

const PROMPTS = [
  {
    name: "sample-1-sob",
    prompt: `A sad green cartoon frog character (Pepe-like) with big teary bloodshot eyes and a trembling frown, ` +
      `wearing a crumpled tinfoil hat, clutching a smartphone that shows a red crashing downtrend stock chart, ` +
      `a red rubber stamp reading "RUGGED" slapped across the corner, faint red chart lines in the background, ` +
      `palette of acid lime green, black, off-white and alarm red. ${STYLE}`,
  },
  {
    name: "sample-2-dead",
    prompt: `A defeated grey-green cartoon frog character (Pepe-like) with X-shaped dead eyes and a flat straight-line mouth, ` +
      `a brown paper bag pulled halfway over its head, slumped shoulders, gritty halftone texture, ` +
      `"EXIT LIQUIDITY" stamped in red, liquidation orange-red and sickly green palette with black and off-white. ${STYLE}`,
  },
  {
    name: "sample-3-cope",
    prompt: `A coping green cartoon frog character (Pepe-like) with a forced wide fake smile but a hollow thousand-yard stare, ` +
      `wearing a tiny cheap golden paper crown, holding an empty open wallet upside down with a single moth flying out, ` +
      `"NGMI" stamped in the corner, palette of acid lime green, gold, black, off-white and red. ${STYLE}`,
  },
];

async function gen(p) {
  const t0 = Date.now();
  const res = await fetch("https://fal.run/fal-ai/flux/dev", {
    method: "POST",
    headers: { Authorization: "Key " + KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: p.prompt, image_size: "square_hd", num_images: 1, num_inference_steps: 30, enable_safety_checker: true }),
  });
  if (!res.ok) { console.error(p.name, "FAILED", res.status, (await res.text()).slice(0, 300)); return; }
  const data = await res.json();
  const url = data.images && data.images[0] && data.images[0].url;
  if (!url) { console.error(p.name, "no image url", JSON.stringify(data).slice(0, 200)); return; }
  const img = await fetch(url);
  const buf = Buffer.from(await img.arrayBuffer());
  const ext = (data.images[0].content_type || "image/jpeg").includes("png") ? "png" : "jpg";
  const out = path.join(__dirname, "assets", `${p.name}.${ext}`);
  fs.writeFileSync(out, buf);
  console.log(`OK ${p.name} -> assets/${p.name}.${ext} (${(buf.length/1024|0)}KB, ${(Date.now()-t0)/1000}s)`);
}

(async () => {
  for (const p of PROMPTS) {
    try { await gen(p); } catch (e) { console.error(p.name, "ERR", e.message); }
  }
})();
