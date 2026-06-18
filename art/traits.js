// Trait dictionary for prompt-driven generation. Each option has a rarity `weight`
// and a `prompt` fragment that tells the LoRA what to draw. Categories multiply:
// 6 x 5 x 5 x 10 x 6 x 5 = 45,000 possible combos (> 10k unique).
module.exports = {
  // The fixed style scaffold (the LoRA supplies the look; this keeps composition consistent).
  styleBase:
    "pixel art CryptoPunk style portrait of the Pepe the Frog meme face, big white eyes with small black pupils, " +
    "two-tone brown lips, long neck and shoulders, three-quarter view, clean crisp pixels, flat colors, centered",

  // Order here = order of attributes in metadata.
  categories: {
    Background: [
      { value: "Slate",   weight: 34, prompt: "solid muted slate-blue background" },
      { value: "Teal",    weight: 22, prompt: "solid teal background" },
      { value: "Rug Red",  weight: 14, prompt: "solid dark red background" },
      { value: "Purple",  weight: 12, prompt: "solid purple background" },
      { value: "Gold",    weight: 10, prompt: "solid gold background" },
      { value: "Acid",    weight: 8,  prompt: "solid acid-green background" },
    ],
    Skin: [
      { value: "Classic Green", weight: 64, prompt: "green skin" },
      { value: "Zombie",        weight: 12, prompt: "sickly grey-green zombie skin" },
      { value: "Blue",          weight: 10, prompt: "blue skin" },
      { value: "Toxic",         weight: 8,  prompt: "bright toxic-green skin" },
      { value: "Albino",        weight: 6,  prompt: "pale white albino skin with pink eyes" },
    ],
    Eyes: [
      { value: "Normal",      weight: 54, prompt: "" },
      { value: "Bloodshot",   weight: 16, prompt: "bloodshot red eyes" },
      { value: "Wide",        weight: 12, prompt: "wide shocked eyes" },
      { value: "Half Closed", weight: 10, prompt: "tired half-closed eyes" },
      { value: "Crazy",       weight: 8,  prompt: "crazy spiral eyes" },
    ],
    Headwear: [
      { value: "None",         weight: 26, prompt: "" },
      { value: "Red Mohawk",   weight: 10, prompt: "wearing a tall red mohawk" },
      { value: "Blue Mohawk",  weight: 8,  prompt: "wearing a tall blue mohawk" },
      { value: "Purple Cap",   weight: 12, prompt: "wearing a purple baseball cap" },
      { value: "Black Cap",    weight: 9,  prompt: "wearing a black backwards baseball cap" },
      { value: "Beanie",       weight: 11, prompt: "wearing a dark blue knit beanie" },
      { value: "Spiky Hair",   weight: 9,  prompt: "wearing messy black spiky hair" },
      { value: "Cowboy Hat",   weight: 5,  prompt: "wearing a brown cowboy hat" },
      { value: "Golden Crown", weight: 4,  prompt: "wearing a small golden crown" },
      { value: "Halo",         weight: 3,  prompt: "with a glowing golden halo above the head" },
    ],
    Eyewear: [
      { value: "None",        weight: 50, prompt: "" },
      { value: "Black Shades", weight: 22, prompt: "wearing black sunglasses" },
      { value: "3D Glasses",  weight: 10, prompt: "wearing red and blue 3D glasses" },
      { value: "VR Headset",  weight: 7,  prompt: "wearing a VR headset" },
      { value: "Monocle",     weight: 6,  prompt: "wearing a gold monocle" },
      { value: "Eye Patch",   weight: 5,  prompt: "wearing a black eye patch" },
    ],
    Mouth: [
      { value: "Plain",     weight: 58, prompt: "" },
      { value: "Cigarette", weight: 15, prompt: "a cigarette in the mouth" },
      { value: "Cigar",     weight: 9,  prompt: "a fat cigar in the mouth" },
      { value: "Blunt",     weight: 8,  prompt: "a blunt in the mouth" },
      { value: "Gold Grill", weight: 10, prompt: "gold grillz teeth" },
    ],
  },
};
