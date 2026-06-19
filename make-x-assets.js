// Generates X (Twitter) profile assets that match the site's brand logo.
//   assets/x-logo.png    1000x1000  (profile picture - the NGMI mark)
//   assets/x-header.png  1500x500   (profile banner)
const fs = require("fs");
const { Resvg } = require("@resvg/resvg-js");

const PAPER = "#f4f3ec", INK = "#0b0b0b", ACID = "#c6f24e", RUG = "#e5341f", SOFT = "#5a564d";
const FONTS = ["assets/fonts/Anton-Regular.ttf", "assets/fonts/SpaceMono-Bold.ttf"];
const dataUri = (p) => "data:image/png;base64," + fs.readFileSync(p).toString("base64");

const dots = `<defs><pattern id="dots" width="34" height="34" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="2" fill="${INK}" opacity="0.06"/></pattern></defs>`;

// ---------- LOGO / AVATAR (matches the nav logo: "NG" boxed in lime-on-black + "MI") ----------
const logoSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1000" viewBox="0 0 1000 1000">
  ${dots}
  <rect width="1000" height="1000" fill="${PAPER}"/>
  <rect width="1000" height="1000" fill="url(#dots)"/>
  <rect x="60" y="60" width="880" height="880" fill="none" stroke="${INK}" stroke-width="10"/>
  <rect x="250" y="358" width="300" height="292" rx="16" fill="${INK}"/>
  <text x="400" y="598" font-family="Anton" font-size="250" fill="${ACID}" text-anchor="middle">NG</text>
  <text x="576" y="598" font-family="Anton" font-size="250" fill="${INK}" text-anchor="start">MI</text>
  <text x="500" y="730" font-family="Space Mono" font-weight="700" font-size="40" letter-spacing="8" fill="${SOFT}" text-anchor="middle">EXIT LIQUIDITY</text>
</svg>`;

// ---------- HEADER / BANNER ----------
const pepeA = dataUri("assets/gallery/10.png");
const pepeB = dataUri("assets/gallery/06.png");
const headerSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1500" height="500" viewBox="0 0 1500 500">
  ${dots}
  <rect width="1500" height="500" fill="${PAPER}"/>
  <rect width="1500" height="500" fill="url(#dots)"/>
  <text x="70" y="150" font-family="Anton" font-size="118" fill="${INK}">NGMI</text>
  <rect x="66" y="190" width="690" height="74" fill="${ACID}"/>
  <text x="84" y="247" font-family="Anton" font-size="60" fill="${INK}">YOU ARE THE EXIT LIQUIDITY</text>
  <text x="70" y="312" font-family="Space Mono" font-weight="700" font-size="27" fill="${SOFT}">10,000 pre-rugged Pepes. We told you first.</text>
  <text x="70" y="350" font-family="Space Mono" font-weight="700" font-size="27" fill="${RUG}">engmi.fun</text>
  <!-- pepes on the right -->
  <g transform="translate(945,40)">
    <rect x="-6" y="-6" width="212" height="212" fill="${INK}"/>
    <image href="${pepeB}" x="0" y="0" width="200" height="200"/>
  </g>
  <g transform="translate(1180,150)">
    <rect x="-6" y="-6" width="272" height="272" fill="${INK}"/>
    <image href="${pepeA}" x="0" y="0" width="260" height="260"/>
    <g transform="rotate(-8 130 130)"><rect x="20" y="108" width="220" height="44" fill="${RUG}" opacity="0.92"/><text x="130" y="140" font-family="Space Mono" font-weight="700" font-size="26" fill="#fff" text-anchor="middle" letter-spacing="4">RUGGED</text></g>
  </g>
</svg>`;

function render(svg, w, out) {
  const r = new Resvg(svg, { font: { fontFiles: FONTS, loadSystemFonts: false, defaultFontFamily: "Anton" }, fitTo: { mode: "width", value: w } });
  fs.writeFileSync(out, r.render().asPng());
  console.log("wrote", out);
}
render(logoSvg, 1000, "assets/x-logo.png");
render(headerSvg, 1500, "assets/x-header.png");
