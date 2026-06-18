// Snaps FLUX's soft "pixel art" into crisp hard pixels:
//   downscale-average to a grid (flattens anti-aliasing) -> nearest-neighbor upscale.
// Keeps originals; writes to images_px/. Test a few first, then run on all.
//   GRID=40 ONLY=26,32 node art/pixelate.js     # preview two
//   GRID=40 node art/pixelate.js                # whole folder
const Jimp = require("jimp");
const fs = require("fs");
const path = require("path");

const SRC = process.env.SRC || path.join(__dirname, "output", "collection", "images");
const DST = process.env.DST || path.join(__dirname, "output", "collection", "images_px");
const GRID = Number(process.env.GRID) || 40;          // native pixel resolution to snap to
const OUT = Number(process.env.OUT) || (GRID * 24);   // final px (multiple of GRID = even blocks)
const POSTERIZE = Number(process.env.POSTERIZE) || 0; // 0=off; else color levels e.g. 24 to flatten shading
const ONLY = process.env.ONLY ? process.env.ONLY.split(",").map(s => s.trim() + ".png") : null;

fs.mkdirSync(DST, { recursive: true });
const files = fs.readdirSync(SRC).filter(f => /\.png$/i.test(f)).filter(f => !ONLY || ONLY.includes(f));

(async () => {
  let n = 0;
  for (const f of files) {
    const img = await Jimp.read(path.join(SRC, f));
    img.resize(GRID, GRID, Jimp.RESIZE_BILINEAR);            // average soft edges into flat blocks
    if (POSTERIZE) img.posterize(POSTERIZE);
    img.resize(OUT, OUT, Jimp.RESIZE_NEAREST_NEIGHBOR);      // blow back up = crisp hard pixels
    await img.writeAsync(path.join(DST, f));
    if (++n % 250 === 0) console.log(n, "done");
  }
  console.log(`Pixelated ${files.length} -> ${DST}  (GRID=${GRID}, OUT=${OUT}, POSTERIZE=${POSTERIZE || "off"})`);
})();
