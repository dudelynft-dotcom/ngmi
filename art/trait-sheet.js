// Renders a labeled preview of every individual trait (on the base Pepe) so you can eyeball them.
const Jimp = require("jimp");
const fs = require("fs");
const path = require("path");
const cfg = require("./config");
const L = path.join(__dirname, "layers");

const read = (p) => Jimp.read(p);
const opt = (layer) => fs.existsSync(path.join(L, layer))
  ? fs.readdirSync(path.join(L, layer)).filter(f => f.endsWith(".png")).map(f => ({ name: f.match(/^(.*?)(?:#\d+)?\.png$/i)[1].trim(), file: path.join(L, layer, f) }))
  : [];

const CELL = 168, IMG = 132, LABEL = 36, PAD = 8, COLS = 4;
const hx = (h) => { h = h.replace("#",""); return Jimp.rgbaToInt(parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16),255); };

(async () => {
  const base = await read(path.join(L, "base", "Pepe#100.png"));
  const bgOpts = opt("background");
  const items = [];

  // base alone (on slate)
  items.push({ label: "BASE: Pepe", bg: "#4a6b8a", layers: [base] });
  // headwear (on slate + base)
  for (const o of opt("headwear")) if (!/^none$/i.test(o.name)) items.push({ label: "HAT: " + o.name, bg: "#4a6b8a", layers: [base, await read(o.file)] });
  // eyewear
  for (const o of opt("eyewear")) if (!/^none$/i.test(o.name)) items.push({ label: "EYES: " + o.name, bg: "#4a6b8a", layers: [base, await read(o.file)] });
  // backgrounds (base on each bg color)
  for (const o of bgOpts) { const c = (await read(o.file)).getPixelColor(2, 2); items.push({ label: "BG: " + o.name, bgInt: c, layers: [base] }); }

  const ROWS = Math.ceil(items.length / COLS);
  const W = COLS * CELL + (COLS + 1) * PAD, H = ROWS * CELL + (ROWS + 1) * PAD;
  const sheet = new Jimp(W, H, hx("#1b1b1b"));
  let font; try { font = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE); } catch { font = null; }

  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const cx = PAD + (i % COLS) * (CELL + PAD), cy = PAD + ((i / COLS) | 0) * (CELL + PAD);
    const cell = new Jimp(CELL, CELL, it.bgInt != null ? it.bgInt : hx(it.bg || "#4a6b8a"));
    // composite the sprite, upscaled
    let sprite = new Jimp(cfg.grid, cfg.grid, 0x00000000);
    for (const l of it.layers) sprite.composite(l, 0, 0);
    sprite.resize(IMG, IMG, Jimp.RESIZE_NEAREST_NEIGHBOR);
    cell.composite(sprite, (CELL - IMG) / 2, 4);
    // label strip
    const strip = new Jimp(CELL, LABEL, hx("#000000"));
    cell.composite(strip, 0, CELL - LABEL);
    if (font) cell.print(font, 8, CELL - LABEL + 8, it.label);
    sheet.composite(cell, cx, cy);
  }
  await sheet.writeAsync(path.join(__dirname, "output", "_traits.png"));
  console.log("wrote art/output/_traits.png", W + "x" + H, items.length + " traits");
})();
