// Authors the real pixel-Pepe trait sprites (32x32, transparent, aligned) for the compositor.
// Drawn in code so every trait lines up perfectly on the same base. Run: npm run art:seed
const Jimp = require("jimp");
const fs = require("fs");
const path = require("path");
const cfg = require("./config");

const G = cfg.grid;
const LAYERS = path.join(__dirname, "layers");

const hx = (h, a = 255) => { h = h.replace("#", ""); return Jimp.rgbaToInt(parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16), a); };
const blank = () => new Jimp(G, G, 0x00000000);
const inb = (x, y) => x >= 0 && y >= 0 && x < G && y < G;
const px = (img, x, y, c) => { if (inb(x, y)) img.setPixelColor(c, x, y); };
function rect(img, x, y, w, h, c) { for (let i=0;i<w;i++) for (let j=0;j<h;j++) px(img, x+i, y+j, c); }
function ellipse(img, cx, cy, rx, ry, c) {
  for (let y=Math.floor(cy-ry); y<=Math.ceil(cy+ry); y++)
    for (let x=Math.floor(cx-rx); x<=Math.ceil(cx+rx); x++) {
      const dx=(x-cx)/rx, dy=(y-cy)/ry;
      if (dx*dx+dy*dy <= 1) px(img, x, y, c);
    }
}
async function save(layer, name, img) {
  const dir = path.join(LAYERS, layer);
  fs.mkdirSync(dir, { recursive: true });
  await img.writeAsync(path.join(dir, name));
}

// ---- palette ----
const OUT = hx("#243a16"), GREEN = hx("#5f9a3e"), GSH = hx("#4a7a30"), BELLY = hx("#d2e2a0");
const WHITE = hx("#f4f6ec"), BLACK = hx("#10180a"), LIP = hx("#8a5630"), LIPD = hx("#5e3a1f");

// Head geometry shared by base + traits so everything lines up.
const HCX = 16, HCY = 16, HRX = 12, HRY = 12;   // head center/radii
const EYE_Y = 14;                                // eye row

function drawBase() {
  const img = blank();
  ellipse(img, HCX, HCY, HRX + 0.6, HRY + 0.6, OUT);   // outline
  ellipse(img, HCX, HCY, HRX, HRY, GREEN);             // head
  ellipse(img, HCX, HCY + 1, HRX - 1, HRY - 1, GREEN);
  ellipse(img, HCX, 21, 7, 5, BELLY);                  // belly
  // eyes (classic Pepe: white domes, droopy lid, pupils forward)
  ellipse(img, 11, EYE_Y, 3.2, 3.0, WHITE);
  ellipse(img, 21, EYE_Y, 3.2, 3.0, WHITE);
  ellipse(img, 11, EYE_Y, 3.4, 1.4, GREEN);            // upper lid (droop)
  ellipse(img, 21, EYE_Y, 3.4, 1.4, GREEN);
  rect(img, 11, EYE_Y, 2, 2, BLACK);                   // pupils
  rect(img, 21, EYE_Y, 2, 2, BLACK);
  px(img, 13, 17, OUT); px(img, 19, 17, OUT);          // nostrils
  // lips (wide, two-tone)
  rect(img, 9, 19, 14, 2, LIP); px(img,8,20,LIP); px(img,23,20,LIP);
  rect(img, 9, 21, 14, 1, LIPD);
  return img;
}

(async () => {
  // BACKGROUNDS (opaque)
  for (const [n,c,w] of [["Slate","#4a6b8a",38],["Teal","#2f6b66",24],["Rug Red","#8a2f2f",18],["Purple","#5b3f8a",12],["Gold","#b9912f",8]])
    await save("background", `${n}#${w}.png`, new Jimp(G, G, hx(c)));

  // BASE
  await save("base", "Pepe#100.png", drawBase());

  // HEADWEAR (transparent, drawn on top of the head)
  await save("headwear", "None#34.png", blank());

  { const i=blank(); ellipse(i,HCX,8,11,5,hx("#3a2f6e")); rect(i,5,8,22,2,hx("#3a2f6e")); rect(i,22,9,7,2,hx("#3a2f6e")); ellipse(i,HCX,8,11,4,hx("#4b3c8c")); await save("headwear","Cap#22.png",i); }

  { const i=blank(); rect(i,5,7,22,3,hx("#2c3e50")); rect(i,5,10,22,2,hx("#22303d")); rect(i,5,6,22,1,hx("#ecf0f1")); await save("headwear","Beanie#16.png",i); }

  { const i=blank(); for(let x=10;x<23;x+=2){ const hh=4+((x/2)%3); rect(i,x,7-hh+3,2,hh,hx("#c0392b")); } await save("headwear","Mohawk#12.png",i); }

  { const i=blank(); const g=hx("#f1c40f"),gd=hx("#b8901a"); for(let k=0;k<4;k++){ const x=8+k*5; rect(i,x,4,3,4,g); px(i,x+1,3,g);} rect(i,8,7,16,2,g); rect(i,8,9,16,1,gd); await save("headwear","Crown#6.png",i); }

  { const i=blank(); const h=hx("#1b1b1b"); for(let x=7;x<25;x++){ const t=5-Math.abs(x-16)/3|0; rect(i,x,8-t,1,t+2,h);} ellipse(i,HCX,9,11,2,h); await save("headwear","Spiky Hair#10.png",i); }

  // EYEWEAR (transparent, drawn over the eyes)
  await save("eyewear", "None#62.png", blank());

  { const i=blank(); const b=hx("#0c0c0c"); rect(i,7,EYE_Y-1,9,4,b); rect(i,17,EYE_Y-1,9,4,b); rect(i,15,EYE_Y,3,1,b); await save("eyewear","Shades#26.png",i); }

  { const i=blank(); rect(i,7,EYE_Y-1,9,4,hx("#e74c3c")); rect(i,17,EYE_Y-1,9,4,hx("#3498db")); rect(i,15,EYE_Y,3,1,hx("#222222")); await save("eyewear","3D Glasses#12.png",i); }

  console.log("Real trait sprites written to art/layers/ (base + backgrounds + headwear + eyewear).");
})();
