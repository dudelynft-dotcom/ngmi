#!/usr/bin/env bash
# Run this INSIDE the RunPod pod (Web Terminal) to install the NGMI LoRA into ComfyUI.
# Assumes a ComfyUI+FLUX template that already has flux1-dev / clips / vae.
set -e

# Adjust if your template puts ComfyUI elsewhere:
COMFY_DIR="${COMFY_DIR:-/workspace/ComfyUI}"
[ -d "$COMFY_DIR" ] || COMFY_DIR="/ComfyUI"
echo "ComfyUI dir: $COMFY_DIR"

mkdir -p "$COMFY_DIR/models/loras"
echo "Downloading NGMI LoRA..."
wget -q --show-progress -O "$COMFY_DIR/models/loras/ngmi.safetensors" \
  "https://v3b.fal.media/files/b/0a9ecf2d/LyemRON34U6lT2Jw8f-q6_pytorch_lora_weights.safetensors"

echo
echo "LoRA installed: $COMFY_DIR/models/loras/ngmi.safetensors"
echo "Now confirm these base files exist (from your template):"
for f in models/unet/flux1-dev.safetensors models/clip/t5xxl_fp16.safetensors models/clip/clip_l.safetensors models/vae/ae.safetensors; do
  if [ -f "$COMFY_DIR/$f" ]; then echo "  OK   $f"; else echo "  MISSING  $f  <-- fix before running the batch"; fi
done
echo
echo "If a name differs, note it - the batch uses: flux1-dev.safetensors, t5xxl_fp16.safetensors, clip_l.safetensors, ae.safetensors, ngmi.safetensors"
