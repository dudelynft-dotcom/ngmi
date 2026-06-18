// Trains a FLUX style LoRA on the user's 5 reference Pepes so we can reproduce
// that EXACT art style on demand, then control traits via the prompt.
// Run: node art/train-lora.mjs   (takes a few minutes; uses FAL credits)
import "dotenv/config";
import { fal } from "@fal-ai/client";
import AdmZip from "adm-zip";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
fal.config({ credentials: process.env.FAL_KEY });

const REF_DIR = path.join(__dirname, "..", "assets", "ref image");
const refs = fs.readdirSync(REF_DIR).filter(f => /\.(jfif|jpg|jpeg|png)$/i.test(f));
console.log("Reference images:", refs.length, refs);

// Zip the references (rename .jfif -> .jpg; they are already JPEG).
const zip = new AdmZip();
refs.forEach((f, i) => zip.addFile(`ref_${i + 1}.jpg`, fs.readFileSync(path.join(REF_DIR, f))));
const zipBuf = zip.toBuffer();
console.log("Zip built:", (zipBuf.length / 1024).toFixed(0), "KB");

// Upload zip to fal storage
const file = new File([zipBuf], "ngmi-refs.zip", { type: "application/zip" });
const dataUrl = await fal.storage.upload(file);
console.log("Uploaded:", dataUrl);

// Train style LoRA
console.log("Training LoRA (this takes a few minutes)...");
const result = await fal.subscribe("fal-ai/flux-lora-fast-training", {
  input: {
    images_data_url: dataUrl,
    trigger_word: "NGMIPEPE",
    is_style: true,
    steps: 1000,
    create_masks: false,
  },
  logs: true,
  onQueueUpdate: (u) => { if (u.status === "IN_PROGRESS") (u.logs || []).slice(-1).forEach(l => l && console.log("  ", l.message)); },
});

const loraUrl = result.data?.diffusers_lora_file?.url;
console.log("\nLoRA trained:", loraUrl);
fs.writeFileSync(path.join(__dirname, "lora.json"), JSON.stringify({ loraUrl, trigger: "NGMIPEPE", trainedFrom: refs }, null, 2));
console.log("Saved -> art/lora.json");
