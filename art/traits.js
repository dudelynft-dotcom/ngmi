// Trait dictionary for prompt-driven generation, modeled on CryptoPunks.
// SINGLE flat background (like Punks) baked into styleBase - no Background category.
// Each option: rarity `weight` + `prompt` fragment. "None/Plain/Normal" weighted high
// so most punks have just 1-3 attributes (like the real collection).
module.exports = {
  // The LoRA supplies the look; this fixes composition + the single Punk-style background.
  styleBase:
    "pixel art CryptoPunk style portrait of the Pepe the Frog meme face, big white eyes with small black pupils, " +
    "two-tone brown lips, long neck and shoulders, three-quarter view, " +
    "solid flat steel blue-grey background, single background color, clean crisp pixels, flat colors, centered",

  categories: {
    // "Type" in Punk terms.
    Skin: [
      { value: "Classic Green", weight: 60, prompt: "green skin" },
      { value: "Zombie",        weight: 10, prompt: "sickly grey-green zombie skin" },
      { value: "Blue",          weight: 8,  prompt: "blue skin" },
      { value: "Toxic",         weight: 7,  prompt: "bright toxic-green skin" },
      { value: "Albino",        weight: 6,  prompt: "pale white albino skin" },
      { value: "Alien",         weight: 5,  prompt: "pale grey alien skin" },
      { value: "Ape",           weight: 4,  prompt: "dark brown ape skin" },
    ],
    Eyes: [
      { value: "Normal",      weight: 50, prompt: "" },
      { value: "Bloodshot",   weight: 14, prompt: "bloodshot red eyes" },
      { value: "Wide",        weight: 10, prompt: "wide shocked eyes" },
      { value: "Half Closed", weight: 9,  prompt: "tired half-closed eyes" },
      { value: "Crazy",       weight: 7,  prompt: "crazy spiral eyes" },
      { value: "Angry",       weight: 6,  prompt: "angry frowning eyes" },
      { value: "Cyclops",     weight: 4,  prompt: "a single large cyclops eye" },
    ],
    // Biggest category, like Punk hair/hats.
    Headwear: [
      { value: "None",          weight: 22, prompt: "" },
      { value: "Red Mohawk",    weight: 8,  prompt: "wearing a tall red mohawk" },
      { value: "Blue Mohawk",   weight: 6,  prompt: "wearing a tall blue mohawk" },
      { value: "Wild Hair",     weight: 7,  prompt: "wearing wild messy hair" },
      { value: "Spiky Hair",    weight: 6,  prompt: "wearing messy black spiky hair" },
      { value: "Purple Hair",   weight: 5,  prompt: "wearing purple hair" },
      { value: "Crazy Hair",    weight: 4,  prompt: "wearing crazy white frizzy hair" },
      { value: "Half Shaved",   weight: 4,  prompt: "wearing a half-shaved haircut" },
      { value: "Purple Cap",    weight: 7,  prompt: "wearing a purple baseball cap" },
      { value: "Black Cap",     weight: 6,  prompt: "wearing a black backwards baseball cap" },
      { value: "Police Cap",    weight: 4,  prompt: "wearing a police cap" },
      { value: "Cowboy Hat",    weight: 4,  prompt: "wearing a brown cowboy hat" },
      { value: "Top Hat",       weight: 3,  prompt: "wearing a black top hat" },
      { value: "Fedora",        weight: 3,  prompt: "wearing a grey fedora" },
      { value: "Bandana",       weight: 4,  prompt: "wearing a red bandana" },
      { value: "Headband",      weight: 4,  prompt: "wearing a sweat headband" },
      { value: "Do-rag",        weight: 3,  prompt: "wearing a black do-rag" },
      { value: "Beanie",        weight: 6,  prompt: "wearing a dark blue knit beanie" },
      { value: "Pilot Helmet",  weight: 3,  prompt: "wearing a leather pilot helmet" },
      { value: "Golden Crown",  weight: 2,  prompt: "wearing a small golden crown" },
      { value: "Tiara",         weight: 2,  prompt: "wearing a jeweled tiara" },
      { value: "Halo",          weight: 2,  prompt: "with a glowing golden halo above the head" },
    ],
    Eyewear: [
      { value: "None",          weight: 48, prompt: "" },
      { value: "Black Shades",  weight: 16, prompt: "wearing black sunglasses" },
      { value: "Classic Shades", weight: 8, prompt: "wearing classic dark shades" },
      { value: "Small Shades",  weight: 6,  prompt: "wearing tiny small sunglasses" },
      { value: "Big Shades",    weight: 5,  prompt: "wearing oversized big sunglasses" },
      { value: "3D Glasses",    weight: 6,  prompt: "wearing red and blue 3D glasses" },
      { value: "VR Headset",    weight: 4,  prompt: "wearing a VR headset" },
      { value: "Nerd Glasses",  weight: 5,  prompt: "wearing round nerd glasses" },
      { value: "Eye Patch",     weight: 4,  prompt: "wearing a black eye patch" },
      { value: "Welding Goggles", weight: 3, prompt: "wearing welding goggles" },
    ],
    // Mouth / facial.
    Mouth: [
      { value: "Plain",       weight: 52, prompt: "" },
      { value: "Cigarette",   weight: 12, prompt: "a cigarette in the mouth" },
      { value: "Cigar",       weight: 7,  prompt: "a fat cigar in the mouth" },
      { value: "Pipe",        weight: 5,  prompt: "a smoking pipe in the mouth" },
      { value: "Vape",        weight: 5,  prompt: "vaping with a vape pen" },
      { value: "Medical Mask", weight: 5, prompt: "wearing a medical face mask" },
      { value: "Mustache",    weight: 5,  prompt: "with a black mustache" },
      { value: "Big Beard",   weight: 4,  prompt: "with a big bushy beard" },
      { value: "Gold Grill",  weight: 6,  prompt: "gold grillz teeth" },
      { value: "Buck Teeth",  weight: 4,  prompt: "with buck teeth" },
    ],
    Accessory: [
      { value: "None",         weight: 60, prompt: "" },
      { value: "Gold Earring", weight: 12, prompt: "wearing a gold earring" },
      { value: "Gold Chain",   weight: 9,  prompt: "wearing a thick gold chain necklace" },
      { value: "Clown Nose",   weight: 5,  prompt: "with a red clown nose" },
      { value: "Mole",         weight: 5,  prompt: "with a face mole" },
      { value: "Rosy Cheeks",  weight: 5,  prompt: "with rosy cheeks" },
      { value: "Face Tattoo",  weight: 4,  prompt: "with a small face tattoo" },
    ],
  },
};
