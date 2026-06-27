// Seventh X post graphic. The Hall of Shame as a police mugshot lineup (whitelisted vs suspect).
const fs = require("fs");
const { Resvg } = require("@resvg/resvg-js");
const FONTS = ["assets/fonts/Anton-Regular.ttf", "assets/fonts/SpaceMono-Bold.ttf"];
const PAPER = "#e9e2cf", INK = "#1a1712", RED = "#c8311c", ACID = "#c6f24e", PANEL = "#d9d1b8";

const MUGS = [
  { img: "02.png", c: 1, wl: true },
  { img: "06.png", c: 2, wl: false },
  { img: "13.png", c: 3, wl: false },
  { img: "20.png", c: 4, wl: true },
];

function mug(m, ox, oy) {
  const img = "data:image/png;base64," + fs.readFileSync("assets/gallery/" + m.img).toString("base64");
  const S = 300;
  let lines = "";
  for (let y = 16; y < S; y += 18) lines += `<line x1="0" y1="${y}" x2="${S}" y2="${y}" stroke="rgba(0,0,0,0.16)" stroke-width="1"/>`;
  const cx = ox + S / 2;
  const status = m.wl
    ? `<rect x="${cx - 100}" y="${oy - 56}" width="200" height="42" rx="5" fill="${ACID}"/><text x="${cx}" y="${oy - 26}" text-anchor="middle" font-family="Anton" font-size="27" fill="${INK}">WHITELISTED</text>`
    : `<rect x="${cx - 82}" y="${oy - 56}" width="164" height="42" rx="5" fill="none" stroke="${RED}" stroke-width="3"/><text x="${cx}" y="${oy - 26}" text-anchor="middle" font-family="Anton" font-size="27" fill="${RED}">SUSPECT</text>`;
  return `${status}
    <g transform="translate(${ox},${oy})">
      <rect x="-5" y="-5" width="${S + 10}" height="${S + 56}" fill="${INK}"/>
      <rect width="${S}" height="${S}" fill="${PANEL}"/>
      <image href="${img}" x="0" y="0" width="${S}" height="${S}"/>
      ${lines}
      <text x="${S / 2}" y="${S + 38}" text-anchor="middle" font-family="Space Mono" font-weight="700" font-size="24" fill="${PAPER}" letter-spacing="3">CASE #${m.c}</text>
    </g>`;
}

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
  <rect width="1600" height="900" fill="${PAPER}"/>
  ${[0, 1, 2, 3, 4, 5].map((i) => `<line x1="60" y1="${250 + i * 80}" x2="1540" y2="${250 + i * 80}" stroke="#000" stroke-width="1" opacity="0.06"/>`).join("")}

  <!-- header -->
  <rect x="60" y="48" width="1480" height="78" fill="${INK}"/>
  <text x="88" y="102" font-family="Anton" font-size="48" fill="${PAPER}">NGMI PD &#183; HALL OF SHAME</text>
  <text x="1514" y="84" text-anchor="end" font-family="Space Mono" font-weight="700" font-size="20" fill="${ACID}">EXHIBIT A</text>
  <text x="1514" y="110" text-anchor="end" font-family="Space Mono" font-weight="700" font-size="20" fill="#9a927c">THE RUGGED, BY NAME</text>

  <!-- lineup -->
  ${MUGS.map((m, i) => mug(m, 142 + i * 330, 320)).join("")}

  <!-- footer -->
  <rect x="60" y="794" width="1480" height="74" fill="${INK}"/>
  <text x="800" y="844" text-anchor="middle" font-family="Anton" font-size="44" fill="${PAPER}">SEE WHO BURNED THEIR BAGS  &#187;  ENGMI.FUN/HALL-OF-SHAME</text>
</svg>`;

const r = new Resvg(svg, { font: { fontFiles: FONTS, loadSystemFonts: false, defaultFontFamily: "Anton" }, fitTo: { mode: "width", value: 1600 } });
fs.writeFileSync("assets/x-launch-7.png", r.render().asPng());
console.log("wrote assets/x-launch-7.png");
