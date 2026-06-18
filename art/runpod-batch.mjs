// Mass-generate the collection on your own GPU via ComfyUI (RunPod). Same traits/prompts
// as gen-collection.mjs, but hits a ComfyUI server instead of fal -> ~30x cheaper for 10k.
//
//   COMFY_URL=https://<pod>-8188.proxy.runpod.net LORA_NAME=ngmi.safetensors \
//   node art/runpod-batch.mjs 10000
//
// Resumable: re-run and it skips editions whose image already exists.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import traits from "./traits.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SUPPLY = Number(process.argv[2]) || 10;
const COMFY = (process.env.COMFY_URL || "http://127.0.0.1:8188").replace(/\/$/, "");
const LORA_NAME = process.env.LORA_NAME || "ngmi.safetensors";
const LORA_SCALE = Number(process.env.LORA_SCALE) || 1.05;
const STEPS = Number(process.env.STEPS) || 30;
const SIZE = Number(process.env.SIZE) || 1024;
const trigger = JSON.parse(fs.readFileSync(path.join(__dirname, "lora.json"), "utf8")).trigger || "NGMIPEPE";

const OUT = path.join(__dirname, "output", "collection");
const IMG = path.join(OUT, "images"), META = path.join(OUT, "metadata");
fs.mkdirSync(IMG, { recursive: true }); fs.mkdirSync(META, { recursive: true });

const cats = Object.entries(traits.categories);
const pick = (o) => { const t = o.reduce((a, x) => a + x.weight, 0); let r = Math.random() * t; for (const x of o) if ((r -= x.weight) < 0) return x; return o.at(-1); };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const clientId = "ngmi-" + Math.floor(Math.random() * 1e9);

// FLUX-dev + LoRA workflow in ComfyUI API format.
function workflow(prompt, seed) {
  return {
    "10": { class_type: "VAELoader", inputs: { vae_name: "ae.safetensors" } },
    "11": { class_type: "DualCLIPLoader", inputs: { clip_name1: "t5xxl_fp16.safetensors", clip_name2: "clip_l.safetensors", type: "flux" } },
    "12": { class_type: "UNETLoader", inputs: { unet_name: "flux1-dev.safetensors", weight_dtype: "default" } },
    "30": { class_type: "LoraLoaderModelOnly", inputs: { model: ["12", 0], lora_name: LORA_NAME, strength_model: LORA_SCALE } },
    "6":  { class_type: "CLIPTextEncode", inputs: { text: prompt, clip: ["11", 0] } },
    "26": { class_type: "FluxGuidance", inputs: { conditioning: ["6", 0], guidance: 3.5 } },
    "5":  { class_type: "EmptySD3LatentImage", inputs: { width: SIZE, height: SIZE, batch_size: 1 } },
    "16": { class_type: "KSamplerSelect", inputs: { sampler_name: "euler" } },
    "17": { class_type: "BasicScheduler", inputs: { model: ["30", 0], scheduler: "simple", steps: STEPS, denoise: 1.0 } },
    "22": { class_type: "BasicGuider", inputs: { model: ["30", 0], conditioning: ["26", 0] } },
    "25": { class_type: "RandomNoise", inputs: { noise_seed: seed } },
    "13": { class_type: "SamplerCustomAdvanced", inputs: { noise: ["25", 0], guider: ["22", 0], sampler: ["16", 0], sigmas: ["17", 0], latent_image: ["5", 0] } },
    "8":  { class_type: "VAEDecode", inputs: { samples: ["13", 0], vae: ["10", 0] } },
    "9":  { class_type: "SaveImage", inputs: { images: ["8", 0], filename_prefix: "ngmi" } },
  };
}

async function queue(prompt, seed) {
  const res = await fetch(`${COMFY}/prompt`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: workflow(prompt, seed), client_id: clientId }) });
  if (!res.ok) throw new Error(`/prompt ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return (await res.json()).prompt_id;
}
async function waitImage(id, tries = 240) {
  for (let i = 0; i < tries; i++) {
    const h = await (await fetch(`${COMFY}/history/${id}`)).json();
    const entry = h[id];
    if (entry?.outputs) {
      for (const n of Object.values(entry.outputs)) if (n.images?.length) return n.images[0];
    }
    await sleep(1000);
  }
  throw new Error("timed out waiting for image");
}
async function fetchImage(img) {
  const u = new URL(`${COMFY}/view`);
  u.search = new URLSearchParams({ filename: img.filename, subfolder: img.subfolder || "", type: img.type || "output" }).toString();
  return Buffer.from(await (await fetch(u)).arrayBuffer());
}

const seen = new Set();
let edition = 0, attempts = 0, made = 0;
console.log(`ComfyUI: ${COMFY}  |  LoRA: ${LORA_NAME}  |  target: ${SUPPLY}`);

while (edition < SUPPLY && attempts < SUPPLY * 40) {
  attempts++;
  const dna = Object.fromEntries(cats.map(([c, o]) => [c, pick(o)]));
  const key = cats.map(([c]) => dna[c].value).join("|");
  if (seen.has(key)) continue;
  seen.add(key);
  edition++;

  if (fs.existsSync(path.join(IMG, `${edition}.png`))) continue; // resume

  const frags = cats.map(([c]) => dna[c].prompt).filter(Boolean);
  const prompt = `${trigger}, ${traits.styleBase}, ${frags.join(", ")}`;
  const seed = (Math.floor(Math.random() * 2 ** 31)) ^ edition;
  const attrs = cats.map(([c]) => ({ trait_type: c, value: dna[c].value })).filter(a => !/^(none|plain|normal)$/i.test(a.value));

  try {
    const t0 = Date.now();
    const img = await fetchImage(await waitImage(await queue(prompt, seed)));
    fs.writeFileSync(path.join(IMG, `${edition}.png`), img);
    fs.writeFileSync(path.join(META, `${edition}.json`), JSON.stringify({
      name: `NGMI #${edition}`, description: "10,000 pre-rugged Pepes. You are the exit liquidity.",
      image: `ipfs://REPLACE_CID/${edition}.png`, edition, attributes: attrs,
    }, null, 2));
    made++;
    console.log(`#${edition} (${((Date.now() - t0) / 1000).toFixed(1)}s) ${attrs.map(a => a.value).join(", ") || "bare"}`);
  } catch (e) {
    console.log(`#${edition} FAILED: ${e.message} - retrying later`);
    edition--; seen.delete(key);
    await sleep(2000);
  }
}
console.log(`\nDone. Made ${made} this run -> art/output/collection/`);
