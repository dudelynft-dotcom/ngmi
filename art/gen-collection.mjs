// Full collection generator: weighted-random traits -> prompt -> LoRA image -> ERC-721 metadata.
// Demo on fal; for the real 10k, run the SAME prompts through ComfyUI on RunPod (far cheaper).
//   node art/gen-collection.mjs 5      <- generate 5 (default 5)
import "dotenv/config";
import { fal } from "@fal-ai/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import traits from "./traits.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
fal.config({ credentials: process.env.FAL_KEY });

const SUPPLY = Number(process.argv[2]) || 5;
const { loraUrl, trigger } = JSON.parse(fs.readFileSync(path.join(__dirname, "lora.json"), "utf8"));
const OUT = path.join(__dirname, "output", "collection");
const IMG = path.join(OUT, "images"), META = path.join(OUT, "metadata");
fs.mkdirSync(IMG, { recursive: true }); fs.mkdirSync(META, { recursive: true });

const pick = (opts) => { const t = opts.reduce((a, o) => a + o.weight, 0); let r = Math.random() * t; for (const o of opts) if ((r -= o.weight) < 0) return o; return opts.at(-1); };
const cats = Object.entries(traits.categories);

function rollDna() {
  const dna = {};
  for (const [cat, opts] of cats) dna[cat] = pick(opts);
  return dna;
}
function buildPrompt(dna) {
  const frags = cats.map(([cat]) => dna[cat].prompt).filter(Boolean);
  return `${trigger}, ${traits.styleBase}, ${frags.join(", ")}`;
}
function attributes(dna) {
  return cats.map(([cat]) => ({ trait_type: cat, value: dna[cat].value }))
    .filter(a => !/^(none|plain|normal)$/i.test(a.value));
}

const seen = new Set();
let edition = 0, attempts = 0;
console.log(`Generating ${SUPPLY} tokens with LoRA...`);

while (edition < SUPPLY && attempts < SUPPLY * 30) {
  attempts++;
  const dna = rollDna();
  const key = cats.map(([c]) => dna[c].value).join("|");
  if (seen.has(key)) continue;
  seen.add(key);
  edition++;

  const prompt = buildPrompt(dna);
  const t0 = Date.now();
  const r = await fal.subscribe("fal-ai/flux-lora", {
    input: { prompt, loras: [{ path: loraUrl, scale: 1.05 }], image_size: "square_hd", num_inference_steps: 30, guidance_scale: 3.5, num_images: 1 },
  });
  const url = r.data?.images?.[0]?.url;
  if (!url) { console.log(`#${edition} NO IMAGE, retrying`); edition--; seen.delete(key); continue; }
  fs.writeFileSync(path.join(IMG, `${edition}.png`), Buffer.from(await (await fetch(url)).arrayBuffer()));
  fs.writeFileSync(path.join(META, `${edition}.json`), JSON.stringify({
    name: `NGMI #${edition}`,
    description: "10,000 pre-rugged Pepes. You are the exit liquidity.",
    image: `ipfs://REPLACE_CID/${edition}.png`,
    edition,
    attributes: attributes(dna),
  }, null, 2));
  console.log(`#${edition} (${((Date.now() - t0) / 1000).toFixed(1)}s) ${attributes(dna).map(a => a.value).join(", ") || "bare"}`);
}
console.log(`\nDone -> art/output/collection/ (${edition} tokens, images + metadata)`);
