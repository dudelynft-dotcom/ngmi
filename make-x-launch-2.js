// Second X post graphic. Minimal: one punchline + the rugged Pepe. No marketing clutter.
const fs = require("fs");
const { Resvg } = require("@resvg/resvg-js");
const FONTS = ["assets/fonts/Anton-Regular.ttf", "assets/fonts/SpaceMono-Bold.ttf"];
const INK = "#0b0b0b", ACID = "#c6f24e", RED = "#e5341f", PAPER = "#f4f3ec";
const pepe = "data:image/png;base64," + fs.readFileSync("assets/gallery/05.png").toString("base64");

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
  <defs><pattern id="d" width="44" height="44" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="2" fill="#fff" opacity="0.05"/></pattern></defs>
  <rect width="1600" height="900" fill="${INK}"/>
  <rect width="1600" height="900" fill="url(#d)"/>

  <!-- one punchline, that's it -->
  <text x="96" y="430" font-family="Anton" font-size="210" fill="${PAPER}">WE SELL.</text>
  <text x="96" y="640" font-family="Anton" font-size="210" fill="${RED}">YOU COPE.</text>

  <text x="104" y="770" font-family="Space Mono" font-weight="700" font-size="40" letter-spacing="2" fill="${ACID}">engmi.fun</text>

  <!-- the rugged pepe -->
  <g transform="translate(992,168)">
    <rect x="-14" y="-14" width="588" height="588" fill="${ACID}"/>
    <image href="${pepe}" x="0" y="0" width="560" height="560"/>
    <g transform="rotate(-10 280 280)">
      <rect x="34" y="244" width="492" height="84" fill="${RED}" opacity="0.94"/>
      <text x="280" y="304" font-family="Anton" font-size="64" fill="#fff" text-anchor="middle" letter-spacing="9">RUGGED</text>
    </g>
  </g>
</svg>`;

const r = new Resvg(svg, { font: { fontFiles: FONTS, loadSystemFonts: false, defaultFontFamily: "Anton" }, fitTo: { mode: "width", value: 1600 } });
fs.writeFileSync("assets/x-launch-2.png", r.render().asPng());
console.log("wrote assets/x-launch-2.png");
