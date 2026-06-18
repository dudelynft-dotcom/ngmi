// Generates PLACEHOLDER trait layers so the compositor runs end-to-end.
// Replace every PNG in art/layers/** with real pixel-Pepe sprites (same 24x24 grid).
const Jimp = require("jimp");
const fs = require("fs");
const path = require("path");
const cfg = require("./config");

const G = cfg.grid;
const LAYERS = path.join(__dirname, "layers");

const hex = (h, a = 255) => {
  h = h.replace("#", "");
  return Jimp.rgbaToInt(parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), a);
};
function rect(img, x, y, w, h, color) {
  for (let i = 0; i < w; i++) for (let j = 0; j < h; j++) {
    const px = x + i, py = y + j;
    if (px >= 0 && py >= 0 && px < G && py < G) img.setPixelColor(color, px, py);
  }
}
const blank = () => new Jimp(G, G, 0x00000000);
async function save(layer, name, img) {
  const dir = path.join(LAYERS, layer);
  fs.mkdirSync(dir, { recursive: true });
  await img.writeAsync(path.join(dir, name));
}

// palette
const GREEN = hex("#5a8f3a"), GREEN_D = hex("#3f6a27"), BELLY = hex("#c7d89a");
const BLACK = hex("#10180a"), WHITE = hex("#ffffff"), LIP = hex("#7a4a2b"), LIP_D = hex("#5a3520");

function drawBase() {
  const img = blank();
  rect(img, 4, 4, 16, 16, GREEN_D);        // head outline-ish
  rect(img, 5, 5, 14, 14, GREEN);          // head fill
  rect(img, 8, 12, 8, 7, BELLY);           // belly
  // eyes
  rect(img, 6, 7, 5, 4, WHITE); rect(img, 13, 7, 5, 4, WHITE);
  rect(img, 9, 9, 2, 2, BLACK); rect(img, 16, 9, 2, 2, BLACK);
  // mouth (Pepe lips)
  rect(img, 7, 15, 11, 2, LIP); rect(img, 7, 17, 11, 1, LIP_D);
  return img;
}

(async () => {
  // BACKGROUNDS (full, opaque) - weights in the filename
  for (const [name, color, w] of [["Slate", "#4a6b8a", 40], ["Teal", "#2f6b66", 25], ["Purple", "#5b3f8a", 20], ["Rug Red", "#8a2f2f", 15]]) {
    const img = new Jimp(G, G, hex(color));
    await save("background", `${name}#${w}.png`, img);
  }

  // BASE (one for now)
  await save("base", "Pepe#100.png", drawBase());

  // HEADWEAR (transparent overlays)
  const none = blank(); await save("headwear", "None#40.png", none);
  const cap = blank(); rect(cap, 4, 2, 16, 4, hex("#5b3f8a")); rect(cap, 16, 5, 6, 2, hex("#5b3f8a")); await save("headwear", "Cap#25.png", cap);
  const moh = blank(); for (let x = 7; x < 17; x += 2) rect(moh, x, 0, 1, 5, hex("#c0392b")); await save("headwear", "Mohawk#20.png", moh);
  const bea = blank(); rect(bea, 4, 3, 16, 3, hex("#2c3e50")); rect(bea, 4, 6, 16, 1, hex("#ecf0f1")); await save("headwear", "Beanie#15.png", bea);

  // ACCESSORY (transparent overlays)
  const an = blank(); await save("accessory", "None#60.png", an);
  const ear = blank(); rect(ear, 4, 12, 1, 2, hex("#f1c40f")); await save("accessory", "Gold Earring#25.png", ear);
  const cig = blank(); rect(cig, 17, 16, 5, 1, hex("#d9c3a0")); rect(cig, 22, 16, 1, 1, hex("#e74c3c")); await save("accessory", "Cig#15.png", cig);

  console.log("Seed layers written to art/layers/. Replace them with real pixel-Pepe sprites (24x24).");
})();
