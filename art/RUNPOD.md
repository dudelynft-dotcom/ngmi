# Minting the full 10k on RunPod (ComfyUI + your LoRA)

Your style (LoRA) + CryptoPunk-style traits, generated on your own GPU.
~$5-15 for 10,000 vs ~$250-500 on fal.

---

## STEP 0 (on your machine) - pre-roll the collection
This locks every token's traits up front (exact, resumable, reproducible):
```
node art/build-manifest.mjs 10000
```
-> writes `art/manifest.json` (10,000 tokens) and `art/manifest-rarity.json`.
Open `manifest-rarity.json` and sanity-check the distribution. Re-run to reshuffle.

---

## STEP 1 - launch a RunPod pod
- RunPod -> Deploy -> GPU: **RTX 4090** (cheapest that fits FLUX; A40/A6000 also fine).
- Template: search templates for **"ComfyUI Flux"** (one that PRELOADS `flux1-dev` + clips + vae
  saves a big gated download). Deploy it.
- Make sure HTTP port **8188** is exposed. After boot, "Connect" shows a URL like:
  `https://<POD_ID>-8188.proxy.runpod.net`  ->  this is your **COMFY_URL**.

## STEP 2 - install your LoRA on the pod
Open the pod's **Web Terminal** and run (paste the file, or the two lines):
```
cd /workspace/ComfyUI/models/loras 2>/dev/null || cd /ComfyUI/models/loras
wget -O ngmi.safetensors "https://v3b.fal.media/files/b/0a9ecf2d/LyemRON34U6lT2Jw8f-q6_pytorch_lora_weights.safetensors"
```
(or copy `art/pod-setup.sh` into the pod and `bash pod-setup.sh` - it also verifies the base files).

> Open the ComfyUI web UI once and generate one image manually to confirm the model/clip/vae
> names match. The batch expects: `flux1-dev.safetensors`, `t5xxl_fp16.safetensors`,
> `clip_l.safetensors`, `ae.safetensors`, `ngmi.safetensors`. If any differ, rename on the pod
> or set `LORA_NAME` / edit the workflow node in `runpod-batch.mjs`.

## STEP 3 - TEST RUN (50 images) - do not skip
From your machine (Linux/macOS bash):
```
COMFY_URL=https://<POD_ID>-8188.proxy.runpod.net LORA_NAME=ngmi.safetensors \
  node art/runpod-batch.mjs 50
npm run art:qc
```
**Windows PowerShell** (what you're on):
```
$env:COMFY_URL="https://<POD_ID>-8188.proxy.runpod.net"
$env:LORA_NAME="ngmi.safetensors"
node art/runpod-batch.mjs 50
npm run art:qc
```
(env vars persist in that PowerShell window, so STEP 4 is just `node art/runpod-batch.mjs`.)
Open `art/output/collection/qc/sheet-001.png`. If the look/traits are right -> continue.
If a filename was wrong you'll see errors here (cheap to fix at 50, not 10,000).

## STEP 4 - FULL RUN (10,000)
```
COMFY_URL=https://<POD_ID>-8188.proxy.runpod.net LORA_NAME=ngmi.safetensors \
  node art/runpod-batch.mjs
```
- Resumable: if it disconnects, just run the same command again - it skips finished tokens.
- Tip: run it in `tmux`/`screen`-style persistence or keep the terminal open. Each token ~4-6s.
- Watch progress; it prints every 10th token.

## STEP 5 - QC + fix
```
npm run art:qc
```
- Flip through `art/output/collection/qc/sheet-*.png`; check `_rarity.json`.
- Regenerate a bad one: delete `art/output/collection/images/<id>.png` then re-run STEP 4
  (it reproduces that edition's SAME traits with a fresh image).

## STEP 6 - publish
- Upload `art/output/collection/images/` to IPFS (Pinata / nft.storage) -> get a CID.
- Rewrite each metadata `image` from `ipfs://REPLACE_CID/<id>.png` to your real CID.
- Upload `metadata/` to IPFS -> that CID is your contract `baseURI`.
- **Stop the pod** the moment generation finishes (billing is per-second).

## Cost
RTX 4090 ~$0.40/hr, ~4-6s/image => ~700-900/hr => 10,000 ≈ 12-15 GPU-hrs ≈ **$5-15**.
