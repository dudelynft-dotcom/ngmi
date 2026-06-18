# Generating the 10k on RunPod (ComfyUI + your LoRA)

Same style + traits as the fal demo, but on your own GPU. ~$6-15 for 10,000 instead of $250-500.

## 1. Launch a pod
- RunPod -> Deploy -> pick a GPU: **RTX 4090** (cheapest that fits FLUX) or A40/A6000.
- Template: a **ComfyUI + FLUX** template (search the RunPod template list for "ComfyUI Flux").
  Using a FLUX-preloaded template saves you the large gated `flux1-dev` download.
- Expose HTTP port **8188**. After it boots, RunPod gives you a URL like:
  `https://<POD_ID>-8188.proxy.runpod.net`  <- this is your `COMFY_URL`.

## 2. Put the models in place (in the pod's `ComfyUI/models/`)
If the template didn't already include them:
- `unet/flux1-dev.safetensors`   (or `checkpoints/` depending on template)
- `clip/t5xxl_fp16.safetensors`  and  `clip/clip_l.safetensors`
- `vae/ae.safetensors`
- `loras/ngmi.safetensors`  <- **your trained LoRA**. Download it from the URL in `art/lora.json`:
  ```
  cd ComfyUI/models/loras
  wget -O ngmi.safetensors "<loraUrl from art/lora.json>"
  ```

> Tip: open the ComfyUI web UI once and generate a single image manually to confirm the
> model/clip/vae/lora names match what's in `runpod-batch.mjs` (UNETLoader / DualCLIPLoader /
> VAELoader / LoraLoaderModelOnly). If a filename differs, set it via env or edit the workflow.

## 3. Run the batch (from your local machine)
```
COMFY_URL=https://<POD_ID>-8188.proxy.runpod.net LORA_NAME=ngmi.safetensors \
  node art/runpod-batch.mjs 10000
```
Optional env: `LORA_SCALE` (default 1.05), `STEPS` (30), `SIZE` (1024).

- Outputs go to `art/output/collection/images` + `metadata`.
- **Resumable:** re-run the same command and it skips editions already saved (safe across disconnects).
- Failures auto-retry.

## 4. After generation
- QC pass: eyeball the sheet, regenerate any malformed ones (delete its `N.png` + rerun).
- Upload `images/` to IPFS (e.g. nft.storage / Pinata), get the CID.
- Set `image` base in metadata to `ipfs://<CID>/<id>.png` (or rewrite the metadata `image` field).
- Mint with your contract / launchpad; list on OpenSea.

## Cost math
RTX 4090 ~$0.40/hr, ~4-6s per 1024px FLUX image => ~700-900 img/hr =>
10,000 ≈ 12-15 GPU-hours ≈ **$5-15** total. Stop the pod the moment it finishes.
