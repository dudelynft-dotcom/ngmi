// Sixth X post graphic. "Rap sheet" / case-file look: how many projects rugged you -> burn for instant WL.
const fs = require("fs");
const { Resvg } = require("@resvg/resvg-js");
const FONTS = ["assets/fonts/Anton-Regular.ttf", "assets/fonts/SpaceMono-Bold.ttf"];
const PAPER = "#e9e2cf", INK = "#1a1712", RED = "#c8311c", SOFT = "#8a8167", PANEL = "#d9d1b8";
const pepe = "data:image/png;base64," + fs.readFileSync("assets/gallery/09.png").toString("base64");

// scratched tally marks (groups of 5: 4 verticals + a red slash), with hand jitter
function tally(ox, oy) {
  let s = "", groups = 7, perRow = 4, gapX = 150, gapY = 104;
  const j = (a) => (Math.random() * 2 - 1) * a;
  for (let g = 0; g < groups; g++) {
    const col = g % perRow, row = Math.floor(g / perRow);
    const x0 = ox + col * gapX, y0 = oy + row * gapY;
    const full = g < groups - 1, marks = full ? 4 : 3;
    for (let i = 0; i < marks; i++) {
      const x = x0 + i * 22 + j(3);
      s += `<line x1="${x.toFixed(1)}" y1="${(y0 + j(4)).toFixed(1)}" x2="${(x + j(3)).toFixed(1)}" y2="${(y0 + 72 + j(4)).toFixed(1)}" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`;
    }
    if (full) s += `<line x1="${(x0 - 10).toFixed(1)}" y1="${(y0 + 62 + j(4)).toFixed(1)}" x2="${(x0 + 4 * 22 + 10).toFixed(1)}" y2="${(y0 + 8 + j(4)).toFixed(1)}" stroke="${RED}" stroke-width="6" stroke-linecap="round"/>`;
  }
  return s;
}
const rec = (y, k, v) => `<text x="430" y="${y}" font-family="Space Mono" font-weight="700" font-size="25" fill="${INK}">${k}</text><text x="700" y="${y}" font-family="Space Mono" font-weight="700" font-size="25" fill="${INK}">${v}</text>`;

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
  <rect width="1600" height="900" fill="${PAPER}"/>
  <circle cx="1280" cy="250" r="120" fill="#000" opacity="0.03"/>
  <circle cx="300" cy="760" r="90" fill="#000" opacity="0.03"/>

  <!-- header bar -->
  <rect x="60" y="48" width="1480" height="92" fill="${INK}"/>
  <text x="86" y="112" font-family="Anton" font-size="54" fill="${PAPER}">NGMI PD &#183; RUG CRIMES DIVISION</text>
  <text x="1514" y="92" text-anchor="end" font-family="Space Mono" font-weight="700" font-size="20" fill="#c6f24e">FILE No. NGMI-9942</text>
  <text x="1514" y="120" text-anchor="end" font-family="Space Mono" font-weight="700" font-size="20" fill="${SOFT}">CHARGE: BEING EXIT LIQUIDITY</text>

  <!-- subject line -->
  <text x="86" y="186" font-family="Space Mono" font-weight="700" font-size="23" fill="${INK}">SUBJECT: YOU  &#183;  ALIAS: "EXIT LIQUIDITY"  &#183;  STATUS: REPEAT VICTIM</text>
  <line x1="86" y1="206" x2="1514" y2="206" stroke="${INK}" stroke-width="2" stroke-dasharray="3 6"/>

  <!-- mugshot -->
  <g transform="translate(86,236)">
    <rect width="300" height="300" fill="${PANEL}"/>
    ${[0, 1, 2, 3, 4, 5].map((i) => `<line x1="0" y1="${20 + i * 44}" x2="300" y2="${20 + i * 44}" stroke="#b3aa8e" stroke-width="1"/>`).join("")}
    <image href="${pepe}" x="34" y="14" width="232" height="232"/>
    <rect x="0" y="252" width="300" height="48" fill="${INK}"/>
    <text x="150" y="284" text-anchor="middle" font-family="Space Mono" font-weight="700" font-size="22" fill="${PAPER}" letter-spacing="2">RUGGEE #9942</text>
  </g>

  <!-- record column -->
  <text x="430" y="266" font-family="Anton" font-size="40" fill="${INK}">PROJECTS THAT RUGGED YOU:</text>
  ${tally(440, 300)}
  <text x="980" y="338" font-family="Space Mono" font-weight="700" font-size="22" fill="${RED}">you stopped</text>
  <text x="980" y="366" font-family="Space Mono" font-weight="700" font-size="22" fill="${RED}">counting.</text>
  <text x="980" y="394" font-family="Space Mono" font-weight="700" font-size="22" fill="${SOFT}">it didn't stop.</text>

  ${rec(556, "PRIORS .........", "TOO MANY TO LIST")}
  ${rec(594, "DAMAGES ........", "YOUR ENTIRE PORTFOLIO")}
  ${rec(632, "DIAMOND HANDS ..", "AMPUTATED")}
  ${rec(670, "SENTENCE .......", "PERMANENT EXIT LIQUIDITY")}
  ${rec(708, "APPEAL .........", "BURN THE DEAD BAGS TO THE VOID")}

  <!-- red verdict stamp -->
  <g transform="rotate(-9 1230 470)">
    <rect x="1000" y="392" width="430" height="150" fill="none" stroke="${RED}" stroke-width="6" rx="8" opacity="0.92"/>
    <text x="1215" y="446" text-anchor="middle" font-family="Space Mono" font-weight="700" font-size="22" fill="${RED}" letter-spacing="3" opacity="0.92">APPEAL GRANTED</text>
    <text x="1215" y="512" text-anchor="middle" font-family="Anton" font-size="68" fill="${RED}" opacity="0.92">INSTANT WL</text>
  </g>

  <!-- footer CTA -->
  <rect x="60" y="800" width="1480" height="64" fill="${INK}"/>
  <text x="800" y="844" text-anchor="middle" font-family="Anton" font-size="44" fill="${PAPER}">BURN YOUR DEAD BAGS  &#187;  ENGMI.FUN/APPLY</text>
</svg>`;

const r = new Resvg(svg, { font: { fontFiles: FONTS, loadSystemFonts: false, defaultFontFamily: "Anton" }, fitTo: { mode: "width", value: 1600 } });
fs.writeFileSync("assets/x-launch-6.png", r.render().asPng());
console.log("wrote assets/x-launch-6.png");
