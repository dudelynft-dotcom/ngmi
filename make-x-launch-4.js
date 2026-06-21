// Fourth X post graphic. The CTA / mechanic: burn the bag that rugged you -> get whitelisted.
const fs = require("fs");
const { Resvg } = require("@resvg/resvg-js");
const FONTS = ["assets/fonts/Anton-Regular.ttf", "assets/fonts/SpaceMono-Bold.ttf"];
const INK = "#0b0b0b", ACID = "#c6f24e", RED = "#e5341f", PAPER = "#f4f3ec", SOFT = "#9a968b";
const pepe = "data:image/png;base64," + fs.readFileSync("assets/gallery/03.png").toString("base64");

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
  <defs><pattern id="d" width="44" height="44" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="2" fill="#fff" opacity="0.05"/></pattern></defs>
  <rect width="1600" height="900" fill="${INK}"/>
  <rect width="1600" height="900" fill="url(#d)"/>

  <!-- corner pepe -->
  <g transform="translate(1316,60)">
    <rect x="-10" y="-10" width="244" height="244" fill="${ACID}"/>
    <image href="${pepe}" x="0" y="0" width="224" height="224"/>
    <g transform="rotate(-10 112 112)">
      <rect x="6" y="96" width="212" height="40" fill="${RED}" opacity="0.94"/>
      <text x="112" y="124" font-family="Anton" font-size="28" fill="#fff" text-anchor="middle" letter-spacing="4">RUGGED</text>
    </g>
  </g>

  <!-- kicker -->
  <text x="96" y="150" font-family="Space Mono" font-weight="700" font-size="28" letter-spacing="4" fill="${ACID}">// THE INITIATION · WHITELIST OPEN</text>

  <!-- headline -->
  <text x="92" y="400" font-family="Anton" font-size="172" fill="${PAPER}">BURN THE BAG</text>
  <text x="92" y="560" font-family="Anton" font-size="172" fill="${RED}">THAT RUGGED YOU.</text>

  <text x="98" y="648" font-family="Space Mono" font-weight="700" font-size="30" fill="${SOFT}">no follow. no like. proof of loss only.</text>

  <!-- CTA pill -->
  <rect x="92" y="700" width="560" height="92" rx="8" fill="${ACID}"/>
  <text x="120" y="762" font-family="Anton" font-size="56" fill="${INK}">ENGMI.FUN/APPLY</text>
</svg>`;

const r = new Resvg(svg, { font: { fontFiles: FONTS, loadSystemFonts: false, defaultFontFamily: "Anton" }, fitTo: { mode: "width", value: 1600 } });
fs.writeFileSync("assets/x-launch-4.png", r.render().asPng());
console.log("wrote assets/x-launch-4.png");
