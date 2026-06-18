// Match the user's reference EXACTLY via image-to-image: feed a ref punk Pepe,
// swap only the trait, keep the clean pixel base. fal FLUX img2img + jimp clean-up.
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const Jimp = require("jimp");

const KEY = process.env.FAL_KEY;
if (!KEY) { console.error("No FAL_KEY"); process.exit(1); }

// Use a reference as the base (the purple-cap one), then prompt a different trait.
const REF = path.join(__dirname, "assets", "refview-4.png");
const refDataUri = "data:image/png;base64," + fs.readFileSync(REF).toString("base64");

const BASE =
  "clean pixel art CryptoPunk style NFT portrait of a green Pepe the Frog, big white eyes with small black pupils, " +
  "two-tone brown lips, long neck and shoulders, three-quarter view, flat solid colors, crisp hard pixel edges, " +
  "no anti-aliasing, solid muted slate blue-grey background";

const PIECES = [
  { name: "i2i-1-mohawk",  trait: "wearing a tall blue mohawk" },
  { name: "i2i-2-beanie",  trait: "wearing a red knit beanie" },
  { name: "i2i-3-crown",   trait: "wearing a small golden crown, no cap" },
];

async function gen(p) {
  const t0 = Date.now();
  const res = await fetch("https://fal.run/fal-ai/flux/dev/image-to-image", {
    method: "POST",
    headers: { Authorization: "Key " + KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      image_url: refDataUri,
      prompt: `${BASE}, ${p.trait}`,
      strength: 0.72,           // change the headwear, keep the base look
      num_inference_steps: 34,
      image_size: "square_hd",
    }),
  });
  if (!res.ok) { console.error(p.name, "FAILED", res.status, (await res.text()).slice(0, 250)); return; }
  const data = await res.json();
  const url = data.images && data.images[0] && data.images[0].url;
  if (!url) { console.error(p.name, "no url", JSON.stringify(data).slice(0, 200)); return; }
  const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
  const img = await Jimp.read(buf);
  img.cover(512, 512).resize(32, 32, Jimp.RESIZE_NEAREST_NEIGHBOR).posterize(16).resize(576, 576, Jimp.RESIZE_NEAREST_NEIGHBOR);
  await img.writeAsync(path.join(__dirname, "assets", `${p.name}.png`));
  console.log(`OK ${p.name} (${(Date.now()-t0)/1000}s)`);
}

(async () => { for (const p of PIECES) { try { await gen(p); } catch (e) { console.error(p.name, e.message); } } })();
