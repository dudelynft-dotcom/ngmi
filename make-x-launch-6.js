// Sixth X post graphic. Minimal "case file": a mugshot + a wall of tally marks = how many rugged you.
const fs = require("fs");
const { Resvg } = require("@resvg/resvg-js");
const FONTS = ["assets/fonts/Anton-Regular.ttf", "assets/fonts/SpaceMono-Bold.ttf"];
const PAPER = "#e9e2cf", INK = "#1a1712", RED = "#c8311c", ACID = "#c6f24e", PANEL = "#d9d1b8";
const pepe = "data:image/png;base64," + fs.readFileSync("assets/gallery/09.png").toString("base64");

// big hand-scratched tally marks (groups of 5: 4 verticals + a red slash)
function tally(ox, oy) {
  let s = "", groups = 8, perRow = 5, gapX = 205, gapY = 176, H = 118, sp = 26;
  const j = (a) => (Math.random() * 2 - 1) * a;
  for (let g = 0; g < groups; g++) {
    const col = g % perRow, row = Math.floor(g / perRow);
    const x0 = ox + col * gapX, y0 = oy + row * gapY;
    const full = g < groups - 1, marks = full ? 4 : 3;
    for (let i = 0; i < marks; i++) {
      const x = x0 + i * sp + j(4);
      s += `<line x1="${x.toFixed(1)}" y1="${(y0 + j(5)).toFixed(1)}" x2="${(x + j(4)).toFixed(1)}" y2="${(y0 + H + j(5)).toFixed(1)}" stroke="${INK}" stroke-width="9" stroke-linecap="round"/>`;
    }
    if (full) s += `<line x1="${(x0 - 14).toFixed(1)}" y1="${(y0 + H * 0.8 + j(5)).toFixed(1)}" x2="${(x0 + 4 * sp + 14).toFixed(1)}" y2="${(y0 + H * 0.12 + j(5)).toFixed(1)}" stroke="${RED}" stroke-width="9" stroke-linecap="round"/>`;
  }
  return s;
}

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
  <rect width="1600" height="900" fill="${PAPER}"/>
  <circle cx="1300" cy="240" r="130" fill="#000" opacity="0.03"/>

  <!-- header strip -->
  <rect x="60" y="50" width="1480" height="70" fill="${INK}"/>
  <text x="86" y="100" font-family="Anton" font-size="40" fill="${PAPER}">NGMI PD &#183; RUG CRIMES DIVISION</text>
  <text x="1514" y="94" text-anchor="end" font-family="Space Mono" font-weight="700" font-size="22" fill="${ACID}">CASE #9942</text>

  <!-- mugshot -->
  <g transform="translate(86,165)">
    <rect width="340" height="340" fill="${PANEL}"/>
    ${[0, 1, 2, 3, 4, 5, 6].map((i) => `<line x1="0" y1="${22 + i * 44}" x2="340" y2="${22 + i * 44}" stroke="#b3aa8e" stroke-width="1"/>`).join("")}
    <image href="${pepe}" x="40" y="16" width="260" height="260"/>
    <rect x="0" y="290" width="340" height="50" fill="${INK}"/>
    <text x="170" y="324" text-anchor="middle" font-family="Space Mono" font-weight="700" font-size="23" fill="${PAPER}" letter-spacing="2">RUGGEE #9942</text>
  </g>

  <!-- hero: RUGGED + tally wall -->
  <text x="468" y="300" font-family="Anton" font-size="128" fill="${RED}">RUGGED:</text>
  ${tally(474, 372)}

  <!-- red stamp -->
  <g transform="rotate(-8 1250 640)">
    <rect x="1040" y="582" width="420" height="120" fill="none" stroke="${RED}" stroke-width="6" rx="8" opacity="0.92"/>
    <text x="1250" y="660" text-anchor="middle" font-family="Anton" font-size="74" fill="${RED}" opacity="0.92">INSTANT WL</text>
  </g>

  <!-- footer CTA -->
  <rect x="60" y="788" width="1480" height="74" fill="${INK}"/>
  <text x="800" y="838" text-anchor="middle" font-family="Anton" font-size="48" fill="${PAPER}">BURN THE DEAD BAGS  &#187;  ENGMI.FUN/APPLY</text>
</svg>`;

const r = new Resvg(svg, { font: { fontFiles: FONTS, loadSystemFonts: false, defaultFontFamily: "Anton" }, fitTo: { mode: "width", value: 1600 } });
fs.writeFileSync("assets/x-launch-6.png", r.render().asPng());
console.log("wrote assets/x-launch-6.png");
