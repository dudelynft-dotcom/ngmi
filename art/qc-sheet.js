// QC tool: tiles a generated batch into paginated review sheets (labeled with #id + traits)
// so you can eyeball them and spot malformed ones, plus a rarity tally.
// Run: node art/qc-sheet.js        (reads art/output/collection)
// To regen a bad one: delete art/output/collection/images/<id>.png (+ its metadata) and
// re-run the batch generator - it refills the gap.
const Jimp = require("jimp");
const fs = require("fs");
const path = require("path");

const DIR = path.join(__dirname, "output", "collection");
const IMG = path.join(DIR, "images"), META = path.join(DIR, "metadata");
const QC = path.join(DIR, "qc");
fs.mkdirSync(QC, { recursive: true });

const COLS = 7, ROWS = 5, PER = COLS * ROWS;     // 35 per page
const CELL = 190, LABEL = 34, PAD = 6;

(async () => {
  if (!fs.existsSync(IMG)) { console.log("No images yet at", IMG); return; }
  const ids = fs.readdirSync(IMG).filter(f => /\.png$/.test(f)).map(f => +f.replace(".png", "")).sort((a, b) => a - b);
  if (!ids.length) { console.log("No images to review."); return; }

  const fontId = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE);
  const fontTr = await Jimp.loadFont(Jimp.FONT_SANS_8_WHITE);
  const rarity = {};   // trait_type -> value -> count
  let withMeta = 0;

  const pages = Math.ceil(ids.length / PER);
  for (let p = 0; p < pages; p++) {
    const slice = ids.slice(p * PER, p * PER + PER);
    const W = COLS * CELL + (COLS + 1) * PAD;
    const H = ROWS * (CELL + LABEL) + (ROWS + 1) * PAD;
    const sheet = new Jimp(W, H, 0x1b1b1bff);

    for (let i = 0; i < slice.length; i++) {
      const id = slice[i];
      const x = PAD + (i % COLS) * (CELL + PAD);
      const y = PAD + ((i / COLS) | 0) * (CELL + LABEL + PAD);
      const img = await Jimp.read(path.join(IMG, `${id}.png`));
      img.cover(CELL, CELL);
      sheet.composite(img, x, y);

      // tally + label from metadata
      let traitLine = "";
      const mp = path.join(META, `${id}.json`);
      if (fs.existsSync(mp)) {
        withMeta++;
        const m = JSON.parse(fs.readFileSync(mp, "utf8"));
        for (const a of m.attributes || []) (rarity[a.trait_type] ||= {})[a.value] = ((rarity[a.trait_type] || {})[a.value] || 0) + 1;
        traitLine = (m.attributes || []).map(a => a.value).join(", ") || "bare";
      }
      sheet.composite(new Jimp(CELL, LABEL, 0x000000dd), x, y + CELL);
      sheet.print(fontId, x + 5, y + CELL + 1, `#${id}`);
      if (traitLine.length > 36) traitLine = traitLine.slice(0, 35) + "…";
      sheet.print(fontTr, x + 5, y + CELL + 21, traitLine);
    }
    const name = `sheet-${String(p + 1).padStart(3, "0")}.png`;
    await sheet.writeAsync(path.join(QC, name));
    console.log(`${name}  (#${slice[0]}-#${slice.at(-1)})`);
  }

  // rarity report (counts + %)
  const report = {};
  for (const [tt, vals] of Object.entries(rarity)) {
    report[tt] = Object.fromEntries(Object.entries(vals).sort((a, b) => b[1] - a[1])
      .map(([v, c]) => [v, { count: c, pct: +(100 * c / ids.length).toFixed(1) }]));
  }
  fs.writeFileSync(path.join(QC, "_rarity.json"), JSON.stringify(report, null, 2));

  console.log(`\n${ids.length} images, ${withMeta} with metadata, ${pages} review sheet(s) -> art/output/collection/qc/`);
  console.log(`rarity -> art/output/collection/qc/_rarity.json`);
  if (withMeta < ids.length) console.log(`NOTE: ${ids.length - withMeta} images missing metadata.`);
})();
