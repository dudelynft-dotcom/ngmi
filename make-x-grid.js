// High-res NGMI grid for X. 8x5 = 40 Pepes, no text, native backgrounds.
// Images are pre-downloaded to a local folder (node fetch is blocked in this sandbox).
//   curl them to <dir> first, then:  node make-x-grid.js <dir>
const fs = require("fs");
const path = require("path");
const { Resvg } = require("@resvg/resvg-js");

const DIR = process.argv[2] || "/tmp/grid";
const COLS = 8, ROWS = 5, CELL = Number(process.argv[3]) || 512;   // width = COLS*CELL
const files = fs.readdirSync(DIR).filter((f) => f.toLowerCase().endsWith(".png")).sort().slice(0, COLS * ROWS);

const W = COLS * CELL, H = ROWS * CELL;
let tiles = "";
files.forEach((f, i) => {
  const href = "data:image/png;base64," + fs.readFileSync(path.join(DIR, f)).toString("base64");
  const c = i % COLS, r = Math.floor(i / COLS);
  tiles += `<image href="${href}" x="${c * CELL}" y="${r * CELL}" width="${CELL}" height="${CELL}" preserveAspectRatio="xMidYMid slice"/>`;
});
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="#0b0b0b"/>${tiles}</svg>`;
const png = new Resvg(svg, { fitTo: { mode: "width", value: W } }).render().asPng();
fs.writeFileSync("assets/x-grid.png", png);
console.log(`wrote assets/x-grid.png  ${W}x${H}  (${files.length} pepes)`);
