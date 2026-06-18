// NGMI trait compositor: builds unique tokens from layered sprites with weighted
// rarity, dedupes by DNA, and writes images + ERC-721 metadata. (HashLips-style.)
const Jimp = require("jimp");
const fs = require("fs");
const path = require("path");
const cfg = require("./config");

const LAYERS = path.join(__dirname, "layers");
const OUT = path.join(__dirname, "output");
const OUT_IMG = path.join(OUT, "images");
const OUT_META = path.join(OUT, "metadata");

// Read a layer folder -> [{ name, weight, file }]. Filename "Name#weight.png".
function readLayer(name) {
  const dir = path.join(LAYERS, name);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => f.toLowerCase().endsWith(".png")).map(f => {
    const m = f.match(/^(.*?)(?:#(\d+))?\.png$/i);
    return { name: m[1].trim(), weight: m[2] ? +m[2] : 1, file: path.join(dir, f) };
  });
}
function pickWeighted(opts) {
  const total = opts.reduce((a, o) => a + o.weight, 0);
  let r = Math.random() * total;
  for (const o of opts) { if ((r -= o.weight) < 0) return o; }
  return opts[opts.length - 1];
}

(async () => {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT_IMG, { recursive: true });
  fs.mkdirSync(OUT_META, { recursive: true });

  const layerData = cfg.layers.map(l => ({ ...l, options: readLayer(l.name) }));
  const missing = layerData.filter(l => l.options.length === 0).map(l => l.name);
  if (missing.length) console.warn("WARN: empty layers (skipped):", missing.join(", "));

  const seen = new Set();
  const rarity = {};       // trait_type -> value -> count
  let edition = 0, attempts = 0;

  while (edition < cfg.supply && attempts < cfg.maxAttempts) {
    attempts++;
    const dna = layerData.map(l => (l.options.length ? pickWeighted(l.options) : null));
    const key = dna.map(d => (d ? d.name : "")).join("|");
    if (seen.has(key)) continue;
    seen.add(key);
    edition++;

    // composite back -> front
    let canvas = new Jimp(cfg.grid, cfg.grid, 0x00000000);
    for (const opt of dna) {
      if (!opt) continue;
      const layer = await Jimp.read(opt.file);
      canvas.composite(layer, 0, 0);
    }
    canvas.resize(cfg.grid * cfg.scale, cfg.grid * cfg.scale, Jimp.RESIZE_NEAREST_NEIGHBOR);
    await canvas.writeAsync(path.join(OUT_IMG, `${edition}.png`));

    // metadata (skip "None" traits)
    const attributes = [];
    dna.forEach((opt, i) => {
      if (!opt || /^none$/i.test(opt.name)) return;
      const tt = layerData[i].trait_type;
      attributes.push({ trait_type: tt, value: opt.name });
      (rarity[tt] ||= {})[opt.name] = ((rarity[tt] || {})[opt.name] || 0) + 1;
    });
    fs.writeFileSync(path.join(OUT_META, `${edition}.json`), JSON.stringify({
      name: `${cfg.name} #${edition}`,
      description: cfg.description,
      image: `${cfg.baseUri}/${edition}.png`,
      edition,
      attributes,
    }, null, 2));
  }

  fs.writeFileSync(path.join(OUT, "_rarity.json"), JSON.stringify(rarity, null, 2));
  console.log(`Generated ${edition} unique tokens (of ${cfg.supply} requested, ${attempts} attempts).`);
  console.log(`  images   -> art/output/images/`);
  console.log(`  metadata -> art/output/metadata/`);
  console.log(`  rarity   -> art/output/_rarity.json`);
  if (edition < cfg.supply) console.log(`  NOTE: only ${edition} unique combos possible from the current trait set - add more traits.`);
})();
