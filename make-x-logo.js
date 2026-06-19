// X profile logo, take 2: "NGMI" scrawled in marker on a ripped notebook page.
const fs = require("fs");
const { Resvg } = require("@resvg/resvg-js");
const FONTS = ["assets/fonts/PermanentMarker-Regular.ttf", "assets/fonts/PatrickHand-Regular.ttf"];

const INK = "#1b2330", RED = "#e5341f", LINE = "#bcd3e8", PAPER = "#fbfaf3", DESK = "#d9d5c7";

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1000" viewBox="0 0 1000 1000">
  <defs>
    <filter id="sh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#000" flood-opacity="0.22"/></filter>
  </defs>
  <rect width="1000" height="1000" fill="${DESK}"/>

  <g transform="rotate(-2.4 500 500)">
    <!-- the page -->
    <rect x="120" y="150" width="760" height="720" rx="6" fill="${PAPER}" filter="url(#sh)"/>
    <!-- ruled lines -->
    ${Array.from({ length: 8 }, (_, i) => `<line x1="150" y1="${300 + i * 78}" x2="850" y2="${300 + i * 78}" stroke="${LINE}" stroke-width="3"/>`).join("")}
    <!-- red margin -->
    <line x1="250" y1="170" x2="250" y2="850" stroke="${RED}" stroke-width="3" opacity="0.55"/>
    <!-- punch holes -->
    <circle cx="185" cy="330" r="13" fill="${DESK}"/><circle cx="185" cy="510" r="13" fill="${DESK}"/><circle cx="185" cy="690" r="13" fill="${DESK}"/>

    <!-- the scrawl -->
    <text x="510" y="500" font-family="Permanent Marker" font-size="230" fill="${INK}" text-anchor="middle" transform="rotate(-3 510 500)">NGMI</text>
    <text x="520" y="610" font-family="Patrick Hand" font-size="62" fill="#3a4250" text-anchor="middle" transform="rotate(-1.5 520 610)">(not gonna make it)</text>

    <!-- crossed-out wagmi, top -->
    <text x="430" y="265" font-family="Patrick Hand" font-size="58" fill="#8a8576" text-anchor="middle" transform="rotate(-4 430 265)">wagmi</text>
    <line x1="320" y1="255" x2="545" y2="240" stroke="${RED}" stroke-width="7" transform="rotate(-4 430 250)"/>

    <!-- crashing-chart doodle -->
    <polyline points="560,690 620,720 660,700 720,760 770,735 825,800" fill="none" stroke="${RED}" stroke-width="9" stroke-linejoin="round" stroke-linecap="round"/>
    <polygon points="825,800 800,775 822,762" fill="${RED}"/>

    <!-- tape -->
    <rect x="430" y="120" width="150" height="46" fill="#cfe6c2" opacity="0.6" transform="rotate(-6 505 143)"/>
  </g>
</svg>`;

const r = new Resvg(svg, { font: { fontFiles: FONTS, loadSystemFonts: false, defaultFontFamily: "Permanent Marker" }, fitTo: { mode: "width", value: 1000 } });
fs.writeFileSync("assets/x-logo.png", r.render().asPng());
console.log("wrote assets/x-logo.png");
