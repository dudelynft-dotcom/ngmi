// NGMI collection config for the trait compositor.
// Layer order = z-index (first drawn = back). Each layer folder lives in art/layers/<name>/.
// Trait files are named "Trait Name#weight.png" (HashLips convention). "None#w.png" = empty slot.
module.exports = {
  name: "NGMI",
  description: "10,000 pre-rugged Pepes. You are the exit liquidity.",
  baseUri: "ipfs://REPLACE_WITH_CID",   // set after you upload images to IPFS
  grid: 32,        // sprite resolution (each trait PNG is grid x grid)
  scale: 18,       // output upscale -> 32*18 = 576x576 px
  supply: 30,      // demo run; set to 10000 for the full collection
  maxAttempts: 100000,

  // Draw order, back -> front. `trait_type` is what shows in metadata/OpenSea.
  layers: [
    { name: "background", trait_type: "Background" },
    { name: "base",       trait_type: "Base" },
    { name: "eyewear",    trait_type: "Eyewear" },
    { name: "headwear",   trait_type: "Headwear" },
  ],
};
