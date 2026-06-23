// Fifth X post graphic. Drives to the live collection + the per-token "victim file" feature.
const fs = require("fs");
const { Resvg } = require("@resvg/resvg-js");
const FONTS = ["assets/fonts/Anton-Regular.ttf", "assets/fonts/SpaceMono-Bold.ttf"];
const INK = "#0b0b0b", ACID = "#c6f24e", RED = "#e5341f", PAPER = "#f4f3ec", SOFT = "#9a968b", GOLD = "#e0b020";
const pepe = "data:image/png;base64," + fs.readFileSync("assets/gallery/07.png").toString("base64");

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
  <defs><pattern id="d" width="44" height="44" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="2" fill="#fff" opacity="0.05"/></pattern></defs>
  <rect width="1600" height="900" fill="${INK}"/>
  <rect width="1600" height="900" fill="url(#d)"/>

  <!-- corner pepe, tagged as a victim file -->
  <g transform="translate(1316,60)">
    <rect x="-10" y="-10" width="244" height="244" fill="${GOLD}"/>
    <image href="${pepe}" x="0" y="0" width="224" height="224"/>
    <rect x="0" y="188" width="224" height="36" fill="${INK}"/>
    <text x="112" y="214" font-family="Space Mono" font-weight="700" font-size="20" fill="${ACID}" text-anchor="middle" letter-spacing="2">VICTIM #0420</text>
  </g>

  <!-- kicker -->
  <text x="96" y="150" font-family="Space Mono" font-weight="700" font-size="28" letter-spacing="4" fill="${ACID}">// 9,942 VICTIM FILES · NOW LIVE</text>

  <!-- headline -->
  <text x="92" y="400" font-family="Anton" font-size="178" fill="${PAPER}">FIND YOUR</text>
  <text x="92" y="566" font-family="Anton" font-size="178" fill="${RED}">VICTIM FILE.</text>

  <text x="98" y="652" font-family="Space Mono" font-weight="700" font-size="30" fill="${SOFT}">cope index. conviction rating. exactly how you lose.</text>

  <!-- CTA pill -->
  <rect x="92" y="704" width="742" height="92" rx="8" fill="${ACID}"/>
  <text x="120" y="766" font-family="Anton" font-size="52" fill="${INK}">ENGMI.FUN/COLLECTION</text>
</svg>`;

const r = new Resvg(svg, { font: { fontFiles: FONTS, loadSystemFonts: false, defaultFontFamily: "Anton" }, fitTo: { mode: "width", value: 1600 } });
fs.writeFileSync("assets/x-launch-5.png", r.render().asPng());
console.log("wrote assets/x-launch-5.png");
