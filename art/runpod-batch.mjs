// Mass-generate the collection on your own GPU via ComfyUI (RunPod), from art/manifest.json.
// Same look as fal (your LoRA), ~30x cheaper for 10k. Exact, resumable, reproducible.
//
//   1) node art/build-manifest.mjs 10000          # pre-roll all traits
//   2) COMFY_URL=https://<pod>-8188.proxy.runpod.net LORA_NAME=ngmi.safetensors \
//        node art/runpod-batch.mjs 50              # TEST first 50
//   3) ... node art/runpod-batch.mjs               # no number = whole manifest
//
// Resumable: re-run and it skips editions whose image already exists.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COMFY = (process.env.COMFY_URL || "http://127.0.0.1:8188").replace(/\/$/, "");
const LORA_NAME = process.env.LORA_NAME || "ngmi.safetensors";
const LORA_SCALE = Number(process.env.LORA_SCALE) || 1.05;
const STEPS = Number(process.env.STEPS) || 30;
const SIZE = Number(process.env.SIZE) || 1024;
// Model mode: default = single-file fp8 checkpoint (non-gated, easy). Set SEPARATE_FILES=1
// to instead use unet + dual-clip + vae (e.g. a template that ships flux1-dev.safetensors).
const CKPT_NAME = process.env.CKPT_NAME || "flux1-dev-fp8.safetensors";
const SEPARATE = !!process.env.SEPARATE_FILES;

const manifestPath = path.join(__dirname, "manifest.json");
if (!fs.existsSync(manifestPath)) { console.error("No art/manifest.json - run: node art/build-manifest.mjs 10000"); process.exit(1); }
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const LIMIT = process.argv[2] ? Number(process.argv[2]) : manifest.length;
const todo = manifest.slice(0, LIMIT);

const OUT = path.join(__dirname, "output", "collection");
const IMG = path.join(OUT, "images"), META = path.join(OUT, "metadata");
fs.mkdirSync(IMG, { recursive: true }); fs.mkdirSync(META, { recursive: true });

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const clientId = "ngmi-" + manifest.length;

function workflow(prompt, seed) {
  // sampler/guider/output chain shared by both model modes
  const tail = (modelRef, clipRef, vaeRef) => ({
    "30": { class_type: "LoraLoaderModelOnly", inputs: { model: modelRef, lora_name: LORA_NAME, strength_model: LORA_SCALE } },
    "6":  { class_type: "CLIPTextEncode", inputs: { text: prompt, clip: clipRef } },
    "26": { class_type: "FluxGuidance", inputs: { conditioning: ["6", 0], guidance: 3.5 } },
    "5":  { class_type: "EmptySD3LatentImage", inputs: { width: SIZE, height: SIZE, batch_size: 1 } },
    "16": { class_type: "KSamplerSelect", inputs: { sampler_name: "euler" } },
    "17": { class_type: "BasicScheduler", inputs: { model: ["30", 0], scheduler: "simple", steps: STEPS, denoise: 1.0 } },
    "22": { class_type: "BasicGuider", inputs: { model: ["30", 0], conditioning: ["26", 0] } },
    "25": { class_type: "RandomNoise", inputs: { noise_seed: seed } },
    "13": { class_type: "SamplerCustomAdvanced", inputs: { noise: ["25", 0], guider: ["22", 0], sampler: ["16", 0], sigmas: ["17", 0], latent_image: ["5", 0] } },
    "8":  { class_type: "VAEDecode", inputs: { samples: ["13", 0], vae: vaeRef } },
    "9":  { class_type: "SaveImage", inputs: { images: ["8", 0], filename_prefix: "ngmi" } },
  });
  if (SEPARATE) {
    return {
      "10": { class_type: "VAELoader", inputs: { vae_name: "ae.safetensors" } },
      "11": { class_type: "DualCLIPLoader", inputs: { clip_name1: "t5xxl_fp16.safetensors", clip_name2: "clip_l.safetensors", type: "flux" } },
      "12": { class_type: "UNETLoader", inputs: { unet_name: "flux1-dev.safetensors", weight_dtype: "default" } },
      ...tail(["12", 0], ["11", 0], ["10", 0]),
    };
  }
  // default: single-file fp8 checkpoint (MODEL/CLIP/VAE from one loader)
  return {
    "4": { class_type: "CheckpointLoaderSimple", inputs: { ckpt_name: CKPT_NAME } },
    ...tail(["4", 0], ["4", 1], ["4", 2]),
  };
}
async function queue(prompt, seed) {
  const res = await fetch(`${COMFY}/prompt`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: workflow(prompt, seed), client_id: clientId }) });
  if (!res.ok) throw new Error(`/prompt ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return (await res.json()).prompt_id;
}
async function waitImage(id, tries = 300) {
  for (let i = 0; i < tries; i++) {
    const h = await (await fetch(`${COMFY}/history/${id}`)).json();
    const out = h[id]?.outputs;
    if (out) for (const n of Object.values(out)) if (n.images?.length) return n.images[0];
    await sleep(1000);
  }
  throw new Error("timed out waiting for image");
}
async function fetchImage(img) {
  const u = new URL(`${COMFY}/view`);
  u.search = new URLSearchParams({ filename: img.filename, subfolder: img.subfolder || "", type: img.type || "output" }).toString();
  return Buffer.from(await (await fetch(u)).arrayBuffer());
}

let made = 0, skipped = 0, failed = 0;
console.log(`ComfyUI: ${COMFY} | LoRA: ${LORA_NAME} | tokens: ${todo.length}/${manifest.length}`);

for (const m of todo) {
  if (fs.existsSync(path.join(IMG, `${m.edition}.png`))) { skipped++; continue; }
  try {
    const t0 = Date.now();
    const img = await fetchImage(await waitImage(await queue(m.prompt, m.seed)));
    fs.writeFileSync(path.join(IMG, `${m.edition}.png`), img);
    fs.writeFileSync(path.join(META, `${m.edition}.json`), JSON.stringify({
      name: `NGMI #${m.edition}`, description: "10,000 pre-rugged Pepes. You are the exit liquidity.",
      image: `ipfs://REPLACE_CID/${m.edition}.png`, edition: m.edition, attributes: m.attributes,
    }, null, 2));
    made++;
    if (made % 10 === 0 || made === 1) console.log(`#${m.edition} (${((Date.now() - t0) / 1000).toFixed(1)}s) ${m.attributes.map(a => a.value).join(", ") || "bare"}  [${made} made / ${skipped} skip]`);
  } catch (e) {
    failed++;
    console.log(`#${m.edition} FAILED: ${e.message}`);
    await sleep(2000);
  }
}
console.log(`\nDone. made=${made} skipped=${skipped} failed=${failed}. Re-run to retry failures. -> art/output/collection/`);
