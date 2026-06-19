// Second X post graphic. Follow-up to "we are going to rug you" - the four-word roadmap.
const fs = require("fs");
const { Resvg } = require("@resvg/resvg-js");
const FONTS = ["assets/fonts/Anton-Regular.ttf", "assets/fonts/SpaceMono-Bold.ttf"];
const INK = "#0b0b0b", ACID = "#c6f24e", RED = "#e5341f", PAPER = "#f4f3ec", SOFT = "#9a968b";
const pepe = "data:image/png;base64," + fs.readFileSync("assets/gallery/05.png").toString("base64");

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
  <defs><pattern id="d" width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="2" fill="#fff" opacity="0.05"/></pattern></defs>
  <rect width="1600" height="900" fill="${INK}"/>
  <rect width="1600" height="900" fill="url(#d)"/>

  <!-- kicker -->
  <text x="92" y="130" font-family="Space Mono" font-weight="700" font-size="28" letter-spacing="4" fill="${ACID}">// THE FORECAST · NOT A ROADMAP</text>

  <!-- headline -->
  <text x="86" y="350" font-family="Anton" font-size="168" fill="${PAPER}">WE SELL.</text>
  <text x="86" y="510" font-family="Anton" font-size="168" fill="${RED}">YOU COPE.</text>

  <text x="92" y="598" font-family="Space Mono" font-weight="700" font-size="30" fill="${SOFT}">four words. the only honest roadmap in crypto.</text>

  <!-- CTA pill -->
  <rect x="90" y="660" width="690" height="96" rx="8" fill="${ACID}"/>
  <text x="118" y="724" font-family="Anton" font-size="58" fill="${INK}">ENGMI.FUN/ROADMAP</text>
  <text x="702" y="722" font-family="Anton" font-size="58" fill="${INK}">→</text>

  <!-- big pepe -->
  <g transform="translate(1010,150)">
    <rect x="-12" y="-12" width="524" height="524" fill="${ACID}"/>
    <image href="${pepe}" x="0" y="0" width="500" height="500"/>
    <g transform="rotate(-10 250 250)">
      <rect x="30" y="218" width="440" height="74" fill="${RED}" opacity="0.94"/>
      <text x="250" y="272" font-family="Anton" font-size="56" fill="#fff" text-anchor="middle" letter-spacing="8">RUGGED</text>
    </g>
  </g>

  <!-- brand mark bottom-right -->
  <rect x="1360" y="800" width="150" height="60" rx="4" fill="${ACID}"/>
  <text x="1378" y="845" font-family="Anton" font-size="44" fill="${INK}">NGMI</text>
</svg>`;

const r = new Resvg(svg, { font: { fontFiles: FONTS, loadSystemFonts: false, defaultFontFamily: "Anton" }, fitTo: { mode: "width", value: 1600 } });
fs.writeFileSync("assets/x-launch-2.png", r.render().asPng());
console.log("wrote assets/x-launch-2.png");
