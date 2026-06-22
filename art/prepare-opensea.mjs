// Prepare the 10,000 metadata files for OpenSea + your own (VPS) hosting.
//
// Run it on YOUR machine, on the unzipped collection (the folder that holds images/ and metadata/):
//   node art/prepare-opensea.mjs "C:/path/to/unzipped-collection" https://cdn.engmi.fun
//
// What it does, in place:
//   - rewrites every metadata/N.json so   "image": "https://cdn.engmi.fun/images/N.png"
//   - normalises name/description/external_url, keeps your trait attributes
//   - verifies all 10000 metadata + PNGs exist
//   - writes _collection.json (OpenSea contract-level metadata) + a rarity.csv
//
// Then upload images/ and metadata/ to your VPS so they serve at:
//   https://cdn.engmi.fun/images/N.png   and   https://cdn.engmi.fun/metadata/N.json
const fs = require("fs");
const path = require("path");

const DIR = process.argv[2];
const BASE = (process.argv[3] || "").replace(/\/+$/, "");
const TOTAL = Number(process.argv[4]) || 10000;
if (!DIR || !/^https?:\/\//.test(BASE)) {
  console.error('Usage: node prepare-opensea.mjs <collection-dir> <https://your-base-url> [total=10000]');
  console.error('  e.g. node prepare-opensea.mjs "./RUNPOD FINAL" https://cdn.engmi.fun');
  process.exit(1);
}
const META = path.join(DIR, "metadata");
const IMG = path.join(DIR, "images");
if (!fs.existsSync(META)) { console.error("No metadata/ folder inside " + DIR); process.exit(1); }

let fixed = 0, missingMeta = 0, missingImg = 0, badJson = 0;
const traitCounts = {}, typeCounts = {};
for (let n = 1; n <= TOTAL; n++) {
  const f = path.join(META, n + ".json");
  if (!fs.existsSync(f)) { console.error("MISSING metadata: " + n + ".json"); missingMeta++; continue; }
  let j;
  try { j = JSON.parse(fs.readFileSync(f, "utf8")); } catch { console.error("BAD JSON: " + n + ".json"); badJson++; continue; }

  j.name = `NGMI #${n}`;
  j.description = "10,000 pre-rugged Pepes. You are the exit liquidity, and we told you first.";
  j.image = `${BASE}/images/${n}.png`;
  j.external_url = "https://engmi.fun";
  j.attributes = Array.isArray(j.attributes) ? j.attributes : [];
  fs.writeFileSync(f, JSON.stringify(j, null, 2));
  fixed++;

  if (!fs.existsSync(path.join(IMG, n + ".png"))) missingImg++;
  for (const a of j.attributes) {
    const t = a.trait_type || "Trait";
    typeCounts[t] = (typeCounts[t] || 0) + 1;
    const k = t + " :: " + a.value;
    traitCounts[k] = (traitCounts[k] || 0) + 1;
  }
}

// OpenSea contract-level metadata (point your contract's contractURI() here)
fs.writeFileSync(path.join(DIR, "_collection.json"), JSON.stringify({
  name: "NGMI - Exit Liquidity",
  description: "10,000 pre-rugged Pepes. You are the exit liquidity, and we're not even hiding it. The only honest project in the space - and it's the one openly planning to rug you.",
  image: `${BASE}/images/1.png`,
  banner_image_url: `${BASE}/images/2.png`,
  external_link: "https://engmi.fun",
  seller_fee_basis_points: 500,            // 5% royalty - change if you want
  fee_recipient: "0xYOUR_ROYALTY_WALLET",  // <-- set this to your wallet
}, null, 2));

// rarity.csv (trait :: value, count, percent)
const rows = ["trait_type,value,count,percent"];
for (const k of Object.keys(traitCounts).sort()) {
  const [t, v] = k.split(" :: ");
  rows.push(`"${t}","${v}",${traitCounts[k]},${(traitCounts[k] / TOTAL * 100).toFixed(2)}%`);
}
fs.writeFileSync(path.join(DIR, "rarity.csv"), rows.join("\n"));

console.log(`\nPatched ${fixed}/${TOTAL} metadata -> "image": "${BASE}/images/N.png"`);
console.log(`Missing metadata: ${missingMeta} | broken JSON: ${badJson} | missing PNGs: ${missingImg}`);
console.log(`Wrote _collection.json  (set fee_recipient to your wallet) and rarity.csv`);
if (missingMeta || badJson || missingImg) console.log("\n!! Fix the missing/broken items above before uploading.");
else console.log("\nAll 10000 clean. Upload images/ and metadata/ to your VPS and you're OpenSea-ready.");
