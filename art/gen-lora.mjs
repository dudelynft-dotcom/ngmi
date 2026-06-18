// Generates Pepes in the user's EXACT reference style (via the trained LoRA),
// with traits controlled by the prompt. Run: node art/gen-lora.mjs
import "dotenv/config";
import { fal } from "@fal-ai/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
fal.config({ credentials: process.env.FAL_KEY });

const { loraUrl, trigger } = JSON.parse(fs.readFileSync(path.join(__dirname, "lora.json"), "utf8"));
const STYLE = `${trigger}, pixel art CryptoPunk style portrait of the Pepe the Frog meme face, green skin, big white eyes with small black pupils, two-tone brown lips, solid muted slate-blue background, clean crisp pixels, flat colors, centered`;

const SAMPLES = [
  { name: "lora-1-mohawk", trait: "wearing a tall red mohawk" },
  { name: "lora-2-cap",    trait: "wearing a purple baseball cap, gold earring" },
  { name: "lora-3-beanie", trait: "wearing a dark blue knit beanie" },
  { name: "lora-4-crown",  trait: "wearing a golden crown" },
  { name: "lora-5-shades", trait: "wearing black sunglasses" },
  { name: "lora-6-cig",    trait: "wearing a beanie, cigarette in mouth" },
];

const out = path.join(__dirname, "output", "lora");
fs.mkdirSync(out, { recursive: true });

for (const s of SAMPLES) {
  const t0 = Date.now();
  const r = await fal.subscribe("fal-ai/flux-lora", {
    input: {
      prompt: `${STYLE}, ${s.trait}`,
      loras: [{ path: loraUrl, scale: 1.05 }],
      image_size: "square_hd",
      num_inference_steps: 30,
      guidance_scale: 3.5,
      num_images: 1,
    },
  });
  const url = r.data?.images?.[0]?.url;
  if (!url) { console.log(s.name, "NO IMAGE", JSON.stringify(r.data).slice(0, 160)); continue; }
  const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
  fs.writeFileSync(path.join(out, `${s.name}.png`), buf);
  console.log(`OK ${s.name} (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
}
console.log("Done -> art/output/lora/");
