// Pre-rolls the WHOLE collection's traits up front into art/manifest.json:
// each edition gets fixed attributes + prompt + seed. This makes the RunPod run
// exact (guaranteed unique), resumable, and reproducible (regen = same traits).
//   node art/build-manifest.mjs 10000
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import traits from "./traits.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SUPPLY = Number(process.argv[2]) || 10000;
const trigger = JSON.parse(fs.readFileSync(path.join(__dirname, "lora.json"), "utf8")).trigger || "NGMIPEPE";

const cats = Object.entries(traits.categories);
const pick = (o) => { const t = o.reduce((a, x) => a + x.weight, 0); let r = Math.random() * t; for (const x of o) if ((r -= x.weight) < 0) return x; return o.at(-1); };
const isHidden = (v) => /^(none|plain|normal)$/i.test(v);

const seen = new Set();
const manifest = [];
const rarity = {};
let attempts = 0;
const maxAttempts = SUPPLY * 300;

while (manifest.length < SUPPLY && attempts < maxAttempts) {
  attempts++;
  const dna = Object.fromEntries(cats.map(([c, o]) => [c, pick(o)]));
  const key = cats.map(([c]) => dna[c].value).join("|");
  if (seen.has(key)) continue;
  seen.add(key);

  const edition = manifest.length + 1;
  const attributes = cats.map(([c]) => ({ trait_type: c, value: dna[c].value })).filter(a => !isHidden(a.value));
  const frags = cats.map(([c]) => dna[c].prompt).filter(Boolean);
  const prompt = `${trigger}, ${traits.styleBase}, ${frags.join(", ")}`;
  const seed = Math.floor(Math.random() * 2 ** 31);
  manifest.push({ edition, seed, attributes, prompt });
  for (const a of attributes) (rarity[a.trait_type] ||= {})[a.value] = ((rarity[a.trait_type] || {})[a.value] || 0) + 1;
}

fs.writeFileSync(path.join(__dirname, "manifest.json"), JSON.stringify(manifest, null, 2));

// rarity preview
const report = {};
for (const [tt, vals] of Object.entries(rarity))
  report[tt] = Object.fromEntries(Object.entries(vals).sort((a, b) => b[1] - a[1]).map(([v, c]) => [v, `${c} (${(100 * c / manifest.length).toFixed(1)}%)`]));
fs.writeFileSync(path.join(__dirname, "manifest-rarity.json"), JSON.stringify(report, null, 2));

console.log(`Manifest: ${manifest.length} unique tokens (${attempts} rolls) -> art/manifest.json`);
console.log(`Rarity preview -> art/manifest-rarity.json`);
if (manifest.length < SUPPLY) console.log(`WARNING: only ${manifest.length} unique combos reachable - add more trait options to hit ${SUPPLY}.`);
const bare = manifest.filter(m => m.attributes.length === 0).length;
console.log(`Bare (no visible traits): ${bare}`);
